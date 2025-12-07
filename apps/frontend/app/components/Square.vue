<script setup lang="ts">
import type { Piece } from "@primechess/chess-lib";
import type { SquareColors } from "~/types/SquareColor";
import { gsap } from "gsap";
import Draggable from "gsap/Draggable";
gsap.registerPlugin(Draggable);
const { getChessboardColor } = useSettings();

const props = withDefaults(
    defineProps<{
        name: string;
        piece: Piece | null;
        isDark: boolean;
        isLegal?: boolean;
        isActive?: boolean;
        isChecked?: boolean;
    }>(),
    {
        isLegal: false,
        isActive: false,
        isChecked: false,
    },
);

const emit = defineEmits<{
    (e: "dragStart", from: string): void;
    (e: "dragEnd", from: string, to: string | null): void;
}>();

let draggable: Draggable | undefined = undefined;
let boardEl: HTMLElement | null = null;
const pieceEl = ref<HTMLElement | null>(null);

const colorClass = computed(() => {
    const colors: SquareColors = getChessboardColor();

    if (props.isDark) {
        if (props.isLegal) return colors.darkLegal;
        if (props.isActive) return colors.darkActive;
        if (props.isChecked) return colors.darkChecked;
        return colors.dark;
    } else {
        if (props.isLegal) return colors.lightLegal;
        if (props.isActive) return colors.lightActive;
        if (props.isChecked) return colors.lightChecked;
        return colors.light;
    }
});

onMounted(() => {
    boardEl = document.getElementById("chessboard");
});

watch(
    () => props.piece,
    async (newPiece, oldPiece) => {
        if (oldPiece?.name === newPiece?.name && oldPiece?.color === newPiece?.color) {
            return;
        }

        await nextTick();

        draggable?.kill();

        if (newPiece && pieceEl.value) {
            draggable = Draggable.create(pieceEl.value, {
                type: "x,y",
                bounds: boardEl,
                onDragStart() {
                    emit("dragStart", props.name);
                },
                onDragEnd() {
                    const elements = document.elementsFromPoint(this.pointerX, this.pointerY);
                    const square = elements.find((el) => el.hasAttribute("data-square")) as HTMLElement | undefined;
                    const to: string | null = square?.dataset?.square ?? null;

                    emit("dragEnd", props.name, to);

                    gsap.to(pieceEl.value, {
                        x: 0,
                        y: 0,
                        duration: 0.2,
                    });
                },
            })[0];
        }
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    draggable?.kill();
});
</script>

<template>
    <div :data-square="name" :class="colorClass">
        <img
            v-if="piece"
            ref="pieceEl"
            class="relative aspect-square h-full w-full"
            :src="getPieceImage(piece.color, piece.name)"
            :alt="piece.name"
        />
    </div>
</template>
