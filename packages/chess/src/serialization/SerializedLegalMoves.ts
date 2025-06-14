export interface SerializedLegalMoves {
    [from: string]: {
        [to: string]: boolean;
    };
}
