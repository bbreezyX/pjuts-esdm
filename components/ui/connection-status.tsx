"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "iconoir-react";
import { cn } from "@/lib/utils";

/**
 * Hook to track online/offline status
 */
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Connection status indicator component
 */
interface ConnectionStatusProps {
  className?: string;
  showWhenOnline?: boolean;
}

export function ConnectionStatus({ 
  className, 
  showWhenOnline = false 
}: ConnectionStatusProps) {
  const isOnline = useConnectionStatus();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else if (showBanner) {
      // Show "back online" briefly
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showBanner]);

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && !showBanner) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        isOnline
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700 animate-pulse",
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

/**
 * Offline banner that appears at top of screen
 */
export function OfflineBanner() {
  const isOnline = useConnectionStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowReconnected(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 text-sm font-medium text-white transition-all",
        isOnline ? "bg-emerald-500" : "bg-red-500"
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Koneksi kembali tersambung</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Anda sedang offline. Beberapa fitur mungkin tidak tersedia.</span>
        </>
      )}
    </div>
  );
}
