import WFRP4E from "../system/config-wfrp4e.js"

export default function () {
    Hooks.on("setup", () => {
        // Localize strings in the WFRP4E object
        for (let obj in WFRP4E) {
            for (let el in WFRP4E[obj]) {
                if (typeof WFRP4E[obj][el] === "string") {
                    WFRP4E[obj][el] = game.i18n.localize(WFRP4E[obj][el])
                }
            }
        }
    })
}