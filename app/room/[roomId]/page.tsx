"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import DayPhase from "@/components/DayPhase";
import NightPhase from "@/components/NightPhase";
import VotePhase from "@/components/VotePhase";
import VoteResultPhase from "@/components/VoteResultPhase";
import React, { useEffect } from "react";
import MorningPhase from "@/components/MorningPhase";
import CheckVictory from "@/components/CheckVictory";
import WolfWin from "@/components/WolfWin";
import VillagersWin from "@/components/VillagersWin";
import { useUser } from "@clerk/nextjs";

type Player = {
  _id: string;
  name: string;
};

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const game = useQuery(api.functions.game.getGame, {
    roomId: roomId as string,
  });
  const startGame = useMutation(api.functions.game.startGame);
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const players = useQuery(api.functions.players.getPlayers, {
    roomId: roomId as string,
  });
  const roles = useQuery(api.functions.role.getRoles, {});
  const assignRoles = useMutation(api.functions.role.assignRoles);
  const [assigned, setAssigned] = React.useState(false);
  const user = useUser();
  const currentPlayer = useQuery(api.functions.players.findPlayerByName, {
    roomId: roomId as string,
    name: user.user?.fullName || "",
  });
  const current = currentPlayer ? currentPlayer.role : "";

  const updatePlayerMoveComplete = useMutation(
    api.functions.players.updatePlayerMoveComplete
  );
  const checkAllCompleted = useMutation(
    api.functions.game.checkAllCompletedAndAdvancePhase
  );

  useEffect(() => {
    //assignedをfalseにリセット
    setAssigned(false);
  }, [game?.phase]);

  const handleRoles = async ({
    roomId,
    rolesWithCounts,
  }: {
    roomId: string;
    rolesWithCounts: { role: string; count: number }[];
  }) => {
    const totalCount = rolesWithCounts.reduce((sum, r) => sum + r.count, 0);
    if (players?.length !== totalCount) {
      alert("プレイヤー数と役職数の合計が一致しません");
      return;
    }
    setAssigned(true);
    await assignRoles({ roomId, rolesWithCounts });
  };

  if (!roomId) return <div>Room ID is required</div>;
  if (!game) return <div>Loading...</div>;
  if (!players) return <div>Loading players...</div>;

  switch (game.phase) {
    case "morning":
      return <MorningPhase roomId={roomId as string} />;
    case "day":
      return <DayPhase roomId={roomId as string} />;
    case "vote":
      return <VotePhase roomId={roomId as string} />;
    case "voteresult":
      return <VoteResultPhase roomId={roomId as string} />;
    case "night":
      return <NightPhase roomId={roomId as string} />;
    case "checkvictoryMorning":
      return <CheckVictory roomId={roomId as string} />;
    case "checkvictoryNight":
      return <CheckVictory roomId={roomId as string} />;
    case "wolfWin":
      return <WolfWin roomId={roomId as string} />;
    case "villgersWin":
      return <VillagersWin roomId={roomId as string} />;
    case "ready": {
      return (
        <div>
          <h1>Room: {roomId}</h1>
          <h2>Players</h2>
          <ul className="player-list">
            {players.map((p: Player) => (
              <li key={p._id}>{p.name}</li>
            ))}
          </ul>

          <h1>配役を設定</h1>
          {/* 役職一覧を使用して 役職名 <input number>の形で表示 */}
          {roles && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const selectedRoles = roles.map((role: { Name: string }) => ({
                  role: role.Name,
                  count: Number(formData.get(role.Name)) || 0,
                }));
                handleRoles({ roomId, rolesWithCounts: selectedRoles });
              }}
            >
              <ul className="player-list">
                {roles.map((role: { Name: string }) => (
                  <li key={role.Name}>
                    <label>
                      {role.Name}
                      <input
                        type="number"
                        name={role.Name}
                        min={0}
                        defaultValue={0}
                        style={{ width: 60, marginLeft: 8 }}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              <button type="submit">役職を設定</button>
            </form>
          )}

          {players.length >= 1 && (
            <button
              disabled={!assigned}
              onClick={() => startGame({ roomId: roomId as string })}
            >
              スタート
            </button>
          )}

          {game.phase && (
            <div>
              <button onClick={() => togglePhase({ roomId: roomId as string })}>
                フェーズ切替
              </button>
            </div>
          )}
          {assigned && <p>役職を設定しました</p>}
          {!assigned && <p>役職を設定してください</p>}
          <p>Debug: 現在のフェーズは {game.phase ?? "未設定"} です</p>
        </div>
      );
    }
    case "notify": {
      return (
        <div>
          <h1>あなたの役職は{currentPlayer?.role}です。</h1>
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
              確認完了
            </button>
          ) : (
            <p>あなたは確認完了しています。</p>
          )}
          <button onClick={() => togglePhase({ roomId: roomId as string })}>
            フェーズ切替
          </button>
        </div>
      );
    }
    default:
      return <div>ゲーム未開始</div>;
  }
}
