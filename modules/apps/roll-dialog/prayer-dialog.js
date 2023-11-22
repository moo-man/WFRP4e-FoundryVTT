import SkillDialog from "./skill-dialog";

export default class PrayerDialog extends SkillDialog {

    subTemplate = "systems/wfrp4e/templates/dialog/prayer-dialog.hbs";

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

    async setup(fields={}, data={}, options={})
    {
        let prayer = data.prayer
        options.title = options.title || game.i18n.localize("PrayerTest") + " - " + prayer.name;
        options.title += options.appendTitle || "";


            // If the spell does damage, default the hit location to checked
        if (prayer.damage.value || prayer.damage.dice || prayer.damage.addSL)
        {
            data.hitLocation = true;
            data.hitLocationTable = game.wfrp4e.tables.getHitLocTable(data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc");
        }


        return new Promise(resolve => {
            new this(fields, data, resolve, options)
        })
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "prayer";
    }
}