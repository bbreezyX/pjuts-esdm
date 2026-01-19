import LandingPage from "@/components/landing/landing-page";
import { AuthRedirectClient } from "@/components/landing/auth-redirect-client";

export default function HomePage() {
  return (
    <>
      {/* Client-side redirect for authenticated users - invisible to search engines */}
      <AuthRedirectClient />
      <LandingPage />
    </>
  );
}
