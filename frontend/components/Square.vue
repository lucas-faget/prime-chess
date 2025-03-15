<script setup lang="ts">
import type { SerializedPiece } from "@shared/chess/serialization/SerializedPiece";
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
    }>(),
    {
        isLegal: false,
        isActive: false,
        isChecked: false,
        isFogged: true,
    }
);
</script>

<template>
    <div v-if="isFogged" class="bg-neutral-500"></div>
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
        <img
            v-if="piece !== null"
            class="h-full w-full aspect-square"
            :src="getPieceImage(piece.color, piece.name)"
            :alt="piece.name"
        />
    </div>
</template>
