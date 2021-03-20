

export default class HomebrewSettings extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "homebrew-settings";
        options.template = "systems/wfrp4e/templates/apps/homebrew-settings.html";
        options.height = "auto";
        options.width = 600;
        options.minimizable = true;
        options.title = "Homebrew Settings"
        return options;
    }

    getData() {
        let data = super.getData()

        data.settings = Array.from(game.settings.settings).filter(s => s[1].homebrew).map(i => i[1])
        data.settings.forEach(s => s.inputType = s.type == Boolean ? "checkbox" : "text")
        data.settings.forEach(s => s.value = game.settings.get(s.module, s.key))
        return data
    }


    async _updateObject(event, formData) {
        for(let setting in formData)
            game.settings.set("wfrp4e", setting, formData[setting])
    }

  

}