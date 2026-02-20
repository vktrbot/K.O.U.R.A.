import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  Signal, 
  Power, 
  Thermometer, 
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets
} from "lucide-react";
import { getMainStore } from '@/store/main-store';
import { observer } from 'mobx-react-lite';
import { Telemetry_Delay } from '@/constants/react.constants';

const TelemetryItem = ({ icon, label, value, colorClass = "text-slate-300" }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50">
    {React.cloneElement(icon, { className: `w-6 h-6 ${colorClass}` })}
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`font-semibold text-lg ${colorClass}`}>{value}</p>
    </div>
  </div>
);

export default observer(function TelemetryPanel() {
  const telemetryStore = getMainStore().telemetryStore;
  const connectStore = getMainStore().connectionStore;

  const getLatencyColor = (latency: number) => {
    if (!latency || latency === 0) return "text-slate-400";
    if (parseInt(latency.toString()) < 100) return "text-green-400";
    if (parseInt(latency.toString()) < 200) return "text-yellow-400";
    return "text-red-400";
  };

  const getBatteryColor = (level: number) => {
    if (!level || level === 0) return "text-slate-400";
    if (parseInt(level.toString()) > 50) return "text-green-400";
    if (parseInt(level.toString()) > 20) return "text-yellow-400";
    return "text-red-400";
  };

  const getHumidityColor = (humidity: number) => {
    if (!humidity || humidity === 0) return "text-slate-400";
    return "text-blue-400";
  };

  const systemStatusInfo = {
    standby: { icon: <Clock/>, label: "Valmiustila", color: "text-blue-400" },
    ready: { icon: <CheckCircle/>, label: "Valmis", color: "text-green-400" },
    connecting: { icon: <div className="w-4 h-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />, label: "Yhdistää...", color: "text-yellow-400" },
    offline: { icon: <AlertTriangle/>, label: "Offline", color: "text-red-400" }
  };

  useEffect(() => {
    const onConnectingId = connectStore.onConnectionInitiated.registerListener(() => telemetryStore.setStatus("connecting"));
    const onConnectedId = connectStore.onConnectionEstablished.registerListener(() => telemetryStore.setStatus("ready"));
    const onStoppedId = connectStore.onConnectionStopped.registerListener(() => telemetryStore.setStatus("offline"));
    const onTelemetryId = connectStore.onTelemetryUpdate.registerListener((telemetry) => telemetryStore.acceptTelemetry(telemetry));

    return () => {
      connectStore.onConnectionInitiated.unregisterListener(onConnectingId);
      connectStore.onConnectionEstablished.unregisterListener(onConnectedId);
      connectStore.onConnectionStopped.unregisterListener(onStoppedId);
      connectStore.onTelemetryUpdate.unregisterListener(onTelemetryId);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => telemetryStore.updateTelemetry(), Telemetry_Delay);
    return () => clearInterval(interval);
  }, [])
  
  const currentStatus = systemStatusInfo[telemetryStore.status as keyof typeof systemStatusInfo] || systemStatusInfo.standby;

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <TelemetryItem 
            icon={<ShieldCheck />}
            label="Järjestelmä"
            value={currentStatus.label}
            colorClass={currentStatus.color}
          />
          <TelemetryItem 
            icon={<Signal />}
            label="Viive"
            value={telemetryStore.latency === 0 ? "--" : `${telemetryStore.latency} ms`}
            colorClass={getLatencyColor(telemetryStore.latency)}
          />
          <TelemetryItem 
            icon={<Power />}
            label="Akku"
            value={telemetryStore.battery === 0 ? "--" : `${telemetryStore.battery}%`}
            colorClass={getBatteryColor(telemetryStore.battery)}
          />
          <TelemetryItem 
            icon={<Thermometer />}
            label="Lämpötila"
            value={telemetryStore.temperature === 0 ? "--" : `${telemetryStore.temperature}°C`}
            colorClass="text-orange-400"
          />
          <TelemetryItem 
            icon={<Droplets />}
            label="Kosteus"
            value={telemetryStore.humidity === 0 ? "--" : `${telemetryStore.humidity}%`}
            colorClass={getHumidityColor(telemetryStore.humidity)}
          />
        </div>
      </CardContent>
    </Card>
  );
});
