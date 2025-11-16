<template>
    <div class="flex gap-2">
        <Button
            class="flex-1"
            variant="outlined"
            icon="pi pi-step-backward"
            severity="secondary"
            aria-label="First move"
            v-tooltip.top="'First move'"
            placeholder="Top"
            @click="$emit('goToFirstMove')"
        />
        <Button
            class="flex-1"
            variant="outlined"
            icon="pi pi-caret-left"
            severity="secondary"
            aria-label="Previous move"
            v-tooltip.top="'Previous move'"
            placeholder="Top"
            @click="$emit('goToPreviousMove')"
        />
        <Button
            class="flex-1"
            icon="pi pi-sync"
            severity="contrast"
            aria-label="Spin"
            v-tooltip.top="'Spin chessboard'"
            placeholder="Top"
            @click="$emit('spinChessboard')"
        />
        <Button
            class="flex-1"
            variant="outlined"
            icon="pi pi-caret-right"
            severity="secondary"
            aria-label="Next move"
            v-tooltip.top="'Next move'"
            placeholder="Top"
            @click="$emit('goToNextMove')"
        />
        <Button
            class="flex-1"
            variant="outlined"
            icon="pi pi-step-forward"
            severity="secondary"
            aria-label="Last move"
            v-tooltip.top="'Last move'"
            placeholder="Top"
            @click="$emit('goToLastMove')"
        />
    </div>
</template>
