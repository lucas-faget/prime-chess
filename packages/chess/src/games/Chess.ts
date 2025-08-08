import { ChessVariant } from "../types/ChessVariant";
import type { Position } from "../coordinates/Position";
import { Directions } from "../coordinates/Directions";
import { PlayerColor } from "../types/PlayerColor";
import { PieceName } from "../types/PieceName";
import type { Piece } from "../pieces/Piece";
import { Player } from "../players/Player";
import type { Move } from "../moves/Move";
import type { SerializedMove } from "../serialization/SerializedMove";
import type { LegalMoves } from "../types/LegalMoves";
import type { SerializedLegalMoves } from "../serialization/SerializedLegalMoves";
import type { GameState } from "../types/GameState";
import type { Chessboard } from "../chessboards/Chessboard";
import { TwoPlayerChessboard } from "../chessboards/TwoPlayerChessboard";
import { FourPlayerChessboard } from "../chessboards/FourPlayerChessboard";

export class Chess {
    variant: ChessVariant;
    players: Player[];
    activePlayerIndex: number = 0;
    chessboard: Chessboard;
    legalMoves: LegalMoves = {};
    history: GameState[] = [];
    isActivePlayerChecked: boolean = false;
    gameOver: boolean = false;
    checkmatePiece: Piece | undefined = undefined;

    constructor(variant: ChessVariant, fenString = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        this.variant = variant;

        this.players =
            variant === ChessVariant.FourPlayer
                ? [
                      new Player(PlayerColor.White, "Whites", Directions.Up),
                      new Player(PlayerColor.Silver, "Silvers", Directions.Right),
                      new Player(PlayerColor.Black, "Blacks", Directions.Down),
                      new Player(PlayerColor.Gold, "Golds", Directions.Left),
                  ]
                : [
                      new Player(PlayerColor.White, "Whites", Directions.Up),
                      new Player(PlayerColor.Black, "Blacks", Directions.Down),
                  ];

        if (this.variant === ChessVariant.FischerRandom) {
            let fen: string[] = fenString.split(" ");
            let position: string[] = fen[0].split("/");
            const fischerRandomPieceRow: string = Chess.getFischerRandomPieceRow();
            position[0] = fischerRandomPieceRow;
            position[position.length - 1] = fischerRandomPieceRow.toUpperCase();
            fen[0] = position.join("/");
            fenString = fen.join(" ");
        }

        this.chessboard =
            variant === ChessVariant.FourPlayer
                ? new FourPlayerChessboard()
                : new TwoPlayerChessboard(fenString.split(" ")[0]);

        this.setKingSquares();

        this.history.push({
            fenString,
            move: null,
        });

        console.log(this.history[this.history.length - 1].fenString);

        this.setLegalMoves();
    }

    setKingSquares(): void {
        for (const [squareName, square] of this.chessboard.squares.entries()) {
            const piece = square.piece;
            if (piece !== null) {
                if (piece.getName() === PieceName.King) {
                    const player: Player | undefined = this.players.find((player) => player.color === piece.color);

                    if (player) {
                        if (player.kingSquare !== null) {
                            throw new Error(`Two kings found for player ${player.color}`);
                        } else {
                            player.kingSquare = square;
                        }
                    }
                }
            }
        }

        for (const player of this.players) {
            if (player.kingSquare === null) {
                throw new Error(`No king found for player ${player.color}`);
            }
        }
    }

    static getFischerRandomPieceRow(pieceRow: string = "rnbqkbnr"): string {
        let allPieces = pieceRow.split("");
        let fischerRandomPieces: string[] = Array.from({ length: allPieces.length }, (_, i) => "");
        let indexes: number[] = Array.from({ length: allPieces.length }, (_, i) => i);

        let bishops = allPieces.filter((piece) => piece === "b");

        if (bishops.length > 1) {
            let largestEven: number = bishops.length % 2 === 0 ? bishops.length : bishops.length - 1;
            const evenIndexes: number[] = indexes.filter((index) => index % 2 === 0);
            const oddIndexes: number[] = indexes.filter((index) => index % 2 !== 0);
            for (let i = 0; i < largestEven; i++) {
                let indexes: number[] = i < largestEven / 2 ? evenIndexes : oddIndexes;
                const randomIndex: number = Math.floor(Math.random() * indexes.length);
                fischerRandomPieces[indexes[randomIndex]] = "b";
                indexes.splice(randomIndex, 1);
                bishops.shift();
            }
            indexes = [...evenIndexes, ...oddIndexes];
            indexes.sort((a, b) => a - b);
        }

        let pieces = allPieces.filter((piece) => piece !== "b" && piece !== "r" && piece !== "k");
        pieces = [...pieces, ...bishops];

        for (let i = 0; i < pieces.length; i++) {
            let piece: string = pieces[i];
            const randomIndex: number = Math.floor(Math.random() * indexes.length);
            fischerRandomPieces[indexes[randomIndex]] = piece;
            indexes.splice(randomIndex, 1);
        }

        pieces = allPieces.filter((piece) => piece === "r" || piece === "k");

        if (pieces.length > 3 && (pieces[0] === "k" || pieces[pieces.length - 1] === "k")) {
            let kingIndex: number = Math.floor(Math.random() * (pieces.length - 2)) + 1;
            pieces = pieces.map((piece) => (piece === "k" ? "r" : piece));
            pieces[kingIndex] = "k";
        }

        for (let i = 0; i < pieces.length; i++) {
            let piece: string = pieces[i];
            fischerRandomPieces[indexes[i]] = piece;
        }

        return fischerRandomPieces.join("");
    }

    getActivePlayer(): Player {
        return this.players[this.activePlayerIndex];
    }

    isPlayerActive(color: PlayerColor): boolean {
        return this.getActivePlayer().color === color;
    }

