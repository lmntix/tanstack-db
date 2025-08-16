import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema
} from "drizzle-zod"

export const projectsTable = sqliteTable(`projects`, {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text({ length: 255 }).notNull(),
  description: text(),
  shared_user_ids: text("shared_user_ids"),
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
})

export const todosTable = sqliteTable(`todos`, {
  id: integer().primaryKey({ autoIncrement: true }),
  text: text({ length: 500 }).notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  project_id: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  user_ids: text("user_ids")
})

export const selectProjectSchema = createSelectSchema(projectsTable)
export const createProjectSchema = createInsertSchema(projectsTable).omit({
  created_at: true
})
export const updateProjectSchema = createUpdateSchema(projectsTable)

export const selectTodoSchema = createSelectSchema(todosTable)
export const createTodoSchema = createInsertSchema(todosTable).omit({
  created_at: true
})
export const updateTodoSchema = createUpdateSchema(todosTable)

export type Project = typeof projectsTable.$inferSelect
export type UpdateProject = typeof projectsTable.$inferInsert
export type Todo = typeof todosTable.$inferSelect
export type UpdateTodo = typeof todosTable.$inferInsert
