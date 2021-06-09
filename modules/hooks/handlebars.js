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
  })
}
