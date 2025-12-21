import type { HttpContext } from "@adonisjs/core/http";
import transmit from "@adonisjs/transmit/services/main";
import { Game } from "../types/Game.js";
import { chess, HistoryEntry } from "@primechess/chess-lib";

export default class GamesController {
    private static games = new Map<string, Game>();

    public async create({ request }: HttpContext) {
        const uid = request.header("x-uid");
        if (!uid) return;

        const gameId = crypto.randomUUID();

        const game: Game = {
            id: gameId,
            chess: chess.new(),
            uids: [uid],
        };

        GamesController.games.set(gameId, game);

        console.log(`[Game Created] Game ID: ${gameId}, UID: ${uid}`);

        const history: HistoryEntry[] = game.chess.getHistory();

        return {
            gameId,
            playerIndex: 0,
            state: {
                variant: 0,
                initialFen: history[0].fen,
                moves: history.slice(1).map((entry) => ({
                    from: entry.move?.fromSquare,
                    to: entry.move?.toSquare,
                })),
            },
        };
    }

    public async join({ params, request }: HttpContext) {
        const gameId = params.id;
        const uid = request.header("x-uid");
        if (!uid) return;

        const game = GamesController.games.get(gameId);
        if (!game) {
            return { error: "Game not found" };
        }

        if (!game.uids.includes(uid)) {
            if (game.uids.length >= 2) {
                return { error: "Game is full" };
            }

            game.uids.push(uid);
            console.log(`[Player Joined] Game ID: ${gameId}, UID: ${uid}`);

            if (game.uids.length === 2) {
                console.log(`[Game Started] Game ID: ${gameId}`);
            }
        } else {
            console.log(`[Player Reconnected] Game ID: ${gameId}, UID: ${uid}`);
        }

        const history: HistoryEntry[] = game.chess.getHistory();

        return {
            gameId,
            playerIndex: game.uids.indexOf(uid),
            state: {
                variant: 0,
                initialFen: history[0].fen,
                moves: history.slice(1).map((entry) => ({
                    from: entry.move?.fromSquare,
                    to: entry.move?.toSquare,
                })),
            },
        };
    }

    public async move({ params, request }: HttpContext) {
        const { from, to } = request.only(["from", "to"]);
        const gameId = params.id;
        const uid = request.header("x-uid");
        if (!uid) return;

        const game = GamesController.games.get(gameId);
        if (!game) return { error: "Game not found" };

        if (game.uids.length < 2) {
            return { error: "Game has not started" };
        }

        if (game.uids[game.chess.getActivePlayerIndex()] !== uid) {
            return { error: "Not active player" };
        }

        if (!game.chess.isLegalMove(from, to)) {
            return { error: "Illegal move", from, to };
        }

        game.chess.tryMove(from, to);

        const data = {
            move: { from, to },
        };

        transmit.broadcast(`games/${gameId}`, {
            event: "move",
            ...data,
        });

        return data;
    }
}
