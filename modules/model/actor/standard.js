import { BaseActorModel } from "./base";
import { CharacteristicsModel } from "./components/characteristics";
import { StandardStatusModel } from "./components/status";
import { StandardDetailsModel } from "./components/details";
let fields = foundry.data.fields;

/**
 * Represents actors that have characteristics and skills
 * Encompasses player characters and NPCs
 */
export class StandardActorModel extends BaseActorModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.characteristics = new fields.EmbeddedDataField(CharacteristicsModel);
        schema.status = new fields.EmbeddedDataField(StandardStatusModel);
        schema.details = new fields.EmbeddedDataField(StandardDetailsModel);
        return schema;
    }


    preCreateData(data, options) {
        let preCreateData = super.preCreateData(data, options);
        // Default auto calculation to true
        mergeObject(preCreateData, {
            "flags.autoCalcRun": data.flags?.autoCalcRun || true,
            "flags.autoCalcWalk": data.flags?.autoCalcWalk || true,
            "flags.autoCalcWounds": data.flags?.autoCalcWounds || true,
            "flags.autoCalcCritW": data.flags?.autoCalcCritW || true,
            "flags.autoCalcCorruption": data.flags?.autoCalcCorruption || true,
            "flags.autoCalcEnc": data.flags?.autoCalcEnc || true,
            "flags.autoCalcSize": data.flags?.autoCalcSize || true,
        });
        return preCreateData;
    }

    preUpdateChecks(data, options) {
        super.preUpdateChecks(data, options);

        // Treat the custom default token as a true default token
        // If you change the actor image from the default token, it will automatically set the same image to be the token image
        if (this.prototypeToken?.texture?.src == "systems/wfrp4e/tokens/unknown.png" && updateData.img) {
            updateData["prototypeToken.texture.src"] = updateData.img;
        }

        this._handleGroupAdvantage(data, options)
        this._handleWoundsUpdate(data, options)
        this._handleAdvantageUpdate(data, options)

    }

    async updateChecks(data, options) {
        await super.updateChecks(data, options);

        if (options.deltaWounds) {
            this.parent._displayScrollingChange(options.deltaWounds > 0 ? "+" + options.deltaWounds : options.deltaWounds);
        }
        if (options.deltaAdv) {
            this.parent._displayScrollingChange(options.deltaAdv, { advantage: true });
        }

        return this.checkWounds()
    }

    
    computeItems()
    {
        const inContainers = []; // inContainers is the temporary storage for items within a container
        for (let i of this.parent.items) {
            i.prepareOwnedData()
            
            if (i.location && i.location.value && i.type != "critical" && i.type != "injury") 
            {
                inContainers.push(i);
            }
            else if (i.encumbrance && i.type != "vehicleMod")
            {
                this.status.encumbrance.current += Number(i.encumbrance.value);
            }
        }
    }

    computeBase(items, flags) {
        super.computeBase();
        this.characteristics.compute();

        // TODO: Find alternative to this
        flags.meleeDamageIncrease = 0
        flags.rangedDamageIncrease = 0
        flags.robust = 0
        flags.resolute = 0
        flags.ambi = 0;

        this.runEffects("prePrepareData", { actor: this })
    }

    computeDerived(items, flags) {
        super.computeDerived(items);
        // Recompute bonuses as active effects may have changed it
        this.characteristics.compute();
        this.computeAdvantage(items, flags);
        this.computeMove(items, flags);
        this.computeSize(items, flags);
        this.computeWounds(items, flags);
        this.computeEncumbranceMax(items, flags);
        this.computeEncumbrance(items, flags);
        this.computeAP(items, flags);
        this.computeMount(flags)

        this.runEffects("prepareData", { actor: this })
    }

    computeAdvantage(items, flags) {
        if (!game.settings.get("wfrp4e", "useGroupAdvantage")) {
            if (game.settings.get("wfrp4e", "capAdvantageIB")) {
                this.status.advantage.max = this.characteristics.i.bonus
                this.status.advantage.value = Math.clamped(this.status.advantage.value, 0, this.status.advantage.max)
            }
            else
                this.status.advantage.max = 10;
        }
    }


    computeMove(items, flags) {
        // Auto calculation values - only calculate if user has not opted to enter ther own values
        if (flags.autoCalcWalk)
            this.details.move.walk = parseInt(this.move.value) * 2;

        if (flags.autoCalcRun)
            this.details.move.run = parseInt(this.move.value) * 4;

    }
    computeSize(items, flags) {
        // Find size based on Traits/Talents
        let size;
        let trait = items.trait.find(i => i.name == game.i18n.localize("NAME.Size"))
        if (trait)
            size = WFRP_Utility.findKey(trait.specification.value, game.wfrp4e.config.actorSizes);
        if (!size) // Could not find specialization
        {
            let smallTalent = items.talent.find(i => i.name == game.i18n.localize("NAME.Small"))
            if (smallTalent)
                size = "sml";
            else
                size = "avg";
        }

        let args = { size }
        this.runEffects("calculateSize", args)

        // If the size has been changed since the last known value, update the value 
        this.details.size.value = args.size || "avg"
    }

    computeEncumbranceMax(items, flags) {
        if (flags.autoCalcEnc) {
            this.status.encumbrance.max = this.characteristics.t.bonus + this.characteristics.s.bonus;

            // I don't really like hardcoding this TODO: put this in Large effect script?
            if (this.details.species.value.toLowerCase() == game.i18n.localize("NAME.Ogre").toLowerCase()) {
                this.status.encumbrance.max *= 2;
            }
        }
    }

    computeEncumbrance() {
        // TODO: Need to collect item encumbrances 
        this.status.encumbrance.current = this.status.encumbrance.current;
        this.status.encumbrance.state = this.status.encumbrance.current / this.status.encumbrance.max
    }


    computeAP() {
        const AP = {
            head: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Head"),
                show: true,
            },
            body: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Body"),
                show: true
            },
            rArm: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Left Arm"),
                show: true
            },
            lArm: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Right Arm"),
                show: true
            },
            rLeg: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Right Leg"),
                show: true

            },
            lLeg: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Left Leg"),
                show: true
            },
            shield: 0,
            shieldDamage: 0
        }

        let args = { AP }
        this.runEffects("preAPCalc", args);

        this.getItemTypes("armour").filter(a => a.isEquipped).forEach(a => a._addAPLayer(AP))

        this.getItemTypes("weapon").filter(i => i.properties.qualities.shield && i.isEquipped).forEach(i => {
            AP.shield += i.properties.qualities.shield.value - Math.max(0, i.damageToItem.shield - Number(i.properties.qualities.durable?.value || 0));
            AP.shieldDamage += i.damageToItem.shield;
        })

        this.runEffects("APCalc", args);

        this.status.armour = AP
    }


    /**
  * Calculates the wounds of an actor based on prepared items
  * 
  * Once all the item preparation is done (prepareItems()), we have a list of traits/talents to use that will
  * factor into Wonuds calculation. Namely: Hardy and Size traits. If we find these, they must be considered
  * in Wound calculation. 
  * 
  * @returns {Number} Max wound value calculated
  */
    computeWounds(items, flags) {
        // Easy to reference bonuses
        let sb = this.characteristics.s.bonus + (this.characteristics.s.calculationBonusModifier || 0);
        let tb = this.characteristics.t.bonus + (this.characteristics.t.calculationBonusModifier || 0);
        let wpb = this.characteristics.wp.bonus + (this.characteristics.wp.calculationBonusModifier || 0);
        let multiplier = {
            sb: 0,
            tb: 0,
            wpb: 0,
        }

        if (flags.autoCalcCritW)
            this.status.criticalWounds.max = tb;

        let effectArgs = { sb, tb, wpb, multiplier, actor: this }
        this.runEffects("preWoundCalc", effectArgs);
        ({ sb, tb, wpb } = effectArgs);

        let wounds = this.status.wounds.max;

        if (flags.autoCalcWounds) {
            switch (this.details.size.value) // Use the size to get the correct formula (size determined in prepare())
            {
                case "tiny":
                    wounds = 1 + tb * multiplier.tb + sb * multiplier.sb + wpb * multiplier.wpb;
                    break;

                case "ltl":
                    wounds = tb + tb * multiplier.tb + sb * multiplier.sb + wpb * multiplier.wpb;
                    break;

                case "sml":
                    wounds = 2 * tb + wpb + tb * multiplier.tb + sb * multiplier.sb + wpb * multiplier.wpb;
                    break;

                case "avg":
                    wounds = sb + 2 * tb + wpb + tb * multiplier.tb + sb * multiplier.sb + wpb * multiplier.wpb;
                    break;

                case "lrg":
                    wounds = 2 * (sb + 2 * tb + wpb + tb * multiplier.tb + sb * multiplier.sb + wpb * multiplier.wpb);
                    break;

                case "enor":
                    wounds = 4 * (sb + 2 * tb + wpb + tb * multiplier.tb + sb * multiplier.sb + wpb * multiplier.wpb);
                    break;

                case "mnst":
                    wounds = 8 * (sb + 2 * tb + wpb + tb * multiplier.tb + sb * multiplier.sb + wpb * multiplier.wpb);
                    break;
            }
        }

        effectArgs = { wounds, actor: this }
        this.runEffects("woundCalc", effectArgs);
        wounds = effectArgs.wounds;
        return wounds
    }

    checkWounds() {
        if (game.user.id != WFRP_Utility.getActorOwner(this)?.id) {
            return
        }
        if (this.parent.flags.autoCalcWounds) {
            let wounds = this._calculateWounds()

            if (this.status.wounds.max != wounds) // If change detected, reassign max and current wounds
            {
                // if (this.compendium || !game.actors || !this.inCollection) // Initial setup, don't send update
                // {
                //   this.status.wounds.max = wounds;
                //   this.status.wounds.value = wounds;
                // }
                // else
                if (this.parent.isOwner)
                    return { "system.status.wounds.max": wounds, "system.status.wounds.value": wounds };
            }
        }
    }


    _handleGroupAdvantage(data, options) {
        if (!options.skipGroupAdvantage && hasProperty(data, "system.status.advantage.value") && game.settings.get("wfrp4e", "useGroupAdvantage")) {
            let combatant = game.combat?.getCombatantByActor(this);

            if (!combatant) {
                ui.notifications.notify(game.i18n.localize("GroupAdvantageNoCombatant"))
            }
            // Don't send groupAdvantage updates if this update is from group advantage
            else if (!options.fromGroupAdvantage) {
                await WFRP_Utility.updateGroupAdvantage({ [`${this.parent.advantageGroup}`]: data.system.status.advantage.value })
            }
        }
    }

    _handleWoundsUpdate(data, options) {
        // Prevent wounds from exceeding max
        if (hasProperty(data, "system.status.wounds.value")) {
            if (data.system.status.wounds.value > this.status.wounds.max) {
                data.system.status.wounds.value = this.status.wounds.max;
            }

            options.deltaWounds = data.system.status.wounds.value - this.status.wounds.value;
        }
    }

    _handleAdvantageUpdate(data, options) {
        if (hasProperty(data, "system.status.advantage.value")) {
            if (data.system.status.advantage.value > this.status.advantage.max) {
                data.system.status.advantage.value = this.status.advantage.max;
            }

            options.deltaAdv = data.system.status.advantage.value - this.status.advantage.value;
        }
    }

    tokenSize() {
        let tokenSize = game.wfrp4e.config.tokenSizes[this.details.size.value];
        if (tokenSize < 1) {
            tokenData.texture = { scaleX: tokenSize, scaleY: tokenSize };
            tokenData.width = 1;
            tokenData.height = 1;
        }
        else {
            tokenData.height = tokenSize;
            tokenData.width = tokenSize;
        }
        return tokenData;
    }

    computeMount(flags) {
        if (this.isMounted && !game.actors) {
            game.wfrp4e.postReadyPrepare.push(this);
        }
        else if (this.isMounted && this.status.mount.isToken && !canvas) {
            game.wfrp4e.postReadyPrepare.push(this);
        }
        else if (this.isMounted) {
            let mount = this.mount

            if (mount) {
                if (mount.status.wounds.value == 0)
                    this.status.mount.mounted = false;
                else {

                    this.details.move.value = mount.details.move.value;

                    if (flags.autoCalcWalk)
                        this.details.move.walk = mount.details.move.walk;

                    if (flags.autoCalcRun)
                        this.details.move.run = mount.details.move.run;
                }
            }
        }
    }

    get isMounted() {
        return this.status.mount.mounted && this.status.mount.id
    }

    get mount() {
        if (this.status.mount.isToken) {
            let scene = game.scenes.get(this.status.mount.tokenData.scene)
            if (canvas.scene.id != scene?.id)
                return ui.notifications.error(game.i18n.localize("ErrorTokenMount"))

            let token = canvas.tokens.get(this.status.mount.tokenData.token)

            if (token)
                return token.actor
        }
        let mount = game.actors.get(this.status.mount.id)
        return mount
    }
}

