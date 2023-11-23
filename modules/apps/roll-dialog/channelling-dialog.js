import ChannelTest from "../../system/rolls/channel-test";
import SkillDialog from "./skill-dialog";

export default class ChannellingDialog extends SkillDialog {

    subTemplate = "systems/wfrp4e/templates/dialog/channel-dialog.hbs";
    testClass = ChannelTest

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["channel-roll-dialog"]);
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
        options.title = options.title || game.i18n.localize("ChannellingTest") + " - " + spell.name;
        options.title += options.appendTitle || "";

        if (spell.system.wind && spell.system.wind.value) 
        {
            data.skill = data.actor.itemTypes["skill"].find(i => i.name.toLowerCase() == spell.system.wind.value.toLowerCase());
        }
        else if (spell.system.lore.value == "witchcraft")
        {
            data.skill = data.actor.itemTypes["skill"].find(x => x.name.toLowerCase().includes(game.i18n.localize("NAME.Channelling").toLowerCase()))
        }
        else 
        {
            data.skill = data.actor.itemTypes["skill"].find(x => x.name.includes(game.wfrp4e.config.magicWind[spell.system.lore.value]))
        }
        data.characteristic = data.skill?.system.characteristic.key || "wp";

        data.scripts = data.scripts.concat(data.spell?.getScripts("dialog"), data.skill?.getScripts("dialog"))


        return new Promise(resolve => {
            new this(fields, data, resolve, options).render(true);
        })
    }

    _computeAdvantage()
    {
        // @HOUSE
        if (game.settings.get("wfrp4e", "mooMagicAdvantage"))
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