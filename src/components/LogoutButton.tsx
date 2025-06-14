
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <Button variant="outline" onClick={logout}>
      <LogOut className="mr-2 h-4 w-4" /> Logout
    </Button>
  );
}
