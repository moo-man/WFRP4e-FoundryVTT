export default class TableSettings extends HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "table-settings"],
        window: {
            title: "Table Settings Configuration",
            resizable : true,
        },
        position : {
            width: 400
        },
        form: {
            submitOnChange: true,
            handler: this._onSubmit
        }
    }

    /** @override */
    static PARTS = {
        form: {
            template: "systems/wfrp4e/templates/apps/table-settings.hbs",
            scrollable: [""]
        }
    };

    static #schema = new foundry.data.fields.SchemaField({
        species : new foundry.data.fields.StringField({initial : "FM6ASUoNX21MHuWa", label : "SETTINGS.TABLE_species"}),
        minormis : new foundry.data.fields.StringField({initial : "iPVwX0ul6lHVbKSX", label : "SETTINGS.TABLE_minormis"}),
        majormis : new foundry.data.fields.StringField({initial : "we8Vo5GC3ZsDI7aA", label : "SETTINGS.TABLE_majormis"}),
        mutatephys : new foundry.data.fields.StringField({initial : "YQ5XdjikeSiwo8fn", label : "SETTINGS.TABLE_mutatephys"}),
        mutatemental : new foundry.data.fields.StringField({initial : "5HKnpyOk4XDPdZ7V", label : "SETTINGS.TABLE_mutatemental"}),
        oops : new foundry.data.fields.StringField({initial : "MWkeER1iuwAJASNo", label : "SETTINGS.TABLE_oops"}),
        wrath : new foundry.data.fields.StringField({initial : "CcKYnmbQyRzGkrFy", label : "SETTINGS.TABLE_wrath"}),
        doom : new foundry.data.fields.StringField({initial : "led1vSPKcqMpS6jp", label : "SETTINGS.TABLE_doom"}),
        critarm : new foundry.data.fields.StringField({initial : "JYX8E8WgNb2em8g3", label : "SETTINGS.TABLE_critarm"}),
        critleg : new foundry.data.fields.StringField({initial : "j2joGAVBNJgS1G1g", label : "SETTINGS.TABLE_critleg"}),
        crithead : new foundry.data.fields.StringField({initial : "7KReueNRjaI6dVLk", label : "SETTINGS.TABLE_crithead"}),
        critbody : new foundry.data.fields.StringField({initial : "CUIX4e2hiHdSoJ64", label : "SETTINGS.TABLE_critbody"}),
    })

    static get schema()
    {
        Hooks.call("wfrp4e.tableSettingsSchema", this.#schema)
        return this.#schema
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        let settings = game.settings.get("wfrp4e", "tableSettings")
        context.settings = {}

        for (let setting in settings)
        {
            context.settings[setting] = {
                field : this.constructor.schema.fields[setting],
                value : settings[setting],
                choices : this.getTableChoices(setting)
            }
        }

        return context
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


    static async _onSubmit(event, form, formData) {
        return game.settings.set("wfrp4e", "tableSettings", formData.object)
    }

  

}