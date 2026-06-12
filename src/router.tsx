import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Native crossfade between routes where the View Transitions API exists;
    // styles.css disables it under prefers-reduced-motion.
    defaultViewTransition: true,
  });

  // Streams the server-side React Query cache to the client so data fetched in
  // route loaders hydrates instead of refetching (and SSR HTML has real content).
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
