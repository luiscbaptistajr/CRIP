import { db } from "./index"
import {
  tenants, users, companies, contacts, deals, activities,
} from "./schema"
import bcrypt from "bcryptjs"

async function seed() {
  console.log("Seeding database...")

  // ── Tenant ────────────────────────────────────────────────────────────────
  const [tenant] = await db.insert(tenants).values({
    name: "CRIP Demo",
    slug: "crip-demo",
    plan: "pro",
  }).returning()

  console.log("✓ Tenant created:", tenant.id)

  // ── Users ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 12)

  const [admin] = await db.insert(users).values([
    {
      tenantId:     tenant.id,
      email:        "admin@crip.io",
      name:         "Admin User",
      role:         "admin",
      passwordHash,
    },
    {
      tenantId:     tenant.id,
      email:        "rep@crip.io",
      name:         "Sales Rep",
      role:         "rep",
      passwordHash,
    },
  ]).returning()

  console.log("✓ Users created")

  // ── Companies ─────────────────────────────────────────────────────────────
  const [acme, globex] = await db.insert(companies).values([
    {
      tenantId: tenant.id,
      name:     "Acme Corp",
      domain:   "acme.com",
      industry: "Technology",
      size:     "51-200",
      website:  "https://acme.com",
      city:     "San Francisco",
      country:  "US",
    },
    {
      tenantId: tenant.id,
      name:     "Globex Inc",
      domain:   "globex.com",
      industry: "Manufacturing",
      size:     "201-500",
      website:  "https://globex.com",
      city:     "Vancouver",
      country:  "CA",
    },
  ]).returning()

  console.log("✓ Companies created")

  // ── Contacts ──────────────────────────────────────────────────────────────
  const [john, jane] = await db.insert(contacts).values([
    {
      tenantId:  tenant.id,
      companyId: acme.id,
      ownerId:   admin.id,
      firstName: "John",
      lastName:  "Doe",
      email:     "john.doe@acme.com",
      phone:     "+1 415 555 0100",
      jobTitle:  "VP of Engineering",
      status:    "active",
      source:    "manual",
      score:     82,
      tags:      ["decision-maker", "technical"],
    },
    {
      tenantId:  tenant.id,
      companyId: globex.id,
      ownerId:   admin.id,
      firstName: "Jane",
      lastName:  "Smith",
      email:     "jane.smith@globex.com",
      phone:     "+1 604 555 0200",
      jobTitle:  "CEO",
      status:    "prospect",
      source:    "hubspot",
      score:     91,
      tags:      ["vip"],
    },
  ]).returning()

  console.log("✓ Contacts created")

  // ── Deals ─────────────────────────────────────────────────────────────────
  const [deal1, deal2] = await db.insert(deals).values([
    {
      tenantId:    tenant.id,
      contactId:   john.id,
      companyId:   acme.id,
      ownerId:     admin.id,
      name:        "Acme Corp — Enterprise Plan",
      amount:      "24000",
      currency:    "USD",
      stage:       "proposal",
      probability: 60,
      closeDate:   new Date("2025-09-30"),
      source:      "manual",
    },
    {
      tenantId:    tenant.id,
      contactId:   jane.id,
      companyId:   globex.id,
      ownerId:     admin.id,
      name:        "Globex Inc — Pilot",
      amount:      "8500",
      currency:    "USD",
      stage:       "qualified",
      probability: 40,
      closeDate:   new Date("2025-10-15"),
      source:      "hubspot",
    },
  ]).returning()

  console.log("✓ Deals created")

  // ── Activities ────────────────────────────────────────────────────────────
  await db.insert(activities).values([
    {
      tenantId:    tenant.id,
      contactId:   john.id,
      dealId:      deal1.id,
      userId:      admin.id,
      type:        "call",
      title:       "Discovery call",
      note:        "John confirmed budget approved. Wants a proposal by end of week.",
      duration:    45,
      completedAt: new Date(),
    },
    {
      tenantId:    tenant.id,
      contactId:   john.id,
      dealId:      deal1.id,
      userId:      admin.id,
      type:        "email",
      title:       "Proposal sent",
      note:        "Sent the enterprise proposal PDF. Awaiting feedback.",
      completedAt: new Date(),
    },
    {
      tenantId:    tenant.id,
      contactId:   jane.id,
      dealId:      deal2.id,
      userId:      admin.id,
      type:        "meeting",
      title:       "Intro meeting",
      note:        "Met with Jane and her team. Positive reception.",
      duration:    60,
      completedAt: new Date(),
    },
    {
      tenantId:  tenant.id,
      contactId: jane.id,
      dealId:    deal2.id,
      userId:    admin.id,
      type:      "task",
      title:     "Send follow-up resources",
      note:      "Jane asked for case studies from the manufacturing sector.",
      dueAt:     new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    },
  ])

  console.log("✓ Activities created")
  console.log("\nSeed complete.")
  console.log("Login: admin@crip.io / password123")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
