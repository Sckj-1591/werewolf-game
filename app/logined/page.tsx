"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { SignOutButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const createGame = useMutation(api.functions.game.createGame);
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const addPlayer = useMutation(api.functions.players.addPlayer);
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  const enterRoom = async () => {
    if (roomId.trim()) {
      await createGame({ roomId: roomId.trim() });
      await addPlayer({
        roomId: roomId.trim(),
        name: user?.fullName || "名無し",
      });
      router.push(`/room/${roomId.trim()}`);
    }
  };

  if (isSignedIn) {
    return (
      <div style={{ padding: 20 }}>
        <h2>ようこそ！{isSignedIn ? user?.fullName : "ゲスト"}さん</h2>
        <h3>人狼 By BYOD へようこそ</h3>
        <input
          type="number"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Room IDを入力"
          style={{ marginRight: 8 }}
        />
        <br />
        <button onClick={enterRoom}>入室</button>
        <br />
        <SignOutButton>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            ログアウト
          </button>
        </SignOutButton>
      </div>
    );
  }
  return <div>Loading...</div>;
}
