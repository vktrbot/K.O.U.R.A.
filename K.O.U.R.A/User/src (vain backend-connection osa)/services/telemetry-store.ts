import { ConnectionStatus } from "@/interfaces/common/types";
import ITelemetryStore from "@/interfaces/services/i-telemetry-store";
import { action, makeAutoObservable, observable } from "mobx";
import IConnectionStore from "@/interfaces/services/i-connection-store";
import { format, getCurrentDate } from "@/lib/utils";

export default class TelemetryStore implements ITelemetryStore {
    latency: number;
    battery: number;
    temperature: number;
    humidity: number;
    status: ConnectionStatus;
    connectionStore: IConnectionStore;

    constructor(connectionStore: IConnectionStore) {
        this.latency = 0;
        this.battery = 0;
        this.temperature = 0;
        this.humidity = 0;
        this.status = 'offline';
        makeAutoObservable(this);
        this.connectionStore = connectionStore;
    }

    @action
    public updateTelemetry() {
        this.requestForUpdate();
    }
    
    private async requestForUpdate() {
        if(!this.connectionStore.isConnected) {
            return;
        }
        let socket = this.connectionStore.webSocket;
        socket.send(format("telemetry", {request_time: getCurrentDate()}));
    }

    @action
    public setStatus(status: ConnectionStatus) {
        this.status = status;
    }

    @action
    public acceptTelemetry(data: any) {
        this.latency = data.ping;
    }
}