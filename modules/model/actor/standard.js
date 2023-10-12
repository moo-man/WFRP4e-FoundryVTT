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

    updateChecks(data, options) {
        super.updateChecks(data, options);

        if (options.deltaWounds) {
            this.parent._displayScrollingChange(options.deltaWounds > 0 ? "+" + options.deltaWounds : options.deltaWounds);
        }
        if (options.deltaAdv) {
            this.parent._displayScrollingChange(options.deltaAdv, { advantage: true });
        }

        return this.checkWounds()
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
        this.computeEncumbranceMax(items, flags);
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
    computeSize(items, flags)
    {
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

    computeMount() {
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

                    if (this.flags.autoCalcWalk)
                        this.details.move.walk = mount.details.move.walk;

                    if (this.flags.autoCalcRun)
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

