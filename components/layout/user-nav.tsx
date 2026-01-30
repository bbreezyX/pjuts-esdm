"use client";

import { LogOut, ChevronDown, ShieldCheck, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserNavProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

export function UserNav({ user }: UserNavProps) {
    const handleLogout = async () => {
        await signOut({ redirect: false });
        window.location.href = "/login";
    };

    const isAdmin = user.role === "ADMIN";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-8 sm:h-9 lg:h-10 px-1.5 sm:px-2 lg:px-3 rounded-full bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-border/60 transition-all active:scale-95 group overflow-hidden"
                >
                    <div className="relative flex-shrink-0">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                            <span className="text-[9px] sm:text-[10px] lg:text-xs font-black uppercase">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                        {isAdmin && (
                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-[1.5px] border-card">
                                <ShieldCheck className="w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] lg:w-[8px] lg:h-[8px]" />
                            </div>
                        )}
                    </div>
                    <div className="hidden lg:block text-left min-w-0 max-w-[60px] xl:max-w-[80px] transition-all duration-300">
                        <p className="text-[10px] xl:text-[11px] font-bold text-foreground leading-tight truncate">
                            {user.name}
                        </p>
                        <p className="text-[8px] xl:text-[9px] font-semibold text-muted-foreground uppercase tracking-wide leading-none">
                            {isAdmin ? "Admin" : "Officer"}
                        </p>
                    </div>
                    <ChevronDown className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 flex-shrink-0 lg:ml-0.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl border-border bg-card">
                <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-foreground">{user.name}</span>
                        <span className="text-[10px] font-medium text-muted-foreground truncate">
                            {user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="p-1 space-y-1">
                    <DropdownMenuItem asChild className="p-3 rounded-xl focus:bg-muted cursor-pointer font-bold text-xs gap-3">
                        <Link href="/profile">
                            <UserCircle className="h-4 w-4 text-primary" />
                            Profil Saya
                        </Link>
                    </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="p-1">
                    <DropdownMenuItem
                        className="p-3 rounded-xl focus:bg-red-500/10 text-red-500 focus:text-red-600 cursor-pointer font-bold text-xs gap-3"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Keluar Sesi
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
