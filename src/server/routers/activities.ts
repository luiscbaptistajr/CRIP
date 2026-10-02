import { z } from "zod"
import { router, authedProcedure } from "../trpc"
import { db } from "../db"
import { renewalCall } from "@/server/db/schema"
import { eq } from "drizzle-orm"

export const activitiesRouter = router({

  // ── Get single activity by ID ──────────────────────────────────────────────
  getById: authedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const [activity] = await db
        .select()
        .from(renewalCall)
        .where(eq(renewalCall.agencyId, input.id))
        .limit(1)

      if (!activity) {
        throw new Error("Activity not found")
      }

      return activity
    }),

  // ── Update activity ────────────────────────────────────────────────────────
  update: authedProcedure
    .input(z.object({
      // id:          z.string().uuid(),
      // type:        z.enum(["call", "email", "note", "meeting", "task"]),
      // title:       z.string().min(1, "Title is required").max(255),
      // note:        z.string().optional(),
      // duration:    z.number().min(0).optional(),
      // outcome:     z.string().optional(),
      // completedAt: z.string().optional(),
      // dueAt:       z.string().optional(),

      // Call Details
      callId:                     z.string().uuid(),
      agencyId:                   z.string().min(1, "Please select an agency"),
      spokeWith:                  z.string().optional(),
      createdAt:                  z.string().optional(),
      updatedAt:                  z.string().optional(),

      // Family Trends
      familyTrends:               z.string().optional(),

      // Key Funders
      // keyFunders:                 z.array(z.string()).optional(),

      // Impact
      totalVisits:                z.string().optional(),
      totalVisitsNote:            z.string().optional(),
      uniqueFamilies:             z.string().optional(),
      uniqueFamiliesNote:         z.string().optional(),
      staffVolunteers:            z.string().optional(),
      staffVolunteersNote:        z.string().optional(),
      weeklyStaffHours:           z.string().optional(),
      weeklyStaffHoursNote:       z.string().optional(),
      relevantPartners:           z.string().optional(),
      relevantPartnersNote:       z.string().optional(),
      referralsMade:              z.string().optional(),
      referralsMadeNote:          z.string().optional(),
      foodSecurityMetrics:        z.string().optional(),
      foodSecurityMetricsNote:    z.string().optional(),
      additionalMetrics:          z.string().optional(),
      additionalMetricsNote:      z.string().optional(),

      // Evaluation Practice
      evaluationPractice:         z.string().optional(),

      // Member Experience
      topSuccesses:               z.string().optional(),
      topChallenges:              z.string().optional(),

      // FRP-BC Services Matrix
      // servicesMatrix:             z.record(z.string()).optional(),

      // Offers & Wrap-up
      // subscriptionPermission:     z.enum(["yes", "no", "ask_again_later"]).optional(),
      opportunitiesShared:        z.string().optional(),
      followUpAction:             z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // const { id, completedAt, dueAt, ...rest } = input
      const { agencyId, updatedAt, createdAt, ...rest } = input
      const [updated] = await db
        .update(renewalCall)
        .set({
          ...rest,
          agencyId:     agencyId ? agencyId : null,
          updatedAt:    updatedAt ? new Date(updatedAt) : null,
          createdAt:    createdAt ? new Date(createdAt) : null,
        })
        .where(eq(renewalCall.agencyId, input.agencyId))
        .returning()

      if (!updated) {
        throw new Error("Activity not found or update failed")
      }

      return updated
    }),

  // ── Delete activity ────────────────────────────────────────────────────────
  delete: authedProcedure
    .input(z.object({ agencyId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const [deleted] = await db
        .delete(renewalCall)
        .where(eq(renewalCall.agencyId, input.agencyId))
        .returning()

      return { deleted: !!deleted }
    }),
})
