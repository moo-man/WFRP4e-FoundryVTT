import SkillDialog5e from "./skill-dialog5e";

export default class PrayerDialog5e extends SkillDialog5e
{
    get item()
    {
      return this.data.prayer
    }

    get prayer() 
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
          template : "systems/wfrp4e/templates/dialog/type/5e/prayer-dialog.hbs",
      },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    static async setupData(prayer, actor, context={}, options={})
    {
      let skill = context.skill || actor.itemTags["skill"].find(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase());

      context.hitloc = !!prayer.system.damage.value
      
      context.title = context.title || game.i18n.localize("PrayerTest") + " - " + prayer.name;
      context.title += context.appendTitle || "";
      
      if (!skill)
      {
          skill = {
              name : game.i18n.localize("NAME.Pray"),
              id : "unknown",
              system : {
                  characteristic : {
                      value : "fel"
                  }
              }
          }
      }

      let dialogData = await super.setupData(skill, actor, context, options)

      let data = dialogData.data;
      data.prayer = prayer;
      data.item = prayer;

      data.scripts = data.scripts.concat(data.prayer?.getScripts("dialog").concat(data.prayer.ingredient?.getScripts("dialog") || []).filter(s => !s.options.defending))

      context.messageTemplate = "systems/wfrp4e/templates/chat/roll/5e/prayer-test.hbs";

      return dialogData;
    }


    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        return context;
    }
}