import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, Sparkles } from "lucide-react";
import MembershipPlansTab from "./MembershipPlansTab";
import MembershipMembersTab from "./MembershipMembersTab";
import { useClinicId } from "@/hooks/useClinicId";
import { Loader2 } from "lucide-react";

export default function ClinicMemberships() {
  const { clinicId, loading } = useClinicId();

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!clinicId) return <div className="p-6 text-muted-foreground">Clinic context not available.</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Memberships</h1>
          <p className="text-sm text-muted-foreground">Sell membership cards and offer automatic patient discounts</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" />Members</TabsTrigger>
              <TabsTrigger value="plans"><CreditCard className="h-4 w-4 mr-2" />Plans</TabsTrigger>
            </TabsList>
            <TabsContent value="members" className="mt-6">
              <MembershipMembersTab clinicId={clinicId} />
            </TabsContent>
            <TabsContent value="plans" className="mt-6">
              <MembershipPlansTab clinicId={clinicId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
