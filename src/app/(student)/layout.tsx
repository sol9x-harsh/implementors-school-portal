import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { 
  BookOpen, 
  Activity, 
  LogOut, 
  Bell, 
  MessageCircle, 
  Search, 
  ChevronDown 
} from "lucide-react";
import { StudentNavClient } from "@/components/student/StudentNavClient";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const navItems = [
    { name: "Academic Portfolio", href: "/" },
    { name: "Activities Hub", href: "/activities" },
  ];

  const initials = (session.user.name ?? "Student")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen purple-mesh font-sans">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[280px] shrink-0 flex-col sticky top-0 h-screen
        bg-white border-r border-purple-border/50 shadow-sm z-30">
        
        {/* Brand */}
        <div className="px-8 py-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-gradient flex items-center justify-center shadow-purple rotate-3">
            <span className="text-white font-heading font-black text-xl">S</span>
          </div>
          <div>
            <p className="font-heading font-bold text-base text-purple-foreground leading-tight tracking-tight">Sol9x Portal</p>
            <p className="text-[11px] text-purple-muted-foreground font-sans font-semibold uppercase tracking-[0.2em] mt-0.5">Student Access</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <StudentNavClient navItems={navItems} />
        </nav>

        {/* User Quick Info */}
        <div className="p-6 border-t border-purple-border/30">
          <Link
            href="/api/auth/signout"
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold
              text-red-500 bg-red-50/50 hover:bg-red-50 hover:text-red-600 transition-all duration-300 w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log Out
          </Link>
        </div>
      </aside>

      {/* ── Content area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-purple-border/40 px-8 py-4 flex items-center justify-between">
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-auto relative group hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-muted-foreground group-focus-within:text-purple-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search portfolio or activities..."
              className="w-full bg-purple-muted/50 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm 
                focus:ring-2 focus:ring-purple-primary/20 transition-all placeholder:text-purple-muted-foreground/60"
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Actions */}
            <div className="flex items-center gap-2 border-r border-purple-border/40 pr-6 mr-2">
              <button className="w-10 h-10 rounded-full hover:bg-purple-secondary flex items-center justify-center transition-all relative">
                <Bell className="w-[18px] h-[18px] text-purple-foreground/70" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-primary rounded-full border-2 border-white" />
              </button>
              <button className="w-10 h-10 rounded-full hover:bg-purple-secondary flex items-center justify-center transition-all">
                <MessageCircle className="w-[18px] h-[18px] text-purple-foreground/70" />
              </button>
            </div>

            {/* User Dropdown */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-purple-primary flex items-center justify-center shadow-purple-lg border-2 border-white ring-1 ring-purple-border/30 overflow-hidden">
                <span className="text-white text-xs font-heading font-black">{initials}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-bold text-purple-foreground leading-none flex items-center gap-1.5">
                  {session.user.name?.split(" ")[0]}
                  <ChevronDown className="w-3 h-3 text-purple-muted-foreground group-hover:translate-y-0.5 transition-transform" />
                </p>
                <p className="text-[11px] text-purple-muted-foreground font-semibold mt-1 uppercase tracking-wider">Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
