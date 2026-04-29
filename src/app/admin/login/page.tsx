"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, ShieldCheck, ArrowRight, Lock, Database, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const adminFeatures = [
  { icon: Lock, label: "Secure Access", desc: "Enterprise-grade encryption for all institutional data." },
  { icon: Database, label: "Bulk Records", desc: "Manage thousands of student profiles and academic logs." },
  { icon: UserCheck, label: "Verification", desc: "Audit and validate student credentials in real-time." },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Unauthorized access. Please check your admin credentials.");
      setLoading(false);
    } else {
      // Verify the user has admin privileges before navigating
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
        router.push("/admin");
        router.refresh();
      } else {
        setError("This account does not have administrator privileges. Please use the Student Portal.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-theme flex min-h-screen bg-[#fafafa]">
      {/* ── Left Panel: Admin Branding ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-[40%] relative overflow-hidden flex-col justify-between p-12 bg-purple-foreground text-white">
        <div className="absolute inset-0 bg-purple-gradient opacity-10" />
        
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-primary flex items-center justify-center shadow-purple">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-black text-xl uppercase tracking-widest">Sol9x Console</span>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <h1 className="text-4xl font-heading font-black leading-tight uppercase tracking-tighter">
              Institutional<br />Control Center
            </h1>
            <p className="text-purple-muted-foreground mt-4 font-medium text-sm leading-relaxed max-w-xs">
              Secure gateway for administrators and institutional auditors.
            </p>
          </motion.div>

          <div className="space-y-6">
            {adminFeatures.map((f, i) => (
              <motion.div 
                key={f.label} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-primary/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-purple-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">{f.label}</h3>
                  <p className="text-xs text-purple-muted-foreground mt-1 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="relative z-10 text-white/20 text-[10px] font-black uppercase tracking-widest">
          Secure Terminal v2.4.0 · System Audit Active
        </motion.p>
      </div>

      {/* ── Right Panel: Login Form ────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-secondary/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-primary/10 text-purple-primary text-[10px] font-black uppercase tracking-widest mb-4">
              Restricted Access
            </div>
            <h2 className="text-4xl font-heading font-black text-purple-foreground tracking-tighter">Administrator Login</h2>
            <p className="text-purple-muted-foreground mt-2 font-medium">Verify your identity to manage institutional records.</p>
          </div>

          <div className="bg-white rounded-5xl p-10 shadow-purple border border-purple-border/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black text-purple-foreground uppercase tracking-widest ml-1">
                  Admin Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sol9x.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/10 focus:bg-white focus:border-purple-primary transition-all font-semibold"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-[10px] font-black text-purple-foreground uppercase tracking-widest">
                    Secure Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12 rounded-2xl border-purple-border/40 bg-purple-secondary/10 focus:bg-white focus:border-purple-primary transition-all font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-muted-foreground hover:text-purple-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-purple-gradient text-white font-heading font-black text-sm shadow-purple-lg hover:scale-[1.01] active:scale-95 transition-all mt-4 border-none"
              >
                {loading ? "Authenticating..." : "Establish Secure Session"}
              </Button>
            </form>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button 
              onClick={() => router.push("/login")}
              className="text-[11px] font-black text-purple-muted-foreground uppercase tracking-widest hover:text-purple-primary transition-colors"
            >
              Switch to Student Portal
            </button>
            <div className="flex items-center gap-2 text-[10px] text-purple-muted-foreground/40 font-bold">
              <Lock className="w-3 h-3" />
              <span>TLS 1.3 Active Encryption</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
