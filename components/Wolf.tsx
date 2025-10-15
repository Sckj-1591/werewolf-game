"use client";

import { useQuery } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import React from "react";
import Chat from "./Chat";
import { useUser } from "@clerk/nextjs";
import WolfChat from "./WolfChat";

export default function Wolf({ roomId }: { roomId: string }) {
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

  // プルダウン式で占うプレイヤーを選択
  const [selectedPlayer, setSelectedPlayer] = React.useState<string>("");
  const [hasAttacked, setHasAttacked] = React.useState<boolean>(false);

  // roomId, selectedPlayerを受け取り、role.tsのDivinerActionを呼び出す
  const WolfAction = useMutation(api.functions.role.WolfAction);

  const handleAttack = async () => {
    if (!selectedPlayer) return;
    await WolfAction({ roomId, targetName: selectedPlayer });
    await alert(`${selectedPlayer}さんを襲撃しました`);
    await setHasAttacked(true);
    if (currentPlayer && currentPlayer._id) {
      await updatePlayerMoveComplete({
        playerId: currentPlayer._id,
        isCompleted: true,
      });
    }
  };

  const checkAllCompleted = useMutation(
    api.functions.game.checkAllCompletedAndAdvancePhase
  );

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (!players) return <div>Loading players...</div>;
  if (!alivePlayers) return <div>Loading alive players...</div>;

  if (game.day === 0) {
    return (
      <div>
        <h2>人狼のアクション</h2>
        <p>初日は襲撃できません。</p>
        {!currentPlayer?.isCompleted ? (
          <button
            onClick={async () => {
              if (!currentPlayer || !game) return;
              await updatePlayerMoveComplete({
                playerId: currentPlayer._id,
                isCompleted: true,
              });
              await checkAllCompleted({
                roomId,
              });
            }}
          >
            アクション完了
          </button>
        ) : (
          <p>あなたは行動完了しています。</p>
        )}
        <WolfChat roomId={roomId} phase="night" />
      </div>
    );
  }

  return (
    <div>
      <h2>人狼のアクション</h2>
      {!currentPlayer?.isCompleted ? (
        <div>
          <p>襲撃するプレイヤーを選択してください。</p>
          <select
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            disabled={hasAttacked}
          >
            <option value="">-- プレイヤーを選択 --</option>
            {alivePlayers?.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={async () => {
              await handleAttack();
              await checkAllCompleted({
                roomId,
              });
            }}
            disabled={!selectedPlayer || hasAttacked}
          >
            襲撃
          </button>
        </div>
      ) : (
        <div>{hasAttacked && <p>襲撃を行いました。</p>}</div>
      )}
      <WolfChat roomId={roomId} phase="night" />
    </div>
  );
}
