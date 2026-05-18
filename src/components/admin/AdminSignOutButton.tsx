"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { SignOutDialog } from "@/components/shared/SignOutDialog";

export function AdminSignOutButton() {
  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-[0.12em]
          transition-all duration-300 w-full text-rose-500 bg-rose-50/50 hover:bg-rose-50 hover:text-rose-600 border border-rose-100 shadow-sm"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        Sign Out
      </button>

      <SignOutDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        callbackUrl="/admin/login" 
      />
    </>
  );
}
