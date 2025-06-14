
"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export function NavLinks() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) return null; // Don't show links until auth state is resolved

  // Do not show these general nav links if user is on any dashboard page
  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="flex gap-4 p-4 bg-card shadow-md rounded-md items-center">
      <Link href="/" passHref>
        <Button variant={pathname === "/" ? "secondary" : "ghost"}>Home</Button>
      </Link>
      <Link href="/claim-status" passHref>
        <Button variant={pathname === "/claim-status" ? "secondary" : "ghost"}>Claim Status</Button>
      </Link>
      <div className="ml-auto">
        {user ? (
          <Link href="/dashboard" passHref>
            <Button variant="default">Go to Dashboard</Button>
          </Link>
        ) : (
          <Link href="/login" passHref>
            <Button variant="default">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
