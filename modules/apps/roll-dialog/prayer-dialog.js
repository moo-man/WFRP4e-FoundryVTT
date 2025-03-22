import PrayerTest from "../../system/rolls/prayer-test";
import SkillDialog from "./skill-dialog";

export default class PrayerDialog extends SkillDialog {

    testClass = PrayerTest
    subTemplate = ""
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

    static async setup(fields={}, data={}, options={})
    {
        let prayer = data.prayer
        options.title = options.title || game.i18n.localize("PrayerTest") + " - " + prayer.name;
        options.title += options.appendTitle || "";

        data.skill = data.actor.itemTags["skill"].find(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase());
        data.characteristic = data.skill?.system.characteristic.key || "fel";

        data.scripts = data.scripts.concat(data.prayer?.getScripts("dialog").filter(s => !s.options.defending), data.skill?.getScripts("dialog").filter(s => !s.options.defending) || [])
        data.scripts = data.scripts.concat(data.actor.system.vehicle?.getScripts("dialog").filter(s => !s.options.defending) || [])
        data.scripts = data.scripts.concat(this.getDefendingScripts(data.actor));


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
        data.item = this.data.prayer.id
        return data;
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "prayer";
    }
}