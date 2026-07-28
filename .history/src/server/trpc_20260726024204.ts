import { initTRPC, TRPCError } from "@trpc/server"
// import { auth } from "@/auth"

// ─── Context ──────────────────────────────────────────────────────────────────

export async function createTRPCContext() {
  // const session = await auth()
  // return { session }
  return {}
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>

// ─── tRPC init ────────────────────────────────────────────────────────────────

const t = initTRPC.context<Context>().create()

// ─── Exports ──────────────────────────────────────────────────────────────────

export const router          = t.router
export const publicProcedure = t.procedure
export const authedProcedure  = t.procedure

// Requires a valid session — throws UNAUTHORIZED if not logged in
// export const authedProcedure = t.procedure.use(async ({ ctx, next }) => {
//   if (!ctx.session?.user) {
//     throw new TRPCError({ code: "UNAUTHORIZED" })
//   }
//   return next({
//     ctx: {
//       session: ctx.session,
//     },
//   })
// })