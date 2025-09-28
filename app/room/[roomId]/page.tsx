"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import DayPhase from "@/components/DayPhase";
import NightPhase from "@/components/NightPhase";
import VotePhase from "@/components/VotePhase";
import VoteResultPhase from "@/components/VoteResultPhase";

type Player = {
  _id: string;
  name: string;
};

export default function RoomPage() {
  const { roomId } = useParams();
  const game = useQuery(api.functions.game.getGame, {
    roomId: roomId as string,
  });
  const startGame = useMutation(api.functions.game.startGame);
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const players = useQuery(api.functions.players.getPlayers, {
    roomId: roomId as string,
  });

  if (!roomId) return <div>Room ID is required</div>;
  if (!game) return <div>Loading...</div>;
  if (!players) return <div>Loading players...</div>;

  switch (game.phase) {
    case "day":
      return <DayPhase roomId={roomId as string} />;
    case "vote":
      return <VotePhase roomId={roomId as string} />;
    case "voteresult":
      return <VoteResultPhase roomId={roomId as string} />;
    case "night":
      return <NightPhase roomId={roomId as string} />;
    default:
      return (
        <div>
          <h1>Room: {roomId}</h1>
          <h2>Players</h2>
          <ul>
            {players.map((p: Player) => (
              <li key={p._id}>{p.name}</li>
            ))}
          </ul>

          {players.length >= 1 && !game.phase && (
            <button onClick={() => startGame({ roomId: roomId as string })}>
              スタート
            </button>
          )}

          {game.phase && (
            <div>
              <h2>
                現在のフェーズ:{" "}
                {game.phase === "night"
                  ? "夜"
                  : game.phase === "day"
                    ? "昼"
                    : game.phase === "vote"
                      ? "投票"
                      : "未開始"}
              </h2>
              <button onClick={() => togglePhase({ roomId: roomId as string })}>
                フェーズ切替
              </button>
            </div>
          )}
        </div>
      );
  }
}
