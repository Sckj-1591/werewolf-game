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
  votes: defineTable({
    roomId: v.string(),
    voterName: v.string(),
    targetName: v.string(),
    day: v.number(),
    createdAt: v.number(),
  }),
  roles: defineTable({
    Name: v.string(),
    Description: v.string(),
    Team: v.string(),
    IsWolf: v.boolean(),
    CanTalkAtNight: v.boolean(),
  }),
  attack: defineTable({
    roomId: v.string(),
    targetName: v.string(),
    defencedName: v.union(v.string(), v.null()),
  }),
});
