"use client";

import { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { addPlayer } from "@/convex/functions/players";
import ConvexClientProvider from "./ConvexClientProvider";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";

export default function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const createGame = useMutation(api.functions.game.createGame);
  const addPlayer = useMutation(api.functions.players.addPlayer);
  const { isSignedIn, user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    const enterRoom = async () => {
      if (roomId.trim()) {
        await createGame({ roomId: roomId.trim() });
        await addPlayer({
          roomId: roomId.trim(),
          name: name.trim() || "名無し",
        });
        router.push(`/room/${roomId.trim()}`);
      }
    };

    return (
      <div style={{ padding: 20 }}>
        <h1>人狼チャットへようこそ</h1>
        <input
          type="number"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room IDを入力"
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="あなたの名前を入力"
          style={{ marginRight: 8 }}
        />
        <button onClick={enterRoom}>入室</button>
        <h1 className="text-xl font-semibold">
          ようこそ！{isAuthenticated ? user?.fullName : "ゲスト"}さん
        </h1>
        <div className="flex gap-4">
          {!isAuthenticated ? (
            <SignInButton mode="modal">
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                ログイン
              </button>
            </SignInButton>
          ) : (
            <SignOutButton>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                ログアウト
              </button>
            </SignOutButton>
          )}
        </div>
      </div>
    );
  }
}
