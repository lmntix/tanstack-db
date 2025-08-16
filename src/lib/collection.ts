import { QueryClient } from "@tanstack/query-core"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { createCollection } from "@tanstack/react-db"
import { trpc } from "@/server/api/trpc-client"
import { selectProjectSchema, selectTodoSchema } from "@/server/db/schema"

// Create a query client for query collections
const queryClient = new QueryClient()

export const projectCollection = createCollection(
  queryCollectionOptions({
    id: "projects",
    queryKey: ["projects"],
    // Poll for updates every 5 seconds
    refetchInterval: 5000,
    queryFn: async () => {
      const projects = await trpc.projects.getAll.query()
      return projects.map((project) => ({
        ...project,
        created_at: new Date(project.created_at)
      }))
    },
    queryClient,
    schema: selectProjectSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newProject } = transaction.mutations[0]
      await trpc.projects.create.mutate({
        name: newProject.name,
        description: newProject.description,
        shared_user_ids: Array.isArray(newProject.shared_user_ids)
          ? newProject.shared_user_ids
          : newProject.shared_user_ids
            ? JSON.parse(newProject.shared_user_ids)
            : []
      })
    },
    onUpdate: async ({ transaction }) => {
      const { modified: updatedProject } = transaction.mutations[0]
      await trpc.projects.update.mutate({
        id: updatedProject.id,
        data: {
          name: updatedProject.name,
          description: updatedProject.description,
          shared_user_ids: Array.isArray(updatedProject.shared_user_ids)
            ? updatedProject.shared_user_ids
            : updatedProject.shared_user_ids
              ? JSON.parse(updatedProject.shared_user_ids)
              : []
        }
      })
    },
    onDelete: async ({ transaction }) => {
      const { original: deletedProject } = transaction.mutations[0]
      await trpc.projects.delete.mutate({
        id: deletedProject.id
      })
    }
  })
)

export const todoCollection = createCollection(
  queryCollectionOptions({
    id: "todos",
    queryKey: ["todos"],
    // Poll for updates every 5 seconds
    refetchInterval: 2000,
    queryFn: async () => {
      const todos = await trpc.todos.getAll.query()
      return todos.map((todo) => ({
        ...todo,
        created_at: new Date(todo.created_at)
      }))
    },
    queryClient,
    schema: selectTodoSchema,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newTodo } = transaction.mutations[0]
      await trpc.todos.create.mutate({
        text: newTodo.text,
        completed: newTodo.completed,
        project_id: newTodo.project_id,
        user_ids: newTodo.user_ids
      })
    },
    onUpdate: async ({ transaction }) => {
      const { modified: updatedTodo } = transaction.mutations[0]
      await trpc.todos.update.mutate({
        id: updatedTodo.id,
        data: {
          text: updatedTodo.text,
          completed: updatedTodo.completed
        }
      })
    },
    onDelete: async ({ transaction }) => {
      const { original: deletedTodo } = transaction.mutations[0]
      await trpc.todos.delete.mutate({
        id: deletedTodo.id
      })
    }
  })
)
