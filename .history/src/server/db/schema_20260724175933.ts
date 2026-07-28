import {
  pgTable,
  pgEnum,
  text,
  uuid,
  numeric,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
// import { number } from "zod"

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "rep",
])

export const contactStatusEnum = pgEnum("contact_status", [
  "lead",
  "prospect",
  "active",
  "churned",
  "unqualified",
])

export const dealStageEnum = pgEnum("deal_stage", [
  "prospect",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
])

export const activityTypeEnum = pgEnum("activity_type", [
  "call",
  "email",
  "note",
  "meeting",
  "task",
])

// export const leadSourceEnum = pgEnum("lead_source", [
//   "wordpress",
//   "hubspot",
//   "manual",
//   "referral",
//   "organic",
//   "paid",
//   "other",
// ])

// ─── Tenants ──────────────────────────────────────────────────────────────────
// Every row in every table is scoped to a tenant — the top-level org/workspace.

// export const tenants = pgTable("tenants", {
//   id:        uuid("id").primaryKey().defaultRandom(),
//   name:      text("name").notNull(),
//   slug:      text("slug").notNull(),            // used in subdomains / URL slugs
//   plan:      text("plan").default("free"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// }, (t) => ({
//   slugIdx: uniqueIndex("tenants_slug_idx").on(t.slug),
// }))

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id:            uuid("id").primaryKey().defaultRandom(),
  // tenantId:      uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  email:         text("email").notNull(),
  name:          text("name"),
  image:         text("image"),
  role:          userRoleEnum("role").default("rep").notNull(),
  passwordHash:  text("password_hash"),         // null for OAuth users
  emailVerified: timestamp("email_verified"),
  isActive:      boolean("is_active").default(true).notNull(),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
  updatedAt:     timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  emailTenantIdx: uniqueIndex("users_email_tenant_idx").on(t.email, t.id),
  // emailTenantIdx: uniqueIndex("users_email_tenant_idx").on(t.email, t.tenantId),
  // tenantIdx:      index("users_tenant_idx").on(t.tenantId),
}))

// NextAuth requires these three tables when using the Drizzle adapter

// export const accounts = pgTable("accounts", {
//   id:                uuid("id").primaryKey().defaultRandom(),
//   userId:            uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
//   type:              text("type").notNull(),
//   provider:          text("provider").notNull(),
//   providerAccountId: text("provider_account_id").notNull(),
//   refreshToken:      text("refresh_token"),
//   accessToken:       text("access_token"),
//   expiresAt:         integer("expires_at"),
//   tokenType:         text("token_type"),
//   scope:             text("scope"),
//   idToken:           text("id_token"),
//   sessionState:      text("session_state"),
// }, (t) => ({
//   providerIdx: uniqueIndex("accounts_provider_idx").on(t.provider, t.providerAccountId),
// }))

// export const sessions = pgTable("sessions", {
//   id:           uuid("id").primaryKey().defaultRandom(),
//   sessionToken: text("session_token").notNull().unique(),
//   userId:       uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
//   expires:      timestamp("expires").notNull(),
// })

// export const verificationTokens = pgTable("verification_tokens", {
//   identifier: text("identifier").notNull(),
//   token:      text("token").notNull(),
//   expires:    timestamp("expires").notNull(),
// }, (t) => ({
//   compoundIdx: uniqueIndex("verification_tokens_idx").on(t.identifier, t.token),
// }))

// ─── Companies ────────────────────────────────────────────────────────────────

export const companies = pgTable("companies", {
  id:       uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name:     text("name").notNull(),
  industry: text("industry"),           // Organization Type
  address:  text("address"),
  city:     text("city"),
  country:  text("country"),
  scope:    text("scope"),              // "1-10", "11-50", "51-200", etc.
  size:     text("size"),               // "1-10", "11-50", "51-200", etc.
  notes:    text("notes"),
  website:  text("website"),
  email:    text("email"),
  phone:    text("number"),
  linkedIn: text("linkedIn"),
  facebook: text("facebook"),
  instagram:text("instagram"),
  domain:   text("domain"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  tenantIdx:  index("companies_tenant_idx").on(t.tenantId),
  // companyIdx: index("id").on(t.id),
  domainIdx:  index("companies_domain_idx").on(t.domain),
}))

