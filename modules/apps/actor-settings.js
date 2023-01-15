

export default class ActorSettings extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "actor-settings";
        options.template = "systems/wfrp4e/templates/apps/actor-settings.hbs";
        options.height = "auto";
        options.width = 400;
        options.minimizable = true;
        options.title = "Actor Settings"
        return options;
    }

    getData() {
        let data = super.getData()
        data.tables =  game.wfrp4e.config.hitLocationTables

        data.displays = {}

        if (this.object.type == "character")
        {
            data.displays.size = true;
            data.displays.movement = true;
            data.displays.wounds = true;
            data.displays.critwounds = true;
            data.displays.corruption = true;
            data.displays.encumbrance = true;
            data.displays.hitloc = true;
            data.displays.equipPoints = true;
        }
        if (this.object.type == "npc")
        {
            data.displays.size = true;
            data.displays.movement = true;
            data.displays.wounds = true;
            data.displays.critwounds = true;
            data.displays.encumbrance = true;
            data.displays.hitloc = true;
            data.displays.equipPoints = true;
        }
        if (this.object.type == "creature")
        {
            data.displays.size = true;
            data.displays.movement = true;
            data.displays.wounds = true;
            data.displays.critwounds = true;
            data.displays.encumbrance = true;
            data.displays.hitloc = true;
            data.displays.equipPoints = true;
        }
        if (this.object.type == "vehicle")
        {
            data.displays.vehicle = true;
            data.displays.critwounds = true;
            data.displays.hitloc = true;
        }

        return data
    }


    async _updateObject(event, formData) {
        this.object.update(formData)
    }

  

}