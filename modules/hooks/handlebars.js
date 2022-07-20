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
            return game.wfrp4e.config[obj][key]
        })

        Handlebars.registerHelper("array", function (array, cls) {
            if (typeof cls == "string")
                return array.map(i => `<a class="${cls}">${i}</a>`).join(`<h1 class="${cls} comma">, </h1>`)
            else
                return array.join(", ")
        })

        Handlebars.registerHelper("tokenImg", function(actor) {
            return actor.token ? actor.token.texture.src : actor.protoTypeToken.texture.src
        })

        Handlebars.registerHelper("tokenName", function(actor) {
            return actor.token ? actor.token.name : actor.protoTypeToken.name;
        })
})
}
