import { BaseActorModel } from "./base";
import { CharacteristicsModel } from "./components/characteristics";
import { StandardStatusModel } from "./components/status";
import { StandardDetailsModel } from "./components/details";
import WFRP_Utility from "../../system/utility-wfrp4e";
import Advancement from "../../system/advancement";
let fields = foundry.data.fields;

/**
 * Represents actors that have characteristics and skills
 * Encompasses player characters and NPCs
 */
export class StandardActorModel extends BaseActorModel {
    static preventItemTypes = ["vehicleMod", "vehicleRole", "vehicleTest"];

    static metadata = Object.freeze(foundry.utils.mergeObject(super.metadata, {
        isStandard: true
    }, {inplace: false}));

    static LOCALIZATION_PREFIXES = ["WH.Models.standard"];


    static defineSchema() {
        let schema = super.defineSchema();
        schema.characteristics = new fields.EmbeddedDataField(CharacteristicsModel);
        schema.status = new fields.EmbeddedDataField(StandardStatusModel);
        schema.details = new fields.EmbeddedDataField(StandardDetailsModel);
        schema.settings = new fields.SchemaField({
            equipPoints : new fields.NumberField({initial : 2}),
            autoCalc : new fields.SchemaField({
                run: new fields.BooleanField({initial : true}),
                walk: new fields.BooleanField({initial : true}),
                wounds: new fields.BooleanField({initial : true}),
                criticals: new fields.BooleanField({initial : true}),
                corruption: new fields.BooleanField({initial : true}),
                encumbrance: new fields.BooleanField({initial : true}),
                size: new fields.BooleanField({initial : true})
            })
        })
        return schema;
    }

    static get compendiumBrowserFilters() {
        return new Map([
            ...Array.from(super.compendiumBrowserFilters),
            ...Array.from(StandardDetailsModel.compendiumBrowserDetailsFilters),
        ]);
    }

    async _preCreate(data, options, user) {
        await super._preCreate(data, options, user);
    }

    async _preUpdate(data, options, user) {
        await super._preUpdate(data, options, user);

        // Treat the custom default token as a true default token
        // If you change the actor image from the default token, it will automatically set the same image to be the token image
        if (this.prototypeToken?.texture?.src == "systems/wfrp4e/tokens/unknown.png" && data.img) 
        {
            data["prototypeToken.texture.src"] = data.img;
        }

        await this._handleGroupAdvantage(data, options)
        this._handleWoundsUpdate(data, options)
        this._handleAdvantageUpdate(data, options)

    }

    /**
     * @return {ItemWFRP4e|undefined}
     */
    get canFly() {
        return this.parent.has(game.i18n.localize("NAME.Flight"));
    }

    /**
     * @return {boolean}
     */
    get canSwim() {
        return (this.parent.has(game.i18n.localize("NAME.Swim"), "skill") || this.parent.has(game.i18n.localize("NAME.Amphibious")));
    }

    /**
     * @return {boolean}
     */
    get canCrawl() {
        return true;
    }

    /**
     * @return {boolean}
     */
    get canClimb() {
        return true;
    }

    /**
     * @return {{walk: number[], swim: number[], climb: number[], crawl: number, fly: number}}
     */
    get movementDistance() {
        const value = this.details.move.value;
        const walk = [this.details.move.walk, this.details.move.run];

        return {
            walk,
            swim: this.parent.has(game.i18n.localize("NAME.Amphibious")) ? walk : walk.map(v => v * 0.5),
            climb: walk.map(v => v * 0.5),
            crawl: value * 0.5,
            fly: this.canFly?.system.specification.value || 0,
        }
    }

    itemIsAllowed(item) {
        let allowed = super.itemIsAllowed(item);

        // Prevent vehicle traits
        if (allowed && item.type == "trait")
        {
            allowed = allowed && item.system.category == "standard";
            if (!allowed)
            {
                ui.notifications.error("ERROR.VehicleTraitsOnStandard", {localize : true});
                return false;
            }
        }
        return allowed
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
        this.status.encumbrance.current = this.status.encumbrance.current.toFixed(2);
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
        flags.useless = {};

        this.runScripts("prePrepareData", { actor: this.parent })
    }

    computeDerived() {
        this.runScripts("prePrepareItems", {actor : this.parent })
        // Recompute bonuses as active effects may have changed it
        this.computeTemplates()
        this.characteristics.compute();
        this.computeItems();
        super.computeDerived();
        this.runScripts("computeCharacteristics", this.parent);
        this.computeSize();
        if (this.checkWounds())
        {
            return;
        }
        this.computeAdvantage();
        this.computeMove();
        this.computeEncumbranceMax();
        this.runScripts("computeEncumbrance", this.parent);
        this.computeEncumbranceState();
        this.computeArmour();
        this.computeMount()

        if (game.actors && this.parent.inCollection) // Only check system effects if past this: isn't an on-load prepareData and the actor is in the world (can be updated)
            this.parent.checkSystemEffects()

        this.runScripts("prepareData", { actor: this.parent })

    }

