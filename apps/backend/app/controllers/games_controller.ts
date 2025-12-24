import type { HttpContext } from "@adonisjs/core/http";
import transmit from "@adonisjs/transmit/services/main";
import { Game } from "../types/Game.js";
import { chess, HistoryEntry } from "@primechess/chess-lib";
import { ChessVariant } from "@primechess/types";

export default class GamesController {
    private static games = new Map<string, Game>();

    public async create({ request, response }: HttpContext) {
        const uid = request.header("x-uid");
        if (!uid) {
            return response.status(401).send({ error: "Missing UID" });
        }

        const { variant } = request.only(["variant"]);
        const gameId = crypto.randomUUID();

        const game: Game = {
            id: gameId,
            variant,
            chess: variant === ChessVariant.FischerRandom ? chess.fischerRandom() : chess.new(),
            uids: [uid],
        };

        GamesController.games.set(gameId, game);

        console.log(`[Game Created] Game ID: ${gameId}, UID: ${uid}`);

        const history: HistoryEntry[] = game.chess.getHistory();

        return {
            gameId,
            playerIndex: 0,
            state: {
                variant: variant,
                initialFen: history[0].fen,
                moves: history.slice(1).map((entry) => ({
                    from: entry.move?.fromSquare,
                    to: entry.move?.toSquare,
                })),
            },
        };
    }

    public async join({ params, request, response }: HttpContext) {
        const uid = request.header("x-uid");
        if (!uid) {
            return response.status(401).send({ error: "Missing UID" });
        }

        const gameId = params.id;

        const game = GamesController.games.get(gameId);
        if (!game) {
            return response.status(404).send({ error: "Game not found" });
        }

        if (!game.uids.includes(uid)) {
            if (game.uids.length >= 2) {
                return response.status(403).send({ error: "Game is full" });
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
                variant: game.variant,
                initialFen: history[0].fen,
                moves: history.slice(1).map((entry) => ({
                    from: entry.move?.fromSquare,
                    to: entry.move?.toSquare,
                })),
            },
        };
    }

    public async move({ params, request, response }: HttpContext) {
        const uid = request.header("x-uid");
        if (!uid) {
            return response.status(401).send({ error: "Missing UID" });
        }

        const { from, to } = request.only(["from", "to"]);
        const gameId = params.id;

        const game = GamesController.games.get(gameId);
        if (!game) {
            return response.status(404).send({ error: "Game not found" });
        }

        if (game.uids.length < 2) {
            return response.status(409).send({ error: "Game has not started" });
        }

        if (game.uids[game.chess.getActivePlayerIndex()] !== uid) {
            return response.status(403).send({ error: "Not your turn" });
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
