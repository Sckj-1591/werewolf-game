"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";

export default function NoActionRole({ roomId }: { roomId: string }) {
  const user = useUser();
  const updatePlayerMoveCompleted = useMutation(
    api.functions.players.updatePlayerMoveComplete
  );
  const currentPlayer = useQuery(api.functions.players.findPlayerByName, {
    roomId,
    name: user.user?.fullName || "",
  });
  const game = useQuery(api.functions.game.getGame, { roomId });
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });
  const togglePhase = useMutation(api.functions.game.togglePhase);

  //行動完了チェック関数の追加
  const checkAllCompleted = useMutation(
    api.functions.game.checkAllCompletedAndAdvancePhase
  );

  if (!user.user?.fullName) return <div>Loading user...</div>;

  return (
    <div>
      <h2>あなたの役職はアクションを持っていません。</h2>
      {!currentPlayer?.isCompleted ? (
        <div>
          <p>下のボタンを押して、行動完了を知らせてください。</p>
          <button
            onClick={async () => {
              if (!currentPlayer || !game) return;
              await updatePlayerMoveCompleted({
                playerId: currentPlayer._id,
                isCompleted: true,
              });
              await checkAllCompleted({ roomId });
            }}
          >
            アクション完了
          </button>
        </div>
      ) : (
        <p>あなたは既に行動完了しています。お待ちください。</p>
      )}
    </div>
  );
}
