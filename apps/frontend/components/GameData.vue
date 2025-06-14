<script setup lang="ts">
import type { SerializedPlayer } from "@chess/serialization/SerializedPlayer";

withDefaults(
    defineProps<{
        players: SerializedPlayer[];
        gameOver?: boolean;
        winnerPlayerIndex?: number | undefined;
    }>(),
    {
        gameOver: false,
        winnerPlayerIndex: undefined,
    }
);
</script>

<template>
    <div class="flex flex-col">
        <GameResult class="py-8" :players="players" :gameOver="gameOver" :winnerPlayerIndex="winnerPlayerIndex" />

        <Divider />

        <div class="flex justify-between">
            <span class="text-muted-color">Variant</span>
            <Tag icon="pi pi-tag" value="Standard" severity="secondary"></Tag>
        </div>

        <Divider />

        <div class="flex justify-between">
            <span class="text-muted-color">Speed</span>
            <Tag icon="pi pi-clock" value="Unlimited" severity="secondary"></Tag>
        </div>
    </div>
</template>
