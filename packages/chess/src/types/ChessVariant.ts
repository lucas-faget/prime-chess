export enum ChessVariant {
    Standard = "std",
    FischerRandom = "960",
    FogOfWar = "fog",
    FourPlayer = "4player",
    Custom = "custom",
}

// Standard
//
//    a b c d e f g h
//  + --------------- +
//  | r n b q k b n r | 8
//  | p p p p p p p p | 7
//  | . . . . . . . . | 6
//  | . . . . . . . . | 5
//  | . . . . . . . . | 4
//  | . . . . . . . . | 3
//  | P P P P P P P P | 2
//  | R N B Q K B N R | 1
//  + --------------- +

// FourPlayerChess
//
//    a b c d e f g h i j k l m n
//  + --------------------------- +
//  | . . . R N B K Q B N R . . . | 14
//  | . . . P P P P P P P P . . . | 13
//  | . . . . . . . . . . . . . . | 12
//  | r p . . . . . . . . . . p r | 11
//  | n p . . . . . . . . . . p n | 10
//  | b p . . . . . . . . . . p b | 9
//  | q p . . . . . . . . . . p k | 8
//  | k p . . . . . . . . . . p q | 7
//  | b p . . . . . . . . . . p b | 6
//  | n p . . . . . . . . . . p n | 5
//  | r p . . . . . . . . . . p r | 4
//  | . . . . . . . . . . . . . . | 3
//  | . . . P P P P P P P P . . . | 2
//  | . . . R N B Q K B N R . . . | 1
//  + --------------------------- +
