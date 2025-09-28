"use client";

import React, { use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function VoteResultPhase({ roomId }: { roomId: string }) {
  const game = useQuery(api.functions.game.getGame, { roomId });
  const togglePhase = useMutation(api.functions.game.togglePhase);
  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  return (
    <div>
      <h1>投票結果だよ</h1>
      <button onClick={() => togglePhase({ roomId: roomId as string })}>
        フェーズ切替
      </button>
      <h1>投票結果発表だよ</h1>
      <p>誰が一番票を集めたかな？</p>
    </div>
  );
}
