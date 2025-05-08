import PrayerTest from "../../system/rolls/prayer-test";
import SkillDialog from "./skill-dialog";

export default class PrayerDialog extends SkillDialog {

    testClass = PrayerTest
    chatTemplate = "systems/wfrp4e/templates/chat/roll/prayer-card.hbs"

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["prayer-roll-dialog"]);
        return options;
    }

    get item()
    {
      return this.data.prayer
    }

    get prayer() 
    {
      return this.item;
    }

    static async setupData(prayer, actor, context={}, options={})
    {
        let skill = actor.itemTags["skill"].find(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase());

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
        
        context.title = context.title || game.i18n.localize("PrayerTest") + " - " + prayer.name;
        context.title += context.appendTitle || "";
        delete context.appendTitle;

        context.hitloc = !!(prayer.damage.value || prayer.damage.dice || prayer.damage.addSL)
        
        let dialogData = await super.setupData(skill, actor, context, options);
        let data = dialogData.data;

        data.prayer = prayer

        data.scripts = data.scripts.concat(prayer.getScripts("dialog").filter(s => !s.options.defending))
        return dialogData;
    }

    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        data.item = this.data.prayer.id
        return data;
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "prayer";
    }
}