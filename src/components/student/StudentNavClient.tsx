"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Activity } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Academic Portfolio": BookOpen,
  "Activities Hub": Activity,
};

interface NavItem {
  name: string;
  href: string;
}

export function StudentNavClient({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      {navItems.map((item) => {
        const Icon = iconMap[item.name] ?? BookOpen;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link key={item.name} href={item.href} className="block">
            <motion.div
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-medium
                transition-all duration-300 group
                ${isActive
                  ? "bg-purple-primary/10 text-purple-primary font-bold shadow-[0_2px_10px_rgba(147,51,234,0.08)]"
                  : "text-purple-muted-foreground hover:bg-purple-secondary/80 hover:text-purple-foreground"
                }`}
            >
              {/* Active left bar indicator */}
              {isActive && (
                <motion.span
                  layoutId="student-nav-active-bar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-purple-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors
                  ${isActive ? "text-purple-primary" : "text-purple-muted-foreground group-hover:text-purple-foreground"}`}
              />
              <span className="font-heading tracking-wide">{item.name}</span>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
