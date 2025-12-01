<script setup lang="ts">
import Chessboard from "~/components/Chessboard.vue";
import MoveHistory from "~/components/MoveHistory.vue";

const route = useRoute();
const id = route.params.id;
const gameId: string | undefined = Array.isArray(id) ? id[0] : id;

const {
    rows,
    columns,
    squares,
    legalMoves,
    algebraicMoves,
    activeHalfmoveIndex,
    playerInFrontDirection,
    activeMove,
    checkedSquare,
    join,
    tryMove,
    spinChessboard,
    goToMove,
    goToFirstMove,
    goToPreviousMove,
    goToNextMove,
    goToLastMove,
    cancelLastMove,
} = await useOnlineChess();

onMounted(async () => {
    await join(gameId);
});
</script>

<template>
    <div class="flex w-full max-lg:flex-col lg:h-screen">
        <div class="flex items-center justify-center lg:h-screen lg:flex-1">
            <div class="aspect-square max-lg:w-full lg:h-full">
                <Chessboard
                    :rows="rows"
                    :columns="columns"
                    :legal-moves="legalMoves"
                    :squares="squares"
                    :player-in-front-direction="playerInFrontDirection"
                    :active-move="activeMove"
                    :checked-square="checkedSquare"
                    @try-move="tryMove"
                />
            </div>
        </div>
        <div class="flex w-full flex-col gap-4 overflow-y-auto p-4 lg:h-screen lg:w-120">
            <Panel header="Moves" class="order-2 lg:order-1 lg:flex-1">
                <div class="flex flex-col gap-4">
                    <div class="max-h-50 w-full overflow-y-auto">
                        <MoveHistory
                            v-if="algebraicMoves.length > 0"
                            :algebraic-moves="algebraicMoves"
                            :active-halfmove-index="activeHalfmoveIndex"
                            @go-to-move="goToMove"
                        />
                    </div>
                    <Button label="Cancel last move" variant="text" severity="danger" @click="cancelLastMove" />
                </div>
            </Panel>

            <Panel header="Settings" class="order-3 lg:order-2" toggleable collapsed>
                <Settings />
            </Panel>

            <Controls
                class="order-1 mt-auto lg:order-3"
                @spin-chessboard="spinChessboard"
                @go-to-first-move="goToFirstMove"
                @go-to-previous-move="goToPreviousMove"
                @go-to-next-move="goToNextMove"
                @go-to-last-move="goToLastMove"
            />
        </div>
    </div>
</template>
