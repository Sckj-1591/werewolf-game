import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// 通常チャット一覧取得（リアルタイム購読用）
export const list = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), args.roomId),
          q.eq(q.field("isWolfChat"), false),
          q.eq(q.field("isDead"), false)
        )
      )
      .order("asc")
      .collect();
  },
});

//　人狼チャット一覧取得（リアルタイム購読用）
export const wolfList = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), args.roomId),
          q.eq(q.field("isWolfChat"), true)
        )
      )
      .order("asc")
      .collect();
  },
});

//　死者チャット一覧取得（リアルタイム購読用）
export const deadList = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) =>
        q.and(
          q.eq(q.field("roomId"), args.roomId),
          q.eq(q.field("isDead"), true)
        )
      )
      .order("asc")
      .collect();
  },
});

// 通常メッセージ送信
export const normalSend = mutation({
  args: { roomId: v.string(), author: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      author: args.author,
      text: args.text,
      createdAt: Date.now(),
      isWolfChat: false,
      isDead: false,
    });
  },
});

// 狼チャット用メッセージ送信
export const wolfSend = mutation({
  args: { roomId: v.string(), author: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      author: args.author,
      text: args.text,
      createdAt: Date.now(),
      isWolfChat: true,
      isDead: false,
    });
  },
});

// 死者用メッセージ送信
export const deadSend = mutation({
  args: { roomId: v.string(), author: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      author: args.author,
      text: args.text,
      createdAt: Date.now(),
      isWolfChat: false,
      isDead: true,
    });
  },
});

// 過去の通常メッセージ取得（履歴表示用）
export const getMessages = query({
  args: { roomId: v.string() },
  handler: async (ctx, { roomId }) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("roomId"), roomId))
      .order("asc")
      .collect();
  },
});