    setNextPlayer(): void {
        this.activePlayerIndex = (this.activePlayerIndex + 1) % this.players.length;
    }

    setPreviousPlayer(): void {
        this.activePlayerIndex = (this.activePlayerIndex - 1 + this.players.length) % this.players.length;
    }

    setLegalMoves(): void {
        const player: Player = this.getActivePlayer();
        if (player.kingSquare !== null) {
            this.legalMoves = this.chessboard.calculateLegalMoves(player, this.getEnPassantTargetFromFen());
        }
    }

    serializeLegalMoves(): SerializedLegalMoves {
        const legalMoves: SerializedLegalMoves = {};

        for (const from in this.legalMoves) {
            if (this.legalMoves.hasOwnProperty(from)) {
                legalMoves[from] = {};
                for (const to in this.legalMoves[from]) {
                    if (this.legalMoves[from].hasOwnProperty(to)) {
                        legalMoves[from][to] = true;
                    }
                }
            }
        }

        return legalMoves;
    }

    isLegalMove(fromSquareName: string, toSquareName: string): boolean {
        return fromSquareName in this.legalMoves && toSquareName in this.legalMoves[fromSquareName];
    }

    getLegalMove(fromSquareName: string, toSquareName: string): Move | null {
        return this.isLegalMove(fromSquareName, toSquareName) ? this.legalMoves[fromSquareName][toSquareName] : null;
    }

    getHalfmove(moveIndex: number): SerializedMove | null {
        return moveIndex >= 0 && moveIndex < this.history.length ? this.history[moveIndex].move : null;
    }

    getAlgebraicMoves(): string[] {
        return this.history.slice(1).map((gameState) => gameState?.move?.algebraic ?? "");
    }

    getFenPositionByIndex(moveIndex: number = this.history.length - 1): string {
        if (moveIndex >= 0 && moveIndex < this.history.length) {
            return this.history[moveIndex].fenString.split(" ")[0];
        } else {
            return this.history[this.history.length - 1].fenString.split(" ")[0];
        }
    }

    getCastlingRightsFromFen(): string | null {
        return this.history.length > 0 ? this.history[this.history.length - 1].fenString.split(" ")[2] : null;
    }

    getEnPassantTargetFromFen(): string | null {
        return this.history.length > 0 ? this.history[this.history.length - 1].fenString.split(" ")[3] : null;
    }

    getCheckedSquare(): string | null {
        const player: Player = this.getActivePlayer();
        return player.isChecked && player.kingSquare !== null ? player.kingSquare.name : null;
    }

    storeGameState(move: SerializedMove, enPassantTarget: string | null) {
        const position: string = this.chessboard.toString();
        const activePlayer: string = this.getActivePlayer().color;
        let castlingRights: string =
            this.players[0].getCastlingRightString() + this.players[1].getCastlingRightString();
        if (castlingRights.length === 0) {
            castlingRights = "-";
        }
        enPassantTarget = enPassantTarget ?? "-";
        const halfmoveClock: number = 0;
        const fullmoveNumber: number = 1 + Math.floor(this.history.length / 2);

        const fenString: string = `${position} ${activePlayer} ${castlingRights} ${enPassantTarget} ${halfmoveClock} ${fullmoveNumber}`;

        this.history.push({
            fenString,
            move,
        });

        console.log(this.history[this.history.length - 1].fenString);
    }

    evaluateGame(): void {
        const player: Player = this.getActivePlayer();
        const noLegalMove: boolean = Object.keys(this.legalMoves).length === 0;

        this.gameOver = false;
        this.checkmatePiece = undefined;

        if (noLegalMove) {
            this.gameOver = true;
            if (player.isChecked) {
                this.checkmatePiece = player.isChecked;
            }
        }
    }

    performMove(move: Move): void {
        this.getActivePlayer().isChecked = false;
        const serializedMove: SerializedMove = move.serialize();
        move.carryOutMove();
        move.toSquare.piece?.getName() === PieceName.King && (this.getActivePlayer().kingSquare = move.toSquare);
        this.getActivePlayer().updateCastlingRights(move);
        this.setNextPlayer();
        this.storeGameState(serializedMove, move.enPassantTarget);
        this.getActivePlayer().isChecked = this.chessboard.isChecked(this.getActivePlayer());
        this.setLegalMoves();
        this.evaluateGame();
    }

    tryMove(fromSquareName: string, toSquareName: string): SerializedMove | null {
        if (this.isLegalMove(fromSquareName, toSquareName)) {
            const move = this.getLegalMove(fromSquareName, toSquareName);
            if (move) {
                this.performMove(move);
                return this.history[this.history.length - 1].move;
            }
        }

        return null;
    }

    cancelLastMove(): SerializedMove | null {
        if (this.history.length > 1) {
            const gameState: GameState | undefined = this.history.pop();
            if (gameState && gameState.move) {
                this.getActivePlayer().isChecked = false;
                this.chessboard.undoMove(gameState.move);
                this.setPreviousPlayer();
                this.chessboard.getSquareByName(gameState.move.fromSquare)?.piece?.getName() === PieceName.King &&
                    (this.getActivePlayer().kingSquare = this.chessboard.getSquareByName(gameState.move.fromSquare));
                this.getActivePlayer().setCastlingRightFromString(this.getCastlingRightsFromFen());
                this.getActivePlayer().isChecked = this.chessboard.isChecked(this.getActivePlayer());
                this.setLegalMoves();
                this.evaluateGame();
                return gameState.move;
            }
        }

        return null;
    }

    resetGame(): void {
        // TODO
    }

    static areEqualCoordinates(corrdinates1: Position, coordinates2: Position): boolean {
        return corrdinates1.x === coordinates2.x && coordinates2.y === coordinates2.y;
    }
}
