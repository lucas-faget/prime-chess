import { SerializedMove } from "../serialization/SerializedMove";

export type GameState = {
    fenString: string;
    move: SerializedMove | null;
};
