import CharacteristicDialog5e from "./characteristic-dialog5e";

export default class SkillDialog5e extends CharacteristicDialog5e {
    get skill()
    {
      return this.data.skill;
    }

    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/5e/default-fields.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
            template : "systems/wfrp4e/templates/dialog/type/5e/skill-dialog.hbs",
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
        let dialogData = await super.setupData(characteristic, actor, context, options);

        
        context.messageTemplate = "systems/wfrp4e/templates/chat/roll/5e/characteristic-test.hbs";

        dialogData.data.skill = skill;
        dialogData.fields.characteristic = characteristic;
        dialogData.data.scripts = dialogData.data.scripts.concat(skill.getScripts("dialog"));

        return dialogData;
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        return context;
    }
    
    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        return data;
    }

    computeTargetNumber()
    {
        return this.skill.system.getTotalForCharacteristic(this.fields.characteristic, this.actor);
    }


    // Backwards compatibility for effects
    get type() 
    {
        return "skill";
    }
}
