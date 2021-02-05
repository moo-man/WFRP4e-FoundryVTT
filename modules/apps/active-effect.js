

export default class WFRPActiveEffectConfig extends ActiveEffectConfig {

    getData() {
        let data = super.getData()
        data.effectTriggers = game.wfrp4e.config.effectTriggers;
        let type = getProperty(data, "effect.flags.wfrp4e.effectTrigger")
        if (type && type != "dialogChoice")
        {
            data.showEditor = true;
            data.placeholder = game.wfrp4e.config.effectPlaceholder[type] + game.wfrp4e.config.effectPlaceholder.this
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
            {
                if (this.object.parent.type != "trait")
                    delete data.effectApplication.damage
                
                delete data.effectApplication.equipped
            }
        }
        else 
        {
            delete data.effectApplication.equipped
            delete data.effectApplication.damage
        }

        if (this.object.getFlag("wfrp4e", "effectApplication") == "damage")
        {
            data.effect.flags.wfrp4e.effectTrigger = "applyDamage"
            data.disableTrigger = true;
        }
        data.isGM = game.user.isGM
        return data
    }

    get template() {
        return "systems/wfrp4e/templates/apps/active-effect-config.html"
    }

    async _updateObject(event, formData) {
        let keys = Object.keys(formData).filter(i => i.includes(".key"))
        let values = []
        for (let key of keys)
            values.push(formData[key])
        values = values.filter(i => !!i)
        let character = {data : game.system.model.Actor.character};
        let npc = {data : game.system.model.Actor.npc};
        let creature = {data : game.system.model.Actor.creature};
        for (let value of values)
        {
            let invalidProperty = false;
            if (!hasProperty(character, value))
                invalidProperty = true
            if (!hasProperty(npc, value))
                invalidProperty = true
            if (!hasProperty(creature, value))
                invalidProperty = true

            if (invalidProperty)
                return ui.notifications.error("Invalid key detected. Please ensure to input the correct key values to point to existing actor data. Ex. 'data.characteristics.ws.modifier'")
        }
        await super._updateObject(event, formData)
    }


    activateListeners(html){
        super.activateListeners(html);

        html.find(".effect-type").change(async ev => {
            await this.object.update({"flags.wfrp4e.effectTrigger" : ev.target.value, "flags.wfrp4e.effectApplication" : ""})
            this.render(true)
        })

        html.find(".effect-application").change(async ev => {
            await this.object.update({"flags.wfrp4e.effectApplication" : ev.target.value})
            if (ev.target.value == "damage")
            await this.object.update({"flags.wfrp4e.effectTrigger" : "applyDamage"})
            if (ev.target.value == "invoke")
                await this.object.update({"flags.wfrp4e.effectTrigger" : ""})


            this.render(true)
        })
    }   

}