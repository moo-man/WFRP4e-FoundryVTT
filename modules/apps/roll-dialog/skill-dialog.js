import CharacteristicDialog from "./characteristic-dialog";

export default class SkillDialog extends CharacteristicDialog {

    subTemplate = "systems/wfrp4e/templates/dialog/skill-dialog.hbs";

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["skill-roll-dialog"]);
        return options;
    }

    get item()
    {
      return this.data.skill
    }

    get skill() 
    {
      return this.item;
    }

    async setup(fields={}, data={}, options={})
    {
        let skill = data.skill
        options.title = options.title || game.i18n.format("SkillTest", {skill: data.skill.name});
        options.title += options.appendTitle || "";

        // Default a WS, BS, Melee, or Ranged to have hit location checked
        if ((skill.characteristic.key == "ws" ||
            skill.characteristic.key == "bs" ||
            skill.name.includes(game.i18n.localize("NAME.Melee")) ||
            skill.name.includes(game.i18n.localize("NAME.Ranged")))
            && !options.reload) {
            data.hitLocation = "roll";
        }
        else
            data.hitLocation = "none"

        if (data.skill.name == game.i18n.localize("NAME.Dodge"))    
        {
            options.dodge = true;
        }
        data.characteristic = skill.characteristic.key;
        data.hitLocationTable = game.wfrp4e.tables.getHitLocTable(data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc");


        return new Promise(resolve => {
            new this(fields, data, resolve, options)
        })
    }

    computeFields()
    {
        super.computeFields();   
        this._computeArmour()
    }

    _computeArmour()
    {
        /**
         * Construct armor penalty string based on armors equipped.
         *
         * For each armor, compile penalties and concatenate them into one string.
         * Does not stack armor *type* penalties.
         * 
         * @param {Array} armorList array of processed armor items 
         * @return {string} Penalty string
         */
        armourPrefillModifiers(item, type, options, tooltip = [])
        {
            let stealthPenaltyValue = 0;

            // Armor type penalties do not stack, only apply if you wear any of that type
            let wearingMail = false;
            let wearingPlate = false;

            for (let a of this.actor.itemTypes["armour"].filter(i => i.isEquipped)) {
                // For each armor, apply its specific penalty value, as well as marking down whether
                // it qualifies for armor type penalties (wearingMail/Plate)

                // Skip practical
                if (a.properties.qualities.practical)
                {
                    continue;
                }

                if (a.armorType.value == "mail")
                {
                    wearingMail = true;
                }
                if (a.armorType.value == "plate")
                {
                    wearingPlate = true;
                }
            }

            // Apply armor type penalties at the end
            if (wearingMail || wearingPlate) {
                let stealthPenaltyValue = 0;
                if (wearingMail)
                {
                    stealthPenaltyValue += -10;
                }
                if (wearingPlate)
                {
                    stealthPenaltyValue += -10;
                }

                if (this.item.name.includes(game.i18n.localize("NAME.Stealth"))) 
                {
                    if (stealthPenaltyValue) 
                    {
                        this.fields.modifier += stealthPenaltyValue
                        this.tooltips.addModifier(stealthPenaltyValue, game.i18n.localize("SHEET.ArmourPenalties"));
                    }
                }
            }
            return modifier;
        }
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "skill";
    }
}