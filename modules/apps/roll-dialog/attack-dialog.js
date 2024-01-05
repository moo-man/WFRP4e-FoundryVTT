import SkillDialog from "./skill-dialog";

export default class AttackDialog extends SkillDialog  
{
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.classes = options.classes.concat(["weapon-roll-dialog"]);
        return options;
    }

    get attackType() {
        return this.item.attackType;
    }


    computeFields()
    {
        super.computeFields();
        if (!["roll", "none"].includes(this.fields.hitLocation))
        {
            this.fields.modifier -= 20;
            this.tooltips.addModifier(-20, game.i18n.localize('ROLL.CalledShot'))
        }
    }

    _computeDefending(attacker) 
    {
        let properties = this.item.properties;

        if (this.actor.defensive) 
        {
            this.fields.slBonus += this.actor.defensive;
            this.tooltips.addSLBonus(this.actor.defensive, game.i18n.localize("PROPERTY.Defensive"));
        }

        //if attacker is fast, and the defender is either 1. using a melee trait to defend, or 2. using a weapon without fast
        if (attacker.test.item.properties?.qualities.fast && this.item.attackType == "melee" && !properties?.qualities.fast) 
        {
            this.fields.modifier += -10
            this.tooltips.addModifier(-10, game.i18n.localize('CHAT.TestModifiers.FastWeapon'))
        }

        if (properties.flaws.unbalanced)
        {
            this.fields.slBonus -= 1;
            this.tooltips.addSLBonus(-1, game.i18n.localize("PROPERTY.Unbalanced"))
        }

        if(attacker.test.item.properties?.qualities?.wrap)
        {
            this.fields.slBonus -= 1
            this.tooltips.addSLBonus(-1, game.i18n.localize('CHAT.TestModifiers.WrapDefend'));
        }

        //Size Differences
        let sizeDiff = game.wfrp4e.config.actorSizeNums[attacker.test.size] - this.sizeNum
        //Positive means attacker is larger, negative means defender is larger
        if (sizeDiff >= 1) {
            //Defending against a larger target with a weapon
            if (this.item.attackType == "melee") {
                let slBonus = (-2 * sizeDiff);
                this.fields.slBonus += slBonus
                this.tooltips.addSLBonus(slBonus, game.i18n.localize('CHAT.TestModifiers.DefendingLarger'))
            }
        }
    }

    _computeTargets(target)
    {
        let properties = this.item.properties;

        // Prefill dialog according to qualities/flaws
        if (properties.qualities.accurate) 
        {
            this.fields.modifier += 10;
            this.tooltips.addModifier(10, game.i18n.localize("PROPERTY.Accurate"))
        }

        if (properties.qualities.precise) 
        {
            this.fields.successBonus += 1;
            this.tooltips.addSuccessBonus(1, game.i18n.localize("PROPERTY.Precise"))

        }
        if (properties.flaws.imprecise) 
        {
            this.fields.slBonus -= 1;
            this.tooltips.addSLBonus(-1, game.i18n.localize("PROPERTY.Imprecise"))
        }

          
        if (this.item.attackType == "ranged" && target.actor.statuses.has("engaged"))
        {
            this.fields.modifier -= 20;
            this.tooltips.addModifier(-20, game.i18n.localize("EFFECT.ShootingAtEngagedTarget"));
            this.options.engagedModifier = -20;
        }


        let sizeDiff = this.actor.sizeNum - target.actor.sizeNum
        let sizeModifier = 0
        // Attacking a larger creature with melee
        if (sizeDiff < 0 && (this.item.attackType == "melee" || target.actor.sizeNum <= 3)) 
        {
          sizeModifier += 10;
          this.tooltips.addModifier(10, game.i18n.localize('CHAT.TestModifiers.AttackingLarger'));
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

          this.fields.modifier += sizeModifier
          this.options.sizeModifier = sizeModifier

          if (sizeModifier) 
          {
            const text = (game.i18n.format('CHAT.TestModifiers.ShootingSizeModifier', { size: game.wfrp4e.config.actorSizes[target.actor.details.size.value] }))
            this.tooltips.addModifier(sizeModifier, text)
          }
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
                this.tooltips.addModifier(20, game.i18n.localize('CHAT.TestModifiers.AttackerMountLarger'));
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
                    this.tooltips.addModifier(0, `${game.i18n.localize('CHAT.TestModifiers.IgnoreDefenderMountLarger')}`);
                }
                else 
                {
                    this.tooltips.addModifier(-10, game.i18n.localize('CHAT.TestModifiers.DefenderMountLarger'));
                    this.fields.modifier -= 10;
                }
            }
        }
    }
}