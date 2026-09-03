import WFRP5E from "../system/5e/config-wfrp5e";
import WFRP4E from "../system/config-wfrp4e";

export default class EditionManager extends WHFormApplication
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "edition-manager"],
        window: {
            title: "Edition Configuration",
            resizable : true,
        },
        position : {
            width: 400
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false,
            handler: this._onSubmit
        }
    }

    /** @override */
    static PARTS = {
        form: {
            template: "systems/wfrp4e/templates/apps/edition-manager.hbs",
            scrollable: [""],
            classes: ["standard-form"]
        }
    };

    static #schema = new foundry.data.fields.SchemaField({

    })

    static get schema()
    {
        return this.#schema
    }

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
        context.schema = this.constructor.schema
        return context
    }

    static async _onSubmit(event, form, formData) {
        return game.settings.set("wfrp4e", "editionSettings", formData.object)
    }


    static getConfig()
    {
        let e4 = WFRP4E;
        let e5 = WFRP5E;

        // Todo: add settings
        return foundry.utils.mergeObject(e4, e5);
    }
  

}