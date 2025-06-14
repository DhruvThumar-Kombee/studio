
import { DischargeEntryForm } from "@/components/dashboard/discharge/DischargeEntryForm";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Discharge Entry | Claim Clarity',
  description: 'Enter patient discharge details and upload documents.',
};

export default async function NewDischargeEntryPage() {
  return (
    <div className="space-y-6">
       <DischargeEntryForm />
    </div>
  );
}

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering
