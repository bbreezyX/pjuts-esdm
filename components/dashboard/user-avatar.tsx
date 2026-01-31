"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DashboardUser } from "@/app/actions/dashboard";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  FIELD_STAFF: "Tim Lapangan",
};

/**
 * Get the initial letter(s) from a user's name for avatar display
 */
export function getUserInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/**
 * Generate a consistent background color based on user ID
 */
export function getAvatarColor(userId: string): string {
  const colors = [
    "bg-primary-500",
    "bg-primary-600",
    "bg-primary-700",
    "bg-primary-400",
  ];
  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

interface UserAvatarWithPopoverProps {
  user: DashboardUser;
}

export function UserAvatarWithPopover({ user }: UserAvatarWithPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-lg lg:rounded-xl xl:rounded-2xl border-[2px] lg:border-[3px] border-background shadow-lg shadow-primary/5 transition-transform hover:scale-110 hover:z-10 cursor-pointer flex items-center justify-center text-white text-xs lg:text-sm xl:text-base font-bold",
            getAvatarColor(user.id),
          )}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {getUserInitial(user.name)}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={14}
        className="z-50 p-0 border-none bg-transparent shadow-none w-auto pointer-events-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center gap-0.5 relative"
        >
          <span className="text-foreground font-bold text-xs whitespace-nowrap tracking-tight">
            {user.name}
          </span>
          <span className="text-primary text-[9px] font-black uppercase tracking-[0.15em]">
            {ROLE_LABELS[user.role] || user.role}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border-r border-b border-border rotate-45" />
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
