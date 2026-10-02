import { z }                from "zod"
import { router, authedProcedure } from "../trpc"
import { db }              from "../db"
// import { organizations, organizationStaff, organizationActivities } from "../db/schema"
import { agencies } from "../db/schema"
import { eq, desc, count, ilike, or, and } from "drizzle-orm"

// ─── Shared input schemas ──────────────────────────────────────────────────────

const staffInput = z.object({
  name:    z.string(),
  role:    z.string().optional(),
  email:   z.string().optional(),
  phone:   z.string().optional(),
  primary: z.boolean().optional(),
})

const orgInput = z.object({
  name:             z.string().min(1),
  agencyType:       z.string().optional(),
  address:          z.string().optional(),
  region:           z.string().optional(),
  communitiesServed: z.string().optional(),
  size:             z.string().optional(),
  frpSize:          z.string().optional(),
  status:           z.enum(["Active", "Inactive"]).optional(),
  programsOffered:  z.string().optional(),
  notes:            z.string().optional(),
  website:          z.string().optional(),
  email:            z.string().optional(),
  staff:            z.array(staffInput).optional(),
})

// ─── Router ───────────────────────────────────────────────────────────────────

export const organizationsRouter = router({

  // ── List with search, filter, sort, pagination ────────────────────────────
  list: authedProcedure
    .input(z.object({
      page:    z.number().min(1).default(1),
      limit:   z.number().min(1).max(100).default(10),
      search:  z.string().optional(),
      status:  z.string().optional(),
      sortBy:  z.enum(["name", "region", "lastActive"]).optional(),
      sortDir: z.enum(["asc", "desc"]).optional(),
    }))
    .query(async ({ input }) => {
      const { page, limit, search, status } = input
      const offset = (page - 1) * limit

      const where = search
        ? or(
            ilike(agencies.name,   `%${search}%`),
            ilike(agencies.city,   `%${search}%`),
          )
        : undefined

      const [rows, [{ total }]] = await Promise.all([
        db.select().from(agencies)
          .where(where)
          .orderBy(desc(agencies.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(agencies).where(where),
      ])

      return {
        data:       rows,
        total:      Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      }
    }),

  // ── Get single org with staff + activities ────────────────────────────────
  // getById: authedProcedure
  //   .input(z.object({ id: z.string().uuid() }))
  //   .query(async ({ input }) => {
  //     const [org] = await db
  //       .select()
  //       .from(agencies)
  //       .where(eq(agencies.id, input.id))
  //       .limit(1)

  //     if (!org) throw new Error("Agency not found")

  //     const [staff, activities] = await Promise.all([
  //       db.select().from(organizationStaff)
  //         .where(eq(organizationStaff.organizationId, input.id))
  //         .orderBy(desc(organizationStaff.isPrimary)),
  //       db.select().from(organizationActivities)
  //         .where(eq(organizationActivities.organizationId, input.id))
  //         .orderBy(desc(organizationActivities.createdAt))
  //         .limit(20),
  //     ])

  //     return { ...org, staff, activities }
  //   }),

  // ── Create ─────────────────────────────────────────────────────────────────
  // create: authedProcedure
  //   .input(orgInput)
  //   .mutation(async ({ input }) => {
  //     const { staff, notes, agencyType, communitiesServed,
  //             programsOffered, frpSize, region, status, ...rest } = input

  //     // Generate a slug from name
  //     const slug = (rest.name ?? "org")
  //       .toLowerCase()
  //       .replace(/[^a-z0-9]+/g, "-")
  //       .replace(/(^-|-$)/g, "")
  //       + "-" + Date.now()

  //     // Use a placeholder tenantId for now (replace with real session tenantId)
  //     const tenantId = "00000000-0000-0000-0000-000000000000"

  //     const [org] = await db
  //       .insert(organizations)
  //       .values({
  //         ...rest,
  //         slug,
  //         tenantId,
  //         notes,
  //         description: [agencyType, communitiesServed, programsOffered].filter(Boolean).join(" | "),
  //         status:      (status === "Inactive" ? "churned" : "active") as any,
  //       })
  //       .returning()

  //     // Insert staff members
  //     if (staff?.length) {
  //       await db.insert(organizationStaff).values(
  //         staff.filter(s => s.name?.trim()).map(s => ({
  //           organizationId: org.id,
  //           tenantId,
  //           firstName:      s.name.split(" ")[0],
  //           lastName:       s.name.split(" ").slice(1).join(" ") || null,
  //           email:          s.email   || null,
  //           phone:          s.phone   || null,
  //           jobTitle:       s.role    || null,
  //           isPrimary:      s.primary ?? false,
  //         }))
  //       )
  //     }

  //     // Log creation activity
  //     await db.insert(organizationActivities).values({
  //       organizationId: org.id,
  //       tenantId,
  //       type:           "note",
  //       title:          "Agency created",
  //       isAutomatic:    true,
  //     })

  //     return org
  //   }),

  // ── Update ─────────────────────────────────────────────────────────────────
  // update: authedProcedure
  //   .input(orgInput.extend({ id: z.string().uuid() }))
  //   .mutation(async ({ input }) => {
  //     const { id, staff, notes, agencyType, communitiesServed,
  //             programsOffered, frpSize, region, status, ...rest } = input

  //     const tenantId = "00000000-0000-0000-0000-000000000000"

  //     const [updated] = await db
  //       .update(organizations)
  //       .set({
  //         ...rest,
  //         notes,
  //         description: [agencyType, communitiesServed, programsOffered].filter(Boolean).join(" | "),
  //         status:      (status === "Inactive" ? "churned" : "active") as any,
  //         updatedAt:   new Date(),
  //       })
  //       .where(eq(organizations.id, id))
  //       .returning()

  //     // Replace staff
  //     if (staff) {
  //       await db.delete(organizationStaff)
  //         .where(eq(organizationStaff.organizationId, id))
  //       if (staff.length) {
  //         await db.insert(organizationStaff).values(
  //           staff.filter(s => s.name?.trim()).map(s => ({
  //             organizationId: id,
  //             tenantId,
  //             firstName:      s.name.split(" ")[0],
  //             lastName:       s.name.split(" ").slice(1).join(" ") || null,
  //             email:          s.email   || null,
  //             phone:          s.phone   || null,
  //             jobTitle:       s.role    || null,
  //             isPrimary:      s.primary ?? false,
  //           }))
  //         )
  //       }
  //     }

  //     return updated
  //   }),

  // ── Delete ─────────────────────────────────────────────────────────────────
  // delete: authedProcedure
  //   .input(z.object({ id: z.string().uuid() }))
  //   .mutation(async ({ input }) => {
  //     const [deleted] = await db
  //       .delete(organizations)
  //       .where(eq(organizations.id, input.id))
  //       .returning()
  //     return { deleted: !!deleted }
  //   }),

  // // ── Log activity ───────────────────────────────────────────────────────────
  // logActivity: authedProcedure
  //   .input(z.object({
  //     organizationId: z.string().uuid(),
  //     type:           z.enum(["note","call","email","meeting","deal_created","deal_won","deal_lost","staff_added","staff_removed","status_changed","document_uploaded","task_completed"]),
  //     title:          z.string().min(1),
  //     description:    z.string().optional(),
  //     duration:       z.number().optional(),
  //     outcome:        z.string().optional(),
  //     completedAt:    z.string().optional(),
  //   }))
  //   .mutation(async ({ input }) => {
  //     const tenantId = "00000000-0000-0000-0000-000000000000"
  //     const [activity] = await db
  //       .insert(organizationActivities)
  //       .values({
  //         ...input,
  //         tenantId,
  //         completedAt: input.completedAt ? new Date(input.completedAt) : null,
  //       })
  //       .returning()
  //     return activity
  //   }),
})
