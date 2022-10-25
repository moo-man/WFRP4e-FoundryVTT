export default class TableSettings extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "table-settings";
        options.template = "systems/wfrp4e/templates/apps/table-settings.html";
        options.width = 600;
        options.minimizable = true;
        options.resizable = true;
        options.title = "Table Settings"
        return options;
    }

    getData() {
        let data = super.getData()
        let settings = game.settings.get("wfrp4e", "tableSettings")
        data.settings = {}

        for (let setting in settings)
        {
            data.settings[setting] = {
                label : "SETTINGS.TABLE_" + setting,
                choices : game.tables.filter(i => i.getFlag("wfrp4e", "key") == setting),
                selected : settings[setting]
            }
        }

        return data
    }


    async _updateObject(event, formData) {
        return game.settings.set("wfrp4e", "tableSettings", formData)
    }

  

}