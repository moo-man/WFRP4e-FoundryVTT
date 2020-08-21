import WFRP4E from "../system/config-wfrp4e.js"

export default class ActorSettings extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "actor-settings";
        options.template = "systems/wfrp4e/templates/apps/actor-settings.html";
        options.height = "auto";
        options.width = 400;
        options.minimizable = true;
        options.title = "Actor Settings"
        return options;
    }

    getData() {
        let data = super.getData()
        data.tables = WFRP4E.hitLocationTables
        return data
    }


    async _updateObject(event, formData) {
        this.object.update(formData)
    }

  

}