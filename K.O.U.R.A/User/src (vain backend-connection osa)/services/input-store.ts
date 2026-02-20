import KeyBindAxis from "@/helpers/keybind-axis";
import IInputStore from "@/interfaces/services/i-input-store";
import { computed, observable } from "mobx";

export default class InputStore implements IInputStore {
    @observable private _horizontal: KeyBindAxis;
    @observable private _vertical: KeyBindAxis;
    @observable private _trunk: KeyBindAxis;

    constructor() {
        this._horizontal = new KeyBindAxis("d", "a", 25);
        this._vertical = new KeyBindAxis("w", "s", 25);
        this._trunk = new KeyBindAxis("r", "t", 25);
    }

    @computed
    public get horizontalAxis() {
        return this._horizontal;
    }

    @computed
    public get verticalAxis() {
        return this._vertical;
    }

    @computed
    public get trunkAxis() {
        return this._trunk;
    }
}
