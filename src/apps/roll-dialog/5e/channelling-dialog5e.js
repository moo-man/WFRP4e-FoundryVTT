import CharacteristicDialog5e from "./characteristic-dialog5e";
import SkillDialog5e from "./skill-dialog5e";

export default class ChannellingDialog5e extends SkillDialog5e
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

    static async setupFromSpell(spell, actor, context, options)
    {
      return this.setupData()
    }

    static async setupData(wind, actor, context={}, options={})
    {
      let skill = context.skill || actor.itemTags["skill"].find(i => i.name.toLowerCase() == wind.toLowerCase());
      
      if (!skill)
      {
          skill = {
              name : `${game.i18n.localize("NAME.Channelling")} (${game.wfrp4e.config.magicWind[wind]})`,
              id : "unknown",
              system : {
                  characteristic : {
                      value : "wp"
                  }
              }
          }
      }

      context.title = context.title || game.i18n.localize("ChannellingTest") + " - " + game.wfrp4e.config.magicWind[wind];
      context.title += context.appendTitle || "";
      context.wind = wind;
      let dialogData = await super.setupData(skill, actor, context, options);

      context.messageTemplate = "systems/wfrp4e/templates/chat/roll/5e/channelling-test.hbs";

      return dialogData;
    }


    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        return context;
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