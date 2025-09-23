"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";

type Player = {
  _id: string;
  name: string;
};

export default function RoomPage() {
  const { roomId } = useParams();
  const game = useQuery(api.functions.game.getGame, { roomId: roomId as string });
  const startGame = useMutation(api.functions.game.startGame);
  const togglePhase = useMutation(api.functions.game.togglePhase);
  const players = useQuery(api.functions.players.getPlayers, { roomId: roomId as string });

  if (!roomId) return <div>Room ID is required</div>;
  if (!game) return <div>Loading...</div>;
  if(!players) return <div>Loading players...</div>;

  return (
    <div>
      <h1>Room: {roomId}</h1>
      <h2>Players</h2>
      <ul>
        {players.map((p: Player) => (
          <li key={p._id}>{p.name}</li>
        ))}
      </ul>

      {players.length >= 4 && !game.phase && (
        <button onClick={() => startGame({ roomId: roomId as string })}>
          スタート
        </button>
      )}

      {game.phase && (
        <div>
          <h2>現在のフェーズ: {game.phase === "night" ? "夜" : "朝"}</h2>
          <button onClick={() => togglePhase({ roomId: roomId as string })}>
            フェーズ切替
          </button>
        </div>
      )}
    </div>
  );
}