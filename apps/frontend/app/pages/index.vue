<script setup lang="ts">
import Chessboard from "~/components/Chessboard.vue";

const { rows, columns, chessboard, legalMoves, playerInFrontDirection, tryMove } = useLocalChess();
</script>

<template>
    <div class="flex items-center justify-center">
        <div class="aspect-square h-screen">
            <Chessboard
                :rows="rows"
                :columns="columns"
                :legal-moves="legalMoves"
                :chessboard="chessboard"
                :player-in-front-direction="playerInFrontDirection"
                @try-move="tryMove"
            />
        </div>
    </div>
</template>
