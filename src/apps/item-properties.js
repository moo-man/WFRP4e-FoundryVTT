import WFRP_Utility from "../system/utility-wfrp4e";

export default class ItemProperties extends  HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "item-properties"],
        window: {
            title: "Item Properties",
            resizable : true,
        },
        position : {
            width: 400
        },
        form: {
            submitOnChange: true,
            handler: this._onSubmit
        }
    }
    constructor(document, options) {
        super(options);
        this.document = document

        if (ItemProperties.hasWeaponProperties(this.document)) {
            this.qualities = foundry.utils.deepClone(game.wfrp4e.config.weaponQualities);
            this.flaws = foundry.utils.deepClone(game.wfrp4e.config.weaponFlaws);
        } else if (ItemProperties.hasArmourProperties(this.document)) {
            this.qualities = foundry.utils.deepClone(game.wfrp4e.config.armorQualities);
            this.flaws = foundry.utils.deepClone(game.wfrp4e.config.armorFlaws);
        } else {
            this.qualities = {};
            this.flaws = {}
        }

        foundry.utils.mergeObject(this.qualities, game.wfrp4e.config.itemQualities);
        foundry.utils.mergeObject(this.flaws, game.wfrp4e.config.itemFlaws);

        if (this.document.type === "trait") {
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

    async _prepareContext(options) {
        let context = await super._prepareContext(options);

        context.qualities = Object.keys(this.qualities).map(i => {
            return {
                name: this.qualities[i],
                hasValue: game.wfrp4e.config.propertyHasValue[i],
                key: i,
                existing: this.document.originalProperties.qualities[i],
            }
        })

        context.flaws = Object.keys(this.flaws).map(i => {
            return {
                name: this.flaws[i],
                hasValue: game.wfrp4e.config.propertyHasValue[i],
                key: i,
                existing: this.document.originalProperties.flaws[i],
            }
        })

        context.customQualities = this.document.qualities.value.filter(i => i.custom).map(i => `${i.name} ${i.value ? "(" + i.value + ")" : ""}: ${i.description}`).join(" | ")
        context.customFlaws = this.document.flaws.value.filter(i => i.custom).map(i => `${i.name} ${i.value ? "(" + i.value + ")" : ""}: ${i.description}`).join(" | ")
        context.document = this.document;
        return context
    }

    
    /** @override */
    static PARTS = {
        form: {
            template: "systems/wfrp4e/templates/apps/item-properties.hbs",
            scrollable: [""]
        }
    }


    static async _onSubmit(event, form, formData) {

        let qualities = []
        let flaws = []
        let groups = [];

        for (let prop in formData.object) {

            if (prop == "custom-quality")
                qualities = qualities.concat(this.parseCustomProperty(formData.object[prop]))
            else if (prop == "custom-flaw")
                flaws = flaws.concat(this.parseCustomProperty(formData.object[prop]))

            if (formData.object[prop] && !prop.includes("-value")) {
                let property = {
                    name: prop,
                    value: null
                }
                if (formData.object[`${prop}-value`]) {
                    let value = formData.object[`${prop}-value`]
                    if (Number.isNumeric(value))
                        value = parseInt(value)
                    property.value = value
                }

                if (formData.object[`${prop}-group`]) 
                {
                    property.group = formData.object[`${prop}-group`]
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
        this.document.update({ "system.qualities.value": qualities, "system.flaws.value": flaws })
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

      /** @inheritDoc */
    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);
        this.document.apps.properties = this;
    }


    /** @inheritDoc */
    async _onRender(options) {
        await super._onRender(options)

        // Automatically check or uncheck a property if the associated textbox has been changed
        this.element.querySelectorAll("input.value").forEach(e => {
            e.addEventListener("keyup", ev => {
                let property = ev.target.classList[1];
                let checked = ev.target.value ? true : false
                let element = this.element.querySelector(`[name=${property}]`)
                if (element)
                    element.checked = checked
            })
        })
    }

    /** @inheritDoc */
    async _onClose(options)
    {
        super._onClose(options);
        delete this.document.apps.properties;
    }



}