"use client ";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React, { use } from "react";
import DeadChat from "./DeadChat";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function Dead({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  const user = useUser();
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });
  const currentPlayer = useQuery(api.functions.players.findPlayerByName, {
    roomId,
    name: user.user?.fullName || "",
  });
  const updatePlayerMoveComplete = useMutation(
    api.functions.players.updatePlayerMoveComplete
  );
  const checkAllCompleted = useMutation(
    api.functions.game.checkAllCompletedAndAdvancePhase
  );

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (!players) return <div>Loading players...</div>;
  if (!alivePlayers) return <div>Loading alive players...</div>;
  if (!user.user?.fullName) return <div>Loading user...</div>;
  if (!currentPlayer) return <div>Loading current player...</div>;

  return (
    <div>
      <h1>夜だよ</h1>
      <p>あなたは死亡しています。チャットを閲覧できます。</p>
      <div className="chat-center">
        <DeadChat roomId={roomId} phase="night" />
      </div>
      <button
        className="togglePhase"
        onClick={() => togglePhase({ roomId: roomId as string })}
      >
        フェーズ切替
      </button>
    </div>
  );
}
