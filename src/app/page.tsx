
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mountain } from 'lucide-react'; 

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-center">
      <div className="space-y-6">
        <Mountain className="h-16 w-16 text-primary mx-auto" data-ai-hint="logo mountain" />
        <h1 className="text-5xl font-bold text-primary font-headline">
          Welcome to Claim Clarity
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Easily track your healthcare insurance claims. Get started by looking up your claim status.
        </p>
        <Link href="/claim-status" passHref>
          <Button size="lg" className="text-lg px-8 py-6">
            Check Claim Status
          </Button>
        </Link>
         <footer className="text-center text-sm text-muted-foreground pt-12">
          © {new Date().getFullYear()} Claim Clarity. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
