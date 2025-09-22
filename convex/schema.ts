import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    roomId: v.string(),
    players: v.array(v.object({ name: v.string(), id: v.string() })), // プレイヤー情報
    phase: v.union(v.string(), v.null()), // "day" | "night" など
    createdAt: v.number(),
  }),
});
