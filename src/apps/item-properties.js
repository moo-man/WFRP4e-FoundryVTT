import WFRP_Utility from "../system/utility-wfrp4e";

export default class ItemProperties extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "item-properties";
        options.template = "systems/wfrp4e/templates/apps/item-properties.hbs";
        options.height = "auto";
        options.width = 400;
        options.minimizable = true;
        options.title = "Item Properties"
        return options;
    }

    constructor(...args) {
        super(...args);

        if (ItemProperties.hasWeaponProperties(this.object)) {
            this.qualities = foundry.utils.deepClone(game.wfrp4e.config.weaponQualities);
            this.flaws = foundry.utils.deepClone(game.wfrp4e.config.weaponFlaws);
        } else if (ItemProperties.hasArmourProperties(this.object)) {
            this.qualities = foundry.utils.deepClone(game.wfrp4e.config.armorQualities);
            this.flaws = foundry.utils.deepClone(game.wfrp4e.config.armorFlaws);
        } else {
            this.qualities = {};
            this.flaws = {}
        }

        foundry.utils.mergeObject(this.qualities, game.wfrp4e.config.itemQualities);
        foundry.utils.mergeObject(this.flaws, game.wfrp4e.config.itemFlaws);

        if (this.object.type === "trait") {
            ui.notifications.warn(game.i18n.localize("PROPERTIES.TraitWarning"))
        }
    }

    static hasWeaponProperties(object) {
        switch (object.type) {
            case 'weapon':
            case 'ammunition':
                return true;
            case 'trait':
                return object.system.rollable.value;
            default:
                return object.system.isWeapon;
        }
    }

    static hasArmourProperties(object) {
        switch (object.type) {
            case 'armour':
                return true;
            case 'trait':
                return !object.system.rollable.value;
            default:
                return object.system.isArmour;
        }
    }

    getData() {
        let data = super.getData()

        data.qualities = Object.keys(this.qualities).map(i => {
            return {
                name: this.qualities[i],
                hasValue: game.wfrp4e.config.propertyHasValue[i],
                key: i,
                existing: this.object.originalProperties.qualities[i],
            }
        })

        data.flaws = Object.keys(this.flaws).map(i => {
            return {
                name: this.flaws[i],
                hasValue: game.wfrp4e.config.propertyHasValue[i],
                key: i,
                existing: this.object.originalProperties.flaws[i],
            }
        })

        data.customQualities = this.object.qualities.value.filter(i => i.custom).map(i => `${i.name} ${i.value ? "(" + i.value + ")" : ""}: ${i.description}`).join(" | ")
        data.customFlaws = this.object.flaws.value.filter(i => i.custom).map(i => `${i.name} ${i.value ? "(" + i.value + ")" : ""}: ${i.description}`).join(" | ")

        return data
    }


    async _updateObject(event, formData) {

        let qualities = []
        let flaws = []
        let groups = [];

        for (let prop in formData) {

            if (prop == "custom-quality")
                qualities = qualities.concat(this.parseCustomProperty(formData[prop]))
            else if (prop == "custom-flaw")
                flaws = flaws.concat(this.parseCustomProperty(formData[prop]))

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

                if (formData[`${prop}-group`]) 
                {
                    property.group = formData[`${prop}-group`]
                    groups.push(property.group)
                }

                if (this.qualities[prop])
                    qualities.push(property)
                else if (this.flaws[prop])
                    flaws.push(property)
            }
        }


        // Find the first quality for each group, arbitrarily set that to be the active
        // Hack or Impale or Defensive -> Hack is default active
        for(let groupNum of groups)
        {
            let first = qualities.find(q => q.group == groupNum);
            if (first) first.active = true;
        }

        warhammer.utility.log("Updating Qualities/Flaws", false, formData, qualities, flaws)
        this.object.update({ "system.qualities.value": qualities, "system.flaws.value": flaws })
    }

    parseCustomProperty(string)
    {
        let regex = /(.+?)(\((.+?)\))*\s*:(.+?)(\||$)/gm

        let matches = string.matchAll(regex)
        let traits = []

        for (let match of matches)
        {
            traits.push({
                key : match[1].trim().slugify(),
                custom : true,
                value : match[3],
                name : match[1].trim(),
                display : (match[1].trim() + ` ${match[3] ? match[3] : ""}`).trim(),
                description : match[4].trim()
            })
        }

        return traits
    }


    activateListeners(html) {
        super.activateListeners(html)
        

        html.find(".property-input").change(ev => {
            let property = ev.target.classList[1];
            let checked = ev.target.value ? true : false
            let element = $(ev.currentTarget).parents("form").find(`[name=${property}]`)[0]
            if (element)
                element.checked = checked

        })
    }



}