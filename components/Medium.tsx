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
  const players = useQuery(api.functions.players.getPlayers, { roomId });
  const alivePlayers = useQuery(api.functions.players.getAlivePlayers, {
    roomId,
  });
  const deadPlayers = useQuery(api.functions.players.getDeadPlayers, {
    roomId,
  });

  // プルダウン式で占うプレイヤーを選択
  const [selectedPlayer, setSelectedPlayer] = React.useState<string>("");
  const [hasDivined, setHasDivined] = React.useState<boolean>(false);

  // roomId, selectedPlayerを受け取り、role.tsのDivinerActionを呼び出す
  const MediumAction = useMutation(api.functions.role.MediumAction);

  const handleDivine = async () => {
    if (!selectedPlayer) return;

    try {
      const result = await MediumAction({
        roomId,
        targetName: selectedPlayer,
      });
      if (result.isWolf) {
        alert(`${selectedPlayer}さんは人狼です`);
      } else {
        alert(`${selectedPlayer}さんは人間です`);
      }
      setHasDivined(true);
    } catch (err) {
      console.error(err);
      alert("占いに失敗しました");
    }
  };

  if (!game) return <div>Loading...</div>;
  if (!game.phase) return <div>ゲーム未開始</div>;
  if (!players) return <div>Loading players...</div>;
  if (!alivePlayers) return <div>Loading alive players...</div>;
  if (!deadPlayers) return <div>Loading dead players...</div>;

  return (
    <div>
      <h2>霊媒師のアクション</h2>
      <p>霊媒するプレイヤーを選択してください。</p>
      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        disabled={hasDivined}
      >
        <option value="">-- プレイヤーを選択 --</option>
        {deadPlayers?.map((p) => (
          <option key={p._id} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => {
          handleDivine();
        }}
        disabled={!selectedPlayer || hasDivined}
      >
        霊媒
      </button>
      {hasDivined && <p>霊媒を行いました。</p>}
    </div>
  );
}
