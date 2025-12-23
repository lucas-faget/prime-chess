import { Transmit } from "@adonisjs/transmit-client";
import { ChessVariant, type GameState } from "@primechess/types";

export class ApiService {
    private static baseURL = "http://localhost:3333";
    private static uid: string | null = null;
    private static transmit: Transmit | null = null;

    private static getOrCreateUID(): string {
        if (this.uid) return this.uid;

        let uid: string | null = localStorage.getItem("transmit_uid");
        if (uid) {
            this.uid = uid;
            return uid;
        }

        this.uid = crypto.randomUUID();
        localStorage.setItem("transmit_uid", this.uid);
        return this.uid;
    }

    private static getHeaders(): HeadersInit {
        return {
            "Content-Type": "application/json",
            "x-uid": this.getOrCreateUID(),
        };
    }

    static async createGame(variant: ChessVariant = ChessVariant.Standard): Promise<{
        gameId: string;
        playerIndex: number;
        state: GameState;
    }> {
        const response = await fetch(`${this.baseURL}/games/create`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({ variant }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        return await response.json();
    }

    static async joinGame(gameId: string): Promise<{
        gameId: string;
        playerIndex: number;
        state: GameState;
    }> {
        const response = await fetch(`${this.baseURL}/games/${gameId}/join`, {
            method: "POST",
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }

        return await response.json();
    }

    static async move(
        gameId: string,
        move: {
            from: string;
            to: string;
        },
    ): Promise<void> {
        const response = await fetch(`${this.baseURL}/games/${gameId}/move`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(move),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
        }
    }

    static subscribe(gameId: string, onMove: (data: any) => void): () => void {
        if (!this.transmit) {
            this.transmit = new Transmit({
                baseUrl: this.baseURL,
                uidGenerator: () => this.getOrCreateUID(),
            });
        }

        const subscription = this.transmit.subscription(`games/${gameId}`);
        subscription.create();

        subscription.onMessage(onMove);

        return () => {
            subscription.delete();
        };
    }
}