    computeTemplates()
    {
        let templates = this.parent.itemTypes.template
        for(let t of templates)
        {
            for(let c in this.characteristics)
            {
                this.characteristics[c].modifier += t.system.characteristics[c]
            }
        }
    }

    computeAdvantage() {
        if (!game.settings.get("wfrp4e", "useGroupAdvantage")) {
            if (game.settings.get("wfrp4e", "capAdvantageIB")) {
                this.status.advantage.max = this.characteristics.i.bonus
                this.status.advantage.value = Math.clamped(this.status.advantage.value, 0, this.status.advantage.max)
            }
            else
                this.status.advantage.max = game.settings.get("wfrp4e", "advantagemax");
        }
    }


    computeMove() {
        // Auto calculation values - only calculate if user has not opted to enter ther own values
        if (this.autoCalc.walk)
            this.details.move.walk = Number(this.details.move.value) * 2;

        if (this.autoCalc.run)
            this.details.move.run = Number(this.details.move.value) * 4;

    }
    computeSize() {
        let items = this.parent.itemTypes;
        // Find size based on Traits/Talents
        let size;
        let trait = items.trait.find(i => i.name == game.i18n.localize("NAME.Size") && i.system.enabled)
        if (trait)
            size = warhammer.utility.findKey(trait.specification.value, game.wfrp4e.config.actorSizes);
        if (!size) // Could not find specialization
        {
            let smallTalent = items.talent.find(i => i.name == game.i18n.localize("NAME.Small"))
            if (smallTalent)
                size = "sml";
            else
                size = "avg";
        }

        let args = { size }
        this.runScripts("calculateSize", args)

        // If the size has been changed since the last known value, update the value 
        this.details.size.value = args.size || "avg"
    }

