<script setup lang="ts">
import type { Piece } from "@primechess/chess-lib";
import { useSettings } from "~/composables/useSettings";
import type { SquareColors } from "~/types/SquareColor";
const { getChessboardColor } = useSettings();

const props = withDefaults(
    defineProps<{
        name: string;
        piece: Piece | null;
        isDark: boolean;
        isLegal?: boolean;
        isActive?: boolean;
        isChecked?: boolean;
    }>(),
    {
        isLegal: false,
        isActive: false,
        isChecked: false,
    },
);

const colorClass = computed(() => {
    const colors: SquareColors = getChessboardColor();

    if (props.isDark) {
        if (props.isLegal) return colors.darkLegal;
        if (props.isActive) return colors.darkActive;
        if (props.isChecked) return colors.darkChecked;
        return colors.dark;
    } else {
        if (props.isLegal) return colors.lightLegal;
        if (props.isActive) return colors.lightActive;
        if (props.isChecked) return colors.lightChecked;
        return colors.light;
    }
});
</script>

<template>
    <div :data-square="name" :class="colorClass">
        <img
            v-if="piece"
            class="relative aspect-square h-full w-full"
            :src="getPieceImage(piece.color, piece.name)"
            :alt="piece.name"
        />
    </div>
</template>
