<script setup lang="ts">
import type { SerializedPlayer } from "@chess/serialization/SerializedPlayer";
import { useChessStore } from "~/stores/chess";
import { useSettings } from "~/composables/useSettings";
const { isChessboard3D } = useSettings();

definePageMeta({
    middleware: "game-exists",
    layout: "aside",
});

const chessStore = useChessStore();

const bottomPlayer = computed<SerializedPlayer>(() => {
    return chessStore.players[chessStore.playerInFrontIndex];
});

const topPlayer = computed<SerializedPlayer>(() => {
    return chessStore.players[(chessStore.playerInFrontIndex + 1) % chessStore.players.length];
});

function handleMove(fromSquareName: string, toSquareName: string): void {
    chessStore.tryMove(fromSquareName, toSquareName);
}
</script>

<template>
    <div class="w-full flex max-lg:flex-col">
        <div class="w-full h-full flex justify-center">
            <div class="w-full max-w-[calc(100vh-2*var(--chessboard-head-h))] min-w-[20rem] flex flex-col p-2">
                <div class="h-[var(--chessboard-head-h)] flex items-start shrink-0">
                    <Player :player="topPlayer" />
                </div>
                <div class="aspect-square">
                    <template v-if="chessStore.variant && chessStore.chessboard">
                        <ChessboardThree
                            v-if="isChessboard3D()"
                            :chessboard="chessStore.chessboard"
                            :legalMoves="chessStore.legalMoves"
                            :lastMove="lastMove"
                            @handle-move="handleMove"
                        />
                        <Chessboard
                            v-else
                            :variant="chessStore.variant"
                            :playerInFrontIndex="chessStore.playerInFrontIndex"
                            :playerInFrontDirection="chessStore.playerInFrontDirection"
                            :chessboard="chessStore.chessboard"
                            :activePlayer="chessStore.getActivePlayer()"
                            :canPlay="chessStore.isActiveMoveTheLast"
                            :legalMoves="chessStore.legalMoves"
                            :activeMove="chessStore.getActiveMove()"
                            :checkSquare="chessStore.getCheckedSquare()"
                            @handle-move="handleMove"
                        />
                    </template>
                </div>
                <div class="h-[var(--chessboard-head-h)] flex items-end shrink-0">
                    <Player :player="bottomPlayer" />
                </div>
            </div>
        </div>

        <div
            class="w-96 max-lg:w-full lg:h-screen lg:min-h-[calc(20rem+2*var(--chessboard-head-h))] shrink-0 p-2 flex lg:flex-col flex-col-reverse gap-2"
        >
            <Panel class="flex-1 overflow-hidden">
                <template #header>
                    <Tabs value="0" class="w-full">
                        <TabList>
                            <Tab value="0">Moves</Tab>
                            <Tab value="1">Game</Tab>
                            <Tab value="2">Settings</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel value="0">
                                <div class="flex flex-col gap-4">
                                    <MoveHistory
                                        class="flex-1"
                                        :playerCount="chessStore.players.length"
                                        :halfmoves="chessStore.algebraicMoves"
                                        :activeHalfmoveIndex="chessStore.activeHalfmoveIndex"
                                        @goToMove="chessStore.goToMove($event)"
                                    />
                                    <Button
                                        type="button"
                                        label="Cancel last move"
                                        severity="danger"
                                        @click="chessStore.cancelLastMove"
                                    ></Button>
                                </div>
                            </TabPanel>
                            <TabPanel value="1">
                                <GameData
                                    :players="chessStore.players"
                                    :gameOver="chessStore.gameOver"
                                    :winnerPlayerIndex="chessStore.winnerPlayerIndex"
                                />
                            </TabPanel>
                            <TabPanel value="2">
                                <Settings />
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </template>
            </Panel>

            <Controls
                @goToFirst-Move="chessStore.goToFirstMove"
                @goToPrevious-move="chessStore.goToPreviousMove"
                @spinChessboard="chessStore.spinChessboard"
                @goToNextMove="chessStore.goToNextMove"
                @goToLastMove="chessStore.goToLastMove"
            />
        </div>
    </div>

    <GameOverDialog
        :gameOver="chessStore.gameOver"
        :players="chessStore.players"
        :winnerPlayerIndex="chessStore.winnerPlayerIndex"
        :checkmatePiece="chessStore.checkmatePiece"
    />
</template>