// ─── Contacts ─────────────────────────────────────────────────────────────────

export const contacts = pgTable("contacts", {
  id:          uuid("id").primaryKey().defaultRandom(),
  tenantId:    uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  companyId:   uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
  ownerId:     uuid("owner_id").references(() => users.id, { onDelete: "set null" }),

  // Identity
  firstName:   text("first_name"),
  lastName:    text("last_name"),
  email:       text("email"),
  phone:       text("phone"),
  jobTitle:    text("job_title"),
  avatarUrl:   text("avatar_url"),

  // CRM fields
  status:      contactStatusEnum("status").default("lead").notNull(),
  source:      leadSourceEnum("source").default("manual"),
  score:       integer("score").default(0),    // AI lead score 0–100
  tags:        text("tags").array(),            // ["vip", "decision-maker"]

  // Source tracking
  hubspotId:   text("hubspot_id"),             // populated by HubSpot sync
  wpFormId:    text("wp_form_id"),             // populated by WordPress webhook

  // Metadata
  notes:       text("notes"),
  lastSeenAt:  timestamp("last_seen_at"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  tenantIdx:   index("contacts_tenant_idx").on(t.tenantId),
  emailIdx:    index("contacts_email_idx").on(t.email),
  ownerIdx:    index("contacts_owner_idx").on(t.ownerId),
  companyIdx:  index("contacts_company_idx").on(t.companyId),
  hubspotIdx:  uniqueIndex("contacts_hubspot_idx").on(t.hubspotId),
  statusIdx:   index("contacts_status_idx").on(t.status),
}))

// ─── Deals ────────────────────────────────────────────────────────────────────

export const deals = pgTable("deals", {
  id:          uuid("id").primaryKey().defaultRandom(),
  tenantId:    uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  contactId:   uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  companyId:   uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
  ownerId:     uuid("owner_id").references(() => users.id, { onDelete: "set null" }),

  // Deal fields
  name:        text("name").notNull(),
  amount:      numeric("amount", { precision: 14, scale: 2 }),
  currency:    text("currency").default("USD"),
  stage:       dealStageEnum("stage").default("prospect").notNull(),
  probability: integer("probability").default(0),  // 0–100 %
  closeDate:   timestamp("close_date"),

  // Won / lost tracking
  wonAt:       timestamp("won_at"),
  lostAt:      timestamp("lost_at"),
  lostReason:  text("lost_reason"),

  // Source
  source:      leadSourceEnum("source").default("manual"),
  hubspotId:   text("hubspot_id"),

  notes:       text("notes"),
  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  tenantIdx:   index("deals_tenant_idx").on(t.tenantId),
  stageIdx:    index("deals_stage_idx").on(t.stage),
  ownerIdx:    index("deals_owner_idx").on(t.ownerId),
  contactIdx:  index("deals_contact_idx").on(t.contactId),
  hubspotIdx:  uniqueIndex("deals_hubspot_idx").on(t.hubspotId),
}))

// ─── Activities ───────────────────────────────────────────────────────────────

export const activities = pgTable("activities", {
  id:          uuid("id").primaryKey().defaultRandom(),
  tenantId:    uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  contactId:   uuid("contact_id").references(() => contacts.id, { onDelete: "cascade" }),
  dealId:      uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
  userId:      uuid("user_id").references(() => users.id, { onDelete: "set null" }),  // who logged it

  type:        activityTypeEnum("type").notNull(),
  title:       text("title"),           // "Call with John", "Follow-up email"
  note:        text("note"),            // body / description
  dueAt:       timestamp("due_at"),     // for tasks — when it's due
  completedAt: timestamp("completed_at"),
  duration:    integer("duration"),     // minutes — for calls and meetings

  createdAt:   timestamp("created_at").defaultNow().notNull(),
  updatedAt:   timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  tenantIdx:   index("activities_tenant_idx").on(t.tenantId),
  contactIdx:  index("activities_contact_idx").on(t.contactId),
  dealIdx:     index("activities_deal_idx").on(t.dealId),
  userIdx:     index("activities_user_idx").on(t.userId),
  typeIdx:     index("activities_type_idx").on(t.type),
}))

