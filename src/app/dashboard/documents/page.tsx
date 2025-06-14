
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-primary">Document Center</h1>
          <p className="text-muted-foreground">Manage and track claim-related documents.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            This section will display and allow management of your uploaded and received documents.
            Functionality coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Document listing and management features will be implemented here.
          </p>
          {/* Placeholder for document list or upload interface */}
        </CardContent>
      </Card>
    </div>
  );
}
