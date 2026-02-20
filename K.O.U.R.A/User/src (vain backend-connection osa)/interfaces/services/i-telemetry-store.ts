import { ConnectionStatus } from "../common/types";

export default interface ITelemetryStore {
    latency: number;
    battery: number;
    temperature: number;
    humidity: number;
    status: ConnectionStatus;

    updateTelemetry(): void;
    setStatus(status: ConnectionStatus);
    acceptTelemetry(data: any);
}