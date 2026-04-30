import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Bell, MessageCircle } from "lucide-react";
import { StudentNavClient } from "@/components/student/StudentNavClient";
import { StudentSignOutButton } from "@/components/student/StudentSignOutButton";
import { StudentSearchBar } from "@/components/student/StudentSearchBar";
import { OnboardingTour } from "@/components/student/OnboardingTour";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const navSections = [
    {
      label: "Academics",
      items: [
        { name: "Dashboard", href: "/" },
        { name: "Activities", href: "/activities" },
      ],
    },
    {
      label: "Account",
      items: [
        { name: "Profile", href: "/profile" },
      ],
    },
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
      <aside className="hidden lg:flex w-[240px] shrink-0 flex-col sticky top-0 h-screen
        bg-white border-r border-purple-border/40 shadow-sm z-30">
        
        {/* Brand */}
        <div className="px-7 py-7 flex items-center gap-3 border-b border-purple-border/30">
          <div className="w-9 h-9 rounded-xl bg-purple-gradient flex items-center justify-center shadow-purple rotate-3 shrink-0">
            <span className="text-white font-heading font-black text-lg">S</span>
          </div>
          <div>
            <p className="font-heading font-bold text-[15px] text-purple-foreground leading-tight tracking-tight">Sol9x Portal</p>
            <p className="text-[10px] text-purple-muted-foreground font-sans font-semibold uppercase tracking-[0.18em] mt-0.5">Student Access</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 overflow-y-auto">
          <StudentNavClient sections={navSections} />
        </nav>

        {/* Sign out */}
        <div className="p-5 border-t border-purple-border/30">
          <StudentSignOutButton />
        </div>
      </aside>

      {/* ── Content area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-purple-border/30 px-6 py-3 flex items-center gap-4">
          
          {/* Search */}
          <StudentSearchBar />

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification bell — placeholder for future feature */}
            <button
              title="Notifications (coming soon)"
              className="relative w-9 h-9 rounded-xl hover:bg-purple-secondary/50 flex items-center justify-center transition-all text-purple-foreground/60 hover:text-purple-primary"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-primary rounded-full border-2 border-white" />
            </button>

            {/* Message icon — placeholder for future feature */}
            <button
              title="Messages (coming soon)"
              className="w-9 h-9 rounded-xl hover:bg-purple-secondary/50 flex items-center justify-center transition-all text-purple-foreground/60 hover:text-purple-primary"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-purple-border/40 mx-1" />

            {/* User chip */}
            <div className="flex items-center gap-2.5 cursor-pointer group pl-1">
              <div className="w-8 h-8 rounded-full bg-purple-gradient flex items-center justify-center shadow-purple border-2 border-white ring-1 ring-purple-border/30">
                <span className="text-white text-[11px] font-heading font-black">{initials}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-bold text-purple-foreground leading-none">
                  {session.user.name?.split(" ")[0]}
                </p>
                <p className="text-[10px] text-purple-muted-foreground font-semibold mt-0.5 uppercase tracking-wider">Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <OnboardingTour />
      </div>
    </div>
  );
}
