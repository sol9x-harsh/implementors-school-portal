"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminSignOutButton() {
  return (
    <button
      onClick={() => {
        if (window.confirm("Are you sure you want to sign out?")) {
          signOut({ callbackUrl: "/admin/login" });
        }
      }}
      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold
        transition-all duration-150 w-full text-rose-500 bg-rose-500/10 hover:bg-rose-500/20"
    >
      <LogOut className="w-3.5 h-3.5 shrink-0" />
      Sign Out
    </button>
  );
}
