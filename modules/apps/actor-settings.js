

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
        data.tables =  game.wfrp4e.config.hitLocationTables

        data.displays = {
            general : true
        }

        if (this.object.data.type == "vehicle")
        {
            data.displays.vehicle = true;
            data.displays.general = false;
        }

        return data
    }


    async _updateObject(event, formData) {
        this.object.update(formData)
    }

  

}