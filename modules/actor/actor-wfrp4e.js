import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP_Audio from "../system/audio-wfrp4e.js";
import CharacteristicDialog from "../apps/roll-dialog/characteristic-dialog.js";
import SkillDialog from "../apps/roll-dialog/skill-dialog.js";
import WeaponDialog from "../apps/roll-dialog/weapon-dialog.js";
import CastDialog from "../apps/roll-dialog/cast-dialog.js";
import ChannellingDialog from "../apps/roll-dialog/channelling-dialog.js";
import TraitDialog from "../apps/roll-dialog/trait-dialog.js";
import PrayerDialog from "../apps/roll-dialog/prayer-dialog.js";
import ActiveEffectWFRP4e from "../system/effect-wfrp4e.js";

/**
 * Provides the main Actor data computation and organization.
 *
 * ActorWFRP4e contains all the preparation data and methods used for preparing an actor:
 * going through each Owned Item, preparing them for display based on characteristics.
 * Additionally, it handles all the different types of roll requests, setting up the
 * test dialog, how each test is displayed, etc.
 *
 * @extends Actor
 * @mixes WarhammerActor
 * @category - Documents
 *
 * @see   ActorSheetWFRP4e - Base sheet class
 * @see   ActorSheetWFRP4eCharacter - Character sheet class
 * @see   ActorSheetWFRP4eNPC - NPC sheet class
 * @see   ActorSheetWFRP4eCreature - Creature sheet class
 * @see   ChatWFRP4e - Sends test data to roll tests.
 */
export default class ActorWFRP4e extends WarhammerActor
{

  _itemTags = null;
  /**
   *
   * Set initial actor data based on type
   * 
   * @param {Object} data        Barebones actor data which this function adds onto.
   * @param {Object} options     (Unused) Additional options which customize the creation workflow.
   *
   */
  async _preCreate(data, options, user) {

    let migration = game.wfrp4e.migration.migrateActorData(this)
    this.updateSource({ effects: game.wfrp4e.migration.removeLoreEffects(data) }, { recursive: false });

    if (!foundry.utils.isEmpty(migration)) {
      this.updateSource(migration)
      warhammer.utility.log("Migrating Actor: " + this.name, true, migration)
    }

    await super._preCreate(data, options, user)
    let preCreateData = {}

    if (!data.items?.length && !options.skipItems && this.type != "vehicle")
      preCreateData.items = await this.system.getInitialItems(this.type != "character");
    else
      preCreateData.items = this.items.map(i => foundry.utils.mergeObject(i.toObject(), game.wfrp4e.migration.migrateItemData(i), { overwrite: true }))

    if (data.effects?.length)
      preCreateData.effects = this.effects.map(i => foundry.utils.mergeObject(i.toObject(), game.wfrp4e.migration.migrateEffectData(i), { overwrite: true }))

    this.updateSource(preCreateData)
  }


  async _onUpdate(data, options, user) {
    await super._onUpdate(data, options, user);

    if (options.deltaWounds > 0)
    {
      TokenHelpers.displayScrollingText("+" + options.deltaWounds, this, {fill: "0x00FF00", direction : CONST.TEXT_ANCHOR_POINTS.TOP});
    }
    else if (options.deltaWounds < 0)
    {
      TokenHelpers.displayScrollingText(options.deltaWounds, this, {fill: "0xFF0000", direction : CONST.TEXT_ANCHOR_POINTS.BOTTOM});
    }

    if (options.deltaAdv > 0)
    {
      TokenHelpers.displayScrollingText("+" + options.deltaAdv, this, {fill: "0x6666FF", direction : CONST.TEXT_ANCHOR_POINTS.TOP});
    }
    else if (options.deltaAdv < 0)
    {
      TokenHelpers.displayScrollingText(options.deltaAdv, this, {fill: "0x6666FF", direction : CONST.TEXT_ANCHOR_POINTS.BOTTOM});
    }
  }

  _onUpdateDescendantDocuments(...args)
  {
      super._onUpdateDescendantDocuments(...args);
      // If an owned item (trait specifically) is disabled, check auras
      if (args[1] == "items" && args[3].some(update => (foundry.utils.hasProperty(update, "system.disabled"))))
      {
          TokenHelpers.updateAuras(this.getActiveTokens()[0]?.document);
      }
  }  

  prepareBaseData()
  {
      this._itemTags = null
      super.prepareBaseData();
  }

  
  /**
   * @override 
   */
  prepareDerivedData() {
    this.system.computeDerived()
  }


  //#region Rolling

  // Shared setup data for all different dialogs
  // Each dialog also has its own "setup" function
  _setupTest(dialogData, dialogClass)
  {
    dialogData.data.actor = this;
    dialogData.data.targets = [];
    dialogData.data.scripts = [];
    if (!dialogData.options.skipTargets)
    {
      dialogData.data.targets = Array.from(game.user.targets);
      dialogData.data.scripts = foundry.utils.deepClone((dialogData.data.targets 
        .map(t => t.actor)
        .filter(actor => actor)
        .reduce((prev, current) => prev.concat(current.getScripts("dialog", (s) => s.options?.targeter)), []) // Retrieve targets' targeter dialog effects
        .concat(this?.getScripts("dialog", (s) => !s.options?.targeter) // Don't use our own targeter dialog effects
        ))) || [];
    }
    else 
    {
      dialogData.data.scripts = this?.getScripts("dialog", (s) => !s.options?.targeter) // Don't use our own targeter dialog effects
    }




    dialogData.data.other = []; // Container for miscellaneous data that can be freely added onto

    if (dialogData.options.context) {
      if (typeof dialogData.options.context.general === "string")
        dialogData.options.context.general = [dialogData.options.context.general]
      if (typeof dialogData.options.context.success === "string")
        dialogData.options.context.success = [dialogData.options.context.success]
      if (typeof dialogData.options.context.failure === "string")
        dialogData.options.context.failure = [dialogData.options.context.failure]
    }

    if (dialogData.data.hitLoc)
    {
      dialogData.fields.hitLocation = dialogData.fields.hitLocation || "roll", // Default a WS or BS test to have hit location if not specified;
      dialogData.data.hitLocationTable = game.wfrp4e.tables.getHitLocTable(dialogData.data.targets[0]?.actor?.details?.hitLocationTable?.value || "hitloc");
    }
    else 
    {
      dialogData.fields.hitLocation = "none"
    }

    return dialogClass.setup(dialogData.fields, dialogData.data, dialogData.options)
  }

