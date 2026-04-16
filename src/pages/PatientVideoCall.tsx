import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Loader2 } from "lucide-react";
import VideoCallRoom from "@/components/VideoCallRoom";

const PatientVideoCall = () => {
  const [searchParams] = useSearchParams();
  const roomUrl = searchParams.get("room");
  const token = searchParams.get("t");
  const [joined, setJoined] = useState(false);

  if (!roomUrl || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground">
              This video consultation link is invalid or has expired. Please contact your doctor's office for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-blue-100">
              <Video className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Video Consultation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              Your doctor is waiting for you. Click below to join the video consultation.
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>✓ Make sure your camera and microphone are enabled</p>
              <p>✓ Use a stable internet connection</p>
              <p>✓ Find a quiet, well-lit space</p>
            </div>
            <Button className="w-full gap-2" size="lg" onClick={() => setJoined(true)}>
              <Video className="h-5 w-5" />
              Join Consultation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <VideoCallRoom
        roomUrl={roomUrl}
        token={token}
        userName="Patient"
        onLeave={() => {
          setJoined(false);
          window.close();
        }}
      />
    </div>
  );
};

export default PatientVideoCall;
