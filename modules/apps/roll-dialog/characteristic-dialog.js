import CharacteristicTest from "../../system/rolls/characteristic-test";
import RollDialog from "./roll-dialog";

export default class CharacteristicDialog extends RollDialog {

    testClass = CharacteristicTest
    chatTemplate = "systems/wfrp4e/templates/chat/roll/characteristic-card.hbs"

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["characteristic-roll-dialog"]);
        return options;
    }

    get item()
    {
      return this.characteristic
    }

    get characteristic() 
    {
      return this.data.characteristic;
    }


    static async setup(fields={}, data={}, options={})
    {
        // let {data, fields} = this._baseDialogData(actor, options);

        options.title = options.title || game.i18n.format("CharTest", {char: game.wfrp4e.config.characteristics[data.characteristic]});
        options.title += options.appendTitle || "";

        if (options.reload)
        {
            data.scripts = data.scripts.concat(options.weapon?.ammo.getScripts("dialog").filter(s => !s.options.defending));
        }

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
        data.item = this.data.characteristic;
        return data;
    }

    
    computeFields() {
        super.computeFields();

        if (this.options.dodge && this.actor.isMounted) {
            this.fields.modifier -= 20
            this.tooltips.add("modifier", -20, game.i18n.localize("EFFECT.DodgeMount"));
        }
    }


    _computeDefending(attacker)
    {
        if (attacker.test.item.properties?.flaws.slow) {
            if (!game.settings.get("wfrp4e", "mooQualities") || this.options.dodge) 
            {
                this.fields.slBonus += 1
                this.tooltips.add("slBonus", 1, game.i18n.localize('CHAT.TestModifiers.SlowDefend'));
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

    createBreakdown()
    {
        let breakdown = super.createBreakdown();
        if (this.characteristic)
        {
            breakdown.characteristic = `${this.actor.system.characteristics[this.characteristic].value} (${game.wfrp4e.config.characteristics[this.characteristic]})`
        }
        return breakdown;
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "characteristic";
    }
}
