import CharacteristicDialog from "./characteristic-dialog";
import SkillDialog from "./skill-dialog";

export default class CastDialog extends SkillDialog {

    subTemplate = "systems/wfrp4e/templates/dialog/spell-dialog.hbs";
    testClass = game.settings.get("wfrp4e", "useWoMOvercast") ? game.wfrp4e.rolls.WomCastTest : game.wfrp4e.rolls.CastTest
    chatTemplate = "systems/wfrp4e/templates/chat/roll/spell-card.hbs"

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["spell-roll-dialog"]);
        return options;
    }

    get item()
    {
      return this.data.spell
    }

    get spell() 
    {
      return this.item;
    }


    static async setupData(spell, actor, context={}, options={})
    {
        let skill = spell.skillToUse;
        let characteristic = skill?.system?.characteristic?.key || "int";
        
        context.title = context.title || game.i18n.localize("CastingTest") + " - " + spell.name;
        context.title += context.appendTitle || "";

        let dialogData;
        if (skill)
        {   
            dialogData = await super.setupData(skill, actor, context, options);
        }
        else
        {
            dialogData = await CharacteristicDialog.setupData(characteristic, actor, context, options);
        }

        let data = dialogData.data;
        data.spell = spell;

        data.scripts = data.scripts.concat(data.spell?.getScripts("dialog").filter(s => !s.options.defending))
    
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
        if (game.settings.get("wfrp4e", "mooMagicAdvantage"))
        {
            return 0;
        }
        else 
        {
            return super._computeAdvantage();
        }
    }
    
    _defaultFields() 
    {
        return mergeObject({
            overchannelling : 0
        }, super._defaultFields());
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "cast";
    }
}