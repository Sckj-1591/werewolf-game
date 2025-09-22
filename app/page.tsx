"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const enterRoom = () => {
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
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
