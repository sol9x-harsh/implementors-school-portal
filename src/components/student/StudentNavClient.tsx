"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  UserCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Dashboard": LayoutDashboard,
  "Activities": Compass,
  "Profile": UserCircle,
};

export interface NavSection {
  label: string;
  items: { name: string; href: string }[];
}

interface Props {
  sections: NavSection[];
}

export function StudentNavClient({ sections }: Props) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <div key={section.label}>
          {/* Section label */}
          <p className="text-[9px] font-black uppercase tracking-[0.22em] px-3 mb-1.5 text-purple-muted-foreground">
            {section.label}
          </p>

          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = iconMap[item.name] ?? LayoutDashboard;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link key={item.name} href={item.href} className="block">
                  <motion.div
                    whileHover={{ x: isActive ? 0 : 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors duration-150 group
                      ${
                        isActive
                          ? "text-purple-primary bg-purple-primary/10 border-l-2 border-purple-primary font-bold"
                          : "text-purple-muted-foreground hover:text-purple-foreground hover:bg-purple-secondary/20 border-l-2 border-transparent font-medium"
                      }`}
                  >
                    {/* Icon */}
                    <Icon
                      className={`w-[15px] h-[15px] shrink-0 transition-colors duration-150 relative z-10
                        ${isActive ? "text-purple-primary" : "text-purple-muted-foreground/60 group-hover:text-purple-primary/80"}`}
                    />

                    {/* Label */}
                    <span
                      className="tracking-wide truncate relative z-10"
                      style={{ fontSize: "13px" }}
                    >
                      {item.name}
                    </span>

                    {/* Active indicator dot */}
                    {isActive && (
                      <motion.span
                        layoutId="student-nav-indicator"
                        className="ml-auto w-1 h-1 rounded-full bg-purple-primary shrink-0 relative z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
