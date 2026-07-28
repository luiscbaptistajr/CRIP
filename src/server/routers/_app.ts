import { router } from "../trpc"
import { dashboardRouter } from "./dashboard"

export const appRouter = router({
  // ...your existing routers
  dashboard: dashboardRouter,
})

export type AppRouter = typeof appRouter