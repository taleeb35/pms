import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, 
  Monitor, MessageSquare, Maximize, Minimize,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoCallRoomProps {
  roomUrl: string;
  token: string;
  userName: string;
  onLeave: () => void;
  isDoctor?: boolean;
}

const VideoCallRoom = ({ roomUrl, token, userName, onLeave, isDoctor = false }: VideoCallRoomProps) => {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const joinUrl = `${roomUrl}?t=${token}`;

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px]">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Badge variant="secondary" className="bg-green-500/20 text-green-700">
          {isDoctor ? "Doctor" : "Patient"} • Live
        </Badge>
        <Button size="icon" variant="secondary" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      <iframe
        ref={iframeRef}
        src={joinUrl}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        className="w-full h-full min-h-[500px] rounded-lg border-0"
        style={{ aspectRatio: "16/9" }}
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Button variant="destructive" onClick={onLeave} className="gap-2">
          <PhoneOff className="h-4 w-4" /> Leave Call
        </Button>
      </div>
    </div>
  );
};

export default VideoCallRoom;
