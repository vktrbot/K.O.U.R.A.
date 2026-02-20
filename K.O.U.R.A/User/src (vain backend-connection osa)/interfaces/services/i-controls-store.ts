import { Vector2 } from "@/helpers/vector-2";

export default interface IControlsStore {
    readonly direction: Vector2;
    setDirection(x: number, y: number);
    setTrunk(direction: number);
}