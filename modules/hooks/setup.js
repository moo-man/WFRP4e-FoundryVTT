

export default function () {
    Hooks.on("setup", () => {
        // Localize strings in the  game.wfrp4e.config.object
        for (let obj in game.wfrp4e.config) {
            if (game.wfrp4e.config.toTranslate.includes[obj]) {
                for (let el in game.wfrp4e.config[obj]) {
                    if (typeof game.wfrp4e.config[obj][el] === "string") {
                        game.wfrp4e.config[obj][el] = game.i18n.localize(game.wfrp4e.config[obj][el])
                    }
                }
            }
        }
    })
}