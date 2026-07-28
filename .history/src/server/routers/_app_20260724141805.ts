import { dashboardRouter } from "./dashboard"

export const appRouter = router({
  // ...your existing routers
  dashboard: dashboardRouter,
})