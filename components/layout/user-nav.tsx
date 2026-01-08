"use client";

import { LogOut, User, ChevronDown } from "lucide-react";
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-slate-100"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">
                            {user.role === "ADMIN" ? "Administrator" : "Petugas Lapangan"}
                        </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 hidden lg:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-xs font-normal text-slate-500">
                            {user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profil Saya
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
