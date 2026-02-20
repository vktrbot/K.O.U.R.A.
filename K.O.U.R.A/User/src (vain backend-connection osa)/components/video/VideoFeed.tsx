import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Maximize2, 
  Minimize2, 
  Video, 
  VideoOff,
  Signal
} from "lucide-react";

import VideoPlayer from "./VideoPlayer";


interface VideoFeedProps {
  title: string;
  source?: string;
  quality?: string;
  latency?: number;
  onTogglePiP?: () => void;
  isPiPMode?: boolean;
  className?: string;
  videoFrame?: string | null;
  isConnected?: boolean;
}

export default function VideoFeed({ 
  title, 
  source = "demo", 
  quality = "HD",
  latency = 0,
  onTogglePiP,
  isPiPMode = false,
  className = "",
  videoFrame = null,
  isConnected = false
}: VideoFeedProps) {
  return (
    <Card className={`glass-card relative overflow-hidden group transition-all duration-300 ${className}`}>
      {/* Video Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-3 transition-opacity duration-300 opacity-100 lg:opacity-0 group-hover:opacity-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-base">{title}</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono bg-black/50 text-purple-300 border-purple-400/50">
              {quality}
            </Badge>
            {latency > 0 && (
              <Badge variant="outline" className="text-xs font-mono bg-black/50 text-green-300 border-green-400/50">
                <Signal className="w-3 h-3 mr-1" />
                {latency}ms
              </Badge>
            )}
            {onTogglePiP && !isPiPMode && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={onTogglePiP}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
            {isPiPMode && onTogglePiP && (
               <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={onTogglePiP}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

            {/* Video Content Area */}
      <div className="w-full h-full bg-gray-800 flex items-center justify-center min-h-[200px]">
        {isConnected && source ? (
          <div className="w-full h-full">
            <VideoPlayer src={source} />
          </div>
        ) : isConnected && videoFrame ? (
          <img
            src={videoFrame}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : isConnected && !videoFrame ? (
          <div className="flex flex-col items-center gap-3 p-6">
            <Video className="w-12 h-12 text-purple-400 animate-pulse" />
            <p className="text-sm text-gray-400 font-medium">Odotetaan videokuvaa...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-6">
            <VideoOff className="w-12 h-12 text-gray-600" />
            <p className="text-sm text-gray-500 font-medium">Ei yhteyttä</p>
          </div>
        )}
      </div>

    </Card>
  );
}
