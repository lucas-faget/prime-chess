<script setup lang="ts">
import { useChessStore } from "~/stores/chess";
import { ChessVariant } from "@chess/types/ChessVariant.ts";
import type { SerializedMove } from "@chess/serialization/SerializedMove";

const chessStore = useChessStore();

const lastMove = ref<SerializedMove | null>(null);

const handleMove = (fromSquareName: string, toSquareName: string): void => {
    let move: SerializedMove | null = chessStore.getLegalMove(fromSquareName, toSquareName);
    if (move !== null) {
        chessStore.tryMove(fromSquareName, toSquareName);
        lastMove.value = move;
    }
};

onBeforeMount(() => {
    if (!chessStore.gameExists() || chessStore.variant !== ChessVariant.Standard) {
        chessStore.createChessGame();
    }
});
</script>

<template>
    <ThreeChessboard
        :chessboard="chessStore.chessboard"
        :legalMoves="chessStore.legalMoves"
        :lastMove="lastMove"
        @handle-move="handleMove"
    />
</template>
