import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

// チャット一覧取得（リアルタイム購読用）
export const list = query({
  args: { roomId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .order("asc")
      .collect();
  },
});

// メッセージ送信
export const send = mutation({
  args: { roomId: v.string(), author: v.string(), text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      roomId: args.roomId,
      author: args.author,
      text: args.text,
      createdAt: Date.now(),
    });
  },
});

// 過去のメッセージ取得（履歴表示用）
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
