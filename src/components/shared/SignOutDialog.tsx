"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { LogOut, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SignOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callbackUrl: string;
}

export function SignOutDialog({ open, onOpenChange, callbackUrl }: SignOutDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut({ callbackUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] rounded-[32px] p-0 overflow-hidden border-none shadow-purple-xl">
        <div className="bg-purple-foreground p-8 text-center relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-purple-gradient opacity-10" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-primary/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 shadow-purple-lg rotate-3">
              <LogOut className="w-8 h-8 text-white" />
            </div>
            
            <DialogTitle className="text-white text-2xl font-heading font-black uppercase tracking-tighter mb-2">
              Sign Out?
            </DialogTitle>
            <DialogDescription className="text-purple-muted-foreground font-medium text-sm">
              You are about to end your current secure session.
            </DialogDescription>
          </div>
        </div>

        <div className="p-6 bg-white space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            End session across all tabs
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 rounded-2xl border-purple-border/30 text-purple-foreground font-bold uppercase tracking-widest hover:bg-purple-secondary/10"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSignOut}
              className="h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white border-none font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Wait...
                </div>
              ) : (
                "Sign Out"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
