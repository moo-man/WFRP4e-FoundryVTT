import SkillDialog from "./skill-dialog";

export default class AttackDialog extends SkillDialog  
{
    get attackType() {
        return this.item.attackType;
    }


    computeFields()
    {
        super.computeFields();
        if (!["roll", "none"].includes(this.fields.hitLocation))
        {
            this.fields.modifier -= 20;
            this.tooltips.add("modifier", -20, game.i18n.localize('ROLL.CalledShot'))
        }
        if (game.settings.get("wfrp4e", "useGroupAdvantage"))
        {
          if (this.userEntry.charging)
          {
            this.fields.modifier += 10;
            this.tooltips.add("modifier", 10, game.i18n.localize('Charging'))
          }
        }
    }

    _computeDefending(attacker) 
    {
        super._computeDefending(attacker);
        let properties = this.item.properties;

        //if attacker is fast, and the defender is either 1. using a melee trait to defend, or 2. using a weapon without fast
        if (attacker.test.item.properties?.qualities.fast && this.item.attackType == "melee" && !properties?.qualities.fast) 
        {
            this.fields.modifier += -10
            this.tooltips.add("modifier", -10, game.i18n.localize('CHAT.TestModifiers.FastWeapon'))
        }

        if (properties.flaws.unbalanced)
        {
            this.fields.slBonus -= 1;
            this.tooltips.add("slBonus", -1, game.i18n.localize("PROPERTY.Unbalanced"))
        }

        if(attacker.test.item.properties?.qualities?.wrap)
        {
            this.fields.slBonus -= 1
            this.tooltips.add("slBonus", -1, game.i18n.localize('CHAT.TestModifiers.WrapDefend'));
        }

        //Size Differences
        let sizeDiff = game.wfrp4e.config.actorSizeNums[attacker.test.size] - this.actor.sizeNum
        //Positive means attacker is larger, negative means defender is larger
        if (sizeDiff >= 1) {
            //Defending against a larger target with a weapon
            if (this.item.attackType == "melee") {
                let slBonus = (-2 * sizeDiff);
                this.fields.slBonus += slBonus
                this.tooltips.add("slBonus", slBonus, game.i18n.localize('CHAT.TestModifiers.DefendingLarger'))
            }
        }
    }

    _computeTargets(target)
    {
        if (this.item.attackType == "ranged" && target.actor.statuses.has("engaged"))
        {
            this.fields.modifier -= 20;
            this.tooltips.add("modifier", -20, game.i18n.localize("EFFECT.ShootingAtEngagedTarget"));
            this.options.engagedModifier = -20;
        }


        let sizeDiff = this.actor.sizeNum - target.actor.sizeNum
        let sizeModifier = 0
        // Attacking a larger creature with melee
        if (sizeDiff < 0 && (this.item.attackType == "melee" || target.actor.sizeNum <= 3))
        {
          sizeModifier += 10;
          this.tooltips.add("modifier", 10, game.i18n.localize('CHAT.TestModifiers.AttackingLarger'));
        }
        // Attacking a larger creature with ranged
        else if (this.item.attackType === "ranged")
        {
          if (target.actor.details.size.value == "tiny")
            sizeModifier -= 30
          if (target.actor.details.size.value == "ltl")
            sizeModifier -= 20
          if (target.actor.details.size.value == "sml")
            sizeModifier -= 10
          if (target.actor.details.size.value == "lrg")
            sizeModifier += 20
          if (target.actor.details.size.value == "enor")
            sizeModifier += 40
          if (target.actor.details.size.value == "mnst")
            sizeModifier += 60

          if (sizeModifier) 
          {
            const text = (game.i18n.format('CHAT.TestModifiers.ShootingSizeModifier', { size: game.wfrp4e.config.actorSizes[target.actor.details.size.value] }))
            this.tooltips.add("modifier", sizeModifier, text)
          }
        }
        
        if (sizeModifier)
        {
          this.context.sizeModifier = sizeModifier
          this.fields.modifier += sizeModifier
        }


        // Attacking a smaller creature from a mount
        if (this.actor.isMounted && this.item.attackType == "melee") 
        {
            let mountSizeDiff = this.actor.mount.sizeNum - target.actor.sizeNum
            if (target.actor.isMounted) 
            {                               // TODO this seems wrong
                mountSizeDiff = this.actor.mount.sizeNum - target.actor.sizeNum
            }

            if (mountSizeDiff >= 1) 
            {
                this.fields.modifier += 20;
                this.tooltips.add("modifier", 20, game.i18n.localize('CHAT.TestModifiers.AttackerMountLarger'));
            }
        }
        // Attacking a creature on a larger mount
        else if (this.item.attackType == "melee" && target.actor.isMounted) 
        {
            let mountSizeDiff = target.actor.mount.sizeNum - this.actor.sizeNum
            if (this.actor.isMounted) 
            {
                mountSizeDiff = target.sizeNum - this.actor.mount.sizeNum
            }
            if (mountSizeDiff >= 1) 
            {
                if ((this.item.reachNum || 0) >= 5) 
                {
                    // TODO this tooltip won't show up because 0 value
                    this.tooltips.add("modifier", 0, `${game.i18n.localize('CHAT.TestModifiers.IgnoreDefenderMountLarger')}`);
                }
                else 
                {
                    this.tooltips.add("modifier", -10, game.i18n.localize('CHAT.TestModifiers.DefenderMountLarger'));
                    this.fields.modifier -= 10;
                }
            }
        }
    }

    async _onFieldChange(ev) 
    {
      if (ev.currentTarget.name == "charging")
      {
        if (!game.settings.get("wfrp4e", "useGroupAdvantage"))
        {
          let advantageField = ui.activeWindow.form.querySelector("[name='advantage']");
          
          if(ev.currentTarget.checked)
          {
            advantageField.value = Number(advantageField.value) + 1;
          }
          else 
          {
            advantageField.value = Math.max(0, Number(advantageField.value) - 1);
          }
          advantageField.dispatchEvent(new Event('change'));
        }
        else 
        {
          this.flags.charging = ev.currentTarget.checked;
        }
      }
        super._onFieldChange(ev)
    }
}