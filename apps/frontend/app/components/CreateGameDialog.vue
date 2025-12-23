<script setup lang="ts">
import { ChessVariant } from "@primechess/types";
import { ApiService } from "~/services/ApiService";
const store = useChessStore();

const visible = ref<boolean>(true);
const loading = ref<boolean>(false);

const opponents = [
    { name: "Local", icon: "pi-desktop", type: 0 },
    { name: "Anybody", icon: "pi-users", type: 1 },
    { name: "Friend", icon: "pi-face-smile", type: 2 },
    { name: "Computer", icon: "pi-microchip-ai", type: 3 },
];

const variants = [
    { name: "Standard", type: ChessVariant.Standard },
    { name: "Fischer random", type: ChessVariant.FischerRandom },
];

const speeds = [{ name: "10+0" }, { name: "5+0" }, { name: "3+0" }, { name: "1+0" }];

const opponent = ref(opponents[0]);
const variant = ref(variants[0]);
const speed = ref(speeds[0]);

const createGame = async (): Promise<void> => {
    loading.value = true;
    const v: ChessVariant = variant.value?.type ?? ChessVariant.Standard;

    try {
        if (opponent.value?.type === 0) {
            // Local
            store.storeGame("local", { variant: v });
            await navigateTo("/local");
        } else {
            // Online
            const data = await ApiService.createGame(v);
            store.storeGame("online", { id: data.gameId, state: data.state });
            await navigateTo(`online/${data.gameId}`);
        }
    } catch (error) {
        console.error("Failed to create game.", error);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <Dialog v-model:visible="visible" modal header="Create a game" class="w-160 max-w-screen">
        <div class="mb-8 flex gap-4 max-sm:flex-col">
            <div class="flex flex-col gap-4">
                <span class="text-surface-500 dark:text-surface-400">Select your opponent.</span>

                <Listbox v-model="opponent" :options="opponents" optionLabel="name" class="w-48 max-sm:w-full">
                    <template #option="slotProps">
                        <div class="flex items-center gap-2">
                            <i :class="`pi ${slotProps.option.icon}`"></i>
                            <span>{{ slotProps.option.name }}</span>
                        </div>
                    </template>
                </Listbox>
            </div>

            <Divider layout="vertical" class="hidden! sm:flex!" />
            <Divider layout="horizontal" class="flex! sm:hidden!" />

            <div class="flex flex-1 flex-col gap-4">
                <div class="flex items-center justify-between gap-4">
                    <span class="text-surface-500 dark:text-surface-400">Variant</span>

                    <Select
                        v-model="variant"
                        :options="variants"
                        optionLabel="name"
                        placeholder="Select a Variant"
                        class="w-40"
                    />
                </div>

                <div class="flex items-center justify-between gap-4">
                    <span class="text-surface-500 dark:text-surface-400">Speed</span>

                    <Select
                        v-model="speed"
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
                @click="visible = false"
            ></Button>
            <Button
                type="button"
                label="Create"
                severity="contrast"
                :icon="loading ? 'pi pi-spinner pi-spin' : 'pi pi-angle-right'"
                iconPos="right"
                @click="createGame"
            ></Button>
        </div>
    </Dialog>
</template>
