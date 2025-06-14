
import { CourierStickerForm } from "@/components/dashboard/courier/CourierStickerForm";
import { getHospitalsForAdminAction } from "@/actions/hospitalActions";
import { getTPAsAction } from "@/actions/tpaMasterActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CourierStickerPage() {
  const [hospitals, tpas] = await Promise.all([
    getHospitalsForAdminAction(),
    getTPAsAction()
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Courier Sticker Generator</CardTitle>
          <CardDescription>
            Select the details to generate a printable courier sticker.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourierStickerForm 
            availableHospitals={hospitals.filter(h => h.isActive)} 
            availableTpas={tpas.filter(t => t.isActive)} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

export const dynamic = 'force-dynamic';
