export default function () {
    const isSmallScreen = ref<boolean>(false);

    let mediaQueryList: MediaQueryList;

    const updateMediaQuery = (event: MediaQueryListEvent) => {
        isSmallScreen.value = event.matches;
    };

    onMounted(() => {
        mediaQueryList = window.matchMedia("(max-width: 640px)");
        isSmallScreen.value = mediaQueryList.matches;
        mediaQueryList.addEventListener("change", updateMediaQuery);
    });

    onUnmounted(() => {
        mediaQueryList.removeEventListener("change", updateMediaQuery);
    });

    return { isSmallScreen };
}
