import type { SquareColors } from "~/types/SquareColor";
import type { UserSettings } from "~/types/UserSettings";

// prettier-ignore
const colorClassNames: SquareColors[] = [
    { name: "slate"  , light: "bg-slate-100"  , dark: "bg-slate-400"  , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "gray"   , light: "bg-gray-100"   , dark: "bg-gray-400"   , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "zinc"   , light: "bg-zinc-100"   , dark: "bg-zinc-400"   , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "stone"  , light: "bg-stone-100"  , dark: "bg-stone-400"  , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "red"    , light: "bg-red-100"    , dark: "bg-red-400"    , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-orange-300", darkChecked: "bg-orange-500" },
    { name: "orange" , light: "bg-orange-100" , dark: "bg-orange-400" , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "amber"  , light: "bg-amber-100"  , dark: "bg-amber-400"  , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "yellow" , light: "bg-yellow-100" , dark: "bg-yellow-400" , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "lime"   , light: "bg-lime-100"   , dark: "bg-lime-400"   , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-blue-300"   , darkActive: "bg-blue-500"   , lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "green"  , light: "bg-green-100"  , dark: "bg-green-400"  , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-blue-300"   , darkActive: "bg-blue-500"   , lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "emerald", light: "bg-emerald-100", dark: "bg-emerald-400", lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-blue-300"   , darkActive: "bg-blue-500"   , lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "teal"   , light: "bg-teal-100"   , dark: "bg-teal-400"   , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-blue-300"   , darkActive: "bg-blue-500"   , lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "cyan"   , light: "bg-cyan-100"   , dark: "bg-cyan-400"   , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "sky"    , light: "bg-sky-100"    , dark: "bg-sky-400"    , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "blue"   , light: "bg-blue-100"   , dark: "bg-blue-400"   , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "indigo" , light: "bg-indigo-100" , dark: "bg-indigo-400" , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "violet" , light: "bg-violet-100" , dark: "bg-violet-400" , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "purple" , light: "bg-purple-100" , dark: "bg-purple-400" , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "fuchsia", light: "bg-fuchsia-100", dark: "bg-fuchsia-400", lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "pink"   , light: "bg-pink-100"   , dark: "bg-pink-400"   , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-red-300"   , darkChecked: "bg-red-500"    },
    { name: "rose"   , light: "bg-rose-100"   , dark: "bg-rose-400"   , lightLegal: "bg-neutral-500", darkLegal: "bg-neutral-600", lightActive: "bg-emerald-300", darkActive: "bg-emerald-500", lightChecked: "bg-orange-300", darkChecked: "bg-orange-500" },
];

const defaultSettings: UserSettings = {
    darkMode: true,
    chessboardColor: colorClassNames.find((color) => color.name === "blue") ?? colorClassNames[0]!,
    chessboardSpin: false,
    pieceAnimation: true,
};

export function useSettings() {
    const userSettings = useState<UserSettings>("userSettings", () => ({
        ...defaultSettings,
    }));

    const isDarkMode = () => {
        return userSettings.value.darkMode;
    };

    const toggleDarkMode = () => {
        userSettings.value.darkMode = !userSettings.value.darkMode;
    };

    const getColors = () => {
        return colorClassNames;
    };

    const getChessboardColor = () => {
        return userSettings.value.chessboardColor;
    };

    const setChessboardColor = (colors: SquareColors) => {
        userSettings.value.chessboardColor = colors;
    };

    const isChessboardSpinAutomatic = () => {
        return userSettings.value.chessboardSpin;
    };

    const toggleChessboardSpin = () => {
        userSettings.value.chessboardSpin = !userSettings.value.chessboardSpin;
    };

    const isPieceAnimationEnabled = () => {
        return userSettings.value.pieceAnimation;
    };

    const togglePieceAnimation = () => {
        userSettings.value.pieceAnimation = !userSettings.value.pieceAnimation;
    };

    const resetSettings = () => {
        userSettings.value = { ...defaultSettings };
    };

    return {
        userSettings,
        isDarkMode,
        toggleDarkMode,
        getColors,
        getChessboardColor,
        setChessboardColor,
        isChessboardSpinAutomatic,
        toggleChessboardSpin,
        isPieceAnimationEnabled,
        togglePieceAnimation,
        resetSettings,
    };
}
