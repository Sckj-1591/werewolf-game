import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    roomId: v.string(),
    createdAt: v.number(),
  }),
  games: defineTable({
    roomId: v.string(),
    players: v.array(v.object({ name: v.string(), id: v.string() })),
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
})
});

