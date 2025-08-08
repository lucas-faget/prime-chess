import type { Direction } from "@chess/coordinates/Direction";

export type SerializedPlayer = {
    name: string;
    color: string;
    direction: Direction;
};
