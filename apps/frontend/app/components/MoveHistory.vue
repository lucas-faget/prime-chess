<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        algebraicMoves: string[];
        activeHalfmoveIndex: number;
        playerCount?: number;
    }>(),
    {
        playerCount: 2,
    },
);

const emit = defineEmits<{
    (e: "goToMove", index: number): void;
}>();

const halfmoveClass = computed(() => ({
    flexBasis: `${100 / props.playerCount}%`,
}));

const fullmoves = computed(() => {
    const moves: string[][] = [];

    for (let i = 0; i < props.algebraicMoves.length; i += props.playerCount) {
        moves.push(props.algebraicMoves.slice(i, i + props.playerCount));
    }

    return moves;
});
</script>

<template>
    <div class="flex w-full flex-col gap-1">
        <div class="flex w-full items-center gap-4" v-for="(fullmove, fullmoveIndex) in fullmoves">
            <div>
                <span class="text-muted-color text-xs">{{ fullmoveIndex + 1 }}.</span>
            </div>
            <div class="flex flex-1 gap-1">
                <div
                    :style="halfmoveClass"
                    :class="[
                        {
                            'bg-surface-200 dark:bg-surface-800':
                                2 * fullmoveIndex + halfmoveIndex + 1 === props.activeHalfmoveIndex,
                        },
                        'hover:bg-surface-200 dark:hover:bg-surface-800 relative cursor-pointer rounded-lg py-1',
                    ]"
                    @click="$emit('goToMove', 2 * fullmoveIndex + halfmoveIndex + 1)"
                    v-for="(halfmove, halfmoveIndex) in fullmove"
                >
                    <span class="relative left-2/5 text-sm">{{ halfmove }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
