import SkillDialog5e from "./skill-dialog5e";

export default class AttackDialog5e extends SkillDialog5e
{
    get attackType() {
        return this.item.system.attackType;
    }

    get tooltipConfig() 
    {
        return {

            SL: {
                label: "DIALOG.SL",
                type: 1, 
                path: "fields.SL"
            },
            advantage: {
                label: "DIALOG.Advantage",
                type: 1, 
                path: "fields.advantage"
            },
            disadvantage: {
                label: "DIALOG.Disadvantage",
                type: 1, 
                path: "fields.disadvantage"
            },
            damage: {
              label: "DIALOG.Damage",
              type: 1,
              path: "fields.damage"
            },

            // Keep old fields for backwards compatibility
            modifier: {
                label: "Modifier",
                type: 1,
                path: "fields.modifier",
                hideLabel: true
            },
            slBonus: {
                label: "DIALOG.SLBonus",
                type: 1,
                path: "fields.slBonus"
            },
            successBonus: {
                label: "DIALOG.SuccessBonus",
                type: 1,
                path: "fields.successBonus"
            },
            difficulty: {
                label: "Difficulty",
                type: 0,
                path: "fields.difficulty"
            },

        }
    }
    
    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/5e/base-dialog.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
          template : "systems/wfrp4e/templates/dialog/type/5e/attack-dialog.hbs",
      },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };


    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        return context;
    }

    computeTargetNumber()
    {
      if (this.skill)
      {
        return this.skill.system.getTotalForCharacteristic(this.fields.characteristic, this.actor);
      }
      else 
      {
        return this.actor.system.characteristics[this.fields.characteristic].value;
      }
    }

    computeFields()
    {
        super.computeFields();
    }

    _computeDefending(attacker) 
    {
        super._computeDefending(attacker);
    }

    _computeTargets(target)
    {

    }
}