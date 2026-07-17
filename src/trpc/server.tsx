import "server-only"

import type { TRPCQueryOptions } from "@trpc/tanstack-react-query"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { cache } from "react"
import { headers } from "next/headers"
import { appRouter } from "@/server/api/root"
import { createTRPCContext } from "@/server/api/trpc"
import { createQueryClient } from "./query-client"

const createContext = cache(async () => {
  const heads = new Headers(await headers())
  heads.set("x-trpc-source", "rsc")
  return createTRPCContext({ headers: heads })
})

const getQueryClient = cache(createQueryClient)

export const trpc = createTRPCOptionsProxy({
  router: appRouter,
  ctx: createContext,
  queryClient: getQueryClient,
})

export function HydrateClient({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  )
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient()
  if (queryOptions.queryKey[1]?.type === "infinite") {
    void queryClient.prefetchInfiniteQuery(
      queryOptions as unknown as Parameters<
        typeof queryClient.prefetchInfiniteQuery
      >[0],
    )
  } else {
    void queryClient.prefetchQuery(queryOptions)
  }
}


type DeepPromiseProxy<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => Promise<infer R>
    ? (...args: A) => Promise<R>
    : T[K] extends (...args: infer A) => infer R
      ? (...args: A) => Promise<R>
      : DeepPromiseProxy<T[K]>;
};


const getCaller = cache(async () => {
  const ctx = await createContext();
  return appRouter.createCaller(ctx);
});

function createApiProxy<T extends object>(
  resolveFn: () => Promise<T>,
  path: string[] = [],
): DeepPromiseProxy<T> {
  return new Proxy((function () {}) as unknown as DeepPromiseProxy<T>, {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      return createApiProxy(resolveFn, [...path, key]);
    },
    async apply(_, __, args) {
      const caller = await resolveFn();
      let target: unknown = caller;
      for (const key of path) {
        target = (target as Record<string, unknown>)[key];
      }
      if (typeof target !== "function") {
        throw new Error(`api.${path.join(".")} is not a function`);
      }
      return (target as (...a: unknown[]) => unknown)(...(args as unknown[]));
    },
  });
}

export const api: DeepPromiseProxy<ReturnType<typeof appRouter.createCaller>> =
  createApiProxy(getCaller);
