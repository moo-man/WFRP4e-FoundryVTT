import SkillDialog from "./skill-dialog";

export default class ChannellingDialog extends SkillDialog {

    subTemplate = "systems/wfrp4e/templates/dialog/channel-dialog.hbs";

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



    async setup(fields={}, data={}, options={})
    {
        let spell = data.spell
        options.title = options.title || game.i18n.localize("ChannellingTest") + " - " + spell.name;
        options.title += options.appendTitle || "";

        return new Promise(resolve => {
            new this(fields, data, resolve, options)
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