"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ProvinceStats } from "@/app/actions/dashboard";

interface StatusBadgeWithPopoverProps {
  prov: ProvinceStats;
}

export function StatusBadgeWithPopover({ prov }: StatusBadgeWithPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const totalIssues = prov.maintenanceNeeded + prov.offline;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="relative flex flex-wrap gap-1.5 sm:gap-2 cursor-help"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {prov.operational > 0 && (
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold border border-emerald-500/20">
              <CheckCircle2 size={8} className="sm:w-[10px] sm:h-[10px]" />
              {prov.operational} OK
            </div>
          )}
          {totalIssues > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-bold border border-amber-500/20">
              <AlertCircle size={8} className="sm:w-[10px] sm:h-[10px]" />
              {totalIssues} Issue
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={12}
        className="z-50 p-0 border-none bg-transparent shadow-none w-auto"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="min-w-[220px] bg-white/95 backdrop-blur-xl border border-border p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden"
        >
          <div className="flex flex-col gap-3 relative z-10">
            <div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none block mb-1">
                Rincian Kondisi
              </span>
              <span className="text-xs font-bold text-foreground">
                {prov.province}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between group/item">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                  <span className="text-xs font-bold text-muted-foreground">
                    Operasional
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-600">
                  {prov.operational}
                </span>
              </div>

              <div className="flex items-center justify-between group/item">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                  <span className="text-xs font-bold text-muted-foreground">
                    Perbaikan
                  </span>
                </div>
                <span className="text-xs font-black text-amber-600">
                  {prov.maintenanceNeeded}
                </span>
              </div>

              <div className="flex items-center justify-between group/item">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" />
                  <span className="text-xs font-bold text-muted-foreground">
                    Offline
                  </span>
                </div>
                <span className="text-xs font-black text-red-600">
                  {prov.offline}
                </span>
              </div>
            </div>

            <div className="pt-2.5 mt-1 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Aset
              </span>
              <span className="text-xs font-black text-foreground">
                {prov.totalUnits}
              </span>
            </div>
          </div>
          <div className="absolute top-full left-4 -translate-y-[1px] w-3 h-3 bg-white border-r border-b border-border rotate-45" />
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
