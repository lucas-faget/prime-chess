<script setup lang="ts">
import { VChessboard, type VMove, type VLegalMoves } from "@/types";
import { ChessVariant } from "@shared/chess/types/ChessVariant.ts";

const props = withDefaults(
    defineProps<{
        variant: ChessVariant;
        playerInFrontIndex: number;
        chessboard: VChessboard;
        canPlay?: boolean;
        legalMoves: VLegalMoves;
        activeMove?: VMove | null;
        checkSquare?: string | null;
    }>(),
    {
        canPlay: false,
        activeMove: null,
        checkSquare: null,
    }
);

const emit = defineEmits<{
    handleMove: [fromSquareName: string, toSquareName: string];
}>();

const fromSquareName = ref<string | null>(null);

const isPerpendicular = computed(
    () =>
        (props.variant === ChessVariant.FourPlayer && props.playerInFrontIndex === 1) || props.playerInFrontIndex === 3
);

const rows = computed(() => {
    switch (props.playerInFrontIndex) {
        case 1:
            return props.variant === ChessVariant.FourPlayer ? props.chessboard.reversedFiles : props.chessboard.ranks;
        case 2:
            return props.chessboard.ranks;
        case 3:
            return props.chessboard.files;
        case 0:
        default:
            return props.chessboard.reversedRanks;
    }
});

const columns = computed(() => {
    switch (props.playerInFrontIndex) {
        case 1:
            return props.variant === ChessVariant.FourPlayer
                ? props.chessboard.reversedRanks
                : props.chessboard.reversedFiles;
        case 2:
            return props.chessboard.reversedFiles;
        case 3:
            return props.chessboard.ranks;
        case 0:
        default:
            return props.chessboard.files;
    }
});

const gridStyle = computed(() => {
    return {
        gridTemplateColumns: `repeat(${props.chessboard.files.length}, ${100 / props.chessboard.files.length}%)`,
        gridTemplateRows: `repeat(${props.chessboard.ranks.length}, ${100 / props.chessboard.ranks.length}%)`,
    };
});

const getSquareName = (column: string, row: string): string => (isPerpendicular.value ? row + column : column + row);

const isDarkSquare = (x: number, y: number): boolean => (isPerpendicular.value ? (x + y) % 2 === 0 : (x + y) % 2 !== 0);

const isActiveSquare = (squareName: string): boolean =>
    props.activeMove !== null &&
    (squareName === props.activeMove.fromSquare || squareName === props.activeMove.toSquare);

const isCheckedSquare = (squareName: string): boolean =>
    props.canPlay && props.checkSquare !== null && squareName === props.checkSquare;

const hasLegalMove = (squareName: string): boolean => squareName in props.legalMoves;

const isLegalMove = (fromSquareName: string, toSquareName: string): boolean =>
    hasLegalMove(fromSquareName) && toSquareName in props.legalMoves[fromSquareName];

const isLegalSquare = (squareName: string): boolean =>
    props.canPlay && fromSquareName.value !== null && isLegalMove(fromSquareName.value, squareName);

function handleSquareClick(squareName: string): void {
    if (props.canPlay) {
        if (hasLegalMove(squareName) && fromSquareName.value !== squareName) {
            fromSquareName.value = squareName;
        } else {
            if (fromSquareName.value !== null) {
                if (isLegalMove(fromSquareName.value, squareName)) {
                    emit("handleMove", fromSquareName.value, squareName);
                }
                fromSquareName.value = null;
            }
        }
    }
}
</script>

<template>
    <div class="grid h-full w-full aspect-square" :style="gridStyle">
        <template v-for="(row, y) in rows" :key="row">
            <template v-for="(column, x) in columns" :key="column">
                <Square
                    :name="getSquareName(column, row)"
                    :piece="chessboard.squares.get(getSquareName(column, row)) ?? null"
                    :isDark="isDarkSquare(x, y)"
                    :isLegal="isLegalSquare(getSquareName(column, row))"
                    :isActive="isActiveSquare(getSquareName(column, row))"
                    :isChecked="isCheckedSquare(getSquareName(column, row))"
                    @click="handleSquareClick(getSquareName(column, row))"
                />
            </template>
        </template>
    </div>
</template>
