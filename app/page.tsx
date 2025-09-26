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
    return (
      <div>
        <div style={{ padding: 20 }}>
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
      </div>
    );
  }

  if (isAuthenticated) {
    router.push("/logined");
  }

  return <div>Redirecting...</div>;
}
