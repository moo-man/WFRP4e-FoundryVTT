import { PhysicalItemModel } from "./components/physical";
import PropertiesMixin from "./components/properties";
import {StandardActorModel} from "../actor/standard";

let fields = foundry.data.fields;

export class WeaponModel extends PropertiesMixin(PhysicalItemModel) {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.damage = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.weaponGroup = new fields.SchemaField({
            value: new fields.StringField({ initial: "basic" })
        });
        schema.reach = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.range = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.skill = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.modeOverride = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.twohanded = new fields.SchemaField({
            value: new fields.BooleanField({ initial: false })
        });
        schema.ammunitionGroup = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.currentAmmo = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.consumesAmmo = new fields.SchemaField({
            value: new fields.BooleanField({ initial: false })
        });
        schema.special = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.loaded = new fields.SchemaField({
            value: new fields.BooleanField({ initial: false }),
            repeater: new fields.BooleanField({ initial: false }),
            amt: new fields.NumberField({ initial: 0 })
        });
        schema.offhand = new fields.SchemaField({
            value: new fields.BooleanField({ initial: false })
        });

        schema.equipped = new fields.BooleanField({ initial: false })

        return schema;
    }

    //#region getters 

    get isMelee() {
        return this.modeOverride?.value == "melee" || (game.wfrp4e.config.groupToType[this.weaponGroup.value] == "melee" && this.modeOverride?.value != "ranged")
    }

    get isRanged() {
        return this.modeOverride?.value == "ranged" || (game.wfrp4e.config.groupToType[this.weaponGroup.value] == "ranged" && this.modeOverride?.value != "melee")
    }

    get isEquipped() {

        return this.equipped
    }

    get WeaponGroup() {
        return game.wfrp4e.config.weaponGroups[this.weaponGroup.value]
    }

    get Reach() {
        return game.wfrp4e.config.weaponReaches[this.reach.value];
    }

    get Range() {
        return this.applyAmmoMods(this.computeWeaponFormula("range"), "range")
      }
    

    get attackType() {
        return this.modeOverride?.value || game.wfrp4e.config.groupToType[this.weaponGroup.value]
    }

    get reachNum() {
        return game.wfrp4e.config.reachNum[this.reach.value]
    }

    get ammo() {
        if (this.isRanged && this.currentAmmo?.value && this.parent.isOwned)
          return this.parent.actor.items.get(this.currentAmmo.value)
    }

    get ammoList() {
    if (this.ammunitionGroup.value == "throwing")
        return this.parent.actor.getItemTypes("weapon").filter(i => i.weaponGroup.value == "throwing")
    else 
        return this.parent.actor.getItemTypes("ammunition").filter(a => a.ammunitionType.value == this.ammunitionGroup.value)
    }

    get Damage() {

        let actor = this.parent.actor
        let damage = this.applyAmmoMods(this.computeWeaponFormula("damage"), "damage") + (actor.flags[`${this.attackType}DamageIncrease`] || 0) - Math.max((this.damageToItem.value - (this.properties.qualities.durable?.value || 0)), 0)

        //@HOUSE
        if (game.settings.get("wfrp4e", "mooSizeDamage") && actor.system instanceof StandardActorModel)
        {
          if (this.damage.value.includes("SB") && actor.sizeNum > 3)
          {
            game.wfrp4e.utility.logHomebrew("mooSizeDamage")
            let SBsToAdd = actor.sizeNum - 3
            damage += (actor.characteristics.s.bonus * SBsToAdd)
          }
    
        }
        //@/HOUSE
    
        return parseInt(damage || 0)
      }

      get DamageString() {
        let string = this.Damage
    
        if (this.damage.dice)
          string += `+ ${this.damage.dice}`
    
        if (this.ammo && this.ammo.damage.dice)
          string += `+ ${this.ammo.damage.dice}`
    
        return string
      }

      get mountDamage() {

        let actor = this.parent.actor
        if (!actor)
            return;

        if (this.attackType != "melee" || !actor.isMounted || !actor.mount)
        {
            return this.Damage
        }
                                                                                                                                // Account for Durable, Math.max so durable doesn't go past damageToItem
        return this.applyAmmoMods(this.computeWeaponFormula("damage", actor.mount), "damage") + (actor.flags[`${this.attackType}DamageIncrease`] || 0) - Math.max((this.damageToItem.value - (this.properties.qualities.durable?.value || 0)), 0)

      }

      //#endregion


    async preCreateData(data, options, user) {
        let preCreateData = await super.preCreateData(data, options, user);

        if (this.parent.isOwned && this.parent.actor.type != "character" && this.parent.actor.type != "vehicle") {
            foundry.utils.setProperty(preCreateData, "system.equipped", true); // TODO: migrate this into a unified equipped property
        }

        return preCreateData;
    }


    async preUpdateChecks(data) {
        await super.preUpdateChecks(data);

        if (this.weaponGroup.value == "throwing" && getProperty(data, "system.ammunitionGroup.value") == "throwing") {
            delete data.system.ammunitionGroup.value
            return ui.notifications.notify(game.i18n.localize("SHEET.ThrowingAmmoError"))
        }
    }


    toggleEquip()
    {
        return this.parent.update({"system.equipped" : !this.isEquipped})
    }

    get usesHands()
    {
        let actor = this.parent?.actor;
        let locations = [];
        if (actor && this.isEquipped)
        {
            if (this.twohanded.value)
            {
                locations = locations.concat(["rArm", "lArm"])
            }
            else if (this.offhand.value)
            {
                locations.push(actor.secondaryArmLoc);
            }
            else 
            {
                locations.push(actor.mainArmLoc)
            }
        }
        return locations;
    }

    get properties() {
        if (this._properties)
        {
            return this._properties;
        }

        let properties = super.properties;
        properties.unusedQualities = {},
        properties.inactiveQualities = {}

        //TODO: Don't like having to check for type here
        if (this.parent.isOwned && !this.skillToUse && this.parent.actor.type != "vehicle") {
            properties.unusedQualities = properties.qualities
            properties.qualities = {}
            if (this.ammo)
                properties.qualities = this.ammo.properties.qualities
        }

        if (this.parent.isOwned) {
            for (let prop in properties.qualities) {
                let property = properties.qualities[prop]
                if (Number.isNumeric(property.group) && !property.active) {
                    properties.inactiveQualities[prop] = property;
                    delete properties.qualities[prop];
                }
            }
        }

        properties.special = this.special?.value
        if (this.ammo)
            properties.specialAmmo = this.ammo.properties.special

        return properties;
    }


    computeOwned() {
        if (this.isRanged && this.ammo && this.skillToUse && this.parent.actor.type != "vehicle")
            this._addProperties(this.ammo.properties)

        if (this.weaponGroup.value == "flail" && !this.skillToUse && !this.flaws.value.find(i => i.name == "dangerous"))
            this.flaws.value.push({ name: "dangerous" })

        if (game.settings.get("wfrp4e", "mooQualities")) {
            game.wfrp4e.utility.logHomebrew("mooQualities")
            let momentum = this.qualities.value.find(q => q.name == "momentum" && q.value)
            if (momentum?.value && this.parent.actor.status.advantage.value > 0) {
                let qualityString = momentum.value
                this._addProperties({ qualities: game.wfrp4e.utility.propertyStringToObject(qualityString, game.wfrp4e.utility.allProperties()), flaws: {} })
                this.qualities.value.splice(this.qualities.value.findIndex(q => q.name == "momentum"), 1)
            }
        }

        this.range.bands = this.computeRangeBands()

        if (this.loading) {
            this.loaded.max = 1
            if (this.repeater) {
                this.loaded.max = this.repeater.value
                if (!this.loaded.max)
                    this.loaded.max = 1
            }
        }
    }

    computeEncumbrance() 
    {
        let enc = super.computeEncumbrance();
        // Weapons don't lower encumbrance when equipped
        if (this.isEquipped && this.encumbrance.value > 0) // Check if encumbrance > 0 because we don't want to add encumbrance back if there wasn't any to begin with
        {
            enc++;
        }
        return enc
    }


    computeRangeBands() {

        let range = this.applyAmmoMods(this.computeWeaponFormula("range"), "range")
        if (!range || this.attackType == "melee")
            return

        let rangeBands = {}

        rangeBands[`${game.i18n.localize("Point Blank")}`] = {
            range: [0, Math.ceil(range / 10)],
            modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Point Blank"]],
            difficulty: game.wfrp4e.config.rangeModifiers["Point Blank"]
        }
        rangeBands[`${game.i18n.localize("Short Range")}`] = {
            range: [Math.ceil(range / 10) + 1, Math.ceil(range / 2)],
            modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Short Range"]],
            difficulty: game.wfrp4e.config.rangeModifiers["Short Range"]
        }
        rangeBands[`${game.i18n.localize("Normal")}`] = {
            range: [Math.ceil(range / 2) + 1, range],
            modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Normal"]],
            difficulty: game.wfrp4e.config.rangeModifiers["Normal"]
        }
        rangeBands[`${game.i18n.localize("Long Range")}`] = {
            range: [range + 1, range * 2],
            modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Long Range"]],
            difficulty: game.wfrp4e.config.rangeModifiers["Long Range"]
        }
        rangeBands[`${game.i18n.localize("Extreme")}`] = {
            range: [range * 2 + 1, range * 3],
            modifier: game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Extreme"]],
            difficulty: game.wfrp4e.config.rangeModifiers["Extreme"]
        }

        //@HOUSE
        if (game.settings.get("wfrp4e", "mooRangeBands")) {
            game.wfrp4e.utility.logHomebrew("mooRangeBands")
            if (!this.parent.getFlag("wfrp4e", "optimalRange"))
                game.wfrp4e.utility.log("Warning: No Optimal Range set for " + this.name)

            rangeBands[`${game.i18n.localize("Point Blank")}`].modifier = this.#optimalDifference(game.i18n.localize("Point Blank")) * -20 + 20
            delete rangeBands[`${game.i18n.localize("Point Blank")}`].difficulty
            rangeBands[`${game.i18n.localize("Short Range")}`].modifier = this.#optimalDifference(game.i18n.localize("Short Range")) * -20 + 20
            delete rangeBands[`${game.i18n.localize("Short Range")}`].difficulty
            rangeBands[`${game.i18n.localize("Normal")}`].modifier = this.#optimalDifference(game.i18n.localize("Normal")) * -20 + 20
            delete rangeBands[`${game.i18n.localize("Normal")}`].difficulty
            rangeBands[`${game.i18n.localize("Long Range")}`].modifier = this.#optimalDifference(game.i18n.localize("Long Range")) * -20 + 20
            delete rangeBands[`${game.i18n.localize("Long Range")}`].difficulty
            rangeBands[`${game.i18n.localize("Extreme")}`].modifier = this.#optimalDifference(game.i18n.localize("Extreme")) * -20 + 20
            delete rangeBands[`${game.i18n.localize("Extreme")}`].difficulty
        }
        //@/HOUSE


        // If entangling and has no ammunition (implying non-projectiles like a whip)
        if (this.weaponGroup.value == "entangling" && this.ammunitionGroup.value == "none") {
            rangeBands[`${game.i18n.localize("Point Blank")}`].modifier = 0
            rangeBands[`${game.i18n.localize("Short Range")}`].modifier = 0
            rangeBands[`${game.i18n.localize("Normal")}`].modifier = 0
            rangeBands[`${game.i18n.localize("Long Range")}`].modifier = 0
            rangeBands[`${game.i18n.localize("Extreme")}`].modifier = 0
        }
        return rangeBands;
    }

    //@HOUSE
    #optimalDifference(range)
    {
        let keys = Object.keys(game.wfrp4e.config.rangeBands)
        let rangeKey = game.wfrp4e.utility.findKey(range, game.wfrp4e.config.rangeBands)
        let weaponRange = this.parent.getFlag("wfrp4e", "optimalRange")
        if (!weaponRange || !rangeKey)
            return 1

        return Math.abs(keys.findIndex(i => i == rangeKey) - keys.findIndex(i => i == weaponRange))
    }
    //@/HOUSE

    applyAmmoMods(value, type) {
        // If weapon ammo, just use its damage
        if (this.ammo?.type == "weapon" && type == "damage") {
            return Number(this.ammo.damage.value)
        }

        // If no ammo or has weapon ammo, don't apply mods
        if (!this.ammo || this.ammo.type == "weapon")
            return value

        let ammoValue = this.ammo[type].value

        if (!ammoValue)
            return value

        // If range modification was handwritten, process it
        if (ammoValue.toLowerCase() == game.i18n.localize("as weapon")) { }
        else if (ammoValue.toLowerCase() == "as weapon") { }
        // Do nothing to weapon's range
        else if (ammoValue.toLowerCase() == game.i18n.localize("half weapon"))
            value /= 2;
        else if (ammoValue.toLowerCase() == "half weapon")
            value /= 2;
        else if (ammoValue.toLowerCase() == game.i18n.localize("third weapon"))
            value /= 3;
        else if (ammoValue.toLowerCase() == "third weapon")
            value /= 3;
        else if (ammoValue.toLowerCase() == game.i18n.localize("quarter weapon"))
            value /= 4;
        else if (ammoValue.toLowerCase() == "quarter weapon")
            value /= 4;
        else if (ammoValue.toLowerCase() == game.i18n.localize("twice weapon"))
            value *= 2;
        else if (ammoValue.toLowerCase() == "twice weapon")
            value *= 2;
        else // If the range modification is a formula (supports +X -X /X *X)
        {
            try {
                try // Works for + and -
                {
                    ammoValue = (0, eval)(ammoValue);
                    value = Math.floor((0, eval)(value + ammoValue));
                }
                catch // if *X and /X
                {                                      // eval (50 + "/5") = eval(50/5) = 10
                    value = Math.floor((0, eval)(value + ammoValue));
                }
            } catch (error) {
                ui.notifications.error(game.i18n.format("ERROR.AMMO_MODS", {type}));
                console.error(error, {value, type, item: this, ammo: this.ammo});
            }
        }
        return value
    }


    /**
   * Calculates a weapon's range or damage formula.
   * 
   * Takes a weapon formula for Damage or Range (SB + 4 or SBx3) and converts to a numeric value.
   * 
   * @param {String} formula formula to be processed (SBx3 => 9).
   * 
   * @return {Number} Numeric formula evaluation
   */
    computeWeaponFormula(type, mount) {
        let formula = this[type].value || 0
        let actorToUse = this.parent.actor
        try {
            formula = formula.toLowerCase();
            // Iterate through characteristics
            for (let ch in this.parent.actor.characteristics) {
                if (ch == "s" && mount)
                    actorToUse = mount
                else
                    actorToUse = this.parent.actor
                // Determine if the formula includes the characteristic's abbreviation + B (SB, WPB, etc.)
                if (formula.includes(ch.concat('b'))) {
                    // Replace that abbreviation with the Bonus value
                    formula = formula.replace(ch.concat('b'), actorToUse.characteristics[ch].bonus.toString());
                }
            }
            // To evaluate multiplication, replace x with *
            formula = formula.replace('x', '*');

            return (0, eval)(formula);
        }
        catch
        {
            return formula
        }
    }

    getSkillToUse() {
        let skills = this.parent.actor?.getItemTypes("skill") || []
        let skill = skills.find(x => x.name.toLowerCase() == this.skill.value.toLowerCase())
        if (!skill) {
            skill = skills.find(x => x.name.toLowerCase().includes(`(${this.WeaponGroup.toLowerCase()})`))
        }
        return skill
    }


    /** 
     * Helper method to apply damage to an item
     * 
     * @param {number} value Damage the item by this amount
     * @param {string} type "value", "shield" or "both"
     */
    damageItem(value = 1, type="value")
    {
        let update = {};
        let broken = false
        if (["value", "both"].includes(type))
        {

            let currentDamage = this.damageToItem.value + value;
            
            // If maxDamageTaken is undefined, there is no max
            let max = this.maxDamageTaken("value")
            if (max && currentDamage > max)
            {
                currentDamage = max;
            }
            if (currentDamage == max)
            {
                broken = true;
            }
            
            update[`system.damageToItem.value`] = currentDamage
        }
        if (["shield", "both"].includes(type))
        {

            let currentDamage = this.damageToItem.shield + value;
            
            // If maxDamageTaken is undefined, there is no max
            let max = this.maxDamageTaken("shield")
            if (max && currentDamage > max)
            {
                currentDamage = max;
            }
           
            if (currentDamage == max)
            {
                broken = true;
            }

            update[`system.damageToItem.shield`] = currentDamage
        }

        if (broken)
        {
            ui.notifications.notify(`${this.parent.name} broken!`)
        }

        return this.parent.update(update);
    }

    maxDamageTaken(type)
    {
        if (type == "value")
        {
            let regex = /\d{1,3}/gm
            return Number(regex.exec(this.damage.value)[0] || 0) + Number(this.properties.qualities.durable?.value || 0) || 999
        }
        else if (type == "shield")
        {
            return Number(this.properties.qualities.shield?.value || 0)
        }
    }

    
    getOtherEffects()
    {
        return super.getOtherEffects().concat(this.ammo?.effects.contents || [])
    }

    shouldTransferEffect(effect)
    {
        return super.shouldTransferEffect(effect) && (!effect.applicationData.equipTransfer || this.isEquipped)
    }


    async expandData(htmlOptions) {
        let data = await super.expandData(htmlOptions);

        if (this.weaponGroup.value)
            data.properties.push(this.WeaponGroup);
        if (this.range.value)
            data.properties.push(`${game.i18n.localize("Range")}: ${this.range.value}`);
        if (this.damage.value) {
            let damage = this.damage.value
            if (this.damage.dice)
                damage += " + " + this.damage.dice
            data.properties.push(`${game.i18n.localize("Damage")}: ${damage}`);
        }
        if (this.twohanded.value)
            data.properties.push(game.i18n.localize("ITEM.TwoHanded"));
        if (this.reach.value)
            data.properties.push(`${game.i18n.localize("Reach")}: ${game.wfrp4e.config.weaponReaches[this.reach.value] + " - " + game.wfrp4e.config.reachDescription[this.reach.value]}`);
        if (this.damageToItem.value)
            data.properties.push(`${game.i18n.format("ITEM.WeaponDamaged", { damage: this.damageToItem.value })}`);
        if (this.damageToItem.shield)
            data.properties.push(`${game.i18n.format("ITEM.ShieldDamaged", { damage: this.damageToItem.shield })}`);

        let itemProperties = this.OriginalQualities.concat(this.OriginalFlaws)
        for (let prop of itemProperties)
            data.properties.push("<a class ='item-property'>" + prop + "</a>")

        if (this.special.value)
            data.properties.push(`${game.i18n.localize("Special")}: ` + this.special.value);

        data.properties = data.properties.filter(p => !!p);
        return data;
    }

    chatData() {
        let properties = [
            `<b>${game.i18n.localize("Price")}</b>: ${this.price.gc || 0} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${this.price.ss || 0} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${this.price.bp || 0} ${game.i18n.localize("MARKET.Abbrev.BP")}`,
            `<b>${game.i18n.localize("Encumbrance")}</b>: ${this.encumbrance.value}`,
            `<b>${game.i18n.localize("Availability")}</b>: ${game.wfrp4e.config.availability[this.availability.value] || "-"}`
        ]

        if (this.weaponGroup.value)
            properties.push(`<b>${game.i18n.localize("Group")}</b>: ${this.WeaponGroup}`);
        if (this.range.value)
            properties.push(`<b>${game.i18n.localize("Range")}</b>: ${this.range.value}`);
        if (this.damage.value)
            properties.push(`<b>${game.i18n.localize("Damage")}</b>: ${this.damage.value}`);
        if (this.twohanded.value)
            properties.push(`<b>${game.i18n.localize("ITEM.TwoHanded")}</b>`);
        if (this.reach.value)
            properties.push(`<b>${game.i18n.localize("Reach")}</b>: ${game.wfrp4e.config.weaponReaches[this.reach.value] + " - " + game.wfrp4e.config.reachDescription[this.reach.value]}`);
        if (this.damageToItem.value)
            properties.push(`${game.i18n.format("ITEM.WeaponDamaged", { damage: this.damageToItem.value })}`);
        if (this.damageToItem.shield)
            properties.push(`${game.i18n.format("ITEM.ShieldDamaged", { damage: this.damageToItem.shield })}`);

        // Make qualities and flaws clickable
        if (this.qualities.value.length)
            properties.push(`<b>${game.i18n.localize("Qualities")}</b>: ${this.OriginalQualities.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);

        if (this.flaws.value.length)
            properties.push(`<b>${game.i18n.localize("Flaws")}</b>: ${this.OriginalFlaws.map(i => i = "<a class ='item-property'>" + i + "</a>").join(", ")}`);


        properties = properties.filter(p => p != game.i18n.localize("Special"));
        if (this.special.value)
            properties.push(`<b>${game.i18n.localize("Special")}</b>: ` + this.special.value);

        properties = properties.filter(p => !!p);
        return properties;
    }
}