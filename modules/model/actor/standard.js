import { BaseActorModel } from "./base";
import { CharacteristicsModel } from "./components/characteristics";
import { StandardStatusModel } from "./components/status";
import { StandardDetailsModel } from "./components/details";
import WFRP_Utility from "../../system/utility-wfrp4e";
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
        mergeObject(preCreateData, this.checkWounds(true));
        return preCreateData;
    }

    async preUpdateChecks(data, options) {
        await super.preUpdateChecks(data, options);

        // Treat the custom default token as a true default token
        // If you change the actor image from the default token, it will automatically set the same image to be the token image
        if (this.prototypeToken?.texture?.src == "systems/wfrp4e/tokens/unknown.png" && updateData.img) {
            updateData["prototypeToken.texture.src"] = updateData.img;
        }

        await this._handleGroupAdvantage(data, options)
        this._handleWoundsUpdate(data, options)
        this._handleAdvantageUpdate(data, options)

    }

    updateChecks(data, options) {
        let update = super.updateChecks(data, options);

        if (options.deltaWounds) {
            this.parent._displayScrollingChange(options.deltaWounds > 0 ? "+" + options.deltaWounds : options.deltaWounds);
        }
        if (options.deltaAdv) {
            this.parent._displayScrollingChange(options.deltaAdv, { advantage: true });
        }

        // return mergeObject(update, this.checkWounds());
        return update;
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
                this.status.encumbrance.current += Number(i.encumbrance.total);
            }
        }
    }

    computeBase() {
        super.computeBase();
        this.characteristics.compute();

        let flags = this.parent.flags;
        // TODO: Find alternative to this
        flags.meleeDamageIncrease = 0
        flags.rangedDamageIncrease = 0
        flags.robust = 0
        flags.resolute = 0
        flags.ambi = 0;

        this.parent.runScripts("prePrepareData", { actor: this.parent })
    }

    computeDerived(items, flags) {
        this.parent.runScripts("prePrepareItems", {actor : this.parent })
        this.computeItems();
        super.computeDerived(items, flags);
        // Recompute bonuses as active effects may have changed it
        this.characteristics.compute();
        this.runScripts("computeCharacteristics", this.parent);
        if (this.checkWounds())
        {
            return;
        }
        this.computeAdvantage();
        this.computeMove();
        this.computeSize();
        this.computeEncumbranceMax();
        this.runScripts("computeEncumbrance", this.parent);
        this.computeEncumbranceState();
        this.computeArmour();
        this.computeMount()

        this.parent.runScripts("prepareData", { actor: this.parent })
    }

    computeAdvantage() {
        if (!game.settings.get("wfrp4e", "useGroupAdvantage")) {
            if (game.settings.get("wfrp4e", "capAdvantageIB")) {
                this.status.advantage.max = this.characteristics.i.bonus
                this.status.advantage.value = Math.clamped(this.status.advantage.value, 0, this.status.advantage.max)
            }
            else
                this.status.advantage.max = 10;
        }
    }


    computeMove() {
        let flags = this.parent.flags;
        // Auto calculation values - only calculate if user has not opted to enter ther own values
        if (flags.autoCalcWalk)
            this.details.move.walk = parseInt(this.details.move.value) * 2;

        if (flags.autoCalcRun)
            this.details.move.run = parseInt(this.details.move.value) * 4;

    }
    computeSize() {
        let items = this.parent.itemTypes;
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
        this.parent.runScripts("calculateSize", args)

        // If the size has been changed since the last known value, update the value 
        this.details.size.value = args.size || "avg"
    }

    computeEncumbranceMax() {
        let flags = this.parent.flags;
        if (flags.autoCalcEnc) {
            this.status.encumbrance.max = this.characteristics.t.bonus + this.characteristics.s.bonus;

            // I don't really like hardcoding this TODO: put this in Large effect script?
            if (this.details.species.value?.toLowerCase() == game.i18n.localize("NAME.Ogre").toLowerCase()) {
                this.status.encumbrance.max *= 2;
            }
        }
    }

    computeEncumbranceState() {
        this.status.encumbrance.current = this.status.encumbrance.current;
        this.status.encumbrance.state = this.status.encumbrance.current / this.status.encumbrance.max
    }


    computeArmour() {

        this.status.initializeArmour();
        
        let args = { AP : this.status.armour }

        this.parent.runScripts("preAPCalc", args);

        this.parent.getItemTypes("armour").filter(a => a.isEquipped).forEach(a => this.status.addArmourItem(a))
        this.parent.getItemTypes("weapon").filter(i => i.properties.qualities.shield && i.isEquipped).forEach(i => this.status.addShieldItem(i))
        
        this.parent.runScripts("APCalc", args);
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
    computeWounds() {
        let flags = this.parent.flags;

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

        let effectArgs = { sb, tb, wpb, multiplier, actor: this.parent }
        this.parent.runScripts("preWoundCalc", effectArgs);
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

        effectArgs = { wounds, actor: this.parent }
        this.parent.runScripts("woundCalc", effectArgs);
        wounds = effectArgs.wounds;
        return wounds
    }

    checkWounds(force=false) {
        if (game.user.id != WFRP_Utility.getActiveDocumentOwner(this.parent)?.id) {
            return
        }
        if (this.parent.flags.autoCalcWounds || force) {
            let wounds = this.computeWounds()

            if (this.status.wounds.max != wounds) // If change detected, reassign max and current wounds
            {
                if (this.parent.compendium || !game.actors || !this.parent.inCollection) // Initial setup, don't send update
                {
                  this.status.wounds.max = wounds;
                  this.status.wounds.value = wounds;
                }
                else
                {
                    this.parent.update({ "system.status.wounds.max": wounds, "system.status.wounds.value": wounds })
                }
            }
        }
    }


    async _handleGroupAdvantage(data, options) {
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
            if (data.system.status.wounds.value > (getProperty(data, "system.status.wounds.max") || this.status.wounds.max)) {
                data.system.status.wounds.value = this.status.wounds.max;
            }

            options.deltaWounds = data.system.status.wounds.value - this.status.wounds.value;
        }
    }

    _handleAdvantageUpdate(data, options) {
        if (hasProperty(data, "system.status.advantage.value")) 
        {
            let maxAdvantage
            if (game.settings.get("wfrp4e", "capAdvantageIB"))
                maxAdvantage = this.characteristics.i.bonus;
            else
                maxAdvantage = 10;

            if (data.system.status.advantage.value > maxAdvantage) {
                data.system.status.advantage.value = this.status.advantage.max;
            }

            options.deltaAdv = data.system.status.advantage.value - this.status.advantage.value;
        }
    }

    tokenSize() {
        let tokenData = {};
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

    computeMount() {
        let flags = this.parent.flags;

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

