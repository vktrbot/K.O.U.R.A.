import IConnectionStore from "../services/i-connection-store";
import IControlsStore from "../services/i-controls-store";
import IInputStore from "../services/i-input-store";
import IProfileConnectionStore from "../services/i-profile-connection-store";
import ITelemetryStore from "../services/i-telemetry-store";

export default interface IMainStore {
    controlStore: IControlsStore;
    inputStore: IInputStore;
    telemetryStore: ITelemetryStore;
    connectionStore: IConnectionStore;
    connectionProfiles: IProfileConnectionStore;
}