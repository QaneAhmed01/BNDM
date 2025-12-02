import { ConvexHttpClient } from "convex/browser";

let client: ConvexHttpClient | null = null;

export function getConvexClient() {
  if (!client) {
    const url =
      process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL;

    if (!url) {
      throw new Error(
        "Missing Convex deployment URL. Set NEXT_PUBLIC_CONVEX_URL."
      );
    }

    client = new ConvexHttpClient(url, { skipConvexDeploymentUrlCheck: true });
  }

  return client;
}
