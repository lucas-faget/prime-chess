<script setup lang="ts">
import { useSettings } from "~/composables/useSettings";
const { isDarkMode, toggleDarkMode } = useSettings();

const applyMode = () => {
    if (isDarkMode()) {
        document.documentElement.classList.add("p-dark");
    } else {
        document.documentElement.classList.remove("p-dark");
    }
};

const handleClick = () => {
    toggleDarkMode();
    applyMode();
};

onBeforeMount(() => {
    applyMode();
});
</script>

<template>
    <Button
        outlined
        :icon="isDarkMode() ? 'pi pi-moon' : 'pi pi-sun'"
        aria-label="Toggle dark mode"
        severity="contrast"
        @click="handleClick"
    />
</template>
