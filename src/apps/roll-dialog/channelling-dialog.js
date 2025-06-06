import ChannelTest from "../../system/rolls/channel-test";
import SkillDialog from "./skill-dialog";

export default class ChannellingDialog extends SkillDialog {

    chatTemplate = "systems/wfrp4e/templates/chat/roll/channel-card.hbs"
    testClass = ChannelTest



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
            template : "systems/wfrp4e/templates/dialog/type/base-dialog.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
            template : "systems/wfrp4e/templates/dialog/type/channel-dialog.hbs",
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    static async setupData(spell, actor, context={}, options={})
    {

        let skill;
        if (spell.system.wind && spell.system.wind.value) 
        {
            skill = actor.itemTags["skill"].find(i => i.name.toLowerCase() == spell.system.wind.value.toLowerCase());
        }
        else if (spell.system.lore.value == "witchcraft")
        {
            skill = actor.itemTags["skill"].find(x => x.name.toLowerCase().includes(game.i18n.localize("NAME.Channelling").toLowerCase()))
        }
        else 
        {
            skill = actor.itemTags["skill"].find(x => x.name.includes(game.wfrp4e.config.magicWind[spell.system.lore.value]))
        }

        if (!skill)
        {
            skill = {
                name : `${game.i18n.localize("NAME.Channelling")} (${game.wfrp4e.config.magicWind[spell.system.lore.value]})`,
                id : "unknown",
                system : {
                    characteristic : {
                        value : "wp"
                    }
                }
            }
        }
                
        context.title = context.title || game.i18n.localize("ChannellingTest") + " - " + spell.name;
        context.title += context.appendTitle || "";
        delete context.appendTitle;

        let dialogData = await super.setupData(skill, actor, context, options);
        let data = dialogData.data;
        data.spell = spell;
        data.scripts = data.scripts.concat(spell.getScripts("dialog").filter(s => !s.options.defending))

        return dialogData;
    }

    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        data.item = this.data.spell.id
        return data;
    }

    _computeAdvantage()
    {
        // @HOUSE
        if (game.settings.get("wfrp4e", "homebrew").mooMagicAdvantage)
        {
            return super._computeAdvantage();
        }
        else 
        {
            return 0;
        }
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "channelling";
    }
}