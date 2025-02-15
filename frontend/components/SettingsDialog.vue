<script setup lang="ts">
const visible = ref<boolean>(false);
</script>

<template>
    <Button outlined icon="pi pi-cog" aria-label="Open settings dialog" severity="contrast" @click="visible = true" />

    <Dialog v-model:visible="visible" modal header="Settings">
        <Settings global />
    </Dialog>
</template>
