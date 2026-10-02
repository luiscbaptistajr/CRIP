import { router }              from "../trpc"
import { dashboardRouter }      from "./dashboard"
import { activitiesRouter }    from "./activities"
// import { organizationsRouter } from "./organizations"

export const appRouter = router({
  // ...your existing routers
  dashboard:      dashboardRouter,
  activities:     activitiesRouter,
  // organizations:  organizationsRouter,
})

export type AppRouter = typeof appRouter