<script setup lang="ts">
import type { SerializedPiece } from "@chess/serialization/SerializedPiece";

const props = withDefaults(
    defineProps<{
        players: SerializedPiece[];
        gameOver?: boolean;
        winnerPlayerIndex?: number | undefined;
    }>(),
    {
        gameOver: false,
        winnerPlayerIndex: undefined,
    }
);

const playerResults = computed(() => {
    if (props.gameOver) {
        if (props.winnerPlayerIndex !== undefined) {
            return props.players.map((_, index) => (index === props.winnerPlayerIndex ? "1" : "0"));
        } else {
            return props.players.map(() => "1/2");
        }
    } else {
        return props.players.map(() => "0");
    }
});
</script>

<template>
    <div class="flex justify-center items-center gap-8">
        <Player :player="players[0]" vertical />
        <div class="flex gap-4">
            <span v-for="result in playerResults">{{ result }}</span>
        </div>
        <Player :player="players[1]" vertical />
    </div>
</template>
