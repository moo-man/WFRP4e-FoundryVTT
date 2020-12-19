

export default class WFRPActiveEffectConfig extends ActiveEffectConfig {

    getData() {
        let data = super.getData()
        data.effectTriggers = game.wfrp4e.config.effectTriggers;
        let type = getProperty(data, "effect.flags.wfrp4e.effectTrigger")
        if (type && type != "dialogChoice")
        {
            data.showEditor = true;
            data.placeholder = game.wfrp4e.config.effectPlaceholder[type]
        }

        data.effectApplication = duplicate(game.wfrp4e.config.effectApplication)
        if (this.object.parent.entity == "Item")
        {
            if (this.object.parent.type == "weapon" || this.object.parent.type == "armour" || this.object.parent.type=="trapping" || this.object.parent.type=="ammo")
            {
                if (this.object.parent.type=="trapping" && this.object.parent.data.data.trappingType.value != "clothingAccessories")
                    delete data.effectApplication.equipped
            }
            if (this.object.parent.type == "spell" || this.object.parent.type == "prayer")
            {
                delete data.effectApplication.equipped
                delete data.effectApplication.actor
            }
            if (this.object.parent.type == "talent" || this.object.parent.type == "trait" || this.object.parent.type == "psychology" || this.object.parent.type == "disease" || this.object.parent.type == "injury" || this.object.parent.type == "critical")
                delete data.effectApplication.equipped
        }
        else 
        {
            delete data.effectApplication.equipped
        }

        return data
    }

    get template() {
        return "systems/wfrp4e/templates/apps/active-effect-config.html"
    }

    async _updateObject(event, formData) {
        await super._updateObject(event, formData)
    }


    activateListeners(html){
        super.activateListeners(html);

        html.find(".effect-type").change(async ev => {
            // let fd = new FormDataExtended(ev.currentTarget.form)
            // this.object.update(fd);
            await this.object.update({"flags.wfrp4e.effectTrigger" : ev.target.value, "flags.wfrp4e.effectApplication" : ""})
            this.render(true)
        })
    }   
}