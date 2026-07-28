import { z } from "zod"
import { router, authedProcedure } from "../trpc"
import { db } from "../db"
// import { companies, contacts, deals, users } from "../db/schema"
import { companies} from "../db/schema"
import { eq, desc, count, ilike, or } from "drizzle-orm"

const paginationInput = z.object({
  page:   z.number().min(1).default(1),
  limit:  z.number().min(1).max(100).default(10),
  search: z.string().optional(),
})

export const dashboardRouter = router({

  // ── Companies ──────────────────────────────────────────────────────────────
  getCompanies: authedProcedure
    .input(paginationInput)
    .query(async ({ ctx, input }) => {
      const { page, limit, search } = input
      const offset = (page - 1) * limit
      // const tenantId = ctx.session.user.id
    

      const where = search
        ? or(
            ilike(companies.name,   `%${search}%`),
            ilike(companies.domain, `%${search}%`),
            ilike(companies.city,   `%${search}%`),
          )
        : undefined

      const [rows, [{ total }]] = await Promise.all([
        db.select().from(companies)
          .where(where)
          .orderBy(desc(companies.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ total: count() }).from(companies).where(where),
      ])

      return {
        data:       rows,
        total:      Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      }
    })

  // ── Contacts ───────────────────────────────────────────────────────────────
//   getContacts: authedProcedure
//     .input(paginationInput)
//     .query(async ({ ctx, input }) => {
//       const { page, limit, search } = input
//       const offset = (page - 1) * limit
//       const tenantId = ctx.session.user.tenantId

//       const where = search
//         ? or(
//             ilike(contacts.firstName, `%${search}%`),
//             ilike(contacts.lastName,  `%${search}%`),
//             ilike(contacts.email,     `%${search}%`),
//             ilike(contacts.company,   `%${search}%`),
//           )
//         : eq(contacts.tenantId, tenantId)

//       const [rows, [{ total }]] = await Promise.all([
//         db.select().from(contacts)
//           .where(where)
//           .orderBy(desc(contacts.createdAt))
//           .limit(limit)
//           .offset(offset),
//         db.select({ total: count() }).from(contacts).where(where),
//       ])

//       return {
//         data:       rows,
//         total:      Number(total),
//         page,
//         limit,
//         totalPages: Math.ceil(Number(total) / limit),
//       }
//     }),

  // ── Deals ──────────────────────────────────────────────────────────────────
//   getDeals: authedProcedure
//     .input(paginationInput)
//     .query(async ({ ctx, input }) => {
//       const { page, limit, search } = input
//       const offset = (page - 1) * limit
//       const tenantId = ctx.session.user.tenantId

//       const where = search
//         ? ilike(deals.name, `%${search}%`)
//         : eq(deals.tenantId, tenantId)

//       const [rows, [{ total }]] = await Promise.all([
//         db.select().from(deals)
//           .where(where)
//           .orderBy(desc(deals.createdAt))
//           .limit(limit)
//           .offset(offset),
//         db.select({ total: count() }).from(deals).where(where),
//       ])

//       return {
//         data:       rows,
//         total:      Number(total),
//         page,
//         limit,
//         totalPages: Math.ceil(Number(total) / limit),
//       }
//     }),

  // ── Users ──────────────────────────────────────────────────────────────────
//   getUsers: authedProcedure
//     .input(paginationInput)
//     .query(async ({ ctx, input }) => {
//       const { page, limit, search } = input
//       const offset = (page - 1) * limit
//       const tenantId = ctx.session.user.tenantId

//       const where = search
//         ? or(
//             ilike(users.name,  `%${search}%`),
//             ilike(users.email, `%${search}%`),
//           )
//         : eq(users.tenantId, tenantId)

//       const [rows, [{ total }]] = await Promise.all([
//         db.select({
//           id:        users.id,
//           name:      users.name,
//           email:     users.email,
//           role:      users.role,
//           isActive:  users.isActive,
//           createdAt: users.createdAt,
//         }).from(users)
//           .where(where)
//           .orderBy(desc(users.createdAt))
//           .limit(limit)
//           .offset(offset),
//         db.select({ total: count() }).from(users).where(where),
//       ])

//       return {
//         data:       rows,
//         total:      Number(total),
//         page,
//         limit,
//         totalPages: Math.ceil(Number(total) / limit),
//       }
//     }),
})