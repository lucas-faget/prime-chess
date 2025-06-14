<script setup lang="ts">
import type { GameCreationDialog } from "~/components/GameCreationDialog.vue";
import type { Opponent } from "~/types/Opponent";

const gameCreationDialog = ref<GameCreationDialog | null>(null);

const openGameCreationDialog = (opponent: Opponent): void => {
    gameCreationDialog.value?.open(opponent);
};

provide("openGameCreationDialog", openGameCreationDialog);
</script>

<template>
    <div class="md:ml-[var(--aside-w)]">
        <Aside class="max-md:hidden" />
        <Header class="md:hidden" />
        <div class="min-h-screen">
            <slot />
        </div>
        <!-- <Footer /> -->
    </div>

    <GameCreationDialog ref="gameCreationDialog" />
</template>
