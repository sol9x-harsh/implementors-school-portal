"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { SignOutDialog } from "@/components/shared/SignOutDialog";

export function StudentSignOutButton() {
  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-3 px-4 py-3 rounded-[10px] text-[13px] font-bold text-slate-500 hover:text-slate-900 transition-all w-full"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        Log out
      </button>

      <SignOutDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        callbackUrl="/login" 
      />
    </>
  );
}
