import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Video, Loader2, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import VideoCallRoom from "./VideoCallRoom";

interface StartVideoConsultationProps {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
}

const StartVideoConsultation = ({
  appointmentId,
  doctorId,
  patientId,
  patientName,
  patientPhone,
}: StartVideoConsultationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showCallRoom, setShowCallRoom] = useState(false);
  const [enableRecording, setEnableRecording] = useState(true);
  const [consultationData, setConsultationData] = useState<any>(null);

  const startConsultation = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-video-room", {
        body: {
          appointment_id: appointmentId,
          doctor_id: doctorId,
          patient_id: patientId,
          patient_name: patientName,
          patient_phone: patientPhone,
          enable_recording: enableRecording,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setConsultationData(data);
      toast({
        title: "Video Room Created",
        description: "Share the link with the patient to join the call.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create video room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!" });
  };

  const handleLeaveCall = () => {
    setShowCallRoom(false);
    setConsultationData(null);
    setShowDialog(false);
  };

  if (showCallRoom && consultationData) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <VideoCallRoom
          roomUrl={consultationData.room_url}
          token={consultationData.doctor_token}
          userName="Doctor"
          onLeave={handleLeaveCall}
          isDoctor
        />
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <Video className="h-4 w-4" />
        Video Call
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              Video Consultation
            </DialogTitle>
            <DialogDescription>
              Start a video call with {patientName}
            </DialogDescription>
          </DialogHeader>

          {!consultationData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <Label htmlFor="recording" className="text-sm">Enable Recording</Label>
                <Switch
                  id="recording"
                  checked={enableRecording}
                  onCheckedChange={setEnableRecording}
                />
              </div>

              <Button
                onClick={startConsultation}
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
                {loading ? "Creating Room..." : "Create Video Room"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Room Ready
              </Badge>

              {/* Patient join link */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Patient Join Link</Label>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-muted p-2 rounded overflow-hidden text-ellipsis">
                    {consultationData.patient_join_url?.substring(0, 50)}...
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyLink(consultationData.patient_join_url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* WhatsApp share */}
              {consultationData.whatsapp_url && (
                <Button
                  variant="outline"
                  className="w-full gap-2 text-green-700 border-green-200 hover:bg-green-50"
                  onClick={() => window.open(consultationData.whatsapp_url, "_blank")}
                >
                  <MessageCircle className="h-4 w-4" />
                  Send via WhatsApp
                </Button>
              )}

              {/* Join as Doctor */}
              <Button
                className="w-full gap-2"
                onClick={() => setShowCallRoom(true)}
              >
                <Video className="h-4 w-4" />
                Join Call as Doctor
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StartVideoConsultation;
