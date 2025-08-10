<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Direction } from "@chess/coordinates/Direction";
import gsap from "gsap";

const props = withDefaults(
    defineProps<{
        color: string;
        name: string;
        squareName: string;
        animationCoordinates?: Direction | null;
    }>(),
    {
        animationCoordinates: null,
    }
);

const pieceRef = ref<HTMLElement | null>(null);

const emit = defineEmits<{
    pieceMounted: [target: HTMLElement | null];
    pieceUnmounted: [target: HTMLElement | null];
}>();

const performAnimation = () => {
    if (pieceRef.value && props.animationCoordinates) {
        const el = pieceRef.value;

        gsap.set(el, {
            x: -props.animationCoordinates.dx,
            y: -props.animationCoordinates.dy,
        });

        gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
        });
    }
};

onMounted(() => {
    performAnimation();
    emit("pieceMounted", pieceRef.value);
});

onUnmounted(() => {
    performAnimation();
    emit("pieceUnmounted", pieceRef.value);
});
</script>

<template>
    <img
        ref="pieceRef"
        class="piece relative h-full w-full aspect-square piece"
        :data-square="squareName"
        :src="getPieceImage(color, name)"
        :alt="name"
    />
</template>
