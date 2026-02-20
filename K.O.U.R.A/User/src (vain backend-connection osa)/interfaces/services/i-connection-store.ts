import { EventDispatcher } from "@/helpers/event-dispatcher";
import IConnectionProfile from "../common/i-connection-profile";
import { Callback, DataCallback, ITelemetryData } from "../common/types";
import { NullEvent, TelemetryEvent } from "../common/events";

export default interface IConnectionStore {
    webSocket: WebSocket | undefined;
    isConnected: boolean;

    onConnectionInitiated: EventDispatcher<NullEvent>;
    onConnectionEstablished: EventDispatcher<NullEvent>;
    onConnectionStopped: EventDispatcher<NullEvent>;
    onTelemetryUpdate: EventDispatcher<TelemetryEvent>;

    createConnection(profile: IConnectionProfile);
}