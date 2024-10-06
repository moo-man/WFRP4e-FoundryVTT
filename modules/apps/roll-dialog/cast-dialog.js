import CastTest from "../../system/rolls/cast-test";
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

    static async setup(fields={}, data={}, options={})
    {
        let spell = data.spell
        options.title = options.title || game.i18n.localize("CastingTest") + " - " + spell.name;
        options.title += options.appendTitle || "";

        data.skill = spell.skillToUse;
        data.characteristic = data.skill?.system?.characteristic?.key || "int";

        data.scripts = data.scripts.concat(data.spell?.getScripts("dialog"), data.skill?.getScripts("dialog") || [])
        data.scripts = data.scripts.concat(data.actor.system.vehicle?.getScripts("dialog") || [])


        return new Promise(resolve => {
            let dlg = new this(data, fields, options, resolve)
            if (options.bypass)
            {
                dlg.bypass()
            }
            else 
            {
                dlg.render(true);
            }
        })
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

    // Backwards compatibility for effects
    get type() 
    {
        return "cast";
    }
}