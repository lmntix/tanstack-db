import { createTRPCProxyClient, httpBatchLink } from "@trpc/client"
import SuperJSON from "superjson"
import type { AppRouter } from "@/server/api/root"

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      async headers() {
        return {
          cookie: typeof document !== "undefined" ? document.cookie : ""
        }
      },
      transformer: SuperJSON
    })
  ]
})
