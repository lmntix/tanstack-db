import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { createProjectSchema, projectsTable } from "@/server/db/schema"
import { createTRPCRouter, publicProcedure } from "../trpc"

export const projectsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.select().from(projectsTable)

    return projects
  }),

  create: publicProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      const [newItem] = await ctx.db
        .insert(projectsTable)
        .values(input)
        .returning()

      return newItem
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().nullable().optional(),
          shared_user_ids: z.array(z.string()).optional(),
          created_at: z.date().optional()
        })
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedItem] = await ctx.db
        .update(projectsTable)
        .set(input.data)
        .where(and(eq(projectsTable.id, input.id)))
        .returning()

      if (!updatedItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Project not found or you do not have permission to update it"
        })
      }

      return updatedItem
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedItem] = await ctx.db
        .delete(projectsTable)
        .where(and(eq(projectsTable.id, input.id)))
        .returning()

      if (!deletedItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "Project not found or you do not have permission to delete it"
        })
      }

      return deletedItem
    })
})
