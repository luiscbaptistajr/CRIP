import { z } from "zod"
import { router, authedProcedure } from "../trpc"
import { getPresignedUploadUrl, deleteFromR2 } from "../lib/upload"
import { db } from "../db"
import { files } from "../db/schema"
import { eq, and } from "drizzle-orm"

export const filesRouter = router({

  // Step 1 — client calls this to get a presigned URL
  getUploadUrl: authedProcedure
    .input(z.object({
      fileName: z.string().max(255),
      mimeType: z.string(),
      fileSize: z.number().max(10 * 1024 * 1024),
      entityType: z.enum(["contact", "deal", "company"]),
      entityId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { uploadUrl, key } = await getPresignedUploadUrl({
        fileName: input.fileName,
        mimeType: input.mimeType,
        tenantId: ctx.session.user.tenantId,
        folder:   input.entityType,
      })
      return { uploadUrl, key }
    }),

  // Step 2 — client calls this AFTER the upload to R2 completes
  confirmUpload: authedProcedure
    .input(z.object({
      key:        z.string(),
      fileName:   z.string(),
      mimeType:   z.string(),
      fileSize:   z.number(),
      entityType: z.enum(["contact", "deal", "company"]),
      entityId:   z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [file] = await db
        .insert(files)
        .values({
          tenantId:   ctx.session.user.tenantId,
          uploadedBy: ctx.session.user.id,
          key:        input.key,
          fileName:   input.fileName,
          mimeType:   input.mimeType,
          fileSize:   input.fileSize,
          entityType: input.entityType,
          entityId:   input.entityId,
        })
        .returning()

      return file
    }),

  // Delete a file from R2 and remove the DB record
  // delete: authedProcedure
  //   .input(z.object({ fileId: z.string().uuid() }))
  //   .mutation(async ({ ctx, input }) => {
  //     const [file] = await db
  //       .delete(files)
  //       .where(and(
  //         eq(files.id, input.fileId),
  //         eq(files.tenantId, ctx.session.user.tenantId),
  //       ))
  //       .returning()

  //     if (file) await deleteFromR2(file.key)
  //     return { deleted: !!file }
  //   }),
})