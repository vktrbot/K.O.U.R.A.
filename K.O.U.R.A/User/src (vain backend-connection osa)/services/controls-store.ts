import { Vector2 } from "@/helpers/vector-2";
import IConnectionStore from "@/interfaces/services/i-connection-store";
import IControlsStore from "@/interfaces/services/i-controls-store";
import { format } from "@/lib/utils";
import { action, computed, observable } from "mobx";

export default class ControlsStore implements IControlsStore {
    @observable private _direction: Vector2;
    @observable private _trunk: number;
    private connectionStore: IConnectionStore;

    constructor(connectionStore: IConnectionStore) {
        this._direction = new Vector2(0, 0);
        this._trunk = 0;
        this.connectionStore = connectionStore;
    }

    @computed
    public get direction() {
        return this._direction;
    }

    private updateMoveIfConnected() {
        if (!this.connectionStore.isConnected || !this.connectionStore.webSocket) return;
        this.connectionStore.webSocket.send(
            format("move", { direction: this._direction.json() })
        );
    }

    private updateTrunkIfConnected() {
        if (!this.connectionStore.isConnected || !this.connectionStore.webSocket) return;
        this.connectionStore.webSocket.send(
            format("trunk", { direction: this._trunk })
        );
    }

    @action
    setDirection(x: number, y: number) {
        this._direction.setX(x);
        this._direction.setY(y);
        this._direction.normalize();
        this.updateMoveIfConnected();
    }

    @action
    setTrunk(direction: number) {
        this._trunk = direction;
        this.updateTrunkIfConnected();
    }
}
