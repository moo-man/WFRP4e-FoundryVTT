import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP_Audio from "../system/audio-wfrp4e.js";
import WFRP4eDocumentMixin from "./mixin.js"
import AreaHelpers from "../system/area-helpers.js";
import CharacteristicDialog from "../apps/roll-dialog/characteristic-dialog.js";
import SkillDialog from "../apps/roll-dialog/skill-dialog.js";
import WeaponDialog from "../apps/roll-dialog/weapon-dialog.js";
import CastDialog from "../apps/roll-dialog/cast-dialog.js";
import ChannellingDialog from "../apps/roll-dialog/channelling-dialog.js";
import TraitDialog from "../apps/roll-dialog/trait-dialog.js";
import PrayerDialog from "../apps/roll-dialog/prayer-dialog.js";
import EffectWfrp4e from "../system/effect-wfrp4e.js";
import ItemWfrp4e from "../item/item-wfrp4e.js";

/**
 * Provides the main Actor data computation and organization.
 *
 * ActorWfrp4e contains all the preparation data and methods used for preparing an actor:
 * going through each Owned Item, preparing them for display based on characteristics.
 * Additionally, it handles all the different types of roll requests, setting up the
 * test dialog, how each test is displayed, etc.
 *
 * @extends Actor
 * @mixes WFRP4eDocumentMixin
 * @category - Documents
 *
 * @see   ActorSheetWfrp4e - Base sheet class
 * @see   ActorSheetWfrp4eCharacter - Character sheet class
 * @see   ActorSheetWfrp4eNPC - NPC sheet class
 * @see   ActorSheetWfrp4eCreature - Creature sheet class
 * @see   ChatWFRP4e - Sends test data to roll tests.
 */
export default class ActorWfrp4e extends WFRP4eDocumentMixin(Actor)
{

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

    if (!isEmpty(migration)) {
      this.updateSource(migration)
      WFRP_Utility.log("Migrating Actor: " + this.name, true, migration)
    }

    await super._preCreate(data, options, user)
    let preCreateData = {}

    if (!data.items?.length && !options.skipItems)
      preCreateData.items = await this._getNewActorItems()
    else
      preCreateData.items = this.items.map(i => mergeObject(i.toObject(), game.wfrp4e.migration.migrateItemData(i), { overwrite: true }))

    if (data.effects?.length)
      preCreateData.effects = this.effects.map(i => mergeObject(i.toObject(), game.wfrp4e.migration.migrateEffectData(i), { overwrite: true }))

