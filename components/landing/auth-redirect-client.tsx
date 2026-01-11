"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Client-side redirect component for authenticated users.
 * This approach prevents server-side redirects that cause
 * "Page with redirect" issues in Google Search Console.
 * 
 * Search engine crawlers (like Googlebot) won't execute JavaScript,
 * so they'll see the full landing page content while authenticated
 * users get redirected to the dashboard.
 */
export function AuthRedirectClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Only redirect when we've confirmed the user is authenticated
    if (status === "authenticated" && session) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  // This component renders nothing - it only handles the redirect logic
  return null;
}
