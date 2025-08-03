<script setup lang="ts">
import { ChessVariant } from "@chess/types/ChessVariant";
import type { SerializedLegalMoves } from "@chess/serialization/SerializedLegalMoves";
import type { Chessboard } from "@chess/chessboards/Chessboard";
import type { SerializedMove } from "@chess/serialization/SerializedMove";
import type { PlayerColor } from "@chess/types/PlayerColor";
import type { Coordinates } from "@chess/coordinates/Position";

const boardRef = ref(null);
const squareSize = ref<number>(0); // Size of a chessboard square in pixels
const fromSquareName = ref<string | null>(null);
let resizeObserver: ResizeObserver | null = null;

const props = withDefaults(
    defineProps<{
        variant: ChessVariant;
        playerInFrontIndex: number;
        chessboard: Chessboard;
        activePlayerColor: PlayerColor | null;
        canPlay?: boolean;
        legalMoves: SerializedLegalMoves;
        activeMove?: SerializedMove | null;
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

const animationCoordinates = computed(() => {
    if (props.activeMove) {
        const dx: number = props.activeMove.toPosition.x - props.activeMove.fromPosition.x;
        const dy: number = props.activeMove.toPosition.y - props.activeMove.fromPosition.y;

        const isColumnsReversed = isPerpendicular.value
            ? rows.value[0] === props.chessboard.files[0]
            : columns.value[0] === props.chessboard.files[0];

        const isRowsReversed = isPerpendicular.value
            ? columns.value[0] === props.chessboard.ranks[0]
            : rows.value[0] === props.chessboard.ranks[0];

        return {
            x: squareSize.value * (isColumnsReversed ? -dx : dx),
            y: squareSize.value * (isRowsReversed ? -dy : dy),
        };
    }

    return null;
});

const getSquareName = (column: string, row: string): string => (isPerpendicular.value ? row + column : column + row);

const isDarkSquare = (x: number, y: number): boolean => (isPerpendicular.value ? (x + y) % 2 === 0 : (x + y) % 2 !== 0);

const hasLegalMove = (squareName: string): boolean => squareName in props.legalMoves;

const isLegalMove = (fromSquareName: string, toSquareName: string): boolean =>
    hasLegalMove(fromSquareName) && toSquareName in props.legalMoves[fromSquareName];

const isLegalSquare = (squareName: string): boolean => {
    for (const fromSquareName in props.legalMoves) {
        if (squareName in props.legalMoves[fromSquareName]) {
            return true;
        }
    }
    return false;
};

const isLegalSquareForSelectedPiece = (squareName: string): boolean =>
    props.canPlay && fromSquareName.value !== null && isLegalMove(fromSquareName.value, squareName);

const isActiveSquare = (squareName: string): boolean =>
    props.activeMove !== null &&
    (squareName === props.activeMove.fromSquare || squareName === props.activeMove.toSquare);

const isCheckedSquare = (squareName: string): boolean =>
    props.canPlay && props.checkSquare !== null && squareName === props.checkSquare;

const isFoggedSquare = (squareName: string): boolean => {
    return (
        props.variant === ChessVariant.FogOfWar &&
        props.activePlayerColor !== null &&
        props.chessboard.getSquareByName(squareName)?.piece?.color !== props.activePlayerColor &&
        !isLegalSquare(squareName)
    );
};

const getAnimationCoordinates = (squareName: string): Coordinates | null => {
    return props.activeMove?.toSquare === squareName ? animationCoordinates.value : null;
};

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

onMounted(() => {
    if (boardRef.value) {
        resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const width = entry.contentRect.width;
                squareSize.value = width / props.chessboard.files.length;
            }
        });
        resizeObserver.observe(boardRef.value);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver && boardRef.value) {
        resizeObserver.unobserve(boardRef.value);
    }
});
</script>

<template>
    <div ref="boardRef" class="grid h-full w-full aspect-square" :style="gridStyle">
        <template v-for="(row, y) in rows" :key="row">
            <template v-for="(column, x) in columns" :key="column">
                <Square
                    :name="getSquareName(column, row)"
                    :piece="chessboard.getSquareByName(getSquareName(column, row))?.piece?.serialize() ?? null"
                    :isDark="isDarkSquare(x, y)"
                    :isLegal="isLegalSquareForSelectedPiece(getSquareName(column, row))"
                    :isActive="isActiveSquare(getSquareName(column, row))"
                    :isChecked="isCheckedSquare(getSquareName(column, row))"
                    :isFogged="isFoggedSquare(getSquareName(column, row))"
                    :animationCoordinates="getAnimationCoordinates(getSquareName(column, row))"
                    @click="handleSquareClick(getSquareName(column, row))"
                />
            </template>
        </template>
    </div>
</template>