    this.updateSource(preCreateData)
  }


  async _onUpdate(data, options, user) {
    await super._onUpdate(data, options, user);

    if (options.deltaWounds) {
      this._displayScrollingChange(options.deltaWounds > 0 ? "+" + options.deltaWounds : options.deltaWounds);
    }
    if (options.deltaAdv) {
        this._displayScrollingChange(options.deltaAdv, { advantage: true });
    }

    if (game.user.id != user) 
    {
      return
    }
    await Promise.all(this.runScripts("update", {data, options, user}))
    // this.system.checkSize();
  }

  async _onCreate(data, options, user) {
    if (game.user.id != user) {
      return
    }

    await super._onCreate(data, options, user);
    // this.system.checkSize();
  }

  _onCreateDescendantDocuments(...args) {
    super._onCreateDescendantDocuments(...args);
    this._checkAuras(...args)
  }
  _onUpdateDescendantDocuments(...args) {
    super._onUpdateDescendantDocuments(...args);
    this.renderTokenAuras();
  }
  _onDeleteDescendantDocuments(...args) {
    super._onCreateDescendantDocuments(...args);
    this._checkAuras(...args)
  }

  _checkAuras(parent, collection, documents, data, options, userId)
  {
    let effects;
    if (collection == "items")
    {
      effects = documents.reduce((effects, item) => effects.concat(item.effects.contents), []);
    }
    else if (collection == "effects")
    {
      effects = documents;
    }

    // If an item (or targeted aura effect) is added or removed, need to refresh and rerender area effects
    if(effects.some(e => e.applicationData.type == "aura"))
    {
      this.renderTokenAuras();
      AreaHelpers.checkAreas();
    }
  }

  prepareBaseData() {
    this.propagateDataModels(this.system, "runScripts", this.runScripts.bind(this));
    this._itemTypes = null;
    this.system.computeBase()
  }

  prepareDerivedData() {
    this.system.computeDerived()

    //TODO Move prepare-updates to hooks?
    if (this.type != "vehicle") {
      if (game.actors && this.inCollection) // Only check system effects if past this: isn't an on-load prepareData and the actor is in the world (can be updated)
        this.checkSystemEffects()
    }
  }


  get conditions() {
    return this.effects.filter(e => e.isCondition)
  }

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
        .reduce((prev, current) => prev.concat(current.getScripts("dialog", (s) => s.options.dialog?.targeter)), []) // Retrieve targets' targeter dialog effects
        .concat(this?.getScripts("dialog", (s) => !s.options.dialog?.targeter) // Don't use our own targeter dialog effects
        ))) || [];
    }
    else 
    {
      dialogData.data.scripts = this?.getScripts("dialog", (s) => !s.options.dialog?.targeter) // Don't use our own targeter dialog effects
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
      skill = this.itemTypes["skill"].find(sk => sk.name == skill)
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
    // if (options.corruption)
    //   cardOptions.rollMode = "gmroll"
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


  async setupExtendedTest(item, options = {}) {

    let defaultRollMode = item.hide.test || item.hide.progress ? "gmroll" : "roll"

    if (item.SL.target <= 0)
      return ui.notifications.error(game.i18n.localize("ExtendedError1"))

    options.extended = item.id;
    options.rollMode = defaultRollMode;
    options.hitLocation = false;
    options.fields = {difficulty : item.system.difficulty.value || "challenging"}

    let characteristic = WFRP_Utility.findKey(item.test.value, game.wfrp4e.config.characteristics)
    if (characteristic) {
      let test = await this.setupCharacteristic(characteristic, options);
      await test.roll();
    }
    else {
      let skill = this.itemTypes["skill"].find(i => i.name == item.test.value)
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
    let extendedTest = this.items.get(testId)
    if (!extendedTest) {

      //ui.notifications.error(game.i18n.localize("ITEM.ReloadError"))
      await this.checkReloadExtendedTest(weapon);
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
    await test.roll({ async: true });
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
    await test.roll({ async: true })
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
    let ownedBasicSkills = this.itemTypes["skill"].filter(i => i.advanced.value == "bsc");
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
    let messageElements = [] // unused and deprecated

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

    // Reduce damage by TB
    if (applyTB) 
    {
      modifiers.tb += actor.characteristics.t.bonus
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
    if (penetrating && game.settings.get("wfrp4e", "mooPenetrating")) {
      game.wfrp4e.utility.logHomebrew("mooPenetrating")
      penetratingIgnored = penetrating.value || 2
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
    catch (e) { WFRP_Utility.log("Sound Context Error: " + e, true) } // Ignore sound errors

    let scriptArgs = { actor, opposedTest, totalWoundLoss, AP, applyAP, applyTB, damageType, updateMsg, messageElements, modifiers, ward, wardRoll, attacker, extraMessages, abort }
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
      tooltip += `<p><strong>${game.i18n.localize("TBRed")}</strong>: -${modifiers.tb}</p>`
      // label : game.i18n.localize("AP"),
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
      let damageEffects = opposedTest.attackerTest.item?.damageEffects;
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
    let owningUser = game.wfrp4e.utility.getActiveDocumentOwner(this);

    if (owningUser?.id != game.user.id)
    {
        return game.wfrp4e.socket.executeOnOwnerAndWait(this, "applyDamage", {damage, options : {damageType, minimumOne, loc, suppressMsg, hideDSN}, actorUuid : this.uuid});
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


  /**
   * Called by data model update checks
   */
  _displayScrollingChange(change, options = {}) {
    if (!change) return;
    change = Number(change);
    const tokens = this.getActiveTokens();
    for (let t of tokens) {
      canvas.interface?.createScrollingText(t.center, change.signedString(), {
        anchor: (change<0) ? CONST.TEXT_ANCHOR_POINTS.BOTTOM: CONST.TEXT_ANCHOR_POINTS.TOP,
        direction: (change<0) ? 1: 2,
        fontSize: 30,
        fill: options.advantage ? "0x6666FF" : change < 0 ? "0xFF0000" : "0x00FF00", // I regret nothing
        stroke: 0x000000,
        strokeThickness: 4,
        jitter: 0.25
      });
     }
  }


      // Handles applying effects to this actor, ensuring that the owner is the one to do so
    // This allows the owner of the document to roll tests and execute scripts, instead of the applying user
    // e.g. the players can actually test to avoid an effect, instead of the GM doing it
    async applyEffect({effectUuids=[], effectData=[], messageId}={})
    {
        let owningUser = game.wfrp4e.utility.getActiveDocumentOwner(this);

        if (typeof effectUuids == "string")
        {
            effectUuids = [effectUuids];
        }

        if (owningUser?.id == game.user.id)
        {
            for (let uuid of effectUuids)
            {
                let effect = await fromUuid(uuid);
                let message = game.messages.get(messageId);
                await ActiveEffect.implementation.create(effect.convertToApplied(message?.getTest()), {parent: this, message : message?.id});
            }
            for(let data of effectData)
            {
                await ActiveEffect.implementation.create(data, {parent: this, message : messageId});
            }
        }   
        else 
        {
            game.wfrp4e.socket.executeOnOwner(this, "applyEffect", {effectUuids, effectData, actorUuid : this.uuid, messageId});
        }
    }


  /* --------------------------------------------------------------------------------------------------------- */
  /* -------------------------------------- Auto-Advancement Functions --------------------------------------- */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * These functions are primarily for NPCs and Creatures and their automatic advancement capabilities. 
   *
  /* --------------------------------------------------------------------------------------------------------- */


  /**
   * Advances an actor's skills based on their species and character creation rules
   * 
    * Per character creation, 3 skills from your species list are advanced by 5, and 3 more are advanced by 3.
    * This functions uses the Foundry Roll class to randomly select skills from the list (defined in config.js)
    * and advance the first 3 selected by 5, and the second 3 selected by 3. This function uses the advanceSkill()
    * helper defined below.
   */
  async _advanceSpeciesSkills() {
    let skillList

    // A species may not be entered in the actor, so use some error handling.
    try {
      let { skills } = game.wfrp4e.utility.speciesSkillsTalents(this.details.species.value, this.details.species.subspecies)
      skillList = skills
      if (!skillList) {
        throw game.i18n.localize("ErrorSpeciesSkills") + " " + this.details.species.value;
      }
    }
    catch (error) {
      ui.notifications.info(`${game.i18n.format("ERROR.Species", { name: this.details.species.value })}`)
      WFRP_Utility.log("Could not find species " + this.details.species.value + ": " + error, true);
      throw error
    }
    // The Roll class used to randomly select skills
    let skillSelector = new Roll(`1d${skillList.length}- 1`);
    await skillSelector.roll()

    // Store selected skills
    let skillsSelected = [];
    while (skillsSelected.length < 6) {
      skillSelector = await skillSelector.reroll()
      if (!skillsSelected.includes(skillSelector.total)) // Do not push duplicates
        skillsSelected.push(skillSelector.total);
    }

    // Advance the first 3 by 5, advance the second 3 by 3.
    for (let skillIndex = 0; skillIndex < skillsSelected.length; skillIndex++) {
      if (skillIndex <= 2)
        await this._advanceSkill(skillList[skillsSelected[skillIndex]], 5)
      else
        await this._advanceSkill(skillList[skillsSelected[skillIndex]], 3)
    }
  }


  /**
   * Advances an actor's talents based on their species and character creation rules
   * 
   * Character creation rules for talents state that you get all talents in your species, but there
   * are a few where you must choose between two instead. See config.js for how the species talent 
   * object is set up for support in this. Basically species talents are an array of strings, however
   * ones that offer a choice is formatted as "<talent1>, <talent2>", each talent being a choice. Finally,
   * the last element of the talent list is a number denoting the number of random talents. This function uses
   * the advanceTalent() helper defined below.
   */
  async _advanceSpeciesTalents() {
    // A species may not be entered in the actor, so use some error handling.
    let talentList
    try {
      let { talents } = game.wfrp4e.utility.speciesSkillsTalents(this.details.species.value, this.details.species.subspecies)
      talentList = talents
      if (!talentList) {
      }
    }
    catch (error) {
      ui.notifications.info(`${game.i18n.format("ERROR.Species", { name: this.details.species.value })}`)
      WFRP_Utility.log("Could not find species " + this.details.species.value + ": " + error, true);
      throw error
    }
    let talentSelector;
    for (let talent of talentList) {
      if (!isNaN(talent)) // If is a number, roll on random talents
      {
        for (let i = 0; i < talent; i++) {
          let result = await game.wfrp4e.tables.rollTable("talents")
          await this._advanceTalent(result.object.text);
        }
        continue
      }
      // If there is a comma, talent.split() will yield an array of length > 1
      let talentOptions = talent.split(',').map(function (item) {
        return item.trim();
      });

      // Randomly choose a talent option and advance it.
      if (talentOptions.length > 1) {
        talentSelector = await new Roll(`1d${talentOptions.length} - 1`).roll()
        await this._advanceTalent(talentOptions[talentSelector.total])
      }
      else // If no option, simply advance the talent.
      {
        await this._advanceTalent(talent)
      }
    }

  }


  /**
   * Adds (if needed) and advances a skill by the specified amount.
   * 
   * As the name suggests, this function advances any given skill, if 
   * the actor does not currently have that skill, it will be added 
   * from the compendium and advanced. Note that this function is neither
   * used by manually advancing skills nor when clicking on advancement 
   * indicators. This will simply add the advancement value with no
   * other processing.
   * 
   * @param {String} skillName    Name of the skill to advance/add
   * @param {Number} advances     Advances to add to the skill
   */
  async _advanceSkill(skillName, advances) {
    // Look through items and determine if the actor has the skill
    let existingSkill = this.has(skillName, "skill")
    // If so, simply update the skill with the new advancement value. 
    if (existingSkill) {
      existingSkill = existingSkill.toObject();
      existingSkill.system.advances.value = (existingSkill.system.advances.value < advances) ? advances : existingSkill.system.advances.value;
      await this.updateEmbeddedDocuments("Item", [existingSkill]);
      return;
    }

    // If the actor does not already own skill, search through compendium and add it
    try {
      // See findSkill() for a detailed explanation of how it works
      // Advanced find function, returns the skill the user expects it to return, even with skills not included in the compendium (Lore (whatever))
      let skillToAdd = (await WFRP_Utility.findSkill(skillName)).toObject()
      skillToAdd.system.advances.value = advances;
      await this.createEmbeddedDocuments("Item", [skillToAdd]);
    }
    catch (error) {
      console.error("Something went wrong when adding skill " + skillName + ": " + error);
      ui.notifications.error(game.i18n.format("CAREER.AddSkillError", { skill: skillName, error: error }));
    }
  }

  /**
   * Adds the given talent to the actor
   * 
   * In my implementation, adding a talent is the same as advancing a talent. See
   * prepareTalent() and you'll see that the total number of any given talent is the
   * advencement value.
   * 
   * @param {String} talentName     Name of the talent to add/advance.
   */
  async _advanceTalent(talentName) {
    try {
      // See findTalent() for a detailed explanation of how it works
      // Advanced find function, returns the Talent the user expects it to return, even with Talents not included in the compendium (Etiquette (whatever))
      let talent = await WFRP_Utility.findTalent(talentName);
      await this.createEmbeddedDocuments("Item", [talent.toObject()]);
    }
    catch (error) {
      console.error("Something went wrong when adding talent " + talentName + ": " + error);
      ui.notifications.error(game.i18n.format("CAREER.AddTalentError", { talent: talentName, error: error }));
    }
  }

  /**
   * Advance NPC based on given career
   * 
   * A specialized function used by NPC type Actors that triggers when you click on a 
   * career to be "complete". This takes all the career data and uses it (and the helpers
   * defined above) to advance the actor accordingly. It adds all skills (advanced to the 
   * correct amount to be considered complete), advances all characteristics similarly, and 
   * adds all talents.
   * 
   * Note: This adds *all* skills and talents, which is not necessary to be considered complete.
   * However, I find deleting the ones you don't want to be much easier than trying to pick and 
   * choose the ones you do want.
   *
   * @param {Object} careerData     Career type Item to be used for advancement.
   * 
   */
  async advanceNPC(careerData) {
    let updateObj = {};
    let advancesNeeded = careerData.level.value * 5; // Tier 1 needs 5, 2 needs 10, 3 needs 15, 4 needs 20 in all characteristics and skills

    // Update all necessary characteristics to the advancesNeeded
    for (let advChar of careerData.characteristics)
      if (this.characteristics[advChar].advances < 5 * careerData.level.value)
        updateObj[`data.characteristics.${advChar}.advances`] = 5 * careerData.level.value;

    // Advance all skills in the career
    for (let skill of careerData.skills)
      await this._advanceSkill(skill, advancesNeeded);

    // Add all talents in the career
    for (let talent of careerData.talents)
      await this._advanceTalent(talent);

    this.update(updateObj);
  }


  _replaceData(formula) {
    let dataRgx = new RegExp(/@([a-z.0-9]+)/gi);
    return formula.replace(dataRgx, (match, term) => {
      let value = getProperty(this, term);
      return value ? String(value).trim() : "0";
    });
  }

  /**
   * Use a fortune point from the actor to reroll or add sl to a roll
   * @param {Object} message 
   * @param {String} type (reroll, addSL)
   */
  useFortuneOnRoll(message, type) {
    if (this.status.fortune.value > 0) {
      let test = message.getTest();
      let html = `<h3 class="center"><b>${game.i18n.localize("FORTUNE.Use")}</b></h3>`;
      //First we send a message to the chat
      if (type == "reroll")
        html += `${game.i18n.format("FORTUNE.UsageRerollText", { character: '<b>' + this.name + '</b>' })}<br>`;
      else
        html += `${game.i18n.format("FORTUNE.UsageAddSLText", { character: '<b>' + this.name + '</b>' })}<br>`;

      html += `<b>${game.i18n.localize("FORTUNE.PointsRemaining")} </b>${this.status.fortune.value - 1}`;
      ChatMessage.create(WFRP_Utility.chatDataSetup(html));

      // let cardOptions = this.preparePostRollAction(message);
      //Then we do the actual fortune action



      if (type == "reroll") {
        test.context.fortuneUsedReroll = true;
        test.context.fortuneUsedAddSL = true;
        test.reroll()

      }
      else //add SL
      {
        test.context.fortuneUsedAddSL = true;
        test.addSL(1)
      }
      this.update({ "system.status.fortune.value": this.status.fortune.value - 1 });
    }
  }

  /**
   * Take a Dark Deal to reroll for +1 Corruption
   * @param {Object} message 
   */
  useDarkDeal(message) {
    let html = `<h3 class="center"><b>${game.i18n.localize("DARKDEAL.Use")}</b></h3>`;
    html += `${game.i18n.format("DARKDEAL.UsageText", { character: '<b>' + this.name + '</b>' })}<br>`;
    let corruption = Math.trunc(this.status.corruption.value) + 1;
    html += `<b>${game.i18n.localize("Corruption")}: </b>${corruption}/${this.status.corruption.max}`;
    ChatMessage.create(WFRP_Utility.chatDataSetup(html));
    this.update({ "system.status.corruption.value": corruption });

    let test = message.getTest()
    test.reroll()
  }

  /**
   * This helper can be used to prepare chatOptions to reroll/edit a test card
   * It uses the informations of the roll located in the message entry
   * from game.messages
   * @param {Object} message 
   * @returns {Object} chatOptions
   */
  preparePostRollAction(message) {
    //recreate the initial (virgin) chatOptions object
    //add a flag for reroll limit
    let data = message.flags.data;
    let chatOptions = {
      flags: { img: message.flags.img },
      rollMode: data.rollMode,
      sound: message.sound,
      speaker: message.speaker,
      template: data.template,
      title: data.title.replace(` - ${game.i18n.localize("Opposed")}`, ""),
      user: message.user
    };
    if (data.attackerMessage)
      chatOptions.attackerMessage = data.attackerMessage;
    if (data.defenderMessage)
      chatOptions.defenderMessage = data.defenderMessage;
    if (data.unopposedStartMessage)
      chatOptions.unopposedStartMessage = data.unopposedStartMessage;
    return chatOptions;
  }


  async corruptionDialog(strength) {
    new Dialog({
      title: game.i18n.localize("DIALOG.CorruptionTitle"),
      content: `<p>${game.i18n.format("DIALOG.CorruptionContent", { name: this.name })}</p>`,
      buttons: {
        endurance: {
          label: game.i18n.localize("NAME.Endurance"),
          callback: () => {
            let skill = this.itemTypes["skill"].find(i => i.name == game.i18n.localize("NAME.Endurance"))
            if (skill) {
              this.setupSkill(skill, { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: skill.name }), corruption: strength, skipTargets: true }).then(test => test.roll())
            }
            else {
              this.setupCharacteristic("t", { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: game.wfrp4e.config.characteristics["t"] }), corruption: strength, skipTargets : true }).then(test => test.roll())
            }
          }
        },
        cool: {
          label: game.i18n.localize("NAME.Cool"),
          callback: () => {
            let skill = this.itemTypes["skill"].find(i => i.name == game.i18n.localize("NAME.Cool"))
            if (skill) {
              this.setupSkill(skill, { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: skill.name }), corruption: strength, skipTargets: true }).then(test => test.roll())
            }
            else {
              this.setupCharacteristic("wp", { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: game.wfrp4e.config.characteristics["wp"] }), corruption: strength, skipTargets : true }).then(test => test.roll())
            }
          }
        }

      }
    }).render(true)
  }


  has(traitName, type = "trait") {
    return this.itemTypes[type].find(i => i.name == traitName && i.included)
  }


  /**
 * Some effects applied to an actor are actually intended for items, but to make other things convenient
 * (like duration handling modules, or showing the effect icon on the token), they are given to an actor
 * 
 * Also as an unintended benefit it can be used to circumvent items being prepared twice (and thus their effects being applied twice)
 * 
 * @param {Item} item 
 */
  getEffectsApplyingToItem(item) {
    // Get effects that should be applied to item argument
    return this.effects.contents.filter(e => {
      if (e.disabled) {
        return false;
      }

      // An actor effects intended to apply to an item must have the itemTargets flag
      // Empty array => all items
      // No flag => Should not apply to items
      // Array with IDs => Apply only to those IDs
      let targeted = e.getFlag("wfrp4e", "itemTargets");
      if (targeted) {
        if (targeted.length) {
          return targeted.includes(item.id);
        }
        // If no items specified, apply to all items
        else {
          return true;
        }
      }
      else // If no itemTargets flag, it should not apply to items at all
      {
        return false;
      }

      // Create temporary effects that have the item as the parent, so the script context is correct
    }).map(i => new EffectWfrp4e(i.toObject(), { parent: item }));

  }

  /**
   * Same logic as getEffectsApplyingToItem, but reduce the effects to their scripts
   * 
   * @param {Item} item 
   */
  getScriptsApplyingToItem(item) {
    return this.getEffectsApplyingToItem(item).reduce((prev, current) => prev.concat(current.scripts), []);
  }


  /**
 * 
 * @param {Boolean} includeItemEffects Include Effects that are intended to be applied to Items, see getScriptsApplyingToItem, this does NOT mean effects that come from items
 */
  *allApplicableEffects(includeItemEffects = false) {

    for (const effect of this.effects) {
      if (effect.applicationData.documentType == "Item" && includeItemEffects) // Some effects are intended to modify items, but are placed on the actor for ease of tracking
      {
        yield effect;
      }
      else if (effect.applicationData.documentType == "Actor") // Normal effects (default documentType is actor)
      {
        yield effect;
      }
    }
    for (const item of this.items) {
      for (const effect of item.effects.contents.concat(item.system.getOtherEffects())) {
        // So I was relying on effect.transfer, which is computed in the effect's prepareData
        // However, apparently when you first load the world, that is computed after the actor
        // On subsequent data updates, it's computed before. I don't know if this is intentional
        // Regardless, we need to doublecheck whether this effect should transfer to the actor
        if (effect.determineTransfer()) {
          yield effect;
        }
      }
    }
  }

  /**
   * Decrements all injuries of this Actor
   *
   * @return {Promise<void>}
   */
  async decrementInjuries() {
    for (let i of this.injuries)
      await this.decrementInjury(i);
  }

  /**
   * Decrements a `duration` value for the Injury.
   * If `duration` reaches 0, inform about Injury being finished.
   *
   * @param {ItemWfrp4e}injury
   *
   * @return {Promise<*>}
   */
  async decrementInjury(injury) {
    if (isNaN(injury.system.duration.value))
      return ui.notifications.notify(game.i18n.format("CHAT.InjuryError", { injury: injury.name }))

    injury = foundry.utils.deepClone(injury);
    injury.system.duration.value--;

    if (injury.system.duration.value <= 0) {
      injury.system.duration.value = 0;
      let chatData = game.wfrp4e.utility.chatDataSetup(game.i18n.format("CHAT.InjuryFinish", { injury: injury.name }), "gmroll");
      chatData.speaker = { alias: this.name };
      ChatMessage.create(chatData);
    }

    await this.updateEmbeddedDocuments("Item", [injury]);
  }

  /**
   * Decrements all diseases of this Actor
   *
   * @return {Promise<void>}
   */
  async decrementDiseases() {
    const updates = [];

    for (let d of this.diseases)
      updates.push(await this.decrementDisease(d, false));

    await this.updateEmbeddedDocuments("Item", updates.filter(u => u !== null));
  }

  /**
   * Decrements a value for Disease's `incubation` or `duration` attribute, depending on whether it is active or not.
   * If value reaches 0, activates (if `incubation`), or finishes (if `duration`) the Disease.
   *
   * @param {ItemWfrp4e} disease  - disease Document to decrement and process
   * @param {boolean}    save     - whether disease should be updated here
   *
   * @return {Promise<ItemWfrp4e|null>}
   */
  async decrementDisease(disease, save = true) {
    let d = foundry.utils.deepClone(disease);
    let type = d.system.duration.active ? 'duration' : 'incubation';

    if (Number.isNumeric(d.system[type].value)) {
      d.system[type].value--;

      if (d.system[type].value <= 0) {
        d.system[type].value = 0;

        if (type === 'incubation')
          d = await this.activateDisease(d);

        if (type === 'duration')
          d = await this.finishDisease(d);
      }
    } else {
      let chatData = game.wfrp4e.utility.chatDataSetup(`Attempted to decrement ${d.name} ${type} but value is non-numeric`, "gmroll", false);
      chatData.speaker = {alias: this.name};
      ChatMessage.create(chatData);
    }

    if (d && save)
      await this.updateEmbeddedDocuments("Item", [d]);

    return d;
  }

  /**
   *
   * @param {ItemWfrp4e} disease
   *
   * @return {Promise<void>}
   */
  async activateDisease(disease) {
    disease.system.duration.active = true;
    disease.system.incubation.value = 0;
    let msg = game.i18n.format("CHAT.DiseaseIncubation", { disease: disease.name });

    try {
      let durationRoll = (await new Roll(disease.system.duration.value).roll()).total;
      msg += game.i18n.format("CHAT.DiseaseDuration", { duration: durationRoll, unit: disease.system.duration.unit });
      disease.system.duration.value = durationRoll;
    } catch (e) {
      msg += game.i18n.localize("CHAT.DiseaseDurationError");
    }

    let chatData = game.wfrp4e.utility.chatDataSetup(msg, "gmroll", false);
    chatData.speaker = { alias: this.name };
    ChatMessage.create(chatData);

    return disease;
  }

  /**
   * Finishes disease and handles Lingering symptoms.
   *
   * @param {ItemWfrp4e} disease
   *
   * @return {Promise<ItemWfrp4e|null>}
   */
  async finishDisease(disease) {
    let msg = game.i18n.format("CHAT.DiseaseFinish", { disease: disease.name });
    let removeDisease = true;
    const symptoms = disease.system.symptoms.value.toLowerCase();

    if (symptoms.includes(game.i18n.localize("NAME.Lingering").toLowerCase())) {
      let lingering = disease.effects.find(e => e.name.includes(game.i18n.localize("WFRP4E.Symptom.Lingering")));
      if (lingering) {
        let difficultyname = lingering.name.substring(lingering.name.indexOf("(") + 1, lingering.name.indexOf(")")).toLowerCase();
        let difficulty = game.wfrp4e.utility.findKey(difficultyname, game.wfrp4e.config.difficultyNames, { caseInsensitive: true }) || "challenging"
	  
        let test = await this.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle: ` - ${game.i18n.localize("NAME.Lingering")}`, fields: {difficulty : difficulty} }, {skipTargets: true});
        await test.roll();

        if (test.failed) {
          let negSL = Math.abs(test.result.SL);
          let lingeringDisease;

          if (negSL <= 1) {
            let roll = (await new Roll("1d10").roll()).total;
            msg += "<br>" + game.i18n.format("CHAT.LingeringExtended", { roll });
            removeDisease = false;
            disease.system.duration.value = roll;
          } else if (negSL <= 5) {
            msg += "<br>" + game.i18n.localize("CHAT.LingeringFestering");
            lingeringDisease = await fromUuid("Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb");
          } else if (negSL >= 6) {
            msg += "<br>" + game.i18n.localize("CHAT.LingeringRot");
            lingeringDisease = await fromUuid("Compendium.wfrp4e-core.items.M8XyRs9DN12XsFTQ");
          }

          if (lingeringDisease) {
            lingeringDisease = lingeringDisease.toObject();
            lingeringDisease.system.incubation.value = 0;
            lingeringDisease.system.duration.active = true;

            await this.createEmbeddedDocuments("Item", [lingeringDisease]);
          }
        }
      }
    }

    let chatData = game.wfrp4e.utility.chatDataSetup(msg, "gmroll", false);
    chatData.speaker = { alias: this.name };
    ChatMessage.create(chatData);

    if (removeDisease) {
      await this.deleteEmbeddedDocuments("Item", [disease._id])

      return null;
    }

    return disease;
  }

  async checkReloadExtendedTest(weapon) {

    if (!weapon.loading)
      return

    let reloadingTest = this.items.get(weapon.getFlag("wfrp4e", "reloading"))

    if (weapon.loaded.amt > 0) {
      if (reloadingTest) {
        await reloadingTest.delete()
        await weapon.update({ "flags.wfrp4e.-=reloading": null })
        ui.notifications.notify(game.i18n.localize("ITEM.ReloadFinish"))
        return;
      }
    }
    else {
      let reloadExtendedTest = duplicate(game.wfrp4e.config.systemItems.reload);

      reloadExtendedTest.name = game.i18n.format("ITEM.ReloadingWeapon", { weapon: weapon.name })
      if (weapon.skillToUse)
        reloadExtendedTest.system.test.value = weapon.skillToUse.name
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

      let item = await this.createEmbeddedDocuments("Item", [reloadExtendedTest]);
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


  showCharging(item) {
    if (item.attackType == "melee")
      return true
  }

  get isMounted() {
    return this.system.isMounted
  }

  get mount() {
    return this.system.mount;

  }

  showDualWielding(weapon) {
    if (!weapon.offhand.value && this.has(game.i18n.localize("NAME.DualWielder"), "talent")) {
      return !this.noOffhand
    }
    return false;
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
      effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"


    let existing = this.hasCondition(effect.id)

    if (existing && !existing.isNumberedCondition)
      return existing
    else if (existing) {
      existing._displayScrollingStatus(true)
      return existing.setFlag("wfrp4e", "value", existing.conditionValue + value)
    }
    else if (!existing) {
      if (game.combat && (effect.id == "blinded" || effect.id == "deafened"))
        effect.flags.wfrp4e.roundReceived = game.combat.round
      effect.name = game.i18n.localize(effect.name);

      if (Number.isNumeric(effect.flags.wfrp4e.value))
        effect.flags.wfrp4e.value = value;
        
      effect["statuses"] = [effect.id];
      if (effect.id == "dead")
        effect["flags.core.overlay"] = true;
      if (effect.id == "unconscious")
        await this.addCondition("prone")

      mergeObject(effect, mergeData);

      delete effect.id
      return this.createEmbeddedDocuments("ActiveEffect", [effect], {condition: true})
    }
  }

  async removeCondition(effect, value = 1) {
    if (typeof (effect) === "string")
      effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
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
      await existing.setFlag("wfrp4e", "value", existing.conditionValue - value);
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
    let fear = duplicate(game.wfrp4e.config.systemItems.fear)
    fear.system.SL.target = value;

    setProperty(fear, "flags.wfrp4e.fearName", name)

    return this.createEmbeddedDocuments("Item", [fear], {condition: true}).then(items => {
      this.setupExtendedTest(items[0], {appendTitle : ` - ${items[0].name}`});
    });
  }


  async applyTerror(value, name = undefined) {
    value = value || 1
    let terror = duplicate(game.wfrp4e.config.systemItems.terror)
    terror.flags.wfrp4e.terrorValue = value
    let scripts = new EffectWfrp4e(terror, {parent: this}).scripts;
    for (let s of scripts) {
      await s.execute({ actor: this });
    }
  }

  awardExp(amount, reason) {
    let experience = duplicate(this.details.experience)
    experience.total += amount
    experience.log.push({ reason, amount, spent: experience.spent, total: experience.total, type: "total" })
    this.update({ "system.details.experience": experience });
    ChatMessage.create({ content: game.i18n.format("CHAT.ExpReceived", { amount, reason }), speaker: { alias: this.name } })
  }

  _addToExpLog(amount, reason, newSpent, newTotal) {
    if (!newSpent)
      newSpent = this.details.experience.spent
    if (!newTotal)
      newTotal = this.details.experience.total

    let expLog = duplicate(this.details.experience.log || [])
    expLog.push({ amount, reason, spent: newSpent, total: newTotal, type: newSpent ? "spent" : "total" });
    return expLog
  }


  async checkSystemEffects() {
    if (game.user.id != WFRP_Utility.getActiveDocumentOwner(this)?.id)
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
    let systemEffects = game.wfrp4e.utility.getSystemEffects()
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


  /**
   * Creates a chat message with current conditions and penalties to an actor.
   * 
   * @param {String} tokenId  Token id to retrieve token from canvas
   * @param {Object} round    Round object to display round number
   */
  displayStatus(round = undefined, nameOverride) {
    if (round)
      round = game.i18n.format("CondRound", { round: round });

    let displayConditions = this.effects.map(e => {
      if (e.conditionKey && ! e.disabled) {
        return e.name + " " + (e.conditionValue || "")
      }
    }).filter(i => !!i)

    // Aggregate conditions to be easily displayed (bleeding4 and bleeding1 turns into Bleeding 5)

    let chatOptions = {
      rollMode: game.settings.get("core", "rollMode")
    };
    if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;
    chatOptions["template"] = "systems/wfrp4e/templates/chat/combat-status.hbs"

    let chatData = {
      name: nameOverride || (this.token ? this.token.name : this.prototypeToken.name),
      conditions: displayConditions,
      modifiers: this.flags.modifier,
      round: round
    }


    return renderTemplate(chatOptions.template, chatData).then(html => {
      chatOptions["user"] = game.user.id

      // Emit the HTML as a chat message
      chatOptions["content"] = html;
      chatOptions["type"] = 0;
      ChatMessage.create(chatOptions, false);
      return html;
    });
  }

  renderTokenAuras()
  {
    this.getActiveTokens().forEach(t => t.renderAuras());
  }

  /**
   * Returns items for new actors: money and skills
   */
  async _getNewActorItems() {

    let basicSkills = await WFRP_Utility.allBasicSkills() || [];
    let moneyItems = ((await WFRP_Utility.allMoneyItems()) || [])
      .map(m => { // Set money items to descending in value and set quantity to 0
        m.system.quantity.value= 0
        return m;
      })
      .sort((a, b) => (a.system.coinValue.value >= b.system.coinValue.value) ? -1 : 1)
      || [];

    // If character, automatically add basic skills and money items
    if (this.type == "character")
      return basicSkills.concat(moneyItems)

    // If not a character, ask the user whether they want to add basic skills / money
    else if (this.type == "npc" || this.type == "creature") {
      return new Promise(resolve => {
        new Dialog({
          title: game.i18n.localize("ACTOR.BasicSkillsTitle"),
          content: `<p>${game.i18n.localize("ACTOR.BasicSkillsPrompt")}</p>`,
          buttons: {
            yes: {
              label: game.i18n.localize("Yes"),
              callback: async dlg => {
                resolve(basicSkills.concat(moneyItems))
              }
            },
            no: {
              label: game.i18n.localize("No"),
              callback: async dlg => {
                resolve([])
              }
            },
          },
          default: 'yes'
        }).render(true);
      })
    }
    else return []
  }

  /**@deprecated in favor of just calling itemTypes */
  getItemTypes(type) {
    return this.itemTypes[type]
  }

  _itemTypes = null;

  get itemTypes()
  {
    if (!this._itemTypes)
    {
      this._itemTypes = super.itemTypes;
    }
    return this._itemTypes
  }

  async clearOpposed() {
    return (await this.update({ "flags.-=oppose": null }));
  }

  sameSideAs(actor)
  {
      let self = this.getActiveTokens()[0]?.document?.toObject() || this.prototypeToken;
      let target = actor.getActiveTokens()[0]?.document?.toObject() || actor.prototypeToken;
      if (this.hasPlayerOwner && actor.hasPlayerOwner) // If both are owned by players, probably the same side
      {
          return true;
      }
      else if (this.hasPlayerOwner) // If this actor is owned by a player, and the other is friendly, probably the same side
      {
          return target.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY; 
      }
      else if (actor.hasPlayerOwner) // If this actor is friendly, and the other is owned by a player, probably the same side
      {
          return self.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY;
      }
      else // If neither are owned by a player, only same side if they have the same disposition
      {
          return self.disposition == target.disposition;
      }
  }

  // @@@@@@@@ BOOLEAN GETTERS

  get inCollection() {
    return game.actors && game.actors.get(this.id)
  }

  get hasSpells() {
    return !!this.itemTypes["spell"].length > 0
  }

  get hasPrayers() {
    return !!this.itemTypes["prayer"].length > 0
  }

  get noOffhand() {
    return !this.itemTypes["weapon"].find(i => i.offhand.value)
  }

  get isOpposing() {
    return !!this.flags.oppose
  }

  get currentAreaEffects() 
  {
      return this.effects.contents.filter(e => e.getFlag("wfrp4e", "fromArea"));
  }

  get currentAreas()
  {
      let token = this.getActiveTokens()[0];
      return canvas.templates.placeables.filter(t => AreaHelpers.isInTemplate(token.center, t));
  }

  get auras() 
  {
    return this.items.filter(i => i.included).reduce((acc, item) => acc.concat(item.effects.contents), []).concat(this.effects.contents).filter(e => e.applicationData.type == "aura" && !e.applicationData.targetedAura)
  }

  /**
   * Overriden from foundry to pass true to allApplicableEffects
   */
  get temporaryEffects() 
  {
      const effects = [];
      for ( const effect of this.allApplicableEffects(true) ) 
      {
          if ( effect.active && effect.isTemporary ) {effects.push(effect);}
      }
      return effects;
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
    return this.itemTypes["weapon"].reduce((prev, current) => {
      if (current.isEquipped)
        prev += current.twohanded.value ? 2 : 1
      return prev
    }, 0)
  }

  get equipPointsAvailable() {
    return Number.isNumeric(this.flags.equipPoints) ? this.flags.equipPoints : 2
  }

  get defensive() {

    // Add defensive traits and weapons together
    return this.itemTypes["weapon"].reduce((prev, current) => {
      if (current.isEquipped)
        prev += current.properties.qualities.defensive ? 1 : 0
      return prev
    }, 0) + this.itemTypes["trait"].reduce((prev, current) => {
      if (current.included)
        prev += current.properties?.qualities?.defensive ? 1 : 0
      return prev
    }, 0)
  }

  get currentCareer() {
    return this.system.currentCareer
  }

  get passengers() {
    return this.system.passengers.map(p => {
      let actor = game.actors.get(p?.id);
      if (actor)
        return {
          actor: actor,
          linked: actor.prototypeToken.actorLink,
          count: p.count,
          img : WFRP_Utility.replacePopoutPath(actor.prototypeToken.texture.src),
          enc: game.wfrp4e.config.actorSizeEncumbrance[actor.details.size.value] * p.count
        }
    })
  }

  get attacker() {
    try {
      if (this.flags.oppose) {
        let opposeMessage = game.messages.get(this.flags.oppose.opposeMessageId) // Retrieve attacker's test result message
        let oppose = opposeMessage.getOppose();
        let attackerMessage = oppose.attackerMessage
        // Organize attacker/defender data
        if (opposeMessage)
          return {
            speaker: attackerMessage.speaker,
            test: attackerMessage.getTest(),
            messageId: attackerMessage.id,
            img: WFRP_Utility.getSpeaker(attackerMessage.speaker).img
          };
        else
          this.update({ "flags.-=oppose": null })
      }
    }
    catch (e) {
      this.update({ "flags.-=oppose": null })
    }

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
