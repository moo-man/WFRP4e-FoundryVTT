export default class TableSettings extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "table-settings";
        options.template = "systems/wfrp4e/templates/apps/table-settings.hbs";
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
                choices : this.getTableChoices(setting),
                selected : settings[setting]
            }
        }

        return data
    }

    getTableChoices(key)
    {
        let choices = {}
        let tables = game.tables.filter(i => i.getFlag("wfrp4e", "key") == key);


        // Add tables without a column 
        for(let t of tables.filter(i => !i.getFlag("wfrp4e", "column")))
        {
            choices[t.id] = t.name
        }

        let columns = tables.filter(i => i.getFlag("wfrp4e", "column"))
        if (columns.length)
        {
            choices[columns.map(i => i.id).join(",")] = columns[0].name.split("-")[0];
        }
        return choices
    }


    async _updateObject(event, formData) {
        return game.settings.set("wfrp4e", "tableSettings", formData)
    }

  

}