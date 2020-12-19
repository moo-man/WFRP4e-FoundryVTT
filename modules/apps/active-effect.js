

export default class WFRPActiveEffectConfig extends ActiveEffectConfig {

    getData() {
        let data = super.getData()
        data.effectTriggers = game.wfrp4e.config.effectTriggers;
        let type = getProperty(data, "effect.flags.wfrp4e.effecttrigger")
        if (type && type != "dialogChoice")
        {
            data.showEditor = true;
            data.placeholder = game.wfrp4e.config.effectPlaceholder[type]
        }

        return data
    }

    get template() {
        return "systems/wfrp4e/templates/apps/active-effect-config.html"
    }

    async _updateObject(event, formData) {
        console.log(event, formData)
        await super._updateObject(event, formData)
    }


    activateListeners(html){
        super.activateListeners(html);

        html.find(".effect-type").change(async ev => {
            // let fd = new FormDataExtended(ev.currentTarget.form)
            // this.object.update(fd);
            await this.object.update({"flags.wfrp4e.effecttrigger" : ev.target.value})
            this.render(true)
        })
    }   
}