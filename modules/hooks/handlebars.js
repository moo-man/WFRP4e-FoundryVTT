export default function () {

    Hooks.on("init", () => {
        Handlebars.registerHelper("ifIsGM", function (options) {
            return game.user.isGM ? options.fn(this) : options.inverse(this)
        })

        Handlebars.registerHelper("isGM", function (options) {
            return game.user.isGM
        })

        Handlebars.registerHelper("config", function (key) {
            return game.wfrp4e.config[key]
        })

        Handlebars.registerHelper("configLookup", function (obj, key) {
            if (obj && key)
                return game.wfrp4e.config[obj]?.[key]
            
        })

        Handlebars.registerHelper("array", function (array, cls) {
            if (typeof cls == "string")
                return array.map(i => `<a class="${cls}">${i}</a>`).join(`<h1 class="${cls} comma">, </h1>`)
            else
                return array.join(", ")
        })

        Handlebars.registerHelper("tokenImg", function(actor) {
            let token = game.canvas.tokens.getDocuments().filter(x=>x.actorId == actor.id)[0] ?? actor.prototypeToken;
            return token?.hidden ? "systems/wfrp4e/tokens/unknown.png" : token.texture.src;
        })

        Handlebars.registerHelper("tokenName", function(actor) {
            let token = game.canvas.tokens.getDocuments().filter(x=>x.actorId == actor.id)[0] ?? actor.prototypeToken;
            return token?.hidden ? "???" : token.name;
        })

        Handlebars.registerHelper("settings", function (key) {
            return game.settings.get("wfrp4e", key);
        })
})
}
