import SkillDialog5e from "./skill-dialog5e";

export default class AttackDialog5e extends SkillDialog5e
{
    get attackType() {
        return this.item.system.attackType;
    }

    get tooltipConfig() 
    {
        return {

            SL: {
                label: "DIALOG.SL",
                type: 1, 
                path: "fields.SL"
            },
            advantage: {
                label: "DIALOG.Advantage",
                type: 1, 
                path: "fields.advantage"
            },
            disadvantage: {
                label: "DIALOG.Disadvantage",
                type: 1, 
                path: "fields.disadvantage"
            },
            damage: {
              label: "DIALOG.Damage",
              type: 1,
              path: "fields.damage"
            },
            difficulty: {
                label: "Difficulty",
                type: 0,
                path: "fields.difficulty"
            },

        }
    }
    
    static PARTS = {
        fields : {
            template : "systems/wfrp4e/templates/dialog/type/5e/base-dialog.hbs",
            fields: true
        },
        modifiers : {
            template : "modules/warhammer-lib/templates/partials/dialog-modifiers.hbs",
            modifiers: true
        },
        specific : {
          template : "systems/wfrp4e/templates/dialog/type/5e/attack-dialog.hbs",
      },
        footer : {
            template : "templates/generic/form-footer.hbs"
        }
    };


    async _prepareContext(options)
    {
        let context = await super._prepareContext(options);
        return context;
    }

    computeTargetNumber()
    {
      if (this.skill && this.skill?.id != "unknown")
      {
        return this.skill.system.getTotalForCharacteristic(this.fields.characteristic, this.actor);
      }
      else 
      {
        return this.actor.system.characteristics[this.fields.characteristic].value;
      }
    }

    computeFields()
    {        
        if (!["roll", "none"].includes(this.fields.hitLocation))
        {
            this.addModifier({key: "calledShot", value: -2, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.CalledShot")});
        }

        if (this.item.system.offhand?.value)
        {
            this.addModifier({key: "offhand", value: -2, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.UsingOffhand")});
        }

        if (this.fields.charging)
        {
            this.addModifier({key: "charging", value: 1, field: "advantage", label: game.i18n.localize("5e.Dialog.Modifier.Charging")});
        }

        
        if (this.item.system.isRanged)
        {
            if (game.combat?.active)
            {
                let combatant = game.combat.combatants.find(c => c.actor?.id == this.actor.id);
                if (combatant?.token?.movementHistory?.length > 0) 
                {
                this.addModifier({key: "moved", value: -1, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.Moved")});
                }
            }

            if (this.fields.range == "extreme")
            {
                this.addModifier({key: "range", value: -2, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.Extreme")});
            }
            else if (this.fields.range == "long")
            {
                this.addModifier({key: "range", value: -1, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.Long")});
            }
            else if (this.fields.range == "short")
            {
                this.addModifier({key: "range", value: 1, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.Short")});
            }
            else if (this.fields.range == "pb")
            {
                this.addModifier({key: "range", value: 2, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.PointBlank")});
            }
        }
        super.computeFields();
    }

    _computeDefending(attacker) 
    {
        super._computeDefending(attacker);
        if (this.item.system.isMelee && attacker.test.item?.system.isMelee && this.item.system.reachNum > attacker.test.item.system.reachNum)
        {
          this.addModifier({key: "size", value: 1, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.Shorter")});
        }
    }

    _computeTargets(target)
    {

      if (this.item.system.isRanged)
      {
        if (target.actor.sizeNum == 0)
        {
          this.addModifier({key: "size", value: -2, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.TargetTiny")});
        }
        else if (target.actor.sizeNum == 6)
        {
          this.addModifier({key: "size", value: 2, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.TargetMonstrous")});
        }
        else if (target.actor.sizeNum < this.actor.sizeNum)
        {
          this.addModifier({key: "size", value: -1, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.TargetSmaller")});
        }
        else if (target.actor.sizeNum > this.actor.sizeNum)
        {
          this.addModifier({key: "size", value: 1, field: "SL", label: game.i18n.localize("5e.Dialog.Modifier.TargetLarger")});
        }
      }
    }

    createBreakdown()
    {
        let breakdown = super.createBreakdown();
        breakdown.damage = this.fields.damage;
        return breakdown;
    }

    async onSubmit(submitData)
    {
        if (submitData.charging)
        {
            this.actor.update({"system.status.momentum": true});
        }
    }
    
}