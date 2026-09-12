import RollDialog5e from "./roll-dialog5e";

export default class CharacteristicDialog5e extends RollDialog5e {
    get characteristic() 
    {
      return this.fields.characteristic;
    }

        
    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/5e/default-fields.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
            template : "systems/wfrp4e/templates/dialog/type/5e/characteristic-dialog.hbs",
        },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };

    static async setupData(characteristic, actor, context={}, options={})
    {
        let dialogData = this._baseDialogData(actor, context, options);

        if (context.item && !context.appendTitle)
        {
            context.appendTitle = ` - ${context.item.name}`;
        }

        context.title = context.title || game.i18n.format("CharTest", {char: game.wfrp4e.config.characteristics[characteristic]});
        context.title += context.appendTitle || "";
        
        context.messageTemplate = "systems/wfrp4e/templates/chat/roll/5e/characteristic-test.hbs";
        foundry.utils.mergeObject(dialogData, {fields : context.fields || {}});
        dialogData.fields.characteristic = characteristic;

        let data = dialogData.data;
        
        data.item = context.item;
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
    }

    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        context.target = this.computeTargetNumber();
        return context;
    }
    
    _getSubmissionData()
    {
        let data = super._getSubmissionData();
        return data;

    }

    computeTargetNumber()
    {
        return this.actor.system.characteristics[this.fields.characteristic].value;
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

    _defaultFields() 
    {
        return foundry.utils.mergeObject({
            characteristic: "ws",
        }, super._defaultFields());
    }

    // Backwards compatibility for effects
    get type() 
    {
        return "characteristic";
    }
}
