<script setup lang="ts">
import type { Direction, LegalMoves, Move, Piece, Squares } from "@primechess/chess-lib";
import Square from "~/components/Square.vue";

const props = withDefaults(
    defineProps<{
        rows: string[];
        columns: string[];
        squares: Squares;
        legalMoves: LegalMoves;
        playerInFrontDirection: Direction;
        activeMove?: Move | null;
    }>(),
    {
        activeMove: null,
    },
);

const emit = defineEmits<{
    (e: "tryMove", from: string, to: string): void;
}>();

const fromSquare = ref<string | null>(null);

const gridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${props.columns.length}, ${100 / props.columns.length}%)`,
    gridTemplateRows: `repeat(${props.rows.length}, ${100 / props.rows.length}%)`,
}));

const getSquareName = (column: string, row: string): string =>
    props.playerInFrontDirection.dy === 0 ? row + column : column + row;

const isDarkSquare = (x: number, y: number): boolean =>
    props.playerInFrontDirection.dy === 0 ? (x + y) % 2 === 0 : (x + y) % 2 !== 0;

const isLegalSquare = (square: string): boolean => {
    if (!fromSquare.value) return false;
    return !!props.legalMoves[fromSquare.value]?.[square];
};

const isActiveSquare = (square: string): boolean => {
    if (!props.activeMove) return false;
    return square === props.activeMove.fromSquare || square === props.activeMove.toSquare;
};

const onSquareClick = (square: string) => {
    if (!fromSquare.value) {
        const piece: Piece | null = props.squares[square] ?? null;
        if (!piece) return;
        fromSquare.value = square;
        return;
    }

    if (fromSquare.value === square) {
        fromSquare.value = null;
        return;
    }

    if (isLegalSquare(square)) {
        emit("tryMove", fromSquare.value, square);
        fromSquare.value = null;
    } else {
        const piece: Piece | null = props.squares[square] ?? null;
        fromSquare.value = piece ? square : null;
    }
};
</script>

<template>
    <div class="relative grid aspect-square h-full w-full" :style="gridStyle">
        <template v-for="(row, y) in rows" :key="row">
            <template v-for="(column, x) in columns" :key="column">
                <Square
                    :name="getSquareName(column, row)"
                    :piece="squares[getSquareName(column, row)] ?? null"
                    :isDark="isDarkSquare(x, y)"
                    :isLegal="isLegalSquare(getSquareName(column, row))"
                    :isActive="isActiveSquare(getSquareName(column, row))"
                    @click="onSquareClick(getSquareName(column, row))"
                />
            </template>
        </template>
    </div>
</template>
