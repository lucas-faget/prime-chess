<script setup lang="ts">
import type { SerializedPlayer } from "@chess/serialization/SerializedPlayer";
import type { SerializedPiece } from "@chess/serialization/SerializedPiece";

const visible = ref<boolean>(false);

const props = withDefaults(
    defineProps<{
        players: SerializedPlayer[];
        gameOver?: boolean;
        checkmatePiece?: SerializedPiece | undefined;
        winnerPlayerIndex?: number | undefined;
    }>(),
    {
        gameOver: false,
        winnerPlayerIndex: undefined,
        checkmatePiece: undefined,
    }
);

watch(
    () => props.gameOver,
    (gameOver) => {
        if (gameOver === true) {
            visible.value = true;
        }
    },
    { immediate: true }
);
</script>

<template>
    <Dialog v-model:visible="visible" modal header="Game over" :style="{ width: 'min(100vw,46rem)' }" class="app-font">
        <div class="flex flex-col gap-4">
            <div class="relative">
                <div class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col text-center">
                            <template v-if="winnerPlayerIndex !== undefined">
                                <span class="text-2xl font-medium"> {{ players[winnerPlayerIndex].name }} won </span>
                                <span class="text-lg text-muted-color">by checkmate</span>
                            </template>

                            <template v-else>
                                <span class="text-2xl font-medium">Draw</span>
                                <span class="text-lg text-muted-color">by stalemate</span>
                            </template>
                        </div>

                        <GameResult :players="players" :gameOver="gameOver" :winnerPlayerIndex="winnerPlayerIndex" />
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>
