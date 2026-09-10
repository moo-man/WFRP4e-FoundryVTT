import CharacteristicDialog5e from "./characteristic-dialog5e";
import SkillDialog5e from "./skill-dialog5e";

export default class CastDialog5e extends SkillDialog5e
{
    get item()
    {
      return this.data.spell
    }

    get spell() 
    {
      return this.item;
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
          template : "systems/wfrp4e/templates/dialog/type/5e/cast-dialog.hbs",
      },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    static async setupData(spell, actor, context={}, options={})
    {
      let skill = context.skill || spell.skillToUse;
      let characteristic = context.characteristic || skill?.system?.characteristic?.key || "int";
      
      context.title = context.title || game.i18n.localize("CastingTest") + " - " + spell.name;
      context.title += context.appendTitle || "";
      
      context.hitloc = !!spell.system.damage.value


      let dialogData;
      if (skill)
      {
        dialogData = await super.setupData(skill, actor, context, options)
      }
      else 
      {
        dialogData = await CharacteristicDialog5e.setupData(characteristic, actor, context, options)
      }

      let data = dialogData.data;
      data.spell = spell;
      data.item = spell;

      data.scripts = data.scripts.concat(data.spell?.getScripts("dialog").concat(data.spell.ingredient?.getScripts("dialog") || []).filter(s => !s.options.defending))

      // Needed if the actor doesn't own the spell;
      dialogData.context.itemData = spell.toObject();

      context.messageTemplate = "systems/wfrp4e/templates/chat/roll/5e/cast-test.hbs";

      return dialogData;
    }


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