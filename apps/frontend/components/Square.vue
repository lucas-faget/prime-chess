<script setup lang="ts">
import type { Direction } from "@chess/coordinates/Direction";
import type { SerializedPiece } from "@chess/serialization/SerializedPiece";
import { useSettings } from "~/composables/useSettings";
const { getChessboardColor } = useSettings();

const props = withDefaults(
    defineProps<{
        name: string;
        piece: SerializedPiece | null;
        isDark: boolean;
        isLegal?: boolean;
        isActive?: boolean;
        isChecked?: boolean;
        isFogged?: boolean;
        animationCoordinates?: Direction | null;
    }>(),
    {
        isLegal: false,
        isActive: false,
        isChecked: false,
        isFogged: true,
        animationCoordinates: null,
    }
);

const colorClass = computed(() => {
    const colors = getChessboardColor();

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

const emit = defineEmits<{
    pieceMounted: [target: HTMLElement | null];
    pieceUnmounted: [target: HTMLElement | null];
}>();
</script>

<template>
    <div v-if="isFogged" :data-square="name" class="square relative bg-neutral-700"></div>
    <div v-else :data-square="name" :class="['square', colorClass]">
        <Piece
            v-if="piece"
            :name="piece.name"
            :color="piece.color"
            :squareName="name"
            :animationCoordinates="animationCoordinates"
            @pieceMounted="$emit('pieceMounted', $event)"
            @pieceUnmounted="$emit('pieceUnmounted', $event)"
        />
    </div>
</template>