  /**
   * Setup a Characteristic Test.
   *
   * Characteristics tests are the simplest test, all that needs considering is the target number of the
   * characteristic being tested, and any modifiers the user enters.
   *
   * @param {String} characteristicId     The characteristic id (e.g. "ws") - id's can be found in config.js
   *
   */
  async setupCharacteristic(characteristic, options = {}) {
    let dialogData = {
      fields : options.fields || {},  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        characteristic,
        hitLoc : (characteristic == "ws" || characteristic == "bs") && !options.reload
      },    
      options : options || {}         // Application/optional properties
    }
    // TODO: handle abort
    return this._setupTest(dialogData, CharacteristicDialog)
  }

  /**
   * Setup a Skill Test.
   *
   * Skill tests are much like Characteristic Tests in their simplicity, just with another layer of modifiers (skill advances).
   * However, there is more complication if the skill is instead for an Income test, which adds computation after the roll is
   * completed.
   *
   * @param {Object} skill    The skill item being tested. Skill items contain the advancements and the base characteristic, see template.json for more information.
   * @param {bool}   income   Whether or not the skill is being tested to determine Income.
   */
  async setupSkill(skill, options = {}) {
    if (typeof (skill) === "string") {
      let skillName = skill
      skill = this.itemTags["skill"].find(sk => sk.name == skill)
      if (!skill)
      {
        // Skill not found, find later and use characteristic
        skill = {
          name : skillName,
          id : "unknown",
          characteristic : {
            key : ""
          }
        }
      }
    }

    let dialogData = {
      fields : options.fields || {},  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        skill,
        hitLoc : ((skill.characteristic.key == "ws" ||
                  skill.characteristic.key == "bs" ||
                  skill.name.includes(game.i18n.localize("NAME.Melee")) ||
                  skill.name.includes(game.i18n.localize("NAME.Ranged")))
                  && !options.reload)
      },    
      options : options || {}         // Application/optional properties
    }

    return this._setupTest(dialogData, SkillDialog)
  }

  /**
   * Setup a Weapon Test.
   *
   * Probably the most complicated type of Test, weapon tests' complexity comes from all the different
   * factors and variables of the different weapons available and how they might affect test results,
   * as well as ammo usage, the effects of using different skills etc.
   *
   * @param {Object} weapon   The weapon Item being used.
   * @param {bool}   event    The event that called this Test, used to determine if attack is melee or ranged.
   */
  async setupWeapon(weapon, options = {}) {

    let dialogData = {
      fields : options.fields || {},  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        weapon,
        hitLoc : true
      },    
      options : options || {}         // Application/optional properties
    }
    return this._setupTest(dialogData, WeaponDialog)
  }


  /**
   * Setup a Casting Test.
   *
   * Casting tests are more complicated due to the nature of spell miscasts, ingredients, etc. Whatever ingredient
   * is selected will automatically be used and negate one miscast. For the spell rolling logic, see ChatWFRP.rollCastTest
   * where all this data is passed to in order to calculate the roll result.
   *
   * @param {Object} spell    The spell Item being Casted. The spell item has information like CN, lore, and current ingredient ID
   *
   */
  async setupCast(spell, options = {}) {

    let dialogData = {
      fields : options.fields || {},  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        spell,
        hitLoc : !!spell.system.damage.value
      },    
      options : options || {}         // Application/optional properties
    }
    return this._setupTest(dialogData, CastDialog)
  }

  /**
   * Setup a Channelling Test.
   *
   * Channelling tests are more complicated due to the nature of spell miscasts, ingredients, etc. Whatever ingredient
   * is selected will automatically be used and mitigate miscasts. For the spell rolling logic, see ChatWFRP.rollChannellTest
   * where all this data is passed to in order to calculate the roll result.
   *
   * @param {Object} spell    The spell Item being Channelled. The spell item has information like CN, lore, and current ingredient ID
   * This spell SL will then be updated accordingly.
   *
   */
  async setupChannell(spell, options = {}) {

    let dialogData = {
      fields : options.fields || {},  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        spell,
        hitLoc : false
      },    
      options : options || {}         // Application/optional properties
    }
    return this._setupTest(dialogData, ChannellingDialog)
  }

  /**
   * Setup a Prayer Test.
   *
   * Prayer tests are fairly simple, with the main complexity coming from sin and wrath of the gods,
   * the logic of which can be found in ChatWFRP.rollPrayerTest, where all this data here is passed
   * to in order to calculate the roll result.
   *
   * @param {Object} prayer    The prayer Item being used, compared to spells, not much information
   * from the prayer itself is needed.
   */
  async setupPrayer(prayer, options = {}) {

    let dialogData = {
      fields : options.fields || {},  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        prayer,
        hitLoc : (prayer.damage.value || prayer.damage.dice || prayer.damage.addSL)
      },    
      options : options || {}         // Application/optional properties
    }
    return this._setupTest(dialogData, PrayerDialog)
  }

  /**
   * Setup a Trait Test.
   *
   * Some traits are rollable, and so are assigned a rollable characteristic, this is where
   * rolling those characteristics is setup. Additonally, sometimes these traits have a
   * "Bonus characteristic" which in most all cases means what characteristic bonus to add
   * to determine damage. See the logic in traitTest.
   *
   * @param {Object} trait   The trait Item being used, containing which characteristic/bonus characteristic to use
   */
  async setupTrait(trait, options = {}) {

    let dialogData = {
      fields : options.fields || {},  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        trait,
        hitLoc : (trait.system.rollable.rollCharacteristic == "ws" || trait.system.rollable.rollCharacteristic == "bs")
      },    
      options : options || {}         // Application/optional properties
    }

    return this._setupTest(dialogData, TraitDialog) 
    //   deadeyeShot : this.has(game.i18n.localize("NAME.DeadeyeShot"), "talent") && weapon.attackType == "ranged"
  }

  setupItem(id, options={})
  {
    let item = this.items.get(id);
    switch(item?.type)
    {
      case "skill":
        return this.setupSkill(item, options);
      case "weapon":
        return this.setupWeapon(item, options);
      case "trait":
        return this.setupTrait(item, options);
      case "spell":
        return this.setupCast(item, options);
      case "prayer":
        return this.setupPrayer(item, optionts);
    }
  }


  async setupExtendedTest(item, options = {}) {

    let defaultRollMode = item.hide.test || item.hide.progress ? "gmroll" : "roll"

    if (item.SL.target <= 0)
      return ui.notifications.error(game.i18n.localize("ExtendedError1"))

    options.extended = item.uuid;
    options.rollMode = defaultRollMode;
    options.hitLocation = false;
    options.fields = {difficulty : item.system.difficulty.value || "challenging"}

    let characteristic = warhammer.utility.findKey(item.test.value, game.wfrp4e.config.characteristics)
    if (characteristic) {
      let test = await this.setupCharacteristic(characteristic, options);
      await test.roll();
    }
    else {
      let skill = this.itemTags["skill"].find(i => i.name == item.test.value)
      if (skill) {
        let test = await this.setupSkill(skill, options);
        await test.roll();
      } 
      else {
        ui.notifications.error(`${game.i18n.format("ExtendedError2", { name: item.test.value })}`)
      }
    }
  }


  async rollReloadTest(weapon) {
    let testId = weapon.getFlag("wfrp4e", "reloading")
    let extendedTest = weapon.actor.items.get(testId)
    if (!extendedTest) {

      //ui.notifications.error(game.i18n.localize("ITEM.ReloadError"))
      await this.checkReloadExtendedTest(weapon, this.actor);
      return
    }
    await this.setupExtendedTest(extendedTest, { reload: true, weapon, appendTitle: " - " + game.i18n.localize("ITEM.Reloading") });
  }


  /**
   * Deprecated - only used for compatibility with existing effects
   * As shown in the functions, just call `roll()` on the test object to compute the tests
   */
  async basicTest(test, options = {}) {
    if (test.testData)
      return ui.notifications.warn(game.i18n.localize("WARNING.ActorTest"))
    await test.roll();
    return test;
  }
  async weaponTest(test, options = {}) {
    if (test.testData)
      return ui.notifications.warn(game.i18n.localize("WARNING.ActorTest"))
    await test.roll();
    return test;
  }
  async castTest(test, options = {}) {
    if (test.testData)
      return ui.notifications.warn(game.i18n.localize("WARNING.ActorTest"))
    await test.roll()
    return test;
  }
  async channelTest(test, options = {}) {
    if (test.testData)
      return ui.notifications.warn(game.i18n.localize("WARNING.ActorTest"))
    await test.roll()
    return test;
  }
  async prayerTest(test, options = {}) {
    if (test.testData)
      return ui.notifications.warn(game.i18n.localize("WARNING.ActorTest"))
    await test.roll()
    return test;
  }
  async traitTest(test, options = {}) {
    if (test.testData)
      return ui.notifications.warn(game.i18n.localize("WARNING.ActorTest"))
    await test.roll()
    return test;
  }

  //#endregion



  /**
 * Adds all missing basic skills to the Actor.
 *
 * This function will add all mising basic skills, used when an Actor is created (see create())
 * as well as from the right click menu from the Actor directory.
 *
 */
  async addBasicSkills() {
    let ownedBasicSkills = this.itemTags["skill"].filter(i => i.advanced.value == "bsc");
    let allBasicSkills = await WFRP_Utility.allBasicSkills()

    // Filter allBasicSkills with ownedBasicSkills, resulting in all the missing skills
    let skillsToAdd = allBasicSkills.filter(s => !ownedBasicSkills.find(ownedSkill => ownedSkill.name == s.name))

    // Add those missing basic skills
    this.createEmbeddedDocuments("Item", skillsToAdd);
  }

  /**
   * Apply damage to an actor, taking into account armor, size, and weapons.
   *
   * applyDamage() is typically called at the end of an oppposed tests, where you can
   * right click the chat message and apply damage. This function goes through the
   * process of calculating and reducing damage if needede based on armor, toughness,
   * size, armor qualities/flaws, and weapon qualities/flaws
   *
   * @param {Object} victim       id of actor taking damage
   * @param {Object} opposedData  Test results, all the information needed to calculate damage
   * @param {var}    damageType   enum for what the damage ignores, see config.js
   */
  async applyDamage(opposedTest, damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL) {
    if (!opposedTest.result.damage)
      return `<b>Error</b>: ${game.i18n.localize("CHAT.DamageAppliedError")}`
    // If no damage value, don't attempt anything
    if (!opposedTest.result.damage.value)
      return game.i18n.localize("CHAT.DamageAppliedErrorTiring");
    // Get actor/tokens for those in the opposed test
    let actor = this
    let attacker = opposedTest.attacker
    let soundContext = { item: {}, action: "hit" };

    // Start wound loss at the damage value
    let totalWoundLoss = opposedTest.result.damage.value
    let newWounds = actor.status.wounds.value;
    let applyAP = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let applyTB = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let AP = foundry.utils.deepClone(actor.status.armour[opposedTest.result.hitloc.value]);
    let ward = actor.status.ward.value;
    let wardRoll = Math.ceil(CONFIG.Dice.randomUniform() * 10);
    let abort = false

    // Start message update string
    let updateMsg = `<b>${game.i18n.localize("CHAT.DamageApplied")}</b><span class = 'hide-option'>: `;

    let modifiers = {
      tb : 0,
      ap : {
        value : 0,
        used : 0,
        ignored : 0,
        metal : 0, // Not used here, but convenient for scripts
        nonmetal : 0, // Not used here, but convenient for scripts
        magical : 0, // Not used here, but convenient for scripts
        shield : 0,
        details : []
      },
      other : [], // array of {label : string, value : number, details : string},
      minimumOne : false // whether minimumOne was triggered (used for the tooltip)
    }
    let extraMessages = [];

    let weaponProperties = opposedTest.attackerTest.item?.properties || {}
    // If weapon is undamaging
    let undamaging = false;
    // If weapon has Hack
    let hack = false;
    // If weapon has Impale
    let impale = false;
    // If weapon has Penetrating
    let penetrating = false;

    let zzap = false;

    // if weapon has pummel - only used for audio
    let pummel = false

    let args = { actor, attacker, opposedTest, damageType, weaponProperties, applyAP, applyTB, totalWoundLoss, AP, modifiers, extraMessages, ward, wardRoll, abort}
    await Promise.all(actor.runScripts("preTakeDamage", args))
    await Promise.all(attacker.runScripts("preApplyDamage", args))
    await Promise.all(opposedTest.attackerTest.item?.runScripts("preApplyDamage", args))
    damageType = args.damageType
    applyAP = args.applyAP 
    applyTB = args.applyTB
    ward = args.ward
    abort = args.abort
    totalWoundLoss = args.totalWoundLoss

    if (abort)
    {
      return `${abort}`
    }

    let vehicleTBTooltip = "";
    // Reduce damage by TB
    if (applyTB) 
    {
      if (this.type == "vehicle" && attacker.type != "vehicle" && opposedTest.attackerTest.item?.system.isMelee)
      {
        let tbModifier = game.wfrp4e.config.vehicleActorSizeComparison[this.system.details.size.value][attacker.system.details.size.value]

        if (tbModifier > 0)
        {
          modifiers.tb += actor.characteristics.t.bonus * tbModifier
          vehicleTBTooltip = game.i18n.format("CHAT.VehicleTBTooltipMultiply", {number : tbModifier})
        }
        else if(tbModifier < 0)
        {
          vehicleTBTooltip = game.i18n.format("CHAT.VehicleTBTooltipSubtract", {number : Math.abs(tbModifier)})
          modifiers.tb += actor.characteristics.t.bonus + tbModifier
        }
        else return game.i18n.localize("CHAT.AttackerTooSmallDamage")
      }
      else 
      {
        modifiers.tb += actor.characteristics.t.bonus
      }
    }

    // Determine its qualities/flaws to be used for damage calculation
    penetrating = weaponProperties?.qualities?.penetrating
    undamaging = weaponProperties?.flaws?.undamaging && !opposedTest.result.damaging;
    hack = weaponProperties?.qualities?.hack
    impale = weaponProperties?.qualities?.impale
    pummel = weaponProperties?.qualities?.pummel
    zzap = weaponProperties?.qualities?.zzap
    
    // see if armor flaws should be triggered
    let ignorePartial = opposedTest.attackerTest.result.roll % 2 == 0 || opposedTest.attackerTest.result.critical
    let ignoreWeakpoints = opposedTest.attackerTest.result.critical && impale
    let zzapIgnored = zzap ? 1 : 0 // start zzap out at 1;

    // Mitigate damage with armor one layer at a time
    for (let layer of AP.layers) {
      modifiers.ap.value += layer.value;
      zzapIgnored = zzap ? 1 : 0 // start zzap out at 1

      if (ignoreWeakpoints && layer.weakpoints) {
        modifiers.ap.details.push(game.i18n.format("BREAKDOWN.Weakpoints", {ignored: layer.value, item: layer.source.name}))
        modifiers.ap.ignored += layer.value
        layer.ignored = true;
      }
      else if (ignorePartial && layer.partial) {
        modifiers.ap.details.push(game.i18n.format("BREAKDOWN.Partial", {ignored: layer.value, item: layer.source.name}))
        modifiers.ap.ignored += layer.value;
        layer.ignored = true;
      }
      else if (zzap && layer.metal) // ignore 1 AP and all metal AP 
      {
          zzapIgnored += layer.value;
          layer.ignored = true;
      }
      else if (penetrating && layer.source?.type == "armour") // If penetrating - ignore 1 or all armor depending on material
      {
        if (!game.settings.get("wfrp4e", "mooPenetrating"))
        {
          let penetratingIgnored = layer.metal ? 1 : layer.value
          modifiers.ap.details.push(game.i18n.format("BREAKDOWN.Penetrating", {ignored: penetratingIgnored, item: layer.source.name}))
          modifiers.ap.ignored += penetratingIgnored
          if (layer.metal)
          {
            modifiers.ap.metal += layer.value - 1
            if (layer.magical)
            {
              modifiers.ap.magical += layer.value - 1
            }
          }
          else 
          {
            layer.ignored = true;
          }
        }
      }
      else // If nothing is modifying or ignoring, record AP 
      {
        if (layer.metal)
        {
          modifiers.ap.metal += layer.value;
        }
        else 
        {
          modifiers.ap.nonmetal += layer.value;
        }

        if (layer.magical)
        {
          modifiers.ap.magical += layer.value;
        }
      }
      // if (opposedTest.attackerTest.result.roll % 2 != 0 && layer.impenetrable) {
      //   impenetrable = true;
      //   soundContext.outcome = "impenetrable"
      // }

      // Prioritize plate over chain over leather for sound
      if (layer.value) {
        if (layer.armourType == "plate")
          soundContext.item.armourType = layer.armourType
        else if (!soundContext.item.armourType || (soundContext.item.armourType && (soundContext.item.armourType.includes("leather")) && layer.armourType == "mail")) // set to chain if there isn't an armour type set yet, or the current armor type is leather
          soundContext.item.armourType = layer.armourType
        else if (!soundContext.item.armourType)
          soundContext.item.armourType = "leather"
      }
    }

    modifiers.ap.ignored += zzapIgnored
    if (zzapIgnored)
    {
      modifiers.ap.details.push(game.i18n.format("BREAKDOWN.Zzap", {ignored: zzapIgnored}))
    }

    //@HOUSE
    if (penetrating && game.settings.get("wfrp4e", "mooPenetrating")) 
    {
      game.wfrp4e.utility.logHomebrew("mooPenetrating")
      let penetratingIgnored = penetrating.value || 2
      modifiers.ap.details.push(game.i18n.format("BREAKDOWN.PenetratingMoo", {ignored: penetratingIgnored}))
      modifiers.ap.ignored += penetratingIgnored
    }
    //@/HOUSE

    // If using a shield, add that AP as well
    if (game.settings.get("wfrp4e", "uiaShields") && !opposedTest.defenderTest.context.unopposed) // UIA shields don't need to be used, just equipped
    {
      modifiers.ap.shield = this.status.armour.shield
    }
    else if (opposedTest.defenderTest.weapon) // RAW Shields required the shield to be used
    {
      if (opposedTest.defenderTest.weapon.properties.qualities.shield)
      {
        modifiers.ap.shield = this.status.armour.shield
      }
    }


    // Not really a comprehensive fix 
    if (modifiers.ap.shield && penetrating)
    {
        modifiers.ap.details.push(game.i18n.format("BREAKDOWN.Penetrating", {ignored: modifiers.ap.shield, item: "Shield"}))
        modifiers.ap.shield = 0;
    }
    
    //@HOUSE
    if (game.settings.get("wfrp4e", "mooShieldAP") && opposedTest.defenderTest.failed && modifiers.ap.shield) {
      game.wfrp4e.utility.logHomebrew("mooShieldAP")
      modifiers.ap.details.push(game.i18n.format("BREAKDOWN.ShieldMoo", {ignored: modifiers.ap.shield}))
      modifiers.ap.shield = 0;
    }
    //@/HOUSE

    await Promise.all(actor.runScripts("computeTakeDamageModifiers", args))
    await Promise.all(attacker.runScripts("computeApplyDamageModifiers", args))
    await Promise.all(opposedTest.attackerTest.item?.runScripts("computeApplyDamageModifiers", args))

    modifiers.ap.used = Math.max(0, modifiers.ap.value - modifiers.ap.ignored)
    if (undamaging && modifiers.ap.used)
    {
      modifiers.ap.details.push(game.i18n.format("BREAKDOWN.Undamaging", {originalAP: modifiers.ap.used, modifiedAP: modifiers.ap.used * 2}))
      modifiers.ap.used *= 2;
    }

    // Reduce damage done by AP
    if (!applyAP)
    {
      modifiers.ap.used = 0;
      modifiers.ap.shield = 0;
    }
    
    modifiers.total = -modifiers.tb - modifiers.ap.used - modifiers.ap.shield + modifiers.other.reduce((acc, current) => acc + current.value, 0)
    totalWoundLoss += modifiers.total

    // Minimum 1 wound if not undamaging
    if (!undamaging && totalWoundLoss <= 0)
    {
      args.modifiers.minimumOne = true;
      totalWoundLoss = totalWoundLoss <= 0 ? 1 : totalWoundLoss
    }
    else
    {
      totalWoundLoss = totalWoundLoss <= 0 ? 0 : totalWoundLoss
    }

    try {
      if (opposedTest.attackerTest.weapon.attackType == "melee") {
        if ((opposedTest.attackerTest.weapon.Qualities.concat(opposedTest.attackerTest.weapon.Flaws)).every(p => [game.i18n.localize("PROPERTY.Pummel"), game.i18n.localize("PROPERTY.Slow"), game.i18n.localize("PROPERTY.Damaging")].includes(p)))
          soundContext.outcome = "warhammer" // special sound for warhammer :^)
        else if (AP.used) {
          soundContext.item.type = "armour"
          if (applyAP && totalWoundLoss <= 1)
            soundContext.outcome = "blocked"
          else if (applyAP)
            soundContext.outcome = "normal"
          if (impenetrable)
            soundContext.outcome = "impenetrable"
          if (hack)
            soundContext.outcome = "hack"
        }
        else {
          soundContext.item.type = "hit"
          soundContext.outcome = "normal"
          if (impale || penetrating) {
            soundContext.outcome = "normal_slash"
          }
        }
      }
    }
    catch (e) { warhammer.utility.log("Sound Context Error: " + e, true) } // Ignore sound errors
    let scriptArgs = { actor, attacker, opposedTest, totalWoundLoss, AP, applyAP, applyTB, damageType, updateMsg, modifiers, ward, wardRoll, extraMessages, abort }
    await Promise.all(actor.runScripts("takeDamage", scriptArgs))
    await Promise.all(attacker.runScripts("applyDamage", scriptArgs))
    await Promise.all(opposedTest.attackerTest.item?.runScripts("applyDamage", scriptArgs))
    Hooks.call("wfrp4e:applyDamage", scriptArgs)
    ward = scriptArgs.ward
    abort = scriptArgs.abort
    totalWoundLoss = scriptArgs.totalWoundLoss

    if (abort)
    {
      return `${abort}`
    }

    newWounds -= totalWoundLoss
    updateMsg += "</span>"
    updateMsg += " " + totalWoundLoss;

    let tooltip = `<p><strong>${game.i18n.localize("Damage")}</strong>: ${opposedTest.result.damage.value}</p><hr>`

    if (modifiers.tb)
    {
      tooltip += `<p><strong>${game.i18n.localize("TBRed")}</strong>: -${modifiers.tb} ${vehicleTBTooltip ? `(${vehicleTBTooltip})` : ""}</p>`
    }

    if (!applyTB)
    {
      tooltip += `<p><strong>${game.i18n.localize("TBRed")}</strong>: ${game.i18n.localize("BREAKDOWN.Ignored")}</p>`
    }

    if (applyAP)
    {
      if (modifiers.ap.used != modifiers.ap.value)
      {
        tooltip += `<p><strong>${game.i18n.localize("AP")}</strong>: -${modifiers.ap.used}`
        if (modifiers.ap.ignored)
        {
          tooltip += ` (${modifiers.ap.ignored} ${game.i18n.localize("BREAKDOWN.Ignored").toLowerCase()})`
        }
        tooltip += "</p>"
      }
      else 
      {
        tooltip += `<p><strong>${game.i18n.localize("AP")}</strong>: -${modifiers.ap.used}</p>`
      }

      if (modifiers.ap.shield)
      {
        tooltip += `<p><strong>${game.i18n.localize("CHAT.DamageShield")}</strong>: -${modifiers.ap.shield}</p>`
      }

      if (modifiers.ap.details.length)
      {
        tooltip += `<p style='margin-left : 20px'>${modifiers.ap.details.join("</p><p style='margin-left : 20px'>")}</p>`
      }
    }
    else if (!applyAP)
    {
        tooltip += `<p><strong>${game.i18n.localize("AP")}</strong>: ${game.i18n.localize("BREAKDOWN.Ignored")}</p>`
    }

    if (modifiers.other.length)
    {
      tooltip += `<p>${modifiers.other.filter(i => i.value != 0).map(i => `<strong>${i.label}</strong>: ${i.details ? i.details : ""} (${(i.value > 0 ? "+" : "") + i.value})`).join("</p><p>")}</p>`
    }
    if (modifiers.minimumOne)
    {
      tooltip += `<p>${game.i18n.localize("BREAKDOWN.Minimum1")}</p>`;
    }
    tooltip += `<hr><p><strong>${game.i18n.localize("Wounds")}</strong>: ${totalWoundLoss}</p>`

    updateMsg += ` <a data-tooltip="${tooltip}" style="opacity: 0.5" data-tooltip-direction="LEFT"><i class="fa-solid fa-circle-info"></i></a>`

    WFRP_Audio.PlayContextAudio(soundContext)

    // If damage taken reduces wounds to 0, show Critical
    if (newWounds <= 0) {
      //WFRP_Audio.PlayContextAudio(opposedTest.attackerTest.weapon, {"type": "hit", "equip": "crit"})
      let critAmnt = game.settings.get("wfrp4e", "uiaCritsMod")
      if (game.settings.get("wfrp4e", "uiaCrits") && critAmnt && (Math.abs(newWounds)) > 0) {
        let critModifier = (Math.abs(newWounds)) * critAmnt;
        updateMsg += `<br><a class ="table-click critical-roll" data-modifier=${critModifier} data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")} +${critModifier}</a>`
      }
      //@HOUSE
      else if (game.settings.get("wfrp4e", "mooCritModifiers")) {
        game.wfrp4e.utility.logHomebrew("mooCritModifiers")
        let critModifier = (Math.abs(newWounds) - actor.characteristics.t.bonus) * critAmnt;
        if (critModifier)
          updateMsg += `<br><a class ="table-click critical-roll" data-modifier=${critModifier} data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")} ${critModifier > 0 ? "+" + critModifier : critModifier}</a>`
        else
          updateMsg += `<br><a class ="table-click critical-roll" data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")}</a>`
      }
      //@/HOUSE
      else if (Math.abs(newWounds) < actor.characteristics.t.bonus && !game.settings.get("wfrp4e", "uiaCrits"))
        updateMsg += `<br><a class ="table-click critical-roll" data-modifier="-20" data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")} (-20)</a>`
      else
        updateMsg += `<br><a class ="table-click critical-roll" data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")}</a>`
    }
    if (hack)
    {
      updateMsg += `<br><a class="apply-hack chat-button">${game.i18n.localize('CHAT.ApplyHack')}</a>`
    }

    if (newWounds <= 0)
      newWounds = 0; // Do not go below 0 wounds


    let item = opposedTest.attackerTest.item
    if (item?.properties && item?.properties.qualities.slash && updateMsg.includes("critical-roll"))
    {
      updateMsg += `<br>${game.i18n.format("PROPERTY.SlashAlert", {value : parseInt(item?.properties.qualities.slash.value)})}`
    }

    if (ward > 0) 
    {

      if (wardRoll >= ward) {
        updateMsg = `<span style = "text-decoration: line-through">${updateMsg}</span><br>${game.i18n.format("OPPOSED.Ward", { roll: wardRoll })}`
        return updateMsg;
      }
      else {
        updateMsg += `<br>${game.i18n.format("OPPOSED.WardRoll", { roll : wardRoll })}`
      }
    }

    if (extraMessages.length > 0)
    {
      updateMsg += `<p>${extraMessages.join(`</p><p>`)}</p>`
    }

    if (totalWoundLoss > 0)
    {
      let damageEffects = opposedTest.attackerTest?.damageEffects;
      let filtered = [];
      for(let effect of damageEffects)
      {
        if (await effect.runPreApplyScript())
        {
          filtered.push(effect);
        }
      }
      await actor.applyEffect({effectUuids: filtered.map(i => i.uuid), messageId : opposedTest.attackerTest.message.id});
    }

    // Update actor wound value
    actor.update({ "system.status.wounds.value": newWounds })

    return updateMsg;
  }



  /**
   * Unlike applyDamage(), which is for opposed damage calculation, this function just takes a number and damage type and applies the damage.
   * 
   * @param {Number} damage Amount of damage
   * @param {Object} options Type of damage, minimum 1
   */
  async applyBasicDamage(damage, { damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL, minimumOne = true, loc = "body", suppressMsg = false, hideDSN=false } = {}) 
  {
    let owningUser = getActiveDocumentOwner(this);

    if (owningUser?.id != game.user.id)
    {
        return SocketHandlers.executeOnOwnerAndWait(this, "applyDamage", {damage, options : {damageType, minimumOne, loc, suppressMsg, hideDSN}, actorUuid : this.uuid});
    }

    let newWounds = this.status.wounds.value;
    let modifiedDamage = damage;
    let applyAP = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let applyTB = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let msg = game.i18n.format("CHAT.ApplyDamageBasic", { name: this.prototypeToken.name });


    if (loc == "roll")
    {
      loc = (await game.wfrp4e.tables.rollTable("hitloc", {hideDSN})).result
    }

    if (applyAP) {
      modifiedDamage -= this.status.armour[loc].value
      msg += ` (${this.status.armour[loc].value} ${game.wfrp4e.config.locations[loc]} ${game.i18n.localize("AP")}`
      if (!applyTB)
        msg += ")"
      else
        msg += " + "
    }

    if (applyTB) {
      modifiedDamage -= this.characteristics.t.bonus;
      if (!applyAP)
        msg += " ("
      msg += `${this.characteristics.t.bonus} ${game.i18n.localize("TBRed")})`
    }

    if (minimumOne && modifiedDamage <= 0)
      modifiedDamage = 1;
    else if (modifiedDamage < 0)
      modifiedDamage = 0;

    msg = msg.replace("@DAMAGE", modifiedDamage)

    newWounds -= modifiedDamage
    if (newWounds < 0)
      newWounds = 0;
    await this.update({ "system.status.wounds.value": newWounds })

    if (!suppressMsg)
      await ChatMessage.create({ content: msg })
    return msg;
  }


  async corruptionDialog(strength) {
    const test = await Dialog.wait({
      title: game.i18n.localize("DIALOG.CorruptionTitle"),
      content: `<p>${game.i18n.format("DIALOG.CorruptionContent", { name: this.name })}</p>`,
      buttons: {
        endurance: {
          label: game.i18n.localize("NAME.Endurance"),
          callback: async () => {
            let skill = this.itemTags["skill"].find(i => i.name == game.i18n.localize("NAME.Endurance"))
            if (skill)
              return await this.setupSkill(skill, { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: skill.name }), corruption: strength, skipTargets: true })

            return await this.setupCharacteristic("t", { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: game.wfrp4e.config.characteristics["t"] }), corruption: strength, skipTargets : true })
          }
        },
        cool: {
          label: game.i18n.localize("NAME.Cool"),
          callback: async () => {
            let skill = this.itemTags["skill"].find(i => i.name == game.i18n.localize("NAME.Cool"))
            if (skill)
              return await this.setupSkill(skill, { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: skill.name }), corruption: strength, skipTargets: true })

            return await this.setupCharacteristic("wp", { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: game.wfrp4e.config.characteristics["wp"] }), corruption: strength, skipTargets : true })
          }
        }
      }
    });

    await test.roll();

    return test;
  }


  has(traitName, type = "trait") {
    return this.itemTags[type].find(i => i.name == traitName && i.included)
  }

  /**
   * Checks the status of reloading the provided weapon. If weapon is empty, create an extended test, if test is complete, deleted extended test and load weapon
   * 
   * 
   * @param {Item} weapon - Weapon whose reload status is being checked
   * @param {Actor} actor - Actor whose skills to use (pertinent for vehicles)
   * @returns 
   */
  async checkReloadExtendedTest(weapon, actor) {

    if (!weapon.loading)
      return

    actor = actor || this.actor;

    let reloadingTest = weapon.actor.items.get(weapon.getFlag("wfrp4e", "reloading"))

    if (weapon.loaded.amt > 0) {
      if (reloadingTest) {
        await reloadingTest.delete()
        await weapon.update({ "flags.wfrp4e.-=reloading": null })
        ui.notifications.notify(game.i18n.localize("ITEM.ReloadFinish"))
        return;
      }
    }
    else {
      let reloadExtendedTest = foundry.utils.duplicate(game.wfrp4e.config.systemItems.reload);

      reloadExtendedTest.name = game.i18n.format("ITEM.ReloadingWeapon", { weapon: weapon.name })
      if (weapon.system.getSkillToUse(actor))
        reloadExtendedTest.system.test.value = weapon.system.getSkillToUse(actor).name
      else
        reloadExtendedTest.system.test.value = game.i18n.localize("CHAR.BS")
      reloadExtendedTest.flags.wfrp4e.reloading = weapon.id

      reloadExtendedTest.system.SL.target = weapon.properties.flaws.reload?.value || 1

      if (weapon.actor.type == "vehicle") {
        let vehicleSpeaker
        if (weapon.actor.isToken)
          vehicleSpeaker = {
            token: weapon.actor.token.id,
            scene: weapon.actor.token.parent.id
          }
        else
          vehicleSpeaker = {
            actor: weapon.actor.id
          }
        reloadExtendedTest.flags.wfrp4e.vehicle = vehicleSpeaker
      }

      if (reloadingTest)
        await reloadingTest.delete()

      // use weapon.actor in case the weapon is owned by a vehicle
      let item = await weapon.actor.createEmbeddedDocuments("Item", [reloadExtendedTest]);
      ui.notifications.notify(game.i18n.format("ITEM.CreateReloadTest", { weapon: weapon.name }))
      await weapon.update({ "flags.wfrp4e.reloading": item[0].id });
    }
  }


  setAdvantage(val) {
    return this.update({ "system.status.advantage.value": val })
  }
  modifyAdvantage(val) {
    return this.setAdvantage(this.status.advantage.value + val)
  }

  setWounds(val) {
    return this.update({ "system.status.wounds.value": val })
  }
  modifyWounds(val) {
    return this.setWounds(this.status.wounds.value + val)
  }

  get isMounted() {
    return this.system.isMounted
  }

  get mount() {
    return this.system.mount;

  }

  async addCondition(effect, value = 1, mergeData={}) {
    if (value == 0)
    {
      return;
    }
    if (typeof value == "string")
    {
      value = parseInt(value)
    }

    if (typeof (effect) === "string")
      effect = foundry.utils.duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"


    let existing = this.hasCondition(effect.id)

    if (existing && !existing.isNumberedCondition)
      return existing
    else if (existing) 
    {
      existing._displayScrollingStatus(true)
      return existing.update({"system.condition.value" : existing.conditionValue + value})
    }
    else if (!existing) {
      if (game.combat && (effect.id == "blinded" || effect.id == "deafened"))
      {
        foundry.utils.setProperty(effect, "flags.wfrp4e.roundReceived", game.combat.round);
      }
      effect.name = game.i18n.localize(effect.name);

      if (effect.system.condition.numbered)
        effect.system.condition.value = value;
        
      effect["statuses"] = [effect.id];
      if (effect.id == "dead")
        effect["flags.core.overlay"] = true;
      if (effect.id == "unconscious")
        await this.addCondition("prone")

      foundry.utils.mergeObject(effect, mergeData, {overwrite: false});

      if (effect.system.condition.numbered)
      {
        foundry.utils.setProperty(effect, "flags.core.overlay", false); // Don't let numeric conditions be overlay
      }

      delete effect.id
      return this.createEmbeddedDocuments("ActiveEffect", [effect], {condition: true})
    }
  }

  async removeCondition(effect, value = 1) {
    if (typeof (effect) === "string")
      effect = foundry.utils.duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"

    if (value == 0)
    {
      return;
    }
    if (typeof value == "string")
    {
      value = parseInt(value)
    }

    let existing = this.hasCondition(effect.id);

    if (existing && !existing.isNumberedCondition) {
      if (effect.id == "unconscious")
        await this.addCondition("fatigued");
      return existing.delete();
    }
    else if (existing) {
      await existing.update({"system.condition.value" : existing.conditionValue - value});
      if (existing.conditionValue) // Only display if there's still a condition value (if it's 0, already handled by effect deletion)
        existing._displayScrollingStatus(false);
      //                                                                                                                   Only add fatigued after stunned if not already fatigued
      if (existing.conditionValue == 0 && (effect.id == "bleeding" || effect.id == "poisoned" || effect.id == "broken" || (effect.id == "stunned" && !this.hasCondition("fatigued")))) {
        if (!game.settings.get("wfrp4e", "mooConditions") || !effect.id == "broken") // Homebrew rule prevents broken from causing fatigue
          await this.addCondition("fatigued")
      }

      if (existing.conditionValue <= 0)
        return existing.delete();
    }
  }

  applyFear(value, name = undefined) {
    value = value || 0
    let fear = foundry.utils.duplicate(game.wfrp4e.config.systemItems.fear)
    fear.system.SL.target = value;

    foundry.utils.setProperty(fear, "flags.wfrp4e.fearName", name)

    return this.createEmbeddedDocuments("Item", [fear], {condition: true}).then(items => {
      this.setupExtendedTest(items[0], {appendTitle : ` - ${items[0].name}`});
    });
  }


  async applyTerror(value, name = undefined) {
    value = value || 1
    let terror = foundry.utils.duplicate(game.wfrp4e.config.systemItems.terror)
    foundry.utils.setProperty(terror, "flags.wfrp4e.terrorValue", value);
    let scripts = new ActiveEffectWFRP4e(terror, {parent: this}).scripts;
    for (let s of scripts) {
      await s.execute({ actor: this });
    }
  }

  async checkSystemEffects() {
    if (game.user.id != getActiveDocumentOwner(this)?.id)
    {
      return
    }
    let encumbrance = this.status.encumbrance.state
    let state

    if (encumbrance > 3) {
      state = "enc3"
      if (!this.hasSystemEffect(state)) {
        await this.addSystemEffect(state)
        return
      }
      await this.removeSystemEffect("enc2")
      await this.removeSystemEffect("enc1")
    }
    else if (encumbrance > 2) {
      state = "enc2"
      if (!this.hasSystemEffect(state)) {
        await this.addSystemEffect(state)
        return
      }
      await this.removeSystemEffect("enc1")
      await this.removeSystemEffect("enc3")
    }
    else if (encumbrance > 1) {
      state = "enc1"
      if (!this.hasSystemEffect(state)) {
        await this.addSystemEffect(state)
        return
      }
      await this.removeSystemEffect("enc2")
      await this.removeSystemEffect("enc3")
    }
    else {
      await this.removeSystemEffect("enc1")
      await this.removeSystemEffect("enc2")
      await this.removeSystemEffect("enc3")
    }

  }


  async addSystemEffect(key) {
    let systemEffects = game.wfrp4e.utility.getSystemEffects(this.type == "vehicle")
    let effect = systemEffects[key];
    if (effect) {
      await this.createEmbeddedDocuments("ActiveEffect", [effect])
    }
  }

  async removeSystemEffect(key) {
    let effects = this.effects.filter(e => e.statuses.has(key))
    if (effects.length)
      await this.deleteEmbeddedDocuments("ActiveEffect", effects.map(i => i.id))
  }

  hasSystemEffect(key) {
    return this.hasCondition(key) // Same function so just reuse
  }

  async clearOpposed() {
    return (await this.update({ "flags.-=oppose": null }));
  }

  get itemTags() {
    if (!this._itemTags) 
    {
      let tags = new Set(game.documentTypes.Item);
      let items = this.items.contents;
      for (const item of items) 
      {
        tags = tags.union(item.system.tags);
      }
      this._itemTags = tags.toObject().reduce((obj, tag) => 
      {
        obj[tag] = items.filter(i => i.system.tags.has(tag))
        return obj;
      }, {})
    }

    return this._itemTags;
  }

  // @@@@@@@@ BOOLEAN GETTERS

  get inCollection() {
    return game.actors && game.actors.get(this.id)
  }

  get hasSpells() {
    return !!this.itemTags["spell"].length > 0
  }

  get hasPrayers() {
    return !!this.itemTags["prayer"].length > 0
  }

  get noOffhand() {
    return !this.itemTags["weapon"].find(i => i.offhand.value)
  }

  get isOpposing() {
    return !!this.flags.oppose
  }

  get mainArmLoc() 
  {
    return (this.system.details.mainHand || "r") + "Arm"
  }

  get secondaryArmLoc() 
  {
    return (this.system.details.mainHand == "r" ? "l" : "r") + "Arm"
  }

  /**
   * When a test is rolled, it may roll "rArm" or "lArm" 
   * However, a test doesn't necessarily know who it's attacking, so this
   * actually means "primary" and "secondary" arm respectively.
   * 
   * This function makes the conversion. If a character's main arm is their left, and a test
   * rolled "rArm" as the hit location, that actually means they hit the left arm, as "rArm" means
   * main arm, and their main arm is left
   * 
   * @param {string} hitloc "rArm" or "lArm"
   */
  convertHitLoc(hitloc)
  {
    if (hitloc == "rArm")
    {
      return this.mainArmLoc
    }
    else if (hitloc == "lArm")
    {
      return this.secondaryArmLoc;
    }
    return hitloc
  }


  speakerData(token) {
    if (this.isToken || token) {
      return {
        token: token?.id || this.token.id,
        scene: token?.parent.id || this.token.parent.id
      }
    }
    else {
      return {
        actor: this.id,
        token: token?.id,
        scene: token?.parent.id
      }
    }
  }

  // async _buildEmbedHTML(config, options={}) {
  //   if (this.system.toEmbed)
  //   {
  //     return this.system.toEmbed(config, options)
  //   }
  // }

  // @@@@@@@@@@@ COMPUTED GETTERS @@@@@@@@@
  get Species() {
    let species = game.wfrp4e.config.species[this.details.species.value] || this.details.species.value
    if (this.details.species.subspecies && game.wfrp4e.config.subspecies[this.details.species.value] && game.wfrp4e.config.subspecies[this.details.species.value][this.details.species.subspecies])
      species += ` (${game.wfrp4e.config.subspecies[this.details.species.value][this.details.species.subspecies].name})`
    else if (this.details.species.subspecies)
      species += ` (${this.details.species.subspecies})`

    return species
  }

  get sizeNum() {
    return game.wfrp4e.config.actorSizeNums[this.details.size.value]
  }

  get equipPointsUsed() {
    return this.items
      .filter(item => item.system.isEquippable)
      .reduce((prev, current) => {
          if (current.system.isEquipped)
            prev += current.system.equipPoints;
          return prev;
        }, 0);
  }

  get equipPointsAvailable() {
    return Number.isNumeric(this.flags.equipPoints) ? this.flags.equipPoints : 2
  }

  get currentCareer() {
    return this.system.currentCareer
  }

  get attacker() {
    try {
      if (this.flags.oppose) {
        let opposeMessage = game.messages.get(this.flags.oppose.opposeMessageId) // Retrieve attacker's test result message
        let handler = opposeMessage.system.opposedHandler;
        let attackerMessage = handler.attackerMessage
        // Organize attacker/defender data
        if (opposeMessage)
          return {
            speaker: attackerMessage.speaker,
            test: attackerMessage.system.test,
            messageId: attackerMessage.id,
            img: WFRP_Utility.getSpeaker(attackerMessage.speaker).img
          };
        else
          this.update({ "flags.-=oppose": null })
      }
    }
    catch (e) {
      console.error("Error finding attacker, removing flags." + e)
      this.update({ "flags.-=oppose": null })
    }

  }

  // Filter out disabled traits
  get auraEffects() 
  {
      return this.items.filter(i => i.type != "trait" || !i.system.disabled).reduce((acc, item) => acc.concat(item.effects.contents), []).concat(this.effects.contents).filter(e => e.system.transferData.type == "aura" && !e.system.transferData.area.aura.transferred).filter(i => i.active);
  }


  // Used with Group Advantage
  // Actor is considered in the "Players" group if it is owned by a player or has a Friendly token disposition
  // Otherwise, it is considered in the "Enemies" group
  get advantageGroup() {
    if (this.hasPlayerOwner)
      return "players"
    else if (this.token)
      return this.token.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY ? "players" : "enemies"
    else 
      return this.prototypeToken.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY ? "players" : "enemies"
  }

  // @@@@@@@@@@@ DATA GETTERS @@@@@@@@@@@@@
  get characteristics() { return this.system.characteristics }
  get status() { return this.system.status }
  get details() { return this.system.details }
  get excludedTraits() { return this.system.excludedTraits }
  get roles() { return this.system.roles }

  // @@@@@@@@@@ DERIVED DATA GETTERS
  get armour() { return this.status.armour }
}
