
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Home, UserCircle, Settings, ShieldCheck, Building, Users, FileText, 
  BarChart3, Loader2, ListChecks, Building2, ShieldAlert, FilePlus, LogOut as LogOutIcon, Sticker, FileSpreadsheet, Landmark, Users2
} from 'lucide-react'; 
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

  const allowedPathsForRole: Record<string, string[]> = {
    'super-admin': [
        commonDashboardPath, 
        roleDashboardPaths['super-admin'], 
        roleDashboardPaths['admin'], 
        '/dashboard/admin/services', 
        '/dashboard/admin/hospitals',
        '/dashboard/admin/tpas',
        '/dashboard/admin/hospital-bills',
        '/dashboard/admin/reports',
        '/dashboard/admin/transactions',
        '/dashboard/admin/employees', 
        roleDashboardPaths['staff'], 
        '/dashboard/staff/admissions/new',
        '/dashboard/staff/discharge/new',
        '/dashboard/staff/courier-sticker',
        roleDashboardPaths['hospital']
    ],
    'admin': [
        commonDashboardPath, 
        roleDashboardPaths['admin'], 
        '/dashboard/admin/services', 
        '/dashboard/admin/hospitals',
        '/dashboard/admin/tpas',
        '/dashboard/admin/hospital-bills',
        '/dashboard/admin/reports',
        '/dashboard/admin/transactions',
        '/dashboard/admin/employees', 
        roleDashboardPaths['staff'], 
        '/dashboard/staff/admissions/new',
        '/dashboard/staff/discharge/new',
        '/dashboard/staff/courier-sticker',
        roleDashboardPaths['hospital'], 
    ],
    'staff': [
        commonDashboardPath, 
        roleDashboardPaths['staff'], 
        '/dashboard/staff/admissions/new',
        '/dashboard/staff/discharge/new',
        '/dashboard/staff/courier-sticker', 
        '/dashboard/documents',
        // '/dashboard/staff/reports', // Staff reports path (can be added later if limited reports are defined)
    ],
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
      
      // Check if current path or any of its parent segments up to /dashboard matches an allowed path
      let isPathAllowed = false;
      let currentPathSegment = pathname;
      while (currentPathSegment.length >= commonDashboardPath.length) {
        if (allowedPaths.includes(currentPathSegment)) {
          isPathAllowed = true;
          break;
        }
        // Check if any allowed path is a prefix of the current path segment
        if (allowedPaths.some(p => currentPathSegment.startsWith(p + (p.endsWith('/') ? '' : '/')) || currentPathSegment === p)) {
             isPathAllowed = true;
             break;
        }
        if (currentPathSegment === commonDashboardPath && allowedPaths.includes(commonDashboardPath)) {
            isPathAllowed = true;
            break;
        }
        const lastSlash = currentPathSegment.lastIndexOf('/');
        if (lastSlash <= commonDashboardPath.length -1) break; // Stop if we are at /dashboard or shorter
        currentPathSegment = currentPathSegment.substring(0, lastSlash);
      }


      if (!isPathAllowed) {
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
            <SidebarLink href="/dashboard/admin/employees" icon={Users2}>Employees</SidebarLink>
            <SidebarLink href="/dashboard/admin/services" icon={ListChecks}>Service Master</SidebarLink>
            <SidebarLink href="/dashboard/admin/hospitals" icon={Building2}>Hospital Master</SidebarLink>
            <SidebarLink href="/dashboard/admin/tpas" icon={ShieldAlert}>TPA Master</SidebarLink>
            <SidebarLink href="/dashboard/admin/transactions" icon={Landmark}>Transactions</SidebarLink>
            <SidebarLink href="/dashboard/admin/hospital-bills" icon={FileSpreadsheet}>Hospital Bills</SidebarLink>
            <SidebarLink href="/dashboard/admin/reports" icon={BarChart3}>Reports</SidebarLink>
            <SidebarLink href="/dashboard/staff" icon={Users}>Staff Mgmt</SidebarLink>
            <SidebarLink href="/dashboard/staff/admissions/new" icon={FilePlus}>New Admission</SidebarLink>
            <SidebarLink href="/dashboard/staff/discharge/new" icon={LogOutIcon}>New Discharge</SidebarLink>
            <SidebarLink href="/dashboard/staff/courier-sticker" icon={Sticker}>Courier Sticker</SidebarLink> 
            <SidebarLink href="/dashboard/hospital" icon={Building}>Hospital Mgmt</SidebarLink>
          </>
        );
      case 'admin':
        return (
          <>
            <SidebarLink href="/dashboard/admin" icon={Settings}>Admin Panel</SidebarLink>
            <SidebarLink href="/dashboard/admin/employees" icon={Users2}>Employees</SidebarLink>
            <SidebarLink href="/dashboard/admin/services" icon={ListChecks}>Service Master</SidebarLink>
            <SidebarLink href="/dashboard/admin/hospitals" icon={Building2}>Hospital Master</SidebarLink>
            <SidebarLink href="/dashboard/admin/tpas" icon={ShieldAlert}>TPA Master</SidebarLink>
            <SidebarLink href="/dashboard/admin/transactions" icon={Landmark}>Transactions</SidebarLink>
            <SidebarLink href="/dashboard/admin/hospital-bills" icon={FileSpreadsheet}>Hospital Bills</SidebarLink>
            <SidebarLink href="/dashboard/admin/reports" icon={BarChart3}>Reports</SidebarLink>
            <SidebarLink href="/dashboard/staff" icon={Users}>Staff View</SidebarLink>
            <SidebarLink href="/dashboard/staff/admissions/new" icon={FilePlus}>New Admission</SidebarLink>
            <SidebarLink href="/dashboard/staff/discharge/new" icon={LogOutIcon}>New Discharge</SidebarLink>
            <SidebarLink href="/dashboard/staff/courier-sticker" icon={Sticker}>Courier Sticker</SidebarLink>
            <SidebarLink href="/dashboard/hospital" icon={Building}>Hospital View</SidebarLink>
          </>
        );
      case 'staff':
        return (
          <>
            <SidebarLink href="/dashboard/staff" icon={Users}>Staff Panel</SidebarLink>
            <SidebarLink href="/dashboard/staff/admissions/new" icon={FilePlus}>New Admission</SidebarLink>
            <SidebarLink href="/dashboard/staff/discharge/new" icon={LogOutIcon}>New Discharge</SidebarLink>
            <SidebarLink href="/dashboard/staff/courier-sticker" icon={Sticker}>Courier Sticker</SidebarLink>
            <SidebarLink href="/dashboard/documents" icon={FileText}>Documents</SidebarLink>
            {/* <SidebarLink href="/dashboard/staff/reports" icon={BarChart3}>My Reports</SidebarLink> */}
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
