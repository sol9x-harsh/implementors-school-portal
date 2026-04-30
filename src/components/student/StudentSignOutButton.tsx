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
        className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold
          text-red-500 bg-red-50/50 hover:bg-red-50 hover:text-red-600 transition-all duration-300 w-full"
      >
        <LogOut className="w-4 h-4 shrink-0" />
        Log Out
      </button>

      <SignOutDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        callbackUrl="/login" 
      />
    </>
  );
}
