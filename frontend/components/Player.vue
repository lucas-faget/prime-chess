<script setup lang="ts">
import type { SerializedPlayer } from "@shared/chess/serialization/SerializedPlayer";

withDefaults(
    defineProps<{
        player: SerializedPlayer;
        vertical?: boolean;
    }>(),
    {
        vertical: false,
    }
);
</script>

<template>
    <div :class="['flex items-center', { 'flex-col': vertical }, vertical ? 'gap-1' : 'gap-2']">
        <Avatar icon="pi pi-user" :size="vertical ? 'xlarge' : 'large'" shape="circle" />
        <span>{{ player?.name ?? "" }}</span>
    </div>
</template>
