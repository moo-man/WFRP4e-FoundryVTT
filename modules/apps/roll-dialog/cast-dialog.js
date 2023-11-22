import SkillDialog from "./skill-dialog";

export default class CastDialog extends SkillDialog {

    subTemplate = "systems/wfrp4e/templates/dialog/spell-dialog.hbs";

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


    async setup(fields={}, data={}, options={})
    {
        let spell = data.spell
        options.title = options.title || game.i18n.localize("CastingTest") + " - " + spell.name;
        options.title += options.appendTitle || "";

        // let castSkills = [{ char: true, key: "int", name: game.i18n.localize("CHAR.Int") }]
        if (spell.system.damage.value)
        {
            data.hitLocation = true;
            data.hitLocationTable = game.wfrp4e.tables.getHitLocTable(data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc");
        }

        return new Promise(resolve => {
            new this(fields, data, resolve, options)
        })
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