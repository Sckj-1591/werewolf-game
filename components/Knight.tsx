"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import Chat from "./Chat";
import { useUser } from "@clerk/nextjs";

export default function Diviner({ roomId }: { roomId: string }) {
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const game = useQuery(api.functions.game.getGame, { roomId });
  const user = useUser();
  const currentPlayer = useQuery(api.functions.players.findPlayerByName, {
    roomId,
    name: user.user?.fullName || "",
  });
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });
  const updatePlayerMoveComplete = useMutation(
    api.functions.players.updatePlayerMoveComplete
  );
  const checkAllCompleted = useMutation(
    api.functions.game.checkAllCompletedAndAdvancePhase
  );

  // プルダウン式で占うプレイヤーを選択
  const [selectedPlayer, setSelectedPlayer] = React.useState<string>("");
  const [hasDefenced, setHasDefenced] = React.useState<boolean>(false);

  // roomId, selectedPlayerを受け取り、role.tsのDivinerActionを呼び出す
  const KnightAction = useMutation(api.functions.role.KnightAction);

  const handleDefence = async () => {
    if (!selectedPlayer) return;
    if (selectedPlayer === currentPlayer?.name) {
      alert("自分自身を護衛することはできません");
      return;
    }
    await KnightAction({ roomId, targetName: selectedPlayer });
    await setHasDefenced(true);
    if (currentPlayer && currentPlayer._id) {
      await updatePlayerMoveComplete({
        playerId: currentPlayer._id,
        isCompleted: true,
      });
    }
  };

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (!players) return <div>Loading players...</div>;
  if (!alivePlayers) return <div>Loading alive players...</div>;

  if (game.day === 0) {
    return (
      <div>
        <div>
          <h2>騎士のアクション</h2>
          <p>初日は護衛できません。</p>
        </div>
        {!currentPlayer?.isCompleted ? (
          <button
            onClick={async () => {
              if (!currentPlayer || !game) return;
              await updatePlayerMoveComplete({
                playerId: currentPlayer._id,
                isCompleted: true,
              });
              await checkAllCompleted({ roomId });
            }}
          >
            アクション完了
          </button>
        ) : (
          <h3>あなたは行動完了しています。</h3>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>騎士のアクション</h2>
      {!currentPlayer?.isCompleted ? (
        <div>
          <p>護衛するプレイヤーを選択してください。</p>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            disabled={hasDefenced}
          >
            <option value="">-- プレイヤーを選択 --</option>
            {alivePlayers?.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <br />
          <button
            onClick={async () => {
              await handleDefence();
              await checkAllCompleted({ roomId });
            }}
            disabled={!selectedPlayer || hasDefenced}
          >
            護衛
          </button>
        </div>
      ) : (
        <div>{hasDefenced && <h3>護衛を行いました。</h3>}</div>
      )}
    </div>
  );
}
