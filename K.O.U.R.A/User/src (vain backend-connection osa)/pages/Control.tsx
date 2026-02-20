import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle,
  RotateCcw,
  Play,
  Square,
  Package,
  Shield,
  Zap,
  Droplets,
  Recycle
} from "lucide-react";

import VideoFeed from "../components/video/VideoFeed";
import TelemetryPanel from "../components/controls/TelemetryPanel";
import InputPanel from '@/components/controls/InputPanel';
import { getMainStore } from '@/store/main-store';
import { observer } from 'mobx-react-lite';
import ResetConnection from '@/components/common/ResetConnection';
import VideoPlayer from '@/components/video/VideoPlayer';

export default observer(function Control() {
  const connectionStore = getMainStore().connectionStore;
  const telemetryStore = getMainStore().telemetryStore;
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [emergencyStop, setEmergencyStop] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [vehicleFrame, setVehicleFrame] = useState<string | null>(null);
  const [gripperFrame, setGripperFrame] = useState<string | null>(null);
  
  const [selectedObjectType, setSelectedObjectType] = useState<string[]>([]);

  const objectTypes = [
    { name: 'Tölkit', value: 'can', icon: Droplets },
    { name: 'Muovipullot', value: 'plastic_bottle', icon: Recycle },
    { name: 'Lasipullot', value: 'glass_bottle', icon: Package }
  ];

  const sendCommand = (type: string, content: any) => {
    if (connectionStore.webSocket && connectionStore.webSocket.readyState === WebSocket.OPEN) {
      connectionStore.webSocket.send(JSON.stringify({ type, content }));
    }
  };

  const handleEmergencyStop = () => {
    setEmergencyStop(true);
    if (isRecording) {
      setIsRecording(false);
      setRecordingDuration(0);
    }
    sendCommand('emergency_stop', {});
  };

  const handleSystemReset = () => {
    setEmergencyStop(false);
    sendCommand('system_reset', {});
  };

  const handleRecordingToggle = () => {
    if (emergencyStop) return;
    
    if (isRecording) {
      setIsRecording(false);
      setRecordingDuration(0);
      sendCommand('stop_recording', { duration: recordingDuration });
      console.log('Recording stopped, duration:', recordingDuration);
    } else {
      setIsRecording(true);
      sendCommand('start_recording', {});
      console.log('Recording started');
    }
  };

  const toggleObjectType = (type: string) => {
    if (emergencyStop) return;
    setSelectedObjectType(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleModeChange = () => {
    if (emergencyStop) return;
    
    const newMode = !autoMode;
    setAutoMode(newMode);
    sendCommand('mode', { mode: newMode ? 'auto' : 'manual' });
    console.log('Mode changed to:', newMode ? 'AUTO' : 'MANUAL');
  };

  useEffect(() => {
    console.log("Is Defined:" + import.meta.env.VITE_CONTROL_MODE_FEATURE_ENABLED);
  }, [])

  useEffect(() => {
    sendCommand('detection_settings', {
      objects: selectedObjectType
    });
  }, [selectedObjectType]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  return (
    <div className="space-y-6 max-w-[2000px] mx-auto">
      {/* Connection Error Modal */}
      



      {/* Top Bar: Telemetry */}
      <TelemetryPanel/>

      {/* Video Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VideoFeed
          title="Ajoneuvokamera"
          source="http://10.42.0.1/stream/stream.m3u8"
          quality="HD"
          latency={telemetryStore.latency}
          videoFrame={vehicleFrame}
          isConnected={connectionStore.isConnected}
        />
        
      </div>


      {/* Control Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {import.meta.env.VITE_CONTROL_MODE_FEATURE_ENABLED === "true" &&
        /* Auto/Manual Mode */
        (<Card className="glass-card border-2 border-purple-200 shadow-lg">
          <CardHeader className="pb-3 bg-purple-50 border-b border-purple-200">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-purple-700">
              <Zap className="w-6 h-6 text-purple-600" />
              TOIMINTATILA
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8 px-6">
            <div className="space-y-6">
              <div className={`text-center p-6 rounded-2xl border-2 ${
                autoMode 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-purple-50 border-purple-500'
              }`}>
                <p className="text-3xl font-bold mb-2">
                  {autoMode ? '🤖 AUTOMAATTI' : '🎮 MANUAALI'}
                </p>
                <p className="text-sm text-gray-700 font-semibold">
                  {autoMode ? 'Robotti toimii itse' : 'Sinä ohjaat'}
                </p>
              </div>

              <button
                onClick={handleModeChange}
                disabled={emergencyStop}
                className={`w-full py-8 px-6 rounded-2xl font-bold text-lg transition-all border-4 ${
                  emergencyStop
                    ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                    : autoMode
                      ? 'bg-purple-600 hover:bg-purple-700 border-purple-700 text-white shadow-xl active:scale-95 cursor-pointer'
                      : 'bg-green-600 hover:bg-green-700 border-green-700 text-white shadow-xl active:scale-95 cursor-pointer'
                }`}
              >
                {autoMode ? '→ VAIHDA MANUAALIIN' : '→ VAIHDA AUTOMAATTIIN'}
              </button>
            </div>
          </CardContent>
        </Card>)
        }
        <InputPanel/>
        
      </div>
    </div>
  );
});
