import { ClaimSearchForm } from '@/components/claim-search-form';
import { Mountain } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <Mountain className="h-12 w-12 text-primary" /> 
            {/* Using Mountain as a placeholder logo, replace with actual logo if available */}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary tracking-tight">
            Claim Clarity
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Your Health Insurance Claim Status, Simplified.
          </p>
        </header>
        
        <ClaimSearchForm />

        <footer className="text-center text-sm text-muted-foreground mt-12">
          © {new Date().getFullYear()} Claim Clarity. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
