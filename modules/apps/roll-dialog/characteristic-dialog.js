import RollDialog from "./roll-dialog";

export default class CharacteristicDialog extends RollDialog {

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["characteristic-roll-dialog"]);
        return options;
    }

    get item()
    {
      return this.data.characteristic
    }

    get characteristic() 
    {
      return this.item;
    }


    async setup(fields={}, data={}, options={})
    {
        let char = this.actor.system.characteristics[data.characteristic];
        options.title = options.title || game.i18n.format("CharTest", {char: game.i18n.localize(char.label)});
        options.title += options.appendTitle || "";

        data.hitLocation = ((data.characteristic == "ws" || data.characteristic == "bs") && !data.reload) ? "roll" : "none", // Default a WS or BS test to have hit location;
        data.hitLocationTable = game.wfrp4e.tables.getHitLocTable(data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc");


        return new Promise(resolve => {
            new this(fields, data, resolve, options)
        })
    }

    
    computeFields() {
        super.computeFields();

        if (this.options.dodge && this.actor.isMounted) {
            this.fields.modifier -= 20
            this.tooltips.addModifier(-20, game.i18n.localize("EFFECT.DodgeMount"));
        }
    }


    _computeDefending(attacker)
    {
        if (attacker.test.item.properties?.flaws.slow) {
            if (!game.settings.get("wfrp4e", "mooQualities") && options.dodge) 
            {
                this.fields.slBonus += 1
                this.tooltips.addSLBonus(1, game.i18n.localize('CHAT.TestModifiers.SlowDefend'));
            }
        }

    }
    
    _defaultDifficulty() 
    {
        let difficulty = super._defaultDifficulty();
        if (this.options.corruption || this.options.mutate)
        {
            difficulty = "challenging"
        }

        if (this.options.rest || this.options.income)
        {
            difficulty =  "average"
        }
        return difficulty;
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "characteristic";
    }
}
