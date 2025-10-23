import SkillTest from "../../system/rolls/skill-test";
import CharacteristicDialog from "./characteristic-dialog";

export default class SkillDialog extends CharacteristicDialog {

    chatTemplate = "systems/wfrp4e/templates/chat/roll/skill-card.hbs"

    get item()
    {
      return this.skill
    }

    get extendedTest() 
    {
        return fromUuidSync(this.context.extended);
    }

    get skill() 
    {
      return this.data.skill;
    }

    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/base-dialog.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
            template : "systems/wfrp4e/templates/dialog/type/skill-dialog.hbs",
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    static async setupData(skill, actor, context={}, options={})
    {
        let characteristic;
        if (skill.id == "unknown")
        {
            try 
            {
                let compendiumSkill = await game.wfrp4e.utility.findSkill(skill.name);
                if (compendiumSkill)
                {
                    characteristic = compendiumSkill.system.characteristic.value;
                }
            }
            catch(e)
            {
                characteristic = skill.system.characteristic.value;
            }
        }
        else 
        {
            characteristic = skill.system.characteristic.value;
        }

        context.title = context.title || game.i18n.format("SkillTest", {skill: skill.name});
        context.title += context.appendTitle || "";
        delete context.appendTitle;
        let dialogData = await super.setupData(characteristic, actor, context, options)
        dialogData.fields.characteristic = characteristic;
        foundry.utils.mergeObject(dialogData.data, {skill});

        
        if (dialogData.context.reload)
        {
            dialogData.data.scripts = dialogData.data.scripts.concat(context.weapon?.ammo.getScripts("dialog").filter(s => !s.options.defending));
        }

        
        if (skill.id != "unknown")
        {
            dialogData.data.scripts = dialogData.data.scripts.concat(skill?.getScripts("dialog").filter(s => !s.options.defending))
        }

        if (skill.name == game.i18n.localize("NAME.Dodge"))    
        {
            dialogData.context.dodge = true;
        }
    
        return dialogData;
    }

    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        data.skillName = this.data.skill?.name;
        data.item = this.data.skill?.id;
        data.characteristicToUse = this.data.characteristic;
        return data;
    }

    computeFields()
    {
        // While in a characteristic dialog, the characteristic is considered internal data
        // in a skill dialog, there's a field to change the characteristic used, so it's a field
        // Make sure the internal characteristic value matches the selected field value
        this.data.characteristic = this.fields.characteristic;
        super.computeFields();   
        this._computeArmour()
    }

    _computeArmour()
    {
        let stealthPenaltyValue = 0;

        // Armor type penalties do not stack, only apply if you wear any of that type
        let wearingMail = false;
        let wearingPlate = false;

        for (let a of this.actor.itemTags["armour"].filter(i => i.isEquipped)) {
            // For each armor, apply its specific penalty value, as well as marking down whether
            // it qualifies for armor type penalties (wearingMail/Plate)

            // Skip practical
            if (a.properties.qualities.practical) {
                continue;
            }

            if (a.armorType.value == "mail") {
                wearingMail = true;
            }
            if (a.armorType.value == "plate") {
                wearingPlate = true;
            }
        }

        // Apply armor type penalties at the end
        if (wearingMail || wearingPlate) {
            if (wearingMail) {
                stealthPenaltyValue += -10;
            }
            if (wearingPlate) {
                stealthPenaltyValue += -10;
            }

            if (this.item.name.includes(game.i18n.localize("NAME.Stealth"))) {
                if (stealthPenaltyValue) {
                    this.fields.modifier += stealthPenaltyValue
                    this.tooltips.add("modifier", stealthPenaltyValue, game.i18n.localize("SHEET.ArmourPenalties"));
                }
            }
        }
    }

    createBreakdown()
    {
        let breakdown = super.createBreakdown();
        if (this.skill?.system)
        {
            let skillValue = (this.skill?.system.advances?.value + this.skill?.system.modifier?.value) || 0
            if (skillValue)
            {
                breakdown.skill = `${this.skill.name} ${foundry.applications.handlebars.numberFormat(skillValue, {hash :{sign: true}})}`
            }
        }
        return breakdown;
    }

    _defaultFields() 
    {
        return foundry.utils.mergeObject({
            characteristic : "ws",
        }, super._defaultFields());
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "skill";
    }
}