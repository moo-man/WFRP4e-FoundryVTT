

export default function () {
    Hooks.on("i18nInit", () => {
        // Localize strings in the  game.wfrp4e.config.object
        for (let obj of game.wfrp4e.config.toTranslate) {
                for (let el in game.wfrp4e.config[obj]) {
                    if (typeof game.wfrp4e.config[obj][el] === "string") {
                        game.wfrp4e.config[obj][el] = game.i18n.localize(game.wfrp4e.config[obj][el])
                    }
                }
        }

        // System items are created localized, so must be created here
        game.wfrp4e.config.PrepareSystemItems();
    })
}