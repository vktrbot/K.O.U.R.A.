import { EventDispatcher } from "@/helpers/event-dispatcher";
import { toast } from "@/hooks/use-toast";
import { NullEvent, TelemetryEvent } from "@/interfaces/common/events";
import IConnectionProfile from "@/interfaces/common/i-connection-profile";
import { Callback, ConnectionStatus, DataCallback, ITelemetryData } from "@/interfaces/common/types";
import IConnectionStore from "@/interfaces/services/i-connection-store";
import ITelemetryStore from "@/interfaces/services/i-telemetry-store";
import { action, computed, makeAutoObservable, observable } from "mobx";
import { Event } from "ws";


export class ConnectionStore implements IConnectionStore {

    @observable private _socket: WebSocket | undefined;
    @observable private _isConnected: boolean;
    
    private _connectionInitiated: EventDispatcher<NullEvent>;
    private _connectionEstablished: EventDispatcher<NullEvent>;
    private _connectionStopped: EventDispatcher<NullEvent>;
    private _telemetryUpdate: EventDispatcher<TelemetryEvent>;
    
    private connectionProfile: IConnectionProfile;

    constructor() {
        this._connectionInitiated = new EventDispatcher;
        this._connectionEstablished = new EventDispatcher;
        this._connectionStopped = new EventDispatcher;
        this._telemetryUpdate = new EventDispatcher;
        makeAutoObservable(this);
    }

    public get onConnectionInitiated() {
        return this._connectionInitiated;
    }

    public get onConnectionEstablished() {
        return this._connectionEstablished;
    }

    public get onConnectionStopped() {
        return this._connectionStopped;
    }

    public get onTelemetryUpdate() {
        return this._telemetryUpdate;
    }

    @computed
    public get isConnected() {
        return this._isConnected;
    }

    @computed
    public get webSocket() {
        return this._socket;
    }

    @action
    public createConnection(profile: IConnectionProfile) {
        const address = "http://" + profile.host + ":" + profile.port + "/ws";
        let socket = new WebSocket(address);
        this.connectionProfile = profile;
        this._socket = socket;
        socket.onopen = () => this.handleOpenConnection(socket);
        socket.onerror = (e) => this.handleError(e);
        socket.onmessage = (e) => this.handleMessage(e.data);
        socket.onclose = (e) => this.handleClose(e);
        this.onConnectionInitiated.raise({});
    }


    private handleClose(e: CloseEvent): any {
        this._isConnected = false;
        this._socket = undefined;
        this.resetConnectionProfile();
        this.onConnectionStopped.raise({});
    }

    private resetConnectionProfile() {
        this.connectionProfile.setActive(false);
        this.connectionProfile = undefined;
    }

    private handleOpenConnection(socket: WebSocket) {
        this._isConnected = true;
        this.connectionProfile.setActive(true);
        this.onConnectionEstablished.raise({});
        socket.send(JSON.stringify({type: "power", content: {enabled: true}}));
    }

    private handleError(e: Event) {
        console.log("Error occured during executing socket");
        if(e.target.readyState === WebSocket.CLOSED && !this._isConnected) {
            this._socket = undefined;
            this.resetConnectionProfile();
            this.onConnectionStopped.raise({});
            toast({title: "Cannot establish connection to machine! Terminating!"});
            console.error("Socket connection could not be established, terminating connection...");
        }
    }

    private handleMessage(message: string) {
        console.log(message);
        let info: any = JSON.parse(message);
        if(info.type === "telemetry") {
            this.onTelemetryUpdate.raise(info.data);
        }
    }
}