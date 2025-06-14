<script setup lang="ts">
import { ChessVariant } from "@chess/types/ChessVariant.ts";
import { Opponent } from "~/types/Opponent";
import { useConfirm } from "primevue/useconfirm";
import { useChessStore } from "~/stores/chess";
import ConfirmDialog from "primevue/confirmdialog";

const { isSmallScreen } = useMediaQuery();

const chessStore = useChessStore();
const confirm = useConfirm();

const visible = ref<boolean>(false);
const loading = ref<boolean>(false);

const opponents = [
    { name: "Anybody", icon: "pi-users", type: Opponent.Anybody },
    { name: "Friend", icon: "pi-face-smile", type: Opponent.Friend },
    { name: "Computer", icon: "pi-microchip-ai", type: Opponent.Computer },
];

const variants = [
    { name: "Standard", type: ChessVariant.Standard },
    { name: "Fischer random", type: ChessVariant.FischerRandom },
    { name: "Fog of War", type: ChessVariant.FogOfWar },
    { name: "Four Player chess", type: ChessVariant.FourPlayer },
];

const speeds = [{ name: "10+0" }, { name: "5+0" }, { name: "3+0" }, { name: "1+0" }];

const selectedOpponent = ref(opponents[0]);
const selectedVariant = ref(variants[0]);
const selectedSpeed = ref(speeds[0]);

const openConfirmDialog = (): void => {
    confirm.require({
        message:
            "It seems that a game already exists. If you start a new game, the current game will be removed. Are you sure you want to continue ?",
        header: "Game already exists",
        icon: "pi pi-exclamation-circle",
        rejectProps: {
            label: "Return to game",
            severity: "secondary",
            outlined: true,
        },
        acceptProps: {
            label: "Create new game",
            severity: "contrast",
        },
        reject: () => {
            navigateTo("/play");
        },
        accept: () => {
            visible.value = true;
        },
    });
};

const open = (opponent: Opponent | null = null): void => {
    if (chessStore.gameExists()) {
        openConfirmDialog();
    } else {
        if (opponent) {
            let newOpponent = opponents.find((item) => item.type === opponent);
            if (newOpponent) selectedOpponent.value = newOpponent;
        }
        visible.value = true;
    }
};

const close = (): void => {
    visible.value = false;
};

const createChessGame = async (): void => {
    try {
        loading.value = true;
        await chessStore.createChessGame(selectedVariant.value.type);
    } catch (error) {
        console.error("An error occurred while creating the chess game: ", error);
        alert("Failed to create your chess game. Please try again.");
    } finally {
        loading.value = false;
        close();
        navigateTo("/play");
    }
};

export interface GameCreationDialog {
    open: (opponent: Opponent | null) => void;
    close: () => void;
}

defineExpose({
    open,
    close,
});
</script>

<template>
    <ConfirmDialog :style="{ maxWidth: '32rem' }"></ConfirmDialog>
    <Dialog
        v-model:visible="visible"
        modal
        header="Create a game"
        :style="{ width: 'min(100vw,46rem)' }"
        class="app-font"
    >
        <div class="flex max-sm:flex-col mb-8 gap-4">
            <div class="flex flex-col gap-4">
                <span class="text-surface-500 dark:text-surface-400"> Select your opponent. </span>

                <Listbox v-model="selectedOpponent" :options="opponents" optionLabel="name" class="w-48 max-sm:w-full">
                    <template #option="slotProps">
                        <div class="flex items-center gap-2">
                            <i :class="`pi ${slotProps.option.icon}`"></i>
                            <span>{{ slotProps.option.name }}</span>
                        </div>
                    </template>
                </Listbox>
            </div>

            <Divider :layout="`${isSmallScreen ? 'horizontal' : 'vertical'}`" />

            <div class="flex-1 flex flex-col gap-4">
                <img src="/images/game_creation.png" alt="Image" class="w-full mb-4" />

                <div class="flex justify-between items-center gap-4">
                    <span class="text-surface-500 dark:text-surface-400"> Variant </span>

                    <Select
                        v-model="selectedVariant"
                        :options="variants"
                        optionLabel="name"
                        placeholder="Select a Variant"
                        class="w-40"
                    />
                </div>

                <div class="flex justify-between items-center gap-4">
                    <span class="text-surface-500 dark:text-surface-400"> Speed </span>

                    <Select
                        v-model="selectedSpeed"
                        :options="speeds"
                        optionLabel="name"
                        placeholder="Select a Variant"
                        class="w-40"
                    />
                </div>
            </div>
        </div>

        <Divider />

        <div class="flex justify-end gap-2">
            <Button
                type="button"
                label="Cancel"
                severity="secondary"
                icon="pi pi-angle-left"
                iconPos="left"
                @click="close"
            ></Button>
            <Button
                type="button"
                label="Create"
                severity="contrast"
                :icon="loading ? 'pi pi-spinner pi-spin' : 'pi pi-angle-right'"
                iconPos="right"
                @click="createChessGame"
            ></Button>
        </div>
    </Dialog>
</template>
