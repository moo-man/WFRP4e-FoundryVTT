import { BaseItemModel } from "./base";
let fields = foundry.data.fields;

export class LocationalItemModel extends BaseItemModel {

    static LOCALIZATION_PREFIXES = ["WH.Components.Locational"];


    static defineSchema() {
        let schema = super.defineSchema();
        schema.prompt = new fields.BooleanField();
        schema.location = new fields.SchemaField({
            value: new fields.StringField(),
            key: new fields.StringField(),
        })
        return schema;
    }

    static get compendiumBrowserFilters() {
        return new Map([
            ...Array.from(super.compendiumBrowserFilters),
            ["location", {
                label: "Location",
                type: "set",
                config: {
                    choices: [
                        "WFRP4E.Locations.head",
                        "WFRP4E.Locations.body",
                        "WFRP4E.Locations.arm",
                        "WFRP4E.Locations.leg"
                    ]
                      .map(game.i18n.localize.bind(game.i18n))
                      .reduce((acc, a) => {
                          acc[a] = a;
                          return acc;
                      }, {}),
                    keyPath: "system.location.value"
                }
            }],
        ]);
    }

    /**
     * Used to identify an Item as one being a child of LocationalItemModel
     *
     * @final
     * @returns {boolean}
     */
    get isLocational() {
        return true;
    }


    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);

        if (this.parent.isOwned)
        {
            this.checkSourceTest(); // If this item has a source test, use that location
            
            let location = this.location.key
            if (!location && this.prompt) {
                await this.promptLocation()
            }
            else if (location && !options.skipLocationValue) // The location key might already be defined, but not the display value, so set that accordingly
            {
                this.updateSource({"location.value" : game.wfrp4e.config.locations[location]})
            }
        }
    }

    checkSourceTest()
    {
        let sourceMessageId = this.parent.getFlag("wfrp4e", "sourceMessageId")
        let actor = this.parent?.actor;
        
        if (sourceMessageId && actor)
        {

            let message = game.messages.get(sourceMessageId);
            // Might come from single or opposed test
            let test = message.system.test; 
            let opposed = message.system.opposedTest;

            if (test)
            {
                this.updateSource({"location.key" : actor.convertHitLoc(test.result.hitloc.result)})
            }
            else if (opposed)
            {
                // Opposed test already compute the "true" hit location
                this.updateSource({"location.key" : opposed.result.hitloc.value})
            }
        }
    }

    async promptLocation() {
        let location = await Dialog.wait({
            title: game.i18n.localize("Location"),
            content: "Choose Location",
            buttons: {
                l: {
                    label: `${game.i18n.localize("Left")} ${this.location.value}`,
                    callback: () => {
                        return "l";
                    }
                },
                r: {
                    label: `${game.i18n.localize("Right")} ${this.location.value}`,
                    callback: () => {
                        return "r";
                    }
                }
            }
        })


        let displayLocation = this.location.value;

        if (location == "l") {
            displayLocation = `${game.i18n.localize("Left")} ${this.location.value}`
        }
        if (location == "r") {
            displayLocation = `${game.i18n.localize("Right")} ${this.location.value}`
        }

        this.parent.updateSource({ "system.location": { key: location + this.location.value, value: displayLocation } })
    }

    usesLocation(weapon) {
        let actor = this.parent?.actor;
        if (!this.location.key || !actor || !weapon.isEquipped) {
            return false;
        }
        
        // At this point, we know weapon is equipped

        if (weapon.system.twohanded.value)
        {
            return true;
        }

        if (actor.mainArmLoc == this.normalizeLocation(this.location.key)) {
            return !weapon.system.offhand.value // If not in offhand, it is in the main hand
        }
        else if (actor.secondaryArmLoc == this.normalizeLocation(this.location.key)) {
            return weapon.system.offhand.value
        }
    }

    // e.g. converts rHand to rArm
    normalizeLocation(key)
    {
        if (key[0] == "r")
        {
            return "rArm";
        }
        else if (key[0] == "l")
        {
            return "lArm";
        }
    }

    get weaponsAtLocation() {
        return this.parent?.actor?.itemTypes.weapon.filter(weapon => this.usesLocation(weapon)) || []
    }
}