"use client";

import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const createGame = useMutation(api.functions.game.createGame);

  const enterRoom = async () => {
    if (roomId.trim()) {
      await createGame({ roomId: roomId.trim() });
      router.push(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>人狼チャットへようこそ</h1>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Room IDを入力"
        style={{ marginRight: 8 }}
      />
      <button onClick={enterRoom}>入室</button>
    </div>
  );
}