// ─── Files ────────────────────────────────────────────────────────────────────

export const files = pgTable("files", {
  id:          uuid("id").primaryKey().defaultRandom(),
  tenantId:    uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  uploadedBy:  uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),

  // R2 storage
  key:         text("key").notNull(),         // the object key in R2
  fileName:    text("file_name").notNull(),
  mimeType:    text("mime_type").notNull(),
  fileSize:    integer("file_size").notNull(), // bytes

  // Polymorphic attachment
  entityType:  text("entity_type").notNull(), // "contact" | "deal" | "company"
  entityId:    uuid("entity_id").notNull(),

  createdAt:   timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  tenantIdx:   index("files_tenant_idx").on(t.tenantId),
  entityIdx:   index("files_entity_idx").on(t.entityType, t.entityId),
}))

// ─── Relations ────────────────────────────────────────────────────────────────
// Enables db.query.contacts.findMany({ with: { deals: true } })

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users:      many(users),
  contacts:   many(contacts),
  companies:  many(companies),
  deals:      many(deals),
  activities: many(activities),
  files:      many(files),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant:     one(tenants, { fields: [users.tenantId],  references: [tenants.id] }),
  accounts:   many(accounts),
  sessions:   many(sessions),
  contacts:   many(contacts),   // contacts they own
  deals:      many(deals),      // deals they own
  activities: many(activities),
}))

export const companiesRelations = relations(companies, ({ one, many }) => ({
  tenant:   one(tenants,  { fields: [companies.tenantId],  references: [tenants.id] }),
  contacts: many(contacts),
  deals:    many(deals),
  files:    many(files),
}))

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  tenant:     one(tenants,   { fields: [contacts.tenantId],  references: [tenants.id] }),
  company:    one(companies, { fields: [contacts.companyId], references: [companies.id] }),
  owner:      one(users,     { fields: [contacts.ownerId],   references: [users.id] }),
  deals:      many(deals),
  activities: many(activities),
  files:      many(files),
}))

export const dealsRelations = relations(deals, ({ one, many }) => ({
  tenant:     one(tenants,   { fields: [deals.tenantId],   references: [tenants.id] }),
  contact:    one(contacts,  { fields: [deals.contactId],  references: [contacts.id] }),
  company:    one(companies, { fields: [deals.companyId],  references: [companies.id] }),
  owner:      one(users,     { fields: [deals.ownerId],    references: [users.id] }),
  activities: many(activities),
  files:      many(files),
}))

export const activitiesRelations = relations(activities, ({ one }) => ({
  tenant:  one(tenants,  { fields: [activities.tenantId],  references: [tenants.id] }),
  contact: one(contacts, { fields: [activities.contactId], references: [contacts.id] }),
  deal:    one(deals,    { fields: [activities.dealId],    references: [deals.id] }),
  user:    one(users,    { fields: [activities.userId],    references: [users.id] }),
}))

export const filesRelations = relations(files, ({ one }) => ({
  tenant:     one(tenants, { fields: [files.tenantId],    references: [tenants.id] }),
  uploadedBy: one(users,   { fields: [files.uploadedBy],  references: [users.id] }),
}))

// ─── Inferred types ───────────────────────────────────────────────────────────
// Import these throughout the app instead of manually typing select results

export type Tenant    = typeof tenants.$inferSelect
export type NewTenant = typeof tenants.$inferInsert

export type User    = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export type Company    = typeof companies.$inferSelect
export type NewCompany = typeof companies.$inferInsert

export type Contact    = typeof contacts.$inferSelect
export type NewContact = typeof contacts.$inferInsert

export type Deal    = typeof deals.$inferSelect
export type NewDeal = typeof deals.$inferInsert

export type Activity    = typeof activities.$inferSelect
export type NewActivity = typeof activities.$inferInsert

export type File    = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert

// Useful composite types for queries that join relations
export type ContactWithCompany = Contact & { company: Company | null }
export type ContactWithDeals   = Contact & { deals: Deal[] }
export type DealWithContact    = Deal    & { contact: Contact | null }
export type DealWithActivities = Deal    & { activities: Activity[] }