    computeEncumbranceMax() {
        if (this.autoCalc.encumbrance) {
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

        this.runScripts("preAPCalc", args);

        this.parent.itemTags["armour"].filter(a => a.isEquipped).forEach(a => this.status.addArmourItem(a))
        this.parent.itemTags["weapon"].filter(i => i.properties.qualities.shield && i.isEquipped).forEach(i => this.status.addShieldItem(i))
        
        this.runScripts("APCalc", args);
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

        // Easy to reference bonuses
        let sb = this.characteristics.s.bonus + (this.characteristics.s.calculationBonusModifier || 0);
        let tb = this.characteristics.t.bonus + (this.characteristics.t.calculationBonusModifier || 0);
        let wpb = this.characteristics.wp.bonus + (this.characteristics.wp.calculationBonusModifier || 0);
        let multiplier = {
            sb: 0,
            tb: 0,
            wpb: 0,
        }

        if (this.autoCalc.criticals)
            this.status.criticalWounds.max = tb;

        let effectArgs = { sb, tb, wpb, multiplier, actor: this.parent }
        this.runScripts("preWoundCalc", effectArgs);
        ({ sb, tb, wpb } = effectArgs);

        let wounds = this.status.wounds.max;

        if (this.autoCalc.wounds) {
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
        this.runScripts("woundCalc", effectArgs);
        wounds = effectArgs.wounds;
        return wounds
    }

    checkWounds(force=false) {
        if (this.autoCalc.wounds || force) {
            let newMaxWounds = this.computeWounds()
            let updateCurrentWounds = this.status.wounds.value == this.status.wounds.max;

            if (this.status.wounds.max != newMaxWounds) // If change detected, reassign max and current wounds only if current == max
             {
                if (this.parent.compendium || !game.actors || !this.parent.inCollection) // Initial setup, don't send update
                {
                  this.status.wounds.max = newMaxWounds;
                  if (updateCurrentWounds)
                  {
                    this.status.wounds.value = newMaxWounds;
                  }   
                }
                else
                {
                    if (game.user.id == getActiveDocumentOwner(this.parent)?.id) 
                    {
                        this.parent.update({ 
                            "system.status.wounds.max": newMaxWounds, 
                            "system.status.wounds.value": updateCurrentWounds ? newMaxWounds : this.status.wounds.value }) // Only update current if unwounded
                    }
                }
            }
        }
    }


    async _handleGroupAdvantage(data, options) {
        if (!options.skipGroupAdvantage && foundry.utils.hasProperty(options.changed, "system.status.advantage.value") && game.settings.get("wfrp4e", "useGroupAdvantage")) {
            let combatant = game.combat?.getCombatantByActor(this.parent);

            if (!combatant) {
                ui.notifications.notify(game.i18n.localize("GroupAdvantageNoCombatant"))
            }
            // Don't send groupAdvantage updates if this update is from group advantage
            else if (!options.fromGroupAdvantage) {
                await WFRP_Utility.updateGroupAdvantage({ [`${this.parent.advantageGroup}`]: data.system.status.advantage.value })
                delete data.system.status.advantage.value; // Don't use this advantage update, as updating group advantage does it for us. This prevents a duplicate scrolling number on the token
            }
        }
    }

    _handleWoundsUpdate(data, options) {
        // Prevent wounds from exceeding max
        if (foundry.utils.hasProperty(data, "system.status.wounds.value")) {
            if (data.system.status.wounds.value > (foundry.utils.getProperty(data, "system.status.wounds.max") || this.status.wounds.max)) {
                data.system.status.wounds.value = this.status.wounds.max;
            }

            options.deltaWounds = data.system.status.wounds.value - this.status.wounds.value;
        }
    }

    _handleAdvantageUpdate(data, options) {
        if (foundry.utils.hasProperty(data, "system.status.advantage.value")) 
        {
            if (!game.settings.get("wfrp4e", "useGroupAdvantage")) {
                let maxAdvantage
                if (game.settings.get("wfrp4e", "capAdvantageIB"))
                    maxAdvantage = this.characteristics.i.bonus;
                else
                    maxAdvantage = game.settings.get("wfrp4e", "advantagemax");

                if (data.system.status.advantage.value > maxAdvantage) {
                    data.system.status.advantage.value = this.status.advantage.max;
                }
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

                    if (this.autoCalc.walk)
                        this.details.move.walk = mount.details.move.walk;

                    if (this.autoCalc.run)
                        this.details.move.run = mount.details.move.run;
                }
            }
        }
    }

    
      /**
   * Returns items for new actors: money and skills
   */
  async getInitialItems(prompt=false) {

    let basicSkills = await WFRP_Utility.allBasicSkills() || [];
    let moneyItems = ((await WFRP_Utility.allMoneyItems()) || [])
      .map(m => { // Set money items to descending in value and set quantity to 0
        m.system.quantity.value= 0
        return m;
      })
      .sort((a, b) => (a.system.coinValue.value >= b.system.coinValue.value) ? -1 : 1)
      || [];

    if (!prompt)
    {
        return basicSkills.concat(moneyItems)
    }
    // If not a character, ask the user whether they want to add basic skills / money
    else
    {
        if (await foundry.applications.api.DialogV2.confirm({window : {title: game.i18n.localize("ACTOR.BasicSkillsTitle")}, content: `<p>${game.i18n.localize("ACTOR.BasicSkillsPrompt")}</p>`}))
        {
            return basicSkills.concat(moneyItems);
        }
        else 
        {
            return []
        }
    }
  }

    getOtherEffects() 
    {
        if (this.vehicle)
        {
            return super.getOtherEffects().concat(this.vehicle.system.crewEffects)
        }
        else return [];
    }

    get vehicle()
    {
        return game.actors.contents.find(i => i.type == "vehicle" && i.system.passengers.has(this.parent));
    }

    advance(career)
    {
        let adv = new Advancement(this.parent, career);
        adv.advance();
    }

    hasVehicleRole(role)
    {
        if (!this.vehicle)
        {
            return false;
        }
        else 
        {
            let passenger = this.vehicle.system.passengers.get(this.parent.id);
            return passenger.roles.some(r => r.name == role);
        }
    }

    get equipPointsUsed() {
        return this.parent.items
          .filter(item => item.system.isEquippable)
          .reduce((prev, current) => {
              if (current.system.isEquipped)
                prev += current.system.equipPoints;
              return prev;
            }, 0);
      }

    get isMounted() {
        return this.status.mount.mounted && this.status.mount.id
    }

    get autoCalc() {
        return this.settings.autoCalc;
    }

    get mount() {
        if (this.status.mount.isToken) {
            let scene = game.scenes.get(this.status.mount.tokenData.scene)
            if (canvas?.scene && canvas.scene.id != scene?.id)
            {
                return ui.notifications.error(game.i18n.localize("ErrorTokenMount"))
            }
            else if (!canvas?.scene)
            {
                return null;
            }
            let token = canvas.tokens.get(this.status.mount.tokenData.token)

            if (token)
                return token.actor
        }
        let mount = game.actors.get(this.status.mount.id)
        return mount
    }
}