import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MobileScreen from "@/components/mobile/MobileScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, differenceInYears } from "date-fns";
import {
  Phone, Mail, MapPin, Calendar as CalendarIcon, Droplet, AlertCircle, Heart,
  FileText, Plus, User, Edit, Activity,
} from "lucide-react";
import { calculatePregnancyDuration, getTrimester } from "@/lib/pregnancyUtils";

interface Patient {
  id: string; patient_id: string; full_name: string; father_name: string | null;
  email: string | null; phone: string; cnic: string | null;
  date_of_birth: string; gender: string; blood_group: string | null;
  address: string | null; allergies: string | null; marital_status: string | null;
  medical_history: string | null; city: string | null; major_diseases: string | null;
  pregnancy_start_date: string | null; delivery_status: string | null;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: any }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-sm font-medium break-words">{value}</div>
      </div>
    </div>
  );
};

const MobilePatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [{ data: p }, { data: v }, { data: d }] = await Promise.all([
        supabase.from("patients").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("medical_records")
          .select("id, visit_date, diagnosis, symptoms, notes")
          .eq("patient_id", id)
          .order("visit_date", { ascending: false })
          .limit(50),
        supabase
          .from("medical_documents")
          .select("id, document_name, document_type, document_url, created_at")
          .eq("patient_id", id)
          .order("created_at", { ascending: false }),
      ]);
      setPatient(p as any);
      setVisits(v || []);
      setDocs(d || []);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <MobileScreen title="Patient">
        <div className="space-y-3">
          <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
          <div className="h-48 bg-muted/40 rounded-xl animate-pulse" />
        </div>
      </MobileScreen>
    );
  }

  if (!patient) {
    return (
      <MobileScreen title="Patient">
        <div className="text-center py-12 text-muted-foreground text-sm">Patient not found.</div>
      </MobileScreen>
    );
  }

  const age = differenceInYears(new Date(), new Date(patient.date_of_birth));
  const pregnancyWk = patient.pregnancy_start_date
    ? calculatePregnancyDuration(patient.pregnancy_start_date)
    : null;
  const trimester = patient.pregnancy_start_date ? getTrimester(patient.pregnancy_start_date) : null;

  return (
    <MobileScreen
      title={patient.full_name}
      subtitle={`#${patient.patient_id}`}
    >
      {/* Hero card */}
      <Card className="overflow-hidden border-0 shadow-md">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xl font-bold">
              {patient.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base truncate">{patient.full_name}</div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                <Badge variant="secondary" className="text-[10px] capitalize bg-primary-foreground/20 text-primary-foreground border-0">
                  {patient.gender}
                </Badge>
                <Badge variant="secondary" className="text-[10px] bg-primary-foreground/20 text-primary-foreground border-0">
                  {age} yrs
                </Badge>
                {patient.blood_group && (
                  <Badge variant="secondary" className="text-[10px] bg-primary-foreground/20 text-primary-foreground border-0">
                    {patient.blood_group}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <a href={`tel:${patient.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-foreground/15 text-xs font-medium active:scale-95 transition-transform">
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
            {patient.phone && (
              <a href={`https://wa.me/${patient.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-foreground/15 text-xs font-medium active:scale-95 transition-transform">
                <Mail className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Pregnancy strip */}
      {pregnancyWk && (
        <Card className="mt-3 border-warning/30 bg-warning/5">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-warning/15 flex items-center justify-center">
              <Heart className="h-4 w-4 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">Pregnancy</div>
              <div className="text-[11px] text-muted-foreground">
                {pregnancyWk} · Trimester {trimester ?? "—"}
                {patient.delivery_status === "completed" && " · Delivered"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="info" className="mt-4">
        <TabsList className="grid grid-cols-3 w-full h-10 rounded-xl bg-muted/50">
          <TabsTrigger value="info" className="text-xs rounded-lg">Info</TabsTrigger>
          <TabsTrigger value="visits" className="text-xs rounded-lg">Visits</TabsTrigger>
          <TabsTrigger value="docs" className="text-xs rounded-lg">Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-3">
          <Card>
            <CardContent className="p-3">
              <InfoRow icon={Phone} label="Phone" value={patient.phone} />
              <InfoRow icon={Mail} label="Email" value={patient.email} />
              <InfoRow icon={User} label="Father / Guardian" value={patient.father_name} />
              <InfoRow icon={CalendarIcon} label="Date of birth" value={format(new Date(patient.date_of_birth), "dd MMM yyyy")} />
              <InfoRow icon={Droplet} label="Blood group" value={patient.blood_group} />
              <InfoRow icon={MapPin} label="City" value={patient.city} />
              <InfoRow icon={MapPin} label="Address" value={patient.address} />
              <InfoRow icon={AlertCircle} label="Allergies" value={patient.allergies} />
              <InfoRow icon={Activity} label="Major diseases" value={patient.major_diseases} />
              <InfoRow icon={FileText} label="Medical history" value={patient.medical_history} />
              <InfoRow icon={User} label="CNIC" value={patient.cnic} />
              <InfoRow icon={Heart} label="Marital status" value={patient.marital_status} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="mt-3">
          {visits.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No visits recorded.</div>
          ) : (
            <div className="space-y-2">
              {visits.map((v) => (
                <Card key={v.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold text-sm">{format(new Date(v.visit_date), "dd MMM yyyy")}</div>
                    {v.diagnosis && <Badge variant="secondary" className="text-[10px]">{v.diagnosis}</Badge>}
                  </div>
                  {v.symptoms && <p className="text-xs text-muted-foreground mt-1.5"><span className="font-medium">Symptoms:</span> {v.symptoms}</p>}
                  {v.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-3"><span className="font-medium">Notes:</span> {v.notes}</p>}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="docs" className="mt-3">
          {docs.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No documents uploaded.</div>
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <a
                  key={d.id}
                  href={d.document_url}
                  target="_blank"
                  rel="noopener"
                  className="block p-3 rounded-xl bg-card border active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-info/10 text-info flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{d.document_name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {format(new Date(d.created_at), "dd MMM yyyy")}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="h-6" />
    </MobileScreen>
  );
};

export default MobilePatientDetail;
