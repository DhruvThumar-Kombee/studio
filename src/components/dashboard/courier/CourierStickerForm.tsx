
"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, FileText } from "lucide-react";
import type { HospitalDetails, TPA } from "@/types";

const stickerSchema = z.object({
  hospitalId: z.string().min(1, "Hospital selection is required."),
  tpaId: z.string().min(1, "TPA/Insurance Company selection is required."),
  patientName: z.string().min(1, "Patient Name is required."),
  claimNumber: z.string().min(1, "Claim Number is required."),
});

type StickerFormValues = z.infer<typeof stickerSchema>;

interface CourierStickerFormProps {
  availableHospitals: Pick<HospitalDetails, "id" | "name">[];
  availableTpas: Pick<TPA, "id" | "name">[];
}

interface StickerData extends StickerFormValues {
  hospitalName: string;
  tpaName: string;
}

// Sub-component for the printable sticker content
const PrintableSticker = React.forwardRef<HTMLDivElement, { data: StickerData | null }>(({ data }, ref) => {
  if (!data) return null;

  // Basic A6-like styling (approx. 105mm x 148mm). Browser print scaling will handle final output.
  const stickerStyle: React.CSSProperties = {
    width: "105mm",
    height: "148mm",
    padding: "10mm",
    border: "1px solid #000",
    fontFamily: "Arial, sans-serif",
    fontSize: "12pt",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxSizing: "border-box",
    backgroundColor: "white", // Ensure background is white for printing
    color: "black", // Ensure text is black
  };

  const sectionStyle: React.CSSProperties = {
    borderBottom: "1px dashed #ccc",
    paddingBottom: "5mm",
    marginBottom: "5mm",
  };

  const headerStyle: React.CSSProperties = {
    fontWeight: "bold",
    fontSize: "10pt",
    textTransform: "uppercase",
    marginBottom: "2mm",
  };

  return (
    <div ref={ref} style={stickerStyle} className="printable-sticker-area">
      <div>
        <div style={sectionStyle}>
          <div style={headerStyle}>To:</div>
          <div>{data.tpaName}</div>
          {/* Placeholder for TPA address - can be added if TPA type includes it */}
        </div>
        <div style={sectionStyle}>
          <div style={headerStyle}>Patient Details:</div>
          <div>Patient: {data.patientName}</div>
          <div>Claim No: {data.claimNumber}</div>
          <div>Hospital: {data.hospitalName}</div>
        </div>
      </div>
      <div>
        <div style={headerStyle}>From:</div>
        <div>Claim Clarity Processing Center</div>
        <div>123 Health St, Wellness City, 400001</div>
      </div>
    </div>
  );
});
PrintableSticker.displayName = "PrintableSticker";


