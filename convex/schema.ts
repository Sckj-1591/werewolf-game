import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    roomId: v.string(),
    phase: v.union(v.string(), v.null()),
    day: v.number(),
    createdAt: v.number(),
  }),
  messages: defineTable({
    roomId: v.string(),
    author: v.string(),
    text: v.string(),
    createdAt: v.number(),
  }),
  players: defineTable({
    roomId: v.string(),
    name: v.string(),
    joinedAt: v.number(),
    alive: v.boolean(),
    role: v.union(v.string(), v.null()),
  }),
});
