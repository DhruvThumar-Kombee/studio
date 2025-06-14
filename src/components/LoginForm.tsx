
"use client";

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/actions/authActions';
import { useAuth } from '@/hooks/useAuth';
import type { LoginResponse } from '@/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogIn, Loader2 } from 'lucide-react';

const initialState: LoginResponse = {
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" aria-disabled={pending} disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
      Login
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);
  const { login: contextLogin } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (state.success && state.user && state.token) {
      contextLogin({ user: state.user, token: state.token });
      setError(null); // Clear previous errors
      // Redirect based on role
      switch (state.user.role) {
        case 'super-admin':
          router.push('/dashboard/super-admin');
          break;
        case 'admin':
          router.push('/dashboard/admin');
          break;
        case 'staff':
          router.push('/dashboard/staff');
          break;
        case 'hospital':
          router.push('/dashboard/hospital');
          break;
        default:
          router.push('/dashboard'); 
      }
    } else if (!state.success && state.message) {
      setError(state.message);
    }
  }, [state, contextLogin, router]);

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl md:text-3xl font-headline text-primary">Login</CardTitle>
        <CardDescription>Access your dashboard</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6 p-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="user@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
