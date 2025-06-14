<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        halfmoves: string[];
        playerCount?: number;
        activeHalfmoveIndex?: number;
    }>(),
    {
        playerCount: 2,
        activeHalfMoveIndex: 0,
    }
);

const halfmoveClass = computed(() => ({
    flexBasis: `${100 / props.playerCount}%`,
}));

const fullmoves = computed(() => {
    const moves: string[][] = [];

    for (let i = 0; i < props.halfmoves.length; i += props.playerCount) {
        moves.push(props.halfmoves.slice(i, i + props.playerCount));
    }

    return moves;
});
</script>

<template>
    <div class="w-full flex flex-col gap-1">
        <div class="w-full flex items-center gap-4" v-for="(fullmove, fullmoveIndex) in fullmoves">
            <div>
                <span class="text-xs text-muted-color">{{ fullmoveIndex + 1 }}.</span>
            </div>
            <div class="flex-1 flex gap-1">
                <div
                    :style="halfmoveClass"
                    :class="[
                        {
                            'bg-surface-200 dark:bg-surface-800':
                                2 * fullmoveIndex + halfmoveIndex + 1 === props.activeHalfmoveIndex,
                        },
                        'relative py-1 hover:bg-surface-200 dark:hover:bg-surface-800 rounded-lg cursor-pointer',
                    ]"
                    @click="$emit('goToMove', 2 * fullmoveIndex + halfmoveIndex + 1)"
                    v-for="(halfmove, halfmoveIndex) in fullmove"
                >
                    <span class="relative left-[40%] text-sm">{{ halfmove }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
