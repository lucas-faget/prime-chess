<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Coordinates } from "@chess/coordinates/Position";
import gsap from "gsap";

const props = withDefaults(
    defineProps<{
        color: string;
        name: string;
        animationCoordinates?: Coordinates | null;
    }>(),
    {
        animationCoordinates: null,
    }
);

const pieceRef = ref<HTMLImageElement | null>(null);

onMounted(() => {
    if (pieceRef.value && props.animationCoordinates) {
        const el = pieceRef.value;

        gsap.set(el, {
            x: props.animationCoordinates.x,
            y: props.animationCoordinates.y,
        });

        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
        });
    }
});
</script>

<template>
    <img ref="pieceRef" class="h-full w-full aspect-square piece" :src="getPieceImage(color, name)" :alt="name" />
</template>
