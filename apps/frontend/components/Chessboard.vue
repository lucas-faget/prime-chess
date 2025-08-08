<script setup lang="ts">
import type { Position } from "@chess/coordinates/Position";
import type { Direction } from "@chess/coordinates/Direction";
import { ChessVariant } from "@chess/types/ChessVariant";
import type { SerializedPlayer } from "@chess/serialization/SerializedPlayer";
import type { SerializedMove } from "@chess/serialization/SerializedMove";
import type { SerializedLegalMoves } from "@chess/serialization/SerializedLegalMoves";
import type { Square } from "@chess/squares/Square";
import type { Chessboard } from "@chess/chessboards/Chessboard";
import { useSettings } from "~/composables/useSettings";
const { isPieceAnimationEnabled } = useSettings();
import { gsap } from "gsap";
import Draggable from "gsap/Draggable";
gsap.registerPlugin(Draggable);

const boardRef = ref(null);
const squareSize = ref<number>(0); // Size of a chessboard square in pixels
const fromSquareName = ref<string | null>(null);
let resizeObserver: ResizeObserver | null = null;

const props = withDefaults(
    defineProps<{
        variant: ChessVariant;
        playerInFrontIndex: number;
        playerInFrontDirection: Direction;
        chessboard: Chessboard;
        activePlayer: SerializedPlayer | null;
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
    if (props.activeMove && isPieceAnimationEnabled() && props.activePlayer) {
        let dx: number = props.activeMove.toPosition.x - props.activeMove.fromPosition.x;
        let dy: number = props.activeMove.toPosition.y - props.activeMove.fromPosition.y;

        return boardToScreenDirection(
            {
                dx: -squareSize.value * dx,
                dy: -squareSize.value * dy,
            },
            props.playerInFrontDirection
        );
    }

    return null;
});

const getSquareName = (column: string, row: string): string =>
    props.playerInFrontDirection.dy === 0 ? row + column : column + row;

const isDarkSquare = (x: number, y: number): boolean =>
    props.playerInFrontDirection.dy === 0 ? (x + y) % 2 === 0 : (x + y) % 2 !== 0;

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

const isLegalSquareForDraggedPiece = (squareName: string): boolean =>
    props.canPlay && fromSquareName.value !== null && isLegalMove(fromSquareName.value, squareName);

const isActiveSquare = (squareName: string): boolean =>
    props.activeMove !== null &&
    (squareName === props.activeMove.fromSquare || squareName === props.activeMove.toSquare);

const isCheckedSquare = (squareName: string): boolean =>
    props.canPlay && props.checkSquare !== null && squareName === props.checkSquare;

const isFoggedSquare = (squareName: string): boolean => {
    return (
        props.variant === ChessVariant.FogOfWar &&
        props.activePlayer?.color !== null &&
        props.chessboard.getSquareByName(squareName)?.piece?.color !== props.activePlayer?.color &&
        !isLegalSquare(squareName)
    );
};

const getAnimationCoordinates = (squareName: string): Direction | null => {
    return props.activeMove?.toSquare === squareName ? animationCoordinates.value : null;
};

function boardToScreenDirection(direction: Direction, boardUp: Direction) {
    const boardRight: Direction = { dx: boardUp.dy, dy: -boardUp.dx };

    // [screenX] = [boardRight.x  -boardUp.x ] * [ direction.x ]
    // [screenY]   [boardRight.y  -boardUp.y ]   [ direction.y ]
    return {
        dx: direction.dx * boardRight.dx - direction.dy * boardUp.dx,
        dy: direction.dx * boardRight.dy - direction.dy * boardUp.dy,
    };
}

function screenToBoardDirection(direction: Direction, boardUp: Direction): Direction {
    const boardRight: Direction = { dx: boardUp.dy, dy: -boardUp.dx };

    return {
        dx: direction.dx * boardRight.dx + direction.dy * boardRight.dy,
        dy: -(direction.dx * boardUp.dx + direction.dy * boardUp.dy),
    };
}

function handleSquareClick(squareName: string): void {
    if (props.canPlay) {
        if (fromSquareName.value) {
            if (isLegalMove(fromSquareName.value, squareName)) {
                emit("handleMove", fromSquareName.value, squareName);
            } else if (!hasLegalMove(squareName)) {
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

    nextTick(() => {
        Draggable.create(".piece", {
            type: "x,y",
            inertia: true,
            bounds: boardRef.value,
            onPress() {
                const squareName = this.target.dataset.square;
                if (
                    !props.canPlay ||
                    props.chessboard.getSquareByName(squareName)?.piece?.color !== props.activePlayer?.color
                ) {
                    this.endDrag();
                    return;
                }
                fromSquareName.value = squareName;
            },
            // onRelease() {
            //     fromSquareName.value = null;
            // },
            onDragEnd() {
                if (this.target.dataset.square && props.activePlayer) {
                    const fromSquare: Square | null = props.chessboard.getSquareByName(this.target.dataset.square);
                    if (fromSquare) {
                        const dx: number = Math.floor((this.x + squareSize.value / 2) / squareSize.value);
                        const dy: number = Math.floor((this.y + squareSize.value / 2) / squareSize.value);
                        const direction: Direction = screenToBoardDirection({ dx, dy }, props.playerInFrontDirection);
                        const toSquare = props.chessboard.getSquareByDirection(fromSquare, direction);
                        if (toSquare) {
                            if (isLegalMove(fromSquare.name, toSquare.name)) {
                                emit("handleMove", fromSquare.name, toSquare.name);
                                return;
                            }
                        }
                    }

                    gsap.to(this.target, { x: 0, y: 0 });
                }

                fromSquareName.value = null;
            },
        });
    });
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
                    :isLegal="isLegalSquareForDraggedPiece(getSquareName(column, row))"
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
