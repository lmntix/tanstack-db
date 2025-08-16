import { initTRPC } from "@trpc/server"

import { db } from "@/server/db"

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create()

export const createCallerFactory = t.createCallerFactory

export const createTRPCRouter = t.router

export const publicProcedure = t.procedure
