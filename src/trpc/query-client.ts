import {
  defaultShouldDehydrateQuery,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import superjson from "superjson";

export interface TRPCBlockedErrorDetail {
  code: "FORBIDDEN" | "NOT_FOUND";
  message: string;
}

function handleGlobalError(error: unknown) {
  if (typeof window === "undefined") return;
  if (!(error instanceof TRPCClientError)) return;

  const code = error.data?.code as string | undefined;

  // Banned mid-session → redirect to banned page
  if (code === "FORBIDDEN" && error.message.includes("suspended")) {
    const reason = encodeURIComponent(error.message);
    window.location.href = `/banned?reason=${reason}&expires=permanent`;
    return;
  }

  // Session expired → redirect to home (only after hydration)
  if (code === "UNAUTHORIZED") {
    if (document.readyState === "complete") {
      window.location.href = "/";
    }
    return;
  }

  // Rate limited → toast + localStorage + custom event
  if (code === "TOO_MANY_REQUESTS") {
    const waitSecondsMatch = error.message.match(/\d+/);
    const waitSeconds = waitSecondsMatch ? parseInt(waitSecondsMatch[0]) : 60;
    const path =
      (error.data as { path?: string } | undefined)?.path ?? "global";
    const formatted = new Date(waitSeconds * 1000 - 1000)
      .toISOString()
      .substring(11, 19);

    localStorage.setItem(
      `rateLimit_${path}`,
      (Date.now() + waitSeconds * 1000).toString(),
    );

    window.dispatchEvent(
      new CustomEvent("trpc:rate-limit", { detail: { path, waitSeconds } }),
    );

    import("sonner").then(({ toast }) => {
      toast.error(`Rate limited on ${path}. Try again in ${formatted}.`);
    });
    return;
  }

  // Forbidden / Not found → custom event (let UI handle it)
  if (code === "FORBIDDEN" || code === "NOT_FOUND") {
    window.dispatchEvent(
      new CustomEvent<TRPCBlockedErrorDetail>("trpc:blocked-error", {
        detail: { code, message: error.message },
      }),
    );
    return;
  }
}

export const createQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({ onError: handleGlobalError }),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof TRPCClientError) {
            const code = error.data?.code as string | undefined;
            if (
              code === "FORBIDDEN" ||
              code === "UNAUTHORIZED" ||
              code === "NOT_FOUND"
            )
              return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        onError: handleGlobalError,
        retry: false,
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => false,
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
