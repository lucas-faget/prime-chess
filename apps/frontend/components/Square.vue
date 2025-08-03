<script setup lang="ts">
import type { Coordinates } from "@chess/coordinates/Position";
import type { SerializedPiece } from "@chess/serialization/SerializedPiece";
import { useSettings } from "~/composables/useSettings";
const { getChessboardColor } = useSettings();

withDefaults(
    defineProps<{
        name?: string;
        piece: SerializedPiece | null;
        isDark: boolean;
        isLegal?: boolean;
        isActive?: boolean;
        isChecked?: boolean;
        isFogged?: boolean;
        animationCoordinates?: Coordinates | null;
    }>(),
    {
        isLegal: false,
        isActive: false,
        isChecked: false,
        isFogged: true,
        animationCoordinates: null,
    }
);
</script>

<template>
    <div v-if="isFogged" class="bg-neutral-700"></div>
    <div
        v-else
        :class="[
            isDark
                ? isLegal
                    ? getChessboardColor().darkLegal
                    : isActive
                    ? getChessboardColor().darkActive
                    : isChecked
                    ? getChessboardColor().darkChecked
                    : getChessboardColor().dark
                : isLegal
                ? getChessboardColor().lightLegal
                : isActive
                ? getChessboardColor().lightActive
                : isChecked
                ? getChessboardColor().lightChecked
                : getChessboardColor().light,
        ]"
    >
        <Piece v-if="piece" :name="piece.name" :color="piece.color" :animationCoordinates="animationCoordinates" />
    </div>
</template>