export function CourierStickerForm({ availableHospitals, availableTpas }: CourierStickerFormProps) {
  const [stickerData, setStickerData] = React.useState<StickerData | null>(null);
  const printableStickerRef = React.useRef<HTMLDivElement>(null);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<StickerFormValues>({
    resolver: zodResolver(stickerSchema),
    defaultValues: {
      hospitalId: "",
      tpaId: "",
      patientName: "",
      claimNumber: "",
    },
  });

  const hospitalId = watch("hospitalId");
  const tpaId = watch("tpaId");

  const generatePreview = (data: StickerFormValues) => {
    const selectedHospital = availableHospitals.find(h => h.id === data.hospitalId);
    const selectedTpa = availableTpas.find(t => t.id === data.tpaId);

    if (selectedHospital && selectedTpa) {
      setStickerData({
        ...data,
        hospitalName: selectedHospital.name,
        tpaName: selectedTpa.name,
      });
    }
  };

  const handlePrint = () => {
    if (printableStickerRef.current) {
      const stickerHTML = printableStickerRef.current.innerHTML;
      const printWindow = window.open('', '_blank', 'height=700,width=700');
      
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Sticker</title>');
        // Basic styles for printing - ensures sticker appearance is maintained
        printWindow.document.write(`
          <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            .printable-sticker-area {
              width: 105mm !important;
              height: 148mm !important;
              padding: 10mm !important;
              border: 1px solid #000 !important;
              font-size: 12pt !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
              background-color: white !important;
              color: black !important;
              page-break-inside: avoid; /* Attempt to keep sticker on one page */
            }
            .printable-sticker-area > div > div:not(:last-child) {
              border-bottom: 1px dashed #ccc !important;
              padding-bottom: 5mm !important;
              margin-bottom: 5mm !important;
            }
             .printable-sticker-area > div > div > div:first-child {
              font-weight: bold !important;
              font-size: 10pt !important;
              text-transform: uppercase !important;
              margin-bottom: 2mm !important;
            }
            @media print {
              body, html { visibility: visible; height: auto; }
              .printable-sticker-area { margin: 0; border: none; box-shadow: none; }
              @page { size: A6; margin: 5mm; } /* Suggest A6 size, user can override */
            }
          </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(stickerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus(); // Required for some browsers
        
        // Timeout to ensure content is loaded before printing
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      } else {
        alert("Could not open print window. Please disable your pop-up blocker.");
      }
    }
  };
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <form onSubmit={handleSubmit(generatePreview)} className="space-y-6 md:col-span-1">
        <div className="space-y-2">
          <Label htmlFor="hospitalId">Hospital <span className="text-destructive">*</span></Label>
          <Controller
            name="hospitalId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={availableHospitals.length === 0}>
                <SelectTrigger id="hospitalId">
                  <SelectValue placeholder="Select Hospital" />
                </SelectTrigger>
                <SelectContent>
                  {availableHospitals.map(hospital => (
                    <SelectItem key={hospital.id} value={hospital.id}>{hospital.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.hospitalId && <p className="text-sm text-destructive mt-1">{errors.hospitalId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tpaId">TPA / Insurance Company <span className="text-destructive">*</span></Label>
          <Controller
            name="tpaId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={availableTpas.length === 0}>
                <SelectTrigger id="tpaId">
                  <SelectValue placeholder="Select TPA/Insurance Co." />
                </SelectTrigger>
                <SelectContent>
                  {availableTpas.map(tpa => (
                    <SelectItem key={tpa.id} value={tpa.id}>{tpa.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.tpaId && <p className="text-sm text-destructive mt-1">{errors.tpaId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientName">Patient Name <span className="text-destructive">*</span></Label>
          <Controller
            name="patientName"
            control={control}
            render={({ field }) => <Input id="patientName" {...field} placeholder="Enter patient's full name" />}
          />
          {errors.patientName && <p className="text-sm text-destructive mt-1">{errors.patientName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="claimNumber">Claim Number <span className="text-destructive">*</span></Label>
          <Controller
            name="claimNumber"
            control={control}
            render={({ field }) => <Input id="claimNumber" {...field} placeholder="Enter claim reference number" />}
          />
          {errors.claimNumber && <p className="text-sm text-destructive mt-1">{errors.claimNumber.message}</p>}
        </div>
        
        <Button type="submit" className="w-full">
          <FileText className="mr-2 h-4 w-4" /> Generate Preview
        </Button>
      </form>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Sticker Preview</CardTitle>
            <CardDescription>This is how your sticker will look. Use the print button below to print.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] bg-muted/30 p-4 rounded-md">
            {stickerData ? (
                <div className="transform scale-75 origin-top"> {/* Scale down for better fit in preview area */}
                 <PrintableSticker ref={printableStickerRef} data={stickerData} />
                </div>
            ) : (
              <p className="text-muted-foreground">Fill the form and click "Generate Preview" to see the sticker.</p>
            )}
          </CardContent>
        </Card>
        {stickerData && (
          <Button onClick={handlePrint} className="w-full mt-4" variant="default">
            <Printer className="mr-2 h-4 w-4" /> Print Sticker
          </Button>
        )}
      </div>
    </div>
  );
}
