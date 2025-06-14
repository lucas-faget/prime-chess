<script setup lang="ts"></script>

<template>
    <div class="flex gap-2">
        <Button
            outlined
            class="flex-1"
            icon="pi pi-step-backward"
            aria-label="First move"
            severity="secondary"
            v-tooltip.top="'First move'"
            type="text"
            placeholder="Top"
            @click="$emit('goToFirstMove')"
        />
        <Button
            outlined
            class="flex-1"
            icon="pi pi-caret-left"
            aria-label="Previous move"
            severity="secondary"
            v-tooltip.top="'Previous move'"
            type="text"
            placeholder="Top"
            @click="$emit('goToPreviousMove')"
        />
        <Button
            class="flex-1"
            icon="pi pi-sync"
            aria-label="Spin"
            severity="contrast"
            v-tooltip.top="'Spin chessboard'"
            type="text"
            placeholder="Top"
            @click="$emit('spinChessboard')"
        />
        <Button
            outlined
            class="flex-1"
            icon="pi pi-caret-right"
            aria-label="Next move"
            severity="secondary"
            v-tooltip.top="'Next move'"
            type="text"
            placeholder="Top"
            @click="$emit('goToNextMove')"
        />
        <Button
            outlined
            class="flex-1"
            icon="pi pi-step-forward"
            aria-label="Last move"
            severity="secondary"
            v-tooltip.top="'Last move'"
            type="text"
            placeholder="Top"
            @click="$emit('goToLastMove')"
        />
    </div>
</template>
