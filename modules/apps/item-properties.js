export default class ItemProperties extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "item-properties";
        options.template = "systems/wfrp4e/templates/apps/item-properties.html";
        options.height = "auto";
        options.width = 400;
        options.minimizable = true;
        options.title = "Item Properties"
        return options;
    }

    constructor(...args) {
        super(...args)
        if (this.object.type == "weapon" || this.object.type == "ammunition") {
            this.qualities = foundry.utils.deepClone(game.wfrp4e.config.weaponQualities)
            this.flaws = foundry.utils.deepClone(game.wfrp4e.config.weaponFlaws)
        }
        else if (this.object.type == "armour") {
            this.qualities = foundry.utils.deepClone(game.wfrp4e.config.armorQualities)
            this.flaws = foundry.utils.deepClone(game.wfrp4e.config.armorFlaws)
        }
        else if (this.object.type == "trapping")
        {
            this.qualities = {}
            this.flaws = {}
        }
        mergeObject(this.qualities, game.wfrp4e.config.itemQualities)
        mergeObject(this.flaws, game.wfrp4e.config.itemFlaws)
    }

    getData() {
        let data = super.getData()

        data.qualities = Object.keys(this.qualities).map(i => {
            return {
                name: this.qualities[i],
                hasValue: game.wfrp4e.config.propertyHasValue[i],
                key: i,
                existing: this.object.originalProperties.qualities[i]
            }
        })

        data.flaws = Object.keys(this.flaws).map(i => {
            return {
                name: this.flaws[i],
                hasValue: game.wfrp4e.config.propertyHasValue[i],
                key: i,
                existing: this.object.originalProperties.flaws[i]
            }
        })

        return data
    }


    async _updateObject(event, formData) {

        let qualities = []
        let flaws = []

        for (let prop in formData) {
            if (formData[prop] && !prop.includes("-value")) {
                let property = {
                    name: prop,
                    value: null
                }
                if (formData[`${prop}-value`]) {
                    let value = formData[`${prop}-value`]
                    if (Number.isNumeric(value))
                        value = parseInt(value)
                    property.value = value
                }
                if (this.qualities[prop])
                    qualities.push(property)
                else if (this.flaws[prop])
                    flaws.push(property)
            }
        }
        console.log(qualities, flaws)
        this.object.update({ "data.qualities.value": qualities, "data.flaws.value": flaws })
    }


    activateListeners(html) {
        super.activateListeners(html)
        

        html.find(".property-input").change(ev => {
            let property = ev.target.classList[1];
            let checked = ev.target.value ? true : false
            $(ev.currentTarget).parents("form").find(`[name=${property}]`)[0].checked = checked

        })
    }



}