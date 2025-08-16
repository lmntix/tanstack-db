import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod/v4"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import {
  createTodoSchema,
  todosTable,
  updateTodoSchema
} from "@/server/db/schema"

export const todosRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const todos = await ctx.db.select().from(todosTable)
    return todos
  }),

  create: publicProcedure
    .input(createTodoSchema)
    .mutation(async ({ ctx, input }) => {
      const [newItem] = await ctx.db
        .insert(todosTable)
        .values(input)
        .returning()
      return newItem
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        data: updateTodoSchema
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedItem] = await ctx.db
        .update(todosTable)
        .set(input.data)
        .where(eq(todosTable.id, input.id))
        .returning()

      if (!updatedItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Todo not found or you do not have permission to update it"
        })
      }

      return updatedItem
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [deletedItem] = await ctx.db
        .delete(todosTable)
        .where(eq(todosTable.id, input.id))
        .returning()

      if (!deletedItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Todo not found or you do not have permission to delete it"
        })
      }

      return deletedItem
    })
})
