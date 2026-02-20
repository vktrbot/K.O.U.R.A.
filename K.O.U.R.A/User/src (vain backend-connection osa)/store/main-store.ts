import IConnectionStore from "@/interfaces/services/i-connection-store";
import IControlsStore from "@/interfaces/services/i-controls-store";
import IInputStore from "@/interfaces/services/i-input-store";
import IProfileConnectionStore from "@/interfaces/services/i-profile-connection-store";
import ITelemetryStore from "@/interfaces/services/i-telemetry-store";
import IMainStore from "@/interfaces/stores/i-main-store";
import ConnectionProfileStore from "@/services/connection-profile-store";
import { ConnectionStore } from "@/services/connection-store";
import ControlsStore from "@/services/controls-store";
import InputStore from "@/services/input-store";
import TelemetryStore from "@/services/telemetry-store";
import { observable } from "mobx";

class MainStore implements IMainStore {
    @observable public controlStore: IControlsStore;
    @observable public inputStore: IInputStore;
    @observable public telemetryStore: ITelemetryStore;
    @observable public connectionProfiles : IProfileConnectionStore;
    @observable public connectionStore: IConnectionStore;

    constructor() {
        this.connectionStore = new ConnectionStore();
        this.telemetryStore = new TelemetryStore(this.connectionStore);
        this.controlStore = new ControlsStore(this.connectionStore);
        this.inputStore = new InputStore();
        this.connectionProfiles = new ConnectionProfileStore();
    }
    
}

let mainStore: IMainStore;

export const getMainStore = () : IMainStore => {
    if(!mainStore) {
        mainStore = new MainStore();
    }
    return mainStore;
}