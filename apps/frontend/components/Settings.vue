<script setup lang="ts">
import { useSettings } from "~/composables/useSettings";
const {
    getColors,
    getChessboardColor,
    setChessboardColor,
    isChessboardSpinAutomatic,
    toggleChessboardSpin,
    isChessboard3D,
    toggleChessboard3D,
} = useSettings();

withDefaults(
    defineProps<{
        global?: boolean;
    }>(),
    {
        global: false,
    }
);

const selectedColor = computed({
    get() {
        return getChessboardColor();
    },
    set(color) {
        setChessboardColor(color);
    },
});

const chessboardSpin = computed({
    get() {
        return isChessboardSpinAutomatic();
    },
    set() {
        toggleChessboardSpin();
    },
});

const chessboard3D = computed({
    get() {
        return isChessboard3D();
    },
    set() {
        toggleChessboard3D();
    },
});
</script>

<template>
    <div class="flex flex-col gap-4">
        <div class="flex gap-2 items-center flex-wrap" v-if="global">
            <span class="text-muted-color">Dark mode toggle :</span>
            <DarkModeToggle />
        </div>

        <div class="flex gap-2 items-center flex-wrap">
            <span class="text-muted-color">Chessboard color :</span>
            <Select
                v-model="selectedColor"
                :options="getColors()"
                optionLabel="name"
                placeholder="Select a color"
                class="w-full md:w-56"
            >
                <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex items-center gap-2">
                        <div :class="[slotProps.value.dark, 'w-5 h-5 rounded-md']"></div>
                        <div class="capitalize">{{ slotProps.value.name }}</div>
                    </div>
                    <span v-else>
                        {{ slotProps.placeholder }}
                    </span>
                </template>
                <template #option="slotProps">
                    <div class="flex items-center gap-2">
                        <div :class="[slotProps.option.dark, 'w-5 h-5 rounded-md']"></div>
                        <div class="capitalize">{{ slotProps.option.name }}</div>
                    </div>
                </template>
            </Select>
        </div>

        <div class="flex gap-2 items-center flex-wrap">
            <span class="text-muted-color">Automatic chessboard spin :</span>
            <ToggleSwitch v-model="chessboardSpin" />
        </div>

        <div class="flex gap-2 items-center flex-wrap">
            <span class="text-muted-color">3D chessboard :</span>
            <ToggleSwitch v-model="chessboard3D" />
        </div>
    </div>
</template>
