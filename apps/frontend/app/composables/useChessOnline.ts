import { Transmit } from "@adonisjs/transmit-client";
import type { Move } from "@primechess/chess-lib";
import type { GameState } from "@primechess/types";

export function useChessOnline(state: GameState | null = null) {
    const core = useChessCore(state);

    let gameId: string | undefined = undefined;
    let transmit: Transmit | null = null;
    const playerIndex = ref<number | undefined>(undefined);
    const canMove = computed<boolean>(() => core.canMove.value && playerIndex.value === core.activePlayerIndex.value);

    onMounted(() => {
        transmit = new Transmit({
            baseUrl: "http://localhost:3333",
        });
    });

    async function join(id: string | undefined = undefined): Promise<void> {
        if (!transmit) return;

        const url: string = id ? `http://localhost:3333/games/${id}/join` : "http://localhost:3333/games/create";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-uid": transmit.uid,
            },
        });

        const data = await response.json();

        if (data.gameId) {
            console.log(data.gameId);
            gameId = data.gameId;
            playerIndex.value = data.playerIndex;
            core.loadState(data.state);

            const subscription = transmit.subscription(`games/${gameId}`);
            await subscription.create();

            subscription.onMessage((data: any) => {
                core.tryMove(data.move.from, data.move.to);
            });
        }
    }

    async function tryMove(from: string, to: string): Promise<void> {
        if (!transmit || !gameId) return;

        await fetch(`http://localhost:3333/games/${gameId}/move`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-uid": transmit.uid,
            },
            body: JSON.stringify({ from, to }),
        });
    }

    function cancelLastMove(): Move | null {
        return null;
    }

    return {
        ...core,
        playerIndex,
        canMove,
        join,
        tryMove,
        cancelLastMove,
    };
}
