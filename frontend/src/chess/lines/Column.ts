import { Line } from "./Line";
import type { PieceName } from "../types/PieceName";

export class Column extends Line
{
    pieceName: PieceName;

    constructor(index: number, name: string, pieceName: PieceName) {
        super(index, name);
        this.pieceName = pieceName;
    }
}
