import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import "video.js/dist/video-js.css";

type VideoPlayerProps = {
  src: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      console.error("[VideoPlayer] no <video> element");
      return;
    }
    if (!src) {
      console.error("[VideoPlayer] empty src");
      return;
    }

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (_evt, data) => {
        console.log("[VideoPlayer] MANIFEST_PARSED, levels:", data.levels);
      });

      hls.on(Hls.Events.ERROR, (_evt, data) => {
        console.error(
          "[VideoPlayer] HLS error:",
          data.type,
          data.details,
          "fatal:", data.fatal
        );

        if (!hls || !data.fatal) return;

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          
          console.log("[VideoPlayer] restarting load after network error");
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          console.log("[VideoPlayer] trying to recover media error");
          hls.recoverMediaError();
        } else {
          console.log("[VideoPlayer] destroying player because of fatal error");
          hls.destroy();
          hls = null;
        }
      });

      hls.loadSource(src);        
      hls.attachMedia(video);      
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      
      video.src = src;
    } else {
      console.error("[VideoPlayer] HLS not supported in this browser");
    }

    
    return () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [src]);

  return (
    <div>
      <video
        ref={videoRef}
        playsInline
        controls
        muted
        style={{ width: "100%", height: "100%", backgroundColor: "black" }}
      />
    </div>
  );
};

export default VideoPlayer;
