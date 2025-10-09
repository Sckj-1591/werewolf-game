/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as functions_game from "../functions/game.js";
import type * as functions_messages from "../functions/messages.js";
import type * as functions_players from "../functions/players.js";
import type * as functions_role from "../functions/role.js";
import type * as functions_vote from "../functions/vote.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "functions/game": typeof functions_game;
  "functions/messages": typeof functions_messages;
  "functions/players": typeof functions_players;
  "functions/role": typeof functions_role;
  "functions/vote": typeof functions_vote;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
