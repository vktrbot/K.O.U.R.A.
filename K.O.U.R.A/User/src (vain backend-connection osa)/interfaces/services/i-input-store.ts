import { Vector2 } from "@/helpers/vector-2";
import IKeybindAxis from "../common/i-keybind-axis";

export default interface IInputStore {
    horizontalAxis: IKeybindAxis;
    verticalAxis: IKeybindAxis;
    trunkAxis: IKeybindAxis;
}