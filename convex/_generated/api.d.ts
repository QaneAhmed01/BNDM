/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as advanceMatch from "../advanceMatch.js";
import type * as castVote from "../castVote.js";
import type * as createRoom from "../createRoom.js";
import type * as getRoomState from "../getRoomState.js";
import type * as joinRoom from "../joinRoom.js";
import type * as tournament from "../tournament.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  advanceMatch: typeof advanceMatch;
  castVote: typeof castVote;
  createRoom: typeof createRoom;
  getRoomState: typeof getRoomState;
  joinRoom: typeof joinRoom;
  tournament: typeof tournament;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
