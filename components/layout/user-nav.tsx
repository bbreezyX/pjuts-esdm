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
import { cn } from "@/lib/utils";

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
                    className="flex items-center gap-3 px-2 h-12 rounded-xl hover:bg-muted/50 transition-all border border-transparent hover:border-border active:scale-95 group"
                >
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                            <span className="text-sm font-black uppercase">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                        {isAdmin && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-card">
                                <ShieldCheck size={10} />
                            </div>
                        )}
                    </div>
                    <div className="hidden lg:block text-left mr-1">
                        <p className="text-xs font-black text-foreground leading-none mb-1">{user.name}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                            {isAdmin ? "System Admin" : "Field Officer"}
                        </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
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
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-muted cursor-pointer font-bold text-xs gap-3">
                        <UserCircle className="h-4 w-4 text-primary" />
                        Profil Saya
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-muted cursor-pointer font-bold text-xs gap-3">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Pengaturan Akun
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
