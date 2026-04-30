"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff, GraduationCap, ArrowRight, BookOpen, Trophy, TrendingUp, Sparkles, BookOpenCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const stats = [
  { icon: BookOpen, label: "Active Students", value: "842+" },
  { icon: Trophy, label: "Verified Achievements", value: "3.2K+" },
  { icon: TrendingUp, label: "Growth Tracked", value: "120+" },
];

export default function LoginPage() {
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
      setError("Invalid credentials. Please check and try again.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="admin-theme flex min-h-screen bg-[#fafafa] selection:bg-purple-primary/30">
      {/* ── Left Panel: Branding ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-16 bg-purple-foreground">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-purple-gradient opacity-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-primary/20 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-purple-accent/10 blur-[80px]" />
        
        {/* Logo */}
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-gradient flex items-center justify-center shadow-purple-lg rotate-3 group hover:rotate-6 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-white font-heading font-black text-2xl tracking-tighter uppercase block leading-none">Sol9x</span>
              <span className="text-purple-muted-foreground font-sans font-black text-[10px] uppercase tracking-[0.3em] block mt-1">Student Portal</span>
            </div>
          </motion.div>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-purple-accent text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-3 h-3" />
              Empowering Education
            </div>
            <h1 className="text-6xl font-heading font-black text-white leading-[0.9] tracking-tighter uppercase">
              Unlock Your<br />
              <span className="text-purple-primary">Potential</span><br />
              Today.
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-purple-muted-foreground text-base leading-relaxed max-w-sm font-medium"
          >
            Access your academic records, track your progress, and build a verified portfolio that stands out.
          </motion.p>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 pt-4"
          >
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 group hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4 text-purple-primary" />
                  </div>
                  <div className="text-white font-heading font-black text-xl tracking-tight leading-none">{stat.value}</div>
                  <div className="text-purple-muted-foreground text-[10px] font-bold uppercase tracking-wider mt-2">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Bottom attribution */}
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.9 }}
          className="relative z-10 text-white/20 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          © 2026 Sol9x Academy · Institutional Grade Security
        </motion.p>
      </div>

      {/* ── Right Panel: Login Form ────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 relative overflow-hidden">
        {/* Background blobs for premium feel */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

        {/* Mobile logo */}
        <div className="lg:hidden mb-12 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-gradient flex items-center justify-center shadow-purple-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <span className="font-heading font-black text-3xl text-purple-foreground tracking-tighter uppercase block leading-none">Sol9x</span>
            <span className="text-purple-muted-foreground font-sans font-bold text-xs uppercase tracking-[0.3em] block mt-1">Student Portal</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[440px] relative z-10"
        >
          {/* Heading */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-heading font-black text-purple-foreground tracking-tighter uppercase">Welcome Back</h2>
            <p className="text-purple-muted-foreground mt-2 font-medium">Authenticate to access your workspace</p>
          </div>

          {/* Premium Form Card */}
          <div className="bg-white rounded-[40px] p-10 shadow-purple border border-purple-border/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error */}
              <AnimatePresence mode="wait">
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

              {/* Identifier */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-[10px] font-black text-purple-foreground uppercase tracking-widest ml-1">
                  Student Email Address
                </Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="scholar@sol9x.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-2xl border-purple-border/40 bg-purple-secondary/10 focus:bg-white focus:border-purple-primary transition-all font-semibold placeholder:text-purple-muted-foreground/40"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-[10px] font-black text-purple-foreground uppercase tracking-widest">
                    Security Password
                  </Label>
                  <button type="button" className="text-[10px] font-black text-purple-primary uppercase tracking-widest hover:underline">
                    Forgot?
                  </button>
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
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-purple-gradient text-white font-heading font-black text-sm shadow-purple-lg hover:scale-[1.01] active:scale-95 transition-all mt-4 border-none flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Enter Portal
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Footer actions */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <button 
              onClick={() => router.push("/admin/login")}
              className="group flex items-center gap-2 text-[11px] font-black text-purple-muted-foreground uppercase tracking-widest hover:text-purple-primary transition-all"
            >
              <BookOpenCheck className="w-4 h-4" />
              Institutional Admin Login
            </button>
            
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-purple-secondary/10 border border-purple-border/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-purple-muted-foreground font-bold uppercase tracking-wider">Systems Operational</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
