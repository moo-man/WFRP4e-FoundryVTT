import CharacteristicTest from "../../system/rolls/characteristic-test";
import RollDialog from "./roll-dialog";

export default class CharacteristicDialog extends RollDialog {
    chatTemplate = "systems/wfrp4e/templates/chat/roll/characteristic-card.hbs"
    get item()
    {
      return this.characteristic
    }

    get characteristic() 
    {
      return this.data.characteristic;
    }


    static async setupData(characteristic, actor, context={}, options={})
    {
        let dialogData = this._baseDialogData(actor, context);

        context.title = context.title || game.i18n.format("CharTest", {char: game.wfrp4e.config.characteristics[characteristic]});
        context.title += context.appendTitle || "";
        delete context.appendTitle;

        foundry.utils.mergeObject(dialogData, {data : {characteristic}, fields : context.fields || {}});

        let data = dialogData.data;
        
        data.hitloc = context.hitloc || ((characteristic == "ws" || characteristic == "bs") && !dialogData.context.reload)
        
        if (dialogData.context.reload)
        {
            data.scripts = data.scripts.concat(context.weapon?.ammo.getScripts("dialog").filter(s => !s.options.defending));
        }
            
        data.scripts = data.scripts.concat(data.actor.system.vehicle?.getScripts("dialog").filter(s => !s.options.defending) || [])
        data.scripts = data.scripts.concat(this.getDefendingScripts(data.actor));
        
        if (data.hitloc)
        {
            dialogData.fields.hitLocation = dialogData.fields.hitLocation || "roll";
            data.hitLocationTable = foundry.utils.mergeObject({none : game.i18n.localize("None"), roll : game.i18n.localize("Roll")}, game.wfrp4e.tables.getHitLocTable(data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc"));
        }
        else
        {
            dialogData.fields.hitLocation = "none";
        }

        return dialogData;
        // TODO handle bypass
        /**
        return new Promise(resolve => {
            let dlg = new this(data, fields, context, options, resolve)
            if (options.bypass)
            {
                dlg.bypass()
            }
            else 
            {
                dlg.render(true);
            }
        })*/
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        // context.data.hitLoc = ["ws", "bs"].includes(context.data.characteristic)
        return context;
    }
    
    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        data.item = this.data.characteristic;
        return data;
    }

    
    computeFields() {
        super.computeFields();

        if (this.context.dodge && this.actor.isMounted) {
            this.fields.modifier -= 20
            this.tooltips.add("modifier", -20, game.i18n.localize("EFFECT.DodgeMount"));
        }
    }


    _computeDefending(attacker)
    {
        if (attacker.test.item.properties?.flaws.slow) {
            if (!game.settings.get("wfrp4e", "homebrew").mooQualities || this.context.dodge) 
            {
                this.fields.slBonus += 1
                this.tooltips.add("slBonus", 1, game.i18n.localize('CHAT.TestModifiers.SlowDefend'));
            }
        }

    }
    
    _defaultDifficulty() 
    {
        let difficulty = super._defaultDifficulty();
        if (this.context.corruption || this.context.mutate)
        {
            difficulty = "challenging";
        }

        if (this.context.rest || this.context.income)
        {
            difficulty =  "average";
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
