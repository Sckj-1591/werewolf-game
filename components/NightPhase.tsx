"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import Chat from "./Chat";

export default function NightPhase({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;

  return (
    <div>
      <h1>夜だよ</h1>
      <button onClick={() => togglePhase({ roomId: roomId as string })}>
        フェーズ切替
      </button>

      <Chat roomId={roomId} phase="night" />
    </div>
  );
}
