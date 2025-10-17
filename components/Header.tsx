"use client";

import { useUser } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn, user } = useUser();
  return (
    <header className="app-header">
      <div className="header-center">人狼 By BYOD</div>
      <div className="header-right">
        <span className="underline">
          {isSignedIn ? user?.fullName : "ゲスト"}
        </span>
      </div>
    </header>
  );
}
