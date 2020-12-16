

export default class WFRPActiveEffectConfig extends ActiveEffectConfig {

    getData() {
        let data = super.getData()
        data.effectLabels = game.wfrp4e.config.effectLabels;
        let type = getProperty(data, "effect.flags.wfrp4e.effectType")
        if (type && type != "dialogChoice")
            data.showEditor = true;

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
            await this.object.update({"flags.wfrp4e.effectType" : ev.target.value})
            this.render(true)
        })
    }   
}