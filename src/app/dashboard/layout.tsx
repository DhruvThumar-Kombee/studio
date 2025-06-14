
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, ReactNode } from 'react';
import { Loader2, ListChecks, Building2 } from 'lucide-react'; // Added Building2
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, UserCircle, Settings, ShieldCheck, Building, Users, FileText, BarChart3 } from 'lucide-react';
import { LogoutButton } from '@/components/LogoutButton';


const SidebarLink = ({ href, icon: Icon, children }: { href: string; icon: React.ElementType; children: ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  return (
    <Link href={href} passHref>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className="w-full justify-start"
      >
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </Button>
    </Link>
  );
};


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const roleDashboardPaths: Record<string, string> = {
    'super-admin': '/dashboard/super-admin',
    'admin': '/dashboard/admin',
    'staff': '/dashboard/staff',
    'hospital': '/dashboard/hospital',
  };

  const commonDashboardPath = '/dashboard';

  // Adjusted allowedPaths to be more specific for sub-routes like /admin/services and /admin/hospitals
  const allowedPathsForRole: Record<string, string[]> = {
    'super-admin': [
        commonDashboardPath, 
        roleDashboardPaths['super-admin'], 
        roleDashboardPaths['admin'], 
        '/dashboard/admin/services', 
        '/dashboard/admin/hospitals',
        roleDashboardPaths['staff'], 
        roleDashboardPaths['hospital']
    ],
    'admin': [
        commonDashboardPath, 
        roleDashboardPaths['admin'], 
        '/dashboard/admin/services', 
        '/dashboard/admin/hospitals',
        roleDashboardPaths['staff'], // Assuming admin can view staff/hospital sections as per previous logic
        roleDashboardPaths['hospital'], 
        '/dashboard/reports'
    ],
    'staff': [commonDashboardPath, roleDashboardPaths['staff'], '/dashboard/documents'],
    'hospital': [commonDashboardPath, roleDashboardPaths['hospital'], '/dashboard/claims-overview'],
  };

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/login');
    } else if (!isLoading && user && user.role) {
      const allowedPaths = allowedPathsForRole[user.role] || [];
      const targetDashboard = roleDashboardPaths[user.role] || commonDashboardPath;

      if (pathname === commonDashboardPath && targetDashboard !== commonDashboardPath) {
        router.replace(targetDashboard);
        return;
      }
      
      // Check if current pathname starts with any of the allowed base paths for the role
      const isPathAllowed = allowedPaths.some(allowedPath => {
        // Exact match or prefix match (e.g. /dashboard/admin allows /dashboard/admin/services)
        return pathname === allowedPath || pathname.startsWith(allowedPath + (allowedPath.endsWith('/') ? '' : '/'));
      });
      
      // Specific handling for /dashboard/admin/services and /dashboard/admin/hospitals edit/new pages
      if (user.role === 'admin' || user.role === 'super-admin') {
          if (pathname.startsWith('/dashboard/admin/services/') || pathname.startsWith('/dashboard/admin/hospitals/')) {
              // This path is allowed for admin/super-admin, so do nothing here to override general check
          } else if (!isPathAllowed) {
              router.replace(targetDashboard);
          }
      } else if (!isPathAllowed) {
        router.replace(targetDashboard); 
      }
    }
  }, [user, isLoading, token, router, pathname]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  const getSidebarLinks = (role: string | null) => {
    switch(role) {
      case 'super-admin':
        return (
          <>
            <SidebarLink href="/dashboard/super-admin" icon={ShieldCheck}>Super Admin</SidebarLink>
            <SidebarLink href="/dashboard/admin" icon={Settings}>Admin Mgmt</SidebarLink>
            <SidebarLink href="/dashboard/admin/services" icon={ListChecks}>Service Master</SidebarLink>
            <SidebarLink href="/dashboard/admin/hospitals" icon={Building2}>Hospital Master</SidebarLink>
            <SidebarLink href="/dashboard/staff" icon={Users}>Staff Mgmt</SidebarLink>
            <SidebarLink href="/dashboard/hospital" icon={Building}>Hospital Mgmt</SidebarLink>
          </>
        );
      case 'admin':
        return (
          <>
            <SidebarLink href="/dashboard/admin" icon={Settings}>Admin Panel</SidebarLink>
            <SidebarLink href="/dashboard/admin/services" icon={ListChecks}>Service Master</SidebarLink>
            <SidebarLink href="/dashboard/admin/hospitals" icon={Building2}>Hospital Master</SidebarLink>
            <SidebarLink href="/dashboard/staff" icon={Users}>Staff View</SidebarLink>
            <SidebarLink href="/dashboard/hospital" icon={Building}>Hospital View</SidebarLink>
            <SidebarLink href="/dashboard/reports" icon={BarChart3}>Reports</SidebarLink>
          </>
        );
      case 'staff':
        return (
          <>
            <SidebarLink href="/dashboard/staff" icon={FileText}>Claims</SidebarLink>
            <SidebarLink href="/dashboard/documents" icon={FileText}>Documents</SidebarLink>
          </>
        );
      case 'hospital':
        return (
          <>
            <SidebarLink href="/dashboard/hospital" icon={Building}>Hospital View</SidebarLink>
            <SidebarLink href="/dashboard/claims-overview" icon={FileText}>Claims Overview</SidebarLink>
          </>
        );
      default:
        return null;
    }
  }


  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r p-4 space-y-4 flex flex-col">
        <div className="text-2xl font-bold text-primary mb-6">Dashboard</div>
        <nav className="flex-grow space-y-2">
          <SidebarLink href="/dashboard" icon={Home}>Home</SidebarLink>
          {getSidebarLinks(user.role)}
        </nav>
        <div className="mt-auto">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
