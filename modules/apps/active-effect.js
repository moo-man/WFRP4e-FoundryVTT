

export default class WFRPActiveEffectConfig extends ActiveEffectConfig {

    getData() {
        let data = super.getData()
        console.log(this.object)
        return data
    }

    get template() {
        return "systems/wfrp4e/templates/apps/active-effect-config.html"
    }
}