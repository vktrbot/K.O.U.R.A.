export type ConnectionStatus = "offline" | "standby" | "connecting" | "ready" | "emergency";

export interface ITelemetryData {
    ping: number;   
}

export interface Callback {
    id: string;
    callback: () => void;
}

export interface DataCallback<T> {
    id: string;
    callback: (data: T) => void;
}