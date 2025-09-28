"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

type ChatProps = {
  roomId: string;
  phase: string; // "day" | "night" | "vote"
};

type Message = {
  _id: string; // Convex が自動で付与
  roomId: string;
  author: string;
  text: string;
  createdAt: number;
};

export default function Chat({ roomId, phase }: ChatProps) {
  const [text, setText] = useState("");
  const messages = useQuery(api.functions.messages.getMessages, { roomId });
  const sendMessage = useMutation(api.functions.messages.send);
  const { user } = useUser();

  if (!user) return <div>ログインしてください</div>;

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendMessage({
      roomId,
      text: text.trim(),
      author: user?.fullName || "名無し",
    });
    setText("");
  };

  if (!messages) return <div>Loading messages...</div>;

  return (
    <div style={{ border: "1px solid #ccc", padding: 8, marginTop: 16 }}>
      <h2>チャット ({phase})</h2>
      <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 8 }}>
        {messages.map((m: Message) => (
          <div key={m._id} style={{ marginBottom: 4 }}>
            <strong>{m.author}:</strong> {m.text}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="メッセージを入力"
        style={{ marginRight: 8 }}
      />
      <button onClick={handleSend}>送信</button>
    </div>
  );
}
