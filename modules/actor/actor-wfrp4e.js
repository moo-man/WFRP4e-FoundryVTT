import WFRP_Utility from "../system/utility-wfrp4e.js";

import ChatWFRP from "../system/chat-wfrp4e.js";
import OpposedWFRP from "../system/opposed-wfrp4e.js";
import WFRP_Audio from "../system/audio-wfrp4e.js";
import RollDialog from "../apps/roll-dialog.js";
import EffectWfrp4e from "../system/effect-wfrp4e.js"

/**
 * Provides the main Actor data computation and organization.
 *
 * ActorWfrp4e contains all the preparation data and methods used for preparing an actor:
 * going through each Owned Item, preparing them for display based on characteristics.
 * Additionally, it handles all the different types of roll requests, setting up the
 * test dialog, how each test is displayed, etc.
 *
 *
 * @see   ActorSheetWfrp4e - Base sheet class
 * @see   ActorSheetWfrp4eCharacter - Character sheet class
 * @see   ActorSheetWfrp4eNPC - NPC sheet class
 * @see   ActorSheetWfrp4eCreature - Creature sheet class
 * @see   ChatWFRP4e - Sends test data to roll tests.
 */
export default class ActorWfrp4e extends Actor {


  /**
   *
   * Set initial actor data based on type
   * 
   * @param {Object} data        Barebones actor data which this function adds onto.
   * @param {Object} options     (Unused) Additional options which customize the creation workflow.
   *
   */
  async _preCreate(data, options, user) {
    if (data._id)
      options.keepId = WFRP_Utility._keepID(data._id, this)

    await super._preCreate(data, options, user)

    // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic
    if (data.items)
      return

    let createData = {};
    createData.items = await this._getNewActorItems()

    // Default auto calculation to true
    createData.flags =
    {
      autoCalcRun: true,
      autoCalcWalk: true,
      autoCalcWounds: true,
      autoCalcCritW: true,
      autoCalcCorruption: true,
      autoCalcEnc: true,
      autoCalcSize: true,
    }

    // Set wounds, advantage, and display name visibility
    if (!data.token)
      mergeObject(createData,
        {
          "token.bar1": { "attribute": "status.wounds" },                 // Default Bar 1 to Wounds
          "token.bar2": { "attribute": "status.advantage" },               // Default Bar 2 to Advantage
          "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display name to be on owner hover
          "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,    // Default display bars to be on owner hover
          "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,         // Default disposition to neutral
          "token.name": data.name                                       // Set token name to actor name
        })
    else if (data.token)
      createData.token = data.token

    // Set custom default token
    if (!data.img) {
      createData.img = "systems/wfrp4e/tokens/unknown.png"
      if (data.type == "vehicle")
        createData.img = "systems/wfrp4e/tokens/vehicle.png"
    }


    // Default characters to HasVision = true and Link Data = true
    if (data.type == "character") {

      if (!createData.token) createData.token = {} // Fix for Token Attacher / CF Import

      createData.token.vision = true;
      createData.token.actorLink = true;
    }

    this.data.update(createData)
  }

  async _preUpdate(updateData, options, user) {
    await super._preUpdate(updateData, options, user)

    this.handleScrollingText(updateData)

    // Treat the custom default token as a true default token
    // If you change the actor image from the default token, it will automatically set the same image to be the token image
    if (this.data.token.img == "systems/wfrp4e/tokens/unknown.png" && updateData.img) {
      updateData["token.img"] = updateData.img;
    }

    if (hasProperty(updateData, "data.details.experience") && !hasProperty(updateData, "data.details.experience.log")) {
      let actorData = this.toObject() // duplicate so we have old data during callback
      new Dialog({
        content: `<p>${game.i18n.localize("ExpChangeHint")}</p><div class="form-group"><input name="reason" type="text" /></div>`,
        title: game.i18n.localize("ExpChange"),
        buttons: {
          confirm: {
            label: game.i18n.localize("Confirm"),
            callback: (dlg) => { }
          }
        },
        default: "confirm",
        close: dlg => {
          let expLog = actorData.data.details.experience.log || []
          let newEntry = { reason: dlg.find('[name="reason"]').val() }
          if (hasProperty(updateData, "data.details.experience.spent")) {
            newEntry.amount = updateData.data.details.experience.spent - actorData.data.details.experience.spent
            newEntry.spent = updateData.data.details.experience.spent
            newEntry.total = actorData.data.details.experience.total
            newEntry.type = "spent"
          }
          if (hasProperty(updateData, "data.details.experience.total")) {
            newEntry.amount = updateData.data.details.experience.total - actorData.data.details.experience.total
            newEntry.spent = actorData.data.details.experience.spent
            newEntry.total = updateData.data.details.experience.total
            newEntry.type = "total"
          }

          expLog.push(newEntry)
          this.update({ "data.details.experience.log": expLog })
        }
      }).render(true)
    }
  }

  handleScrollingText(data)
  {
    if (hasProperty(data, "data.status.wounds.value"))
      this._displayScrollingChange(getProperty(data, "data.status.wounds.value") - this.status.wounds.value);
    if (hasProperty(data, "data.status.advantage.value"))
      this._displayScrollingChange(getProperty(data, "data.status.advantage.value") - this.status.advantage.value, {advantage : true});
  }

  prepareBaseData() {
    // For each characteristic, calculate the total and bonus value
    for (let ch of Object.values(this.characteristics)) {
      ch.value = ch.initial + ch.advances + (ch.modifier || 0);
      ch.bonus = Math.floor(ch.value / 10)
      ch.cost = WFRP_Utility._calculateAdvCost(ch.advances, "characteristic")
    }

    if (this.data.flags.autoCalcEnc && this.type != "vehicle")
      this.status.encumbrance.max = this.characteristics.t.bonus + this.characteristics.s.bonus;

    this.data.flags.meleeDamageIncrease = 0
    this.data.flags.rangedDamageIncrease = 0
    this.data.flags.robust = 0
    this.data.flags.resolute = 0
    this.data.flags.ambi = 0;
  }

  /**
   * Calculates simple dynamic data when actor is updated.
   *
   * prepareData() is called when actor data is updated to recalculate values such as Characteristic totals, bonus (e.g.
   * this is how Strength total and Strength Bonus gets updated whenever the user changes the Strength characteristic),
   * movement values, and encumbrance. Some of these may or may not actually be calculated, depending on the user choosing
   * not to have them autocalculated. These values are relatively simple, more complicated calculations that require items
   * can be found in the sheet's getData() function.
   * 
   * NOTE: NOT TO BE CONFUSED WITH prepare() - that function is called upon rendering to organize and process actor data
   *
   * @see ActorSheetWfrp4e.getData()
   */
  prepareData() {

    this.data.reset()

    this.itemCategories = this.itemTypes

    // Copied and rearranged from Actor class
    if (!this.data.img) this.data.img = CONST.DEFAULT_TOKEN;
    if (!this.data.name) this.data.name = "New " + this.documentName;
    this.prepareBaseData();
    this.prepareEmbeddedDocuments();
    this.runEffects("prePrepareData", { actor: this })

    this.prepareBaseData();
    this.prepareDerivedData();

    this.runEffects("prePrepareItems", { actor: this })
    this.prepareItems();


    // if (this.isUniqueOwner)
    //   this.runEffects("oneTime", { actor: this })

    if (this.type == "character")
      this.prepareCharacter();
    if (this.type == "npc")
      this.prepareNPC();
    if (this.type == "creature")
      this.prepareCreature();
    if (this.type == "vehicle")
      this.prepareVehicle()
    if (this.type != "vehicle") {
      this.prepareNonVehicle()
    }

    this.runEffects("prepareData", { actor: this })

    //TODO Move prepare-updates to hooks?
    if (this.type != "vehicle") {
      if (game.actors && this.inCollection && game.user.isUniqueGM) // Only check system effects if past this: isn't an on-load prepareData and the actor is in the world (can be updated)
        this.checkSystemEffects()
    }

  }

  /** @override
   * Replaces foundry's effects getter which returns everything, to only return effects that should actually affect the actor. 
   * For example, effects from a spell shouldn't be affecting the actor who own the spell. Diseases that are still incubating shouldn't have their effects be active
   */
  get effects() {
    let actorEffects = new Collection()
    let effects = super.effects
    effects.forEach(e => {
      let effectApplication = e.application
      let remove

      try {
        if (e.data.origin && e.item) // If effect comes from an item
        {
          let item = e.item
          if (item.type == "disease") { // If disease, don't show symptoms until disease is actually active
            if (!item.data.data.duration.active)
              remove = true
          }
          else if (item.type == "spell" || item.type == "prayer") {
            remove = true
          }

          else if (item.type == "trait" && this.type == "creature" && !item.included) {
            remove = true
          }

          else if (effectApplication) { // if not equipped, remove if effect specifies it needs to be equipped
            if (effectApplication == "equipped") {
              if (!item.isEquipped)
                remove = true;

            }
            else if (effectApplication != "actor") // Otherwise (if effect is targeted), remove it. 
              remove = true
          }
        }
        else // If not an item effect
        {
          if (effectApplication == "apply")
            remove = true
        }

        if (!remove)
          actorEffects.set(e.id, e)
      }

      catch (error) {
        game.wfrp4e.utility.log(`The effect ${e.label} threw an error when being prepared. ${error}`, e)
      }
    })
    return actorEffects;

  }

  /** @override 
   * Return all effects owned by the actor.
   * **/
  get allEffects() {
    return super.effects;
  }


  /** @override  - Use allEffects instead of effects
   * Obtain a reference to the Array of source data within the data object for a certain embedded Document name
   * @param {string} embeddedName   The name of the embedded Document type
   * @return {Collection}           The Collection instance of embedded Documents of the requested type
   */
  getEmbeddedCollection(embeddedName) {
    const cls = this.constructor.metadata.embedded[embeddedName];
    if (!cls) {
      throw new Error(`${embeddedName} is not a valid embedded Document within the ${this.documentName} Document`);
    }
    let name = cls.collectionName
    if (name == "effects")
      name = "allEffects"
    return this[name];
  }

  get conditions() {
    return this.effects.filter(e => e.isCondition)
  }



  /**
   * Calculates derived data for all actor types except vehicle.
   */
  prepareNonVehicle() {
    if (this.type == "vehicle")
      return

    // Auto calculation values - only calculate if user has not opted to enter ther own values
    if (this.data.flags.autoCalcWalk)
      this.details.move.walk = parseInt(this.details.move.value) * 2;

    if (this.data.flags.autoCalcRun)
      this.details.move.run = parseInt(this.details.move.value) * 4;

    if (game.settings.get("wfrp4e", "capAdvantageIB")) {
      this.status.advantage.max = this.characteristics.i.bonus
      this.status.advantage.value = Math.clamped(this.status.advantage.value, 0, this.status.advantage.max)
    }
    else
      this.status.advantage.max = 10;

    if (!hasProperty(this, "data.flags.autoCalcSize"))
      this.data.flags.autoCalcSize = true;


    // Find size based on Traits/Talents
    let size;
    let trait = this.has(game.i18n.localize("NAME.Size"))
    if (trait)
      size = WFRP_Utility.findKey(trait.specification.value, game.wfrp4e.config.actorSizes);
    if (!size) // Could not find specialization
    {
      let smallTalent = this.has(game.i18n.localize("NAME.Small"), "talent")
      if (smallTalent)
        size = "sml";
      else
        size = "avg";
    }

    // If the size has been changed since the last known value, update the value 
    this.details.size.value = size || "avg"

    if (this.data.flags.autoCalcSize && game.actors) {
      let tokenData = this._getTokenSize();
      if (this.isToken) {
        this.token.data.update(tokenData)
      }
      else if (canvas) {
        this.data.token.update(tokenData)
        this.getActiveTokens().forEach(t => t.document.update(tokenData));
      }
    }

    this.checkWounds();


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

          if (this.data.flags.autoCalcWalk)
            this.details.move.walk = mount.details.move.walk;

          if (this.data.flags.autoCalcRun)
            this.details.move.run = mount.details.move.run;
        }
      }
    }

  }

  /**
 * Augments actor preparation with additional calculations for Characters.
 * 
 * Characters have more features and so require more calculation. Specifically,
 * this will add pure soul talent advances to max corruption, as well as display
 * current career values (details, advancement indicatiors, etc.). 
 * 
 * @param {Object} actorData  prepared actor data to augment 
 */
  prepareCharacter() {
    if (this.type != "character")
      return;

    let tb = this.characteristics.t.bonus;
    let wpb = this.characteristics.wp.bonus;

    // If the user has not opted out of auto calculation of corruption, add pure soul value
    if (this.data.flags.autoCalcCorruption) {
      this.status.corruption.max = tb + wpb;
    }


    let currentCareer = this.currentCareer
    if (currentCareer) {
      let { standing, tier } = this._applyStatusModifier(currentCareer.status)
      this.details.status.standing = standing
      this.details.status.tier = tier
      this.details.status.value = game.wfrp4e.config.statusTiers[this.details.status.tier] + " " + this.details.status.standing
    }
    else
      this.details.status.value = ""



    if (currentCareer) {
      let availableCharacteristics = currentCareer.characteristics
      for (let char in this.characteristics) {
        if (availableCharacteristics.includes(char))
          this.characteristics[char].career = true;
      }
    }

    this.details.experience.current = this.details.experience.total - this.details.experience.spent;

  }

  prepareNPC() {
    if (this.type != "npc")
      return;
  }

  prepareCreature() {
    if (this.type != "creature")
      return;
  }

  prepareVehicle() {
    if (this.type != "vehicle")
      return;
  }
  /* --------------------------------------------------------------------------------------------------------- */
  /* Setting up Rolls
  /*
  /* All "setup______" functions gather the data needed to roll a certain test. These are in 3 main objects.
  /* These 3 objects are then given to this.setupDialog() to show the dialog, see that function for its usage.
  /*
  /* The 3 Main objects:
  /* testData - Data associated with modifications to rolling the test itself, or results of the test.
  /*            Examples of this are whether hit locations are found, Weapon qualities that may cause
                criticals/fumbles more often or ingredients for spells that cancel miscasts.
      dialogOptions - Data for rendering the dialog that's important for a specific test type.
                      Example: when casting or channelling, there should be an option for Malignant
                      Influences, but only for those tests.
      cardOptions - Which card to use, the title of the card, the name of the actor, etc.
  /* --------------------------------------------------------------------------------------------------------- */

  //#region Rolling

  /**
     * setupDialog is called by the setup functions for the actors (see setupCharacteristic() for info on their usage)
     * The setup functions give 3 main objects to this function, which it expands with data used by all different
     * types of tests. It renders the dialog and creates the Roll object (rolled in the callback function, located
     * in the "setup" functions). It then calls renderRollCard() to post the results of the test to chat
     *
     * @param {Object} dialogOptions      Dialog template, buttons, everything associated with the dialog
     * @param {Object} testData           Test info: target number, SL bonus, success bonus, etc
     * @param {Object} cardOptions        Chat card template and info
     */
  async setupDialog({ dialogOptions, testData, cardOptions }) {
    let rollMode = game.settings.get("core", "rollMode");

    // Prefill dialog
    mergeObject(dialogOptions.data, testData);
    dialogOptions.data.difficultyLabels = game.wfrp4e.config.difficultyLabels;

    //Suppresses roll sound if the test has it's own sound associated
    mergeObject(cardOptions,
      {
        user: game.user.id,
        sound: CONFIG.sounds.dice
      })


    dialogOptions.data.rollMode = dialogOptions.data.rollMode || rollMode;
    if (CONFIG.Dice.rollModes)
      dialogOptions.data.rollModes = CONFIG.Dice.rollModes;
    else
      dialogOptions.data.rollModes = CONFIG.rollModes;

    dialogOptions.data.dialogEffects.map(e => {
      let modifiers = []
      if (e.modifier)
        modifiers.push(e.modifier + " " + game.i18n.localize("Modifier"))
      if (e.slBonus)
        modifiers.push(e.slBonus + " " + game.i18n.localize("DIALOG.SLBonus"))
      if (e.successBonus)
        modifiers.push(e.successBonus + " " + game.i18n.localize("DIALOG.SuccessBonus"))
      if (e.difficultyStep)
        modifiers.push(e.difficultyStep + " " + game.i18n.localize("DIALOG.DifficultyStep"))

      e.effectSummary = modifiers.join(", ")
    })

    testData.other = []; // Container for miscellaneous data that can be freely added onto

    if (testData.options.context) {
      if (typeof testData.options.context.general === "string")
        testData.options.context.general = [testData.options.context.general]
      if (typeof testData.options.context.success === "string")
        testData.options.context.success = [testData.options.context.success]
      if (typeof testData.options.context.failure === "string")
        testData.options.context.failure = [testData.options.context.failure]
    }

    testData.speaker = this.speakerData;

    if (!testData.options.bypass) {
      // Render Test Dialog
      let html = await renderTemplate(dialogOptions.template, dialogOptions.data);

      return new Promise((resolve, reject) => {
        new RollDialog(
          {
            title: dialogOptions.title,
            content: html,
            actor: this,
            buttons:
            {
              rollButton:
              {
                label: game.i18n.localize("Roll"),
                callback: html => resolve(dialogOptions.callback(html))
              }
            },
            default: "rollButton"
          }).render(true);
      })
    }
    else if (testData.options.bypass) {
      testData.testModifier = testData.options.testModifier || testData.testModifier
      testData.slBonus = testData.options.slBonus || testData.slBonus
      testData.successBonus = testData.options.successBonus || testData.successBonus
      cardOptions.rollMode = testData.options.rollMode || rollMode
      testData.rollMode = cardOptions.rollMode
      return { testData, cardOptions }
    }
    reject()
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
  setupCharacteristic(characteristicId, options = {}) {
    let char = this.characteristics[characteristicId];
    let title = options.title || game.i18n.localize(char.label) + " " + game.i18n.localize("Test");
    title += options.appendTitle || "";

    let testData = {
      title,
      rollClass: game.wfrp4e.rolls.CharacteristicTest,
      item: characteristicId,
      hitLocation: false,
      options: options,
      postFunction: "basicTest"
    };

    mergeObject(testData, this.getPrefillData("characteristic", characteristicId, options))

    // Default a WS or BS test to have hit location checked
    if ((characteristicId == "ws" || characteristicId == "bs") && !options.reload)
      testData.hitLocation = true;

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/characteristic-dialog.html",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        advantage: this.status.advantage.value || 0,
        talents: this.getTalentTests(),
        rollMode: options.rollMode,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.rollMode = cardOptions.rollMode;
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');

        return { testData, cardOptions };
      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/characteristic-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    });
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
  setupSkill(skill, options = {}) {
    if (typeof (skill) === "string") {
      let skillName = skill
      skill = this.getItemTypes("skill").find(sk => sk.name == skill)
      if (!skill)
        return ui.notifications.error(`${game.i18n.format("ERROR.Found", { name: skillName })}`)
    }

    let title = options.title || skill.name + " " + game.i18n.localize("Test");
    title += options.appendTitle || "";

    let testData = {
      title,
      rollClass: game.wfrp4e.rolls.SkillTest,
      hitLocation: false,
      income: options.income,
      item: skill.id,
      options: options,
      postFunction: "basicTest"
    };

    mergeObject(testData, this.getPrefillData("skill", skill, options))

    // Default a WS, BS, Melee, or Ranged to have hit location checked
    if ((skill.characteristic.key == "ws" ||
      skill.characteristic.key == "bs" ||
      skill.name.includes(game.i18n.localize("NAME.Melee")) ||
      skill.name.includes(game.i18n.localize("NAME.Ranged")))
      && !options.reload) {
      testData.hitLocation = true;
    }

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/skill-dialog.html",
      // Prefilled dialog data

      data: {
        hitLocation: testData.hitLocation,
        advantage: this.status.advantage.value || 0,
        talents: this.getTalentTests(),
        characteristicToUse: skill.characteristic.key,
        rollMode: options.rollMode,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.rollMode = cardOptions.rollMode;
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.characteristicToUse = html.find('[name="characteristicToUse"]').val();
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');

        return { testData, cardOptions };
      }
    };
    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/skill-card.html", title)
    if (options.corruption)
      cardOptions.rollMode = "gmroll"

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    });
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
  setupWeapon(weapon, options = {}) {
    let skillCharList = []; // This array is for the different options available to roll the test (Skills and characteristics)
    let title = options.title || game.i18n.localize("WeaponTest") + " - " + weapon.name;
    title += options.appendTitle || "";

    if (!weapon.id)
      weapon = new CONFIG.Item.documentClass(weapon, { parent: this })

    let testData = {
      title,
      rollClass: game.wfrp4e.rolls.WeaponTest,
      hitLocation: true,
      item: weapon.id || weapon.toObject(), // Store item data directly if unowned item (system item like unarmed)
      charging: options.charging || false,
      champion: !!this.has(game.i18n.localize("NAME.Champion")),
      riposte: !!this.has(game.i18n.localize("NAME.Riposte"), "talent"),
      infighter: !!this.has(game.i18n.localize("NAME.Infighter"), "talent"),
      resolute: this.data.flags.resolute || 0,
      options: options,
      postFunction: "weaponTest"
    };



    if (weapon.attackType == "melee")
      skillCharList.push({ char: true, key: "ws", name: game.i18n.localize("CHAR.WS") })

    else if (weapon.attackType == "ranged") {
      // If Ranged, default to Ballistic Skill, but check to see if the actor has the specific skill for the weapon
      skillCharList.push({ char: true, key: "bs", name: game.i18n.localize("CHAR.BS") })
      if (weapon.consumesAmmo.value && weapon.ammunitionGroup.value != "none" && weapon.ammunitionGroup.value) {
        // Check to see if they have ammo if appropriate
        if (options.ammo)
          testData.ammo = options.ammo.find(a => a.id == weapon.currentAmmo.value)
        if (!testData.ammo)
          testData.ammo = this.items.get(weapon.currentAmmo.value)

        if (!testData.ammo || !weapon.currentAmmo.value || testData.ammo.quantity.value == 0) {
          AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
          ui.notifications.error(game.i18n.localize("ErrorNoAmmo"))
          return
        }

      }
      else if (weapon.consumesAmmo.value && weapon.quantity.value == 0) {
        // If this executes, it means it uses its own quantity for ammo (e.g. throwing), which it has none of
        AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
        ui.notifications.error(game.i18n.localize("ErrorNoAmmo"))
        return;
      }
      else {
        // If this executes, it means it uses its own quantity for ammo (e.g. throwing)
        testData.ammo = weapon;
      }


      if (weapon.loading && !weapon.loaded.value) {
        this.rollReloadTest(weapon)
        ui.notifications.notify(game.i18n.localize("ErrorNotLoaded"))
        return new Promise((resolve, reject) => {
          resolve({ abort: true })
        })
      }
    }

    let defaultSelection // The default skill/characteristic being used
    if (weapon.skillToUse) {
      // If the actor has the appropriate skill, default to that.
      skillCharList.push(weapon.skillToUse)
      defaultSelection = skillCharList.findIndex(i => i.name == weapon.skillToUse.name)
    }

    mergeObject(testData, this.getPrefillData("weapon", weapon, options))

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/weapon-dialog.html",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        talents: this.getTalentTests(),
        skillCharList: skillCharList,
        defaultSelection: defaultSelection,
        advantage: this.status.advantage.value || 0,
        rollMode: options.rollMode,
        chargingOption: this.showCharging(weapon),
        dualWieldingOption: this.showDualWielding(weapon),
        charging: testData.charging,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.rollMode = cardOptions.rollMode;
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.charging = html.find('[name="charging"]').is(':checked');
        testData.dualWielding = html.find('[name="dualWielding"]').is(':checked');
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');

        if (this.isMounted && testData.charging) {
          cardOptions.title += " (Mounted)"
        }

        testData.skillSelected = skillCharList[Number(html.find('[name="skillSelected"]').val())];

        return { testData, cardOptions };
      }

    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/weapon-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    });
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
  setupCast(spell, options = {}) {
    let title = options.title || game.i18n.localize("CastingTest") + " - " + spell.name;
    title += options.appendTitle || "";

    // castSkill array holds the available skills/characteristics to cast with - Casting: Intelligence
    let castSkills = [{ char: true, key: "int", name: game.i18n.localize("CHAR.Int") }]

    // if the actor has Language (Magick), add it to the array.
    let skill = spell.skillToUse
    if (skill)
      castSkills.push(skill)

    // Default to Language Magick if it exists
    let defaultSelection = castSkills.findIndex(i => i.name == spell.skillToUse?.name)

    // Prepare the spell to have the complete data object, including damage values, range values, CN, etc.
    let testData = {
      title,
      rollClass: game.wfrp4e.rolls.CastTest,
      item: spell.id,
      malignantInfluence: false,
      options: options,
      postFunction: "castTest"
    };


    // If the spell does damage, default the hit location to checked
    if (spell.damage.value)
      testData.hitLocation = true;

    mergeObject(testData, this.getPrefillData("cast", spell, options))


    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/spell-dialog.html",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        malignantInfluence: testData.malignantInfluence,
        talents: this.getTalentTests(),
        advantage: this.status.advantage.value || 0,
        defaultSelection: defaultSelection,
        castSkills: castSkills,
        rollMode: options.rollMode,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.rollMode = cardOptions.rollMode;
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.skillSelected = castSkills[Number(html.find('[name="skillSelected"]').val())];
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');
        testData.malignantInfluence = html.find('[name="malignantInfluence"]').is(':checked');

        return { testData, cardOptions };
      }
    };

    //@HOUSE
    if (game.settings.get("wfrp4e", "mooMagicAdvantage")) {
      game.wfrp4e.utility.logHomebrew("mooMagicAdvantage")
      dialogOptions.data.advantage = "N/A"
    }
    //@/HOUSE

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/spell-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    });
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
  setupChannell(spell, options = {}) {
    let title = options.title || game.i18n.localize("ChannellingTest") + " - " + spell.name;
    title += options.appendTitle || "";

    // channellSkills array holds the available skills/characteristics to  with - Channelling: Willpower
    let channellSkills = [{ char: true, key: "wp", name: game.i18n.localize("CHAR.WP") }]

    // if the actor has any channel skills, add them to the array.
    let skills = this.getItemTypes("skill").filter(i => i.name.toLowerCase().includes(game.i18n.localize("NAME.Channelling").toLowerCase()))
    if (skills.length)
      channellSkills = channellSkills.concat(skills)

    // Find the spell lore, and use that to determine the default channelling selection
    let spellLore = spell.lore.value;
    let defaultSelection
    if (spell.wind && spell.wind.value) {
      defaultSelection = channellSkills.indexOf(channellSkills.find(x => x.name.includes(spell.wind.value)))
      if (defaultSelection == -1) {
        let customChannellSkill = this.getItemTypes("skill").find(i => i.name.toLowerCase().includes(spell.wind.value.toLowerCase()));
        if (customChannellSkill) {
          channellSkills.push(customChannellSkill)
          defaultSelection = channellSkills.length - 1
        }
      }
    }
    else {
      defaultSelection = channellSkills.indexOf(channellSkills.find(x => x.name.includes(game.wfrp4e.config.magicWind[spellLore])));
    }

    if (spellLore == "witchcraft")
      defaultSelection = channellSkills.indexOf(channellSkills.find(x => x.name.toLowerCase().includes(game.i18n.localize("NAME.Channelling").toLowerCase())))

    let testData = {
      title,
      rollClass: game.wfrp4e.rolls.ChannelTest,
      item: spell.id,
      malignantInfluence: false,
      options: options,
      postFunction: "channelTest"
    };

    mergeObject(testData, this.getPrefillData("channelling", spell, options))

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/channel-dialog.html",
      // Prefilled dialog data
      data: {
        malignantInfluence: testData.malignantInfluence,
        channellSkills: channellSkills,
        defaultSelection: defaultSelection,
        talents: this.getTalentTests(),
        advantage: "N/A",
        rollMode: options.rollMode,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.rollMode = cardOptions.rollMode;
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.malignantInfluence = html.find('[name="malignantInfluence"]').is(':checked');
        testData.skillSelected = channellSkills[Number(html.find('[name="skillSelected"]').val())];

        return { testData, cardOptions };

      }
    };

    //@HOUSE
    if (game.settings.get("wfrp4e", "mooMagicAdvantage")) {
      game.wfrp4e.utility.logHomebrew("mooMagicAdvantage")
      dialogOptions.data.advantage = this.status.advantage.value || 0
    }
    //@/HOUSE

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/channel-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    });
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
  setupPrayer(prayer, options = {}) {
    let title = options.title || game.i18n.localize("PrayerTest") + " - " + prayer.name;
    title += options.appendTitle || "";

    // ppraySkills array holds the available skills/characteristics to pray with - Prayers: Fellowship
    let praySkills = [{ char: true, key: "fel", name: game.i18n.localize("CHAR.Fel") }]

    // if the actor has the Pray skill, add it to the array.
    let skill = this.getItemTypes("skill").find(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase());
    if (skill)
      praySkills.push(skill)

    // Default to Pray skill if available
    let defaultSelection = praySkills.findIndex(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase())

    // Prepare the prayer to have the complete data object, including damage values, range values, etc.
    let testData = { // Store this data to be used in the test logic
      title,
      rollClass: game.wfrp4e.rolls.PrayerTest,
      item: prayer.id,
      hitLocation: false,
      options: options,
      postFunction: "prayerTest"
    }




    // If the spell does damage, default the hit location to checked
    if (prayer.damage.value || prayer.damage.dice || prayer.damage.addSL)
      testData.hitLocation = true;


    mergeObject(testData, this.getPrefillData("prayer", prayer, options))


    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/prayer-dialog.html",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        talents: this.getTalentTests(),
        advantage: this.status.advantage.value || 0,
        praySkills: praySkills,
        defaultSelection: defaultSelection,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.rollMode = cardOptions.rollMode;
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.skillSelected = praySkills[Number(html.find('[name="skillSelected"]').val())];
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');

        return { testData, cardOptions };
      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/prayer-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    });
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
  setupTrait(trait, options = {}) {
    if (!trait.id)
      trait = new CONFIG.Item.documentClass(trait, { parent: this })

    if (!trait.rollable.value)
      return ui.notifications.notify("Non-rollable trait");

    let title = options.title || game.wfrp4e.config.characteristics[trait.rollable.rollCharacteristic] + ` ${game.i18n.localize("Test")} - ` + trait.name;
    title += options.appendTitle || "";

    let skill = this.getItemTypes("skill").find(sk => sk.name == trait.rollable.skill)
    if (skill) {
      title = skill.name + ` ${game.i18n.localize("Test")} - ` + trait.name;
    }
    let testData = {
      title,
      rollClass: game.wfrp4e.rolls.TraitTest,
      item: trait.id || trait.toObject(),  // Store item data directly if unowned item (system item like unarmed)
      hitLocation: false,
      champion: !!this.has(game.i18n.localize("NAME.Champion")),
      options: options,
      postFunction: "traitTest"
    };


    // Default hit location checked if the rollable trait's characteristic is WS or BS
    if (trait.rollable.rollCharacteristic == "ws" || trait.rollable.rollCharacteristic == "bs")
      testData.hitLocation = true;

    mergeObject(testData, this.getPrefillData("trait", trait, options))


    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/skill-dialog.html", // Reuse skill dialog
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        talents: this.getTalentTests(),
        chargingOption: this.showCharging(trait),
        characteristicToUse: trait.rollable.rollCharacteristic,
        advantage: this.status.advantage.value || 0,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.rollMode = cardOptions.rollMode;
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.characteristicToUse = html.find('[name="characteristicToUse"]').val();
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');

        return { testData, cardOptions };
      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/skill-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    });
  }


  setupExtendedTest(item, options = {}) {

    let defaultRollMode = item.hide.test || item.hide.progress ? "gmroll" : "roll"

    if (item.SL.target <= 0)
      return ui.notifications.error(game.i18n.localize("ExtendedError1"))

    options.extended = item.id;
    options.rollMode = defaultRollMode;
    options.hitLocation = false;

    let characteristic = WFRP_Utility.findKey(item.test.value, game.wfrp4e.config.characteristics)
    if (characteristic) {
      return this.setupCharacteristic(characteristic, options).then(setupData => {
        this.basicTest(setupData)
      })
    }
    else {
      let skill = this.getItemTypes("skill").find(i => i.name == item.test.value)
      if (skill) {
        return this.setupSkill(skill, options).then(setupData => {
          this.basicTest(setupData)
        })
      }
      ui.notifications.error(`${game.i18n.format("ExtendedError2", { name: item.test.value })}`)
    }
  }


  /**
   * Universal card options for setup functions.
   *
   * The setup_____() functions all use the same cardOptions, just different templates. So this is
   * a standardized helper function to maintain DRY code.
   *
   * @param {string} template   Fileptah to the template being used
   * @param {string} title      Title of the Test to be displayed on the dialog and card
   */
  _setupCardOptions(template, title) {
    let cardOptions = {
      speaker: {
        alias: this.data.token.name,
        actor: this.id,
      },
      title: title,
      template: template,
      flags: { img: this.data.token.randomImg ? this.data.img : this.data.token.img }
      // img to be displayed next to the name on the test card - if it's a wildcard img, use the actor image
    }

    // If the test is coming from a token sheet
    if (this.token) {
      cardOptions.speaker.alias = this.token.data.name; // Use the token name instead of the actor name
      cardOptions.speaker.token = this.token.id;
      cardOptions.speaker.scene = canvas.scene.id
      cardOptions.flags.img = this.token.data.img; // Use the token image instead of the actor image

      if (this.token.getFlag("wfrp4e", "mask")) {
        cardOptions.speaker.alias = "???"
        cardOptions.flags.img = "systems/wfrp4e/tokens/unknown.png"
      }
    }
    else // If a linked actor - use the currently selected token's data if the actor id matches
    {
      let speaker = ChatMessage.getSpeaker()
      if (speaker.actor == this.id) {
        cardOptions.speaker.alias = speaker.alias
        cardOptions.speaker.token = speaker.token
        cardOptions.speaker.scene = speaker.scene
        cardOptions.flags.img = speaker.token ? canvas.tokens.get(speaker.token).data.img : cardOptions.flags.img
      }

      if (getProperty(this.data.token, "flags.wfrp4e.mask")) {
        cardOptions.speaker.alias = "???"
        cardOptions.flags.img = "systems/wfrp4e/tokens/unknown.png"
      }
    }

    if (this.isMounted && this.mount) {
      cardOptions.flags.mountedImg = this.mount.data.token.img;
      cardOptions.flags.mountedName = this.mount.data.token.name;
    }

    if (VideoHelper.hasVideoExtension(cardOptions.flags.img))
      game.video.createThumbnail(cardOptions.flags.img, { width: 50, height: 50 }).then(img => cardOptions.flags.img = img)

    return cardOptions
  }


  rollReloadTest(weapon) {
    let testId = weapon.getFlag("wfrp4e", "reloading")
    let extendedTest = this.items.get(testId)
    if (!extendedTest) {

      //ui.notifications.error(game.i18n.localize("ITEM.ReloadError"))
      this.checkReloadExtendedTest(weapon);
      return
    }
    this.setupExtendedTest(extendedTest, { reload: true, weapon, appendTitle: " - " + game.i18n.localize("ITEM.Reloading") });
  }


  /* --------------------------------------------------------------------------------------------------------- */
  /* --------------------------------------------- Roll Overides --------------------------------------------- */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * Roll overrides are specialized functions for different types of rolls. In each override, ChatWFRP is called
   * to perform the test logic, which has its own specialized functions for different types of tests. For exapmle,
   * weaponTest() calls ChatWFRP.rollWeaponTest(). Additionally, any post-roll logic that needs to be performed
   * is done here. For example, Income tests use incomeTest, which determines how much money is made after the
   * roll is completed. A normal Skill Test does not go through this process, instead using basicTest override,
   * however both overrides just use the standard ChatWFRP.rollTest().
   *
  /* --------------------------------------------------------------------------------------------------------- */

  /**
   * Default Roll override, the standard rolling method for general tests.
   *
   * basicTest is the default roll override (see this.setupDialog() for where it's assigned). This follows
   * the basic steps. Call ChatWFRP.rollTest for standard test logic, send the result and display data to
   * if(!options.suppressMessage)
ChatWFRP.renderRollCard() as well as handleOpposedTarget().
   *
   * @param {Object} testData         All the data needed to evaluate test results - see setupSkill/Characteristic
   * @param {Object} cardOptions      Data for the card display, title, template, etc.
   * @param {Object} rerenderMessage  The message to be updated (used if editing the chat card)
   */
  async basicTest({ testData, cardOptions }, options = {}) {

    let test
    if (testData.result)
      test = game.wfrp4e.rolls.TestWFRP.recreate(testData)
    else
      test = new testData.rollClass(testData)
    this.runEffects("preRollTest", { test, cardOptions })
    await test.roll()

    if (test.options.corruption) {
      await this.handleCorruptionResult(test);
    }
    if (test.options.mutate) {
      await this.handleMutationResult(test)
    }

    if (test.options.extended) {
      await this.handleExtendedTest(test)
    }

    if (test.options.income) {
      await this.handleIncomeTest(test)
    }

    if (test.options.rest) {
      test.result.woundsHealed = Math.max(Math.trunc(test.result.SL) + test.options.tb, 0);
      test.result.other.push(`${test.result.woundsHealed} ${game.i18n.localize("Wounds Healed")}`)
    }


    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(test))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { test, cardOptions })
    Hooks.call("wfrp4e:rollTest", test, cardOptions)

    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`;
      cardOptions.isOpposedTest = true
    }

    if (!options.suppressMessage)
      if (!options.suppressMessage)
        ChatWFRP.renderRollCard(cardOptions, test, options.rerenderMessage).then(msg => {
          OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
        })
    return test;
  }

  /**
   * weaponTest is used for weapon tests, see setupWeapon for how it's assigned.
   *
   * weaponTest doesn't add any special functionality, it's main purpose being to call
   * ChatWFRP.rollWeaponTest() instead of the generic ChatWFRP.rollTest()
   *
   * @param {Object} testData         All the data needed to evaluate test results - see setupWeapon()
   * @param {Object} cardOptions      Data for the card display, title, template, etc.
   * @param {Object} rerenderMessage  The message to be updated (used if editing the chat card)
   */
  async weaponTest({ testData, cardOptions }, options = {}) {
    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`,
        cardOptions.isOpposedTest = true
    }
    
    let test
    if (testData.result)
      test = game.wfrp4e.rolls.TestWFRP.recreate(testData)
    else
      test = new testData.rollClass(testData)
    this.runEffects("preRollTest", { test, cardOptions })
    this.runEffects("preRollWeaponTest", { test, cardOptions })
    await test.roll()
    let result = test.result

    if (test.item.ammo && test.item.consumesAmmo.value && !test.context.edited && !test.context.reroll) {
      test.item.ammo.update({ "data.quantity.value": test.item.ammo.quantity.value - 1 })
    }
    else if (testData.ammo && test.item.consumesAmmo.value && !test.context.edited && !test.context.reroll) {
      testData.ammo.update({ "data.quantity.value": testData.ammo.quantity.value - 1 })
    }


    if (test.item.loading && !test.context.edited && !test.context.reroll) {
      test.item.loaded.amt--;
      if (test.item.loaded.amt <= 0) {
        test.item.loaded.amt = 0
        test.item.loaded.value = false;

        await test.item.update({ "data.loaded.amt": test.item.loaded.amt, "data.loaded.value": test.item.loaded.value })
        this.checkReloadExtendedTest(test.item)
      }
      else {
        test.item.update({ "data.loaded.amt": test.item.loaded.amt })
      }
    }

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(test))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { test, cardOptions })
    this.runEffects("rollWeaponTest", { test, cardOptions })
    Hooks.call("wfrp4e:rollWeaponTest", test, cardOptions)


    if (!options.suppressMessage)
      ChatWFRP.renderRollCard(cardOptions, test, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })

    if (test.preData.dualWielding && !test.context.edited) {
      let offHandData = duplicate(test.preData)

      if (!this.hasSystemEffect("dualwielder"))
        this.addSystemEffect("dualwielder")

      if (result.outcome == "success") {
        let offhandWeapon = this.getItemTypes("weapon").find(w => w.offhand.value);
        if (test.result.roll % 11 == 0 || test.result.roll == 100)
          delete offHandData.roll
        else {
          let offhandRoll = test.result.roll.toString();
          if (offhandRoll.length == 1)
            offhandRoll = offhandRoll[0] + "0"
          else
            offhandRoll = offhandRoll[1] + offhandRoll[0]
          offHandData.roll = Number(offhandRoll);
        }

        this.setupWeapon(offhandWeapon, { appendTitle: ` (${game.i18n.localize("SHEET.Offhand")})`, offhand: true, offhandReverse: offHandData.roll }).then(setupData => {
          this.weaponTest(setupData)
        })
      }

    }

    return test;
  }

  /**
   * castTest is used for casting tests, see setupCast for how it's assigned.
   *
   * The only special functionality castTest adds is reseting spell SL channelled back to 0, other than that,
   * it's main purpose is to call ChatWFRP.rollCastTest() instead of the generic ChatWFRP.rollTest().
   *
   * @param {Object} testData         All the data needed to evaluate test results - see setupCast()
   * @param {Object} cardOptions      Data for the card display, title, template, etc.
   * @param {Object} rerenderMessage  The message to be updated (used if editing the chat card)
   */
  async castTest({ testData, cardOptions }, options = {}) {
    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`,
        cardOptions.isOpposedTest = true
    }

    let test
    if (testData.result)
      test = game.wfrp4e.rolls.TestWFRP.recreate(testData)
    else
      test = new testData.rollClass(testData)
    this.runEffects("preRollTest", { test, cardOptions })
    this.runEffects("preRollCastTest", { test, cardOptions })
    await test.roll();

    let result = test.result

    // Find ingredient being used, if any
    if (test.hasIngredient && test.item.ingredient.quantity.value > 0 && !test.context.edited && !test.context.reroll)
      test.item.ingredient.update({ "data.quantity.value": test.item.ingredient.quantity.value - 1 })

    // Set initial extra overcasting options to SL if checked
    if (test.result.overcast.enabled) {
      if (test.item.overcast.initial.type == "SL") {
        setProperty(result, "overcast.usage.other.initial", parseInt(result.SL) + (parseInt(test.item.computeSpellPrayerFormula("", false, test.spell.overcast.initial.additional)) || 0))
        setProperty(result, "overcast.usage.other.current", parseInt(result.SL) + (parseInt(test.item.computeSpellPrayerFormula("", false, test.spell.overcast.initial.additional)) || 0))
      }
    }


    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(test))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }

    this.runEffects("rollTest", { test, cardOptions })
    this.runEffects("rollCastTest", { test, cardOptions })
    Hooks.call("wfrp4e:rollCastTest", test, cardOptions)

    if (test.result.miscastModifier) {
      if (test.result.minormis)
        test.result.minormis += ` (${test.result.miscastModifier})`
      if (test.result.majormis)
        test.result.majormis += ` (${test.result.miscastModifier})`
      if (test.result.catastrophicmis)
        test.result.catastrophicmis += ` (${test.result.miscastModifier})`
    }

      //@HOUSE
    if (test.item.cn.SL > 0) {

      if (test.result.castOutcome == "success" || !game.settings.get("wfrp4e", "mooCastAfterChannelling"))
        test.item.update({ "data.cn.SL": 0 })

      else if (game.settings.get("wfrp4e", "mooCastAfterChannelling"))
      {
        game.wfrp4e.utility.logHomebrew("mooCastAfterChannelling")
        if (test.item.cn.SL > 0 && test.result.castOutcome == "failure")
          test.result.other.push("Failure to Cast while Channelling counts as an interruption")
      }
    }
    //@/HOUSE


    if (!options.suppressMessage)
      ChatWFRP.renderRollCard(cardOptions, test, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return test;
  }

  /**
   * channelTest is used for casting tests, see setupCast for how it's assigned.
   *
   * channellOveride doesn't add any special functionality, it's main purpose being to call
   * ChatWFRP.rollChannellTest() instead of the generic ChatWFRP.rollTest()
   *
   * @param {Object} testData         All the data needed to evaluate test results - see setupChannell()
   * @param {Object} cardOptions      Data for the card display, title, template, etc.
   * @param {Object} rerenderMessage  The message to be updated (used if editing the chat card)
   */
  async channelTest({ testData, cardOptions }, options = {}) {
    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`,
        cardOptions.isOpposedTest = true
    }


    let test
    if (testData.result)
      test = game.wfrp4e.rolls.TestWFRP.recreate(testData)
    else
      test = new testData.rollClass(testData)
    this.runEffects("preRollTest", { test, cardOptions })
    this.runEffects("preChannellingTest", { test, cardOptions })
    await test.roll();
    let result = test.result

    // Find ingredient being used, if any
    if (test.hasIngredient && test.item.ingredient.quantity.value > 0 && !test.context.edited && !test.context.reroll)
      test.item.ingredient.update({ "data.quantity.value": test.item.ingredient.quantity.value - 1 })

    let newSL = Math.clamped(Number(test.item.cn.SL) + Number(test.result.SL), 0, test.item.cn.value)
    test.item.update({ "data.cn.SL": newSL })

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(test))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }

    if (test.result.miscastModifier) {
      if (test.result.minormis)
        test.result.minormis += ` (${test.result.miscastModifier})`
      if (test.result.majormis)
        test.result.majormis += ` (${test.result.miscastModifier})`
      if (test.result.catastrophicmis)
        test.result.catastrophicmis += ` (${test.result.miscastModifier})`
    }


    this.runEffects("rollTest", { test, cardOptions })
    this.runEffects("rollChannellingTest", { test, cardOptions })
    Hooks.call("wfrp4e:rollChannelTest", test, cardOptions)

    if (test.result.miscastModifier) {
      if (test.result.minormis)
        test.result.minormis += ` (${test.result.miscastModifier})`
      if (test.result.majormis)
        test.result.majormis += ` (${test.result.miscastModifier})`
      if (test.result.catastrophicmis)
        test.result.catastrophicmis += ` (${test.result.miscastModifier})`
    }

    if (!options.suppressMessage)
      ChatWFRP.renderRollCard(cardOptions, test, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return test;
  }

  /**
   * prayerTest is used for casting tests, see setupCast for how it's assigned.
   *
   * prayerTest doesn't add any special functionality, it's main purpose being to call
   * ChatWFRP.rollPrayerTest() instead of the generic ChatWFRP.rollTest()
   *
   * @param {Object} testData         All the data needed to evaluate test results - see setupPrayer()
   * @param {Object} cardOptions      Data for the card display, title, template, etc.
   * @param {Object} rerenderMessage  The message to be updated (used if editing the chat card)
   */
  async prayerTest({ testData, cardOptions }, options = {}) {
    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`,
        cardOptions.isOpposedTest = true
    }

    let test
    if (testData.result)
      test = game.wfrp4e.rolls.TestWFRP.recreate(testData)
    else
      test = new testData.rollClass(testData)
    this.runEffects("preRollTest", { test, cardOptions })
    this.runEffects("preRollPrayerTest", { test, cardOptions })
    await test.roll();
    let result = test.result

    if (result.wrath) {
      let sin = this.status.sin.value - 1
      if (sin < 0) sin = 0
      this.update({ "data.status.sin.value": sin });
    }

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(test))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { test, cardOptions })
    this.runEffects("rollPrayerTest", { test, cardOptions })
    Hooks.call("wfrp4e:rollPrayerTest", test, cardOptions)

    if (!options.suppressMessage)
      ChatWFRP.renderRollCard(cardOptions, test, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return test;
  }

  /**
   * traitTest is used for Trait tests, see setupTrait for how it's assigned.
   *
   * Since traitTest calls the generic ChatWFRP.rollTest(), which does not consider damage,
   * some post processing must be done to calculate damage values.
   *
   * @param {Object} testData         All the data needed to evaluate test results - see setupTrait()
   * @param {Object} cardOptions      Data for the card display, title, template, etc.
   * @param {Object} rerenderMessage  The message to be updated (used if editing the chat card)
   */
  async traitTest({ testData, cardOptions }, options = {}) {
    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`,
        cardOptions.isOpposedTest = true
    }
    let test
    if (testData.result)
      test = game.wfrp4e.rolls.TestWFRP.recreate(testData)
    else
      test = new testData.rollClass(testData)
    this.runEffects("preRollTest", { test, cardOptions })
    this.runEffects("preRollTraitTest", { test, cardOptions })
    await test.roll();

    let result = test.result
    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(test))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { test, cardOptions })
    this.runEffects("rollTraitTest", { test, cardOptions })
    Hooks.call("wfrp4e:rollTraitTest", test, cardOptions)

    if (!options.suppressMessage)
      ChatWFRP.renderRollCard(cardOptions, test, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return test;
  }

  //#endregion


  /* --------------------------------------------------------------------------------------------------------- */
  /* --------------------------------- Preparation & Calculation Functions ----------------------------------- */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * Preparation function takes raw item data and processes it with actor data, typically using the calculate
   * functions to do so. For example, A weapon passed into prepareWeaponCombat will turn the weapon's damage 
   * from "SB + 4" to the actual damage value by using the actor's strength bonus. See the specific functions
   * below for more details on what exactly is processed. These functions are used when rolling a test 
   * (determining a weapon's base damage) or setting up the actor sheet to be displayed (displaying the damage
   * in the combat tab).
   *
  /* --------------------------------------------------------------------------------------------------------- */

  prepareItems() {

    const inContainers = []; // inContainers is the temporary storage for items within a container

    for (let i of this.items) {
      i.prepareOwnedData()

      if (i.location && i.location.value && i.type != "critical" && i.type != "injury") {
        inContainers.push(i);
      }
      else if (i.encumbrance && i.type != "vehicleMod")
        this.status.encumbrance.current += Number(i.encumbrance.value);
    }
    this.computeEncumbrance()
    this.computeAP()
  }

  computeEncumbrance() {
    if (this.type != "vehicle") {
      this.status.encumbrance.current = Math.floor(this.status.encumbrance.current)
      this.status.encumbrance.state = this.status.encumbrance.current / this.status.encumbrance.max
    }
    else if (this.type == "vehicle") {
      if (!game.actors) // game.actors does not exist at startup, use existing data
        game.wfrp4e.postReadyPrepare.push(this)
      else {
        if (getProperty(this, "data.flags.actorEnc"))
          for (let passenger of this.passengers)
            this.status.encumbrance.current += passenger.enc;
      }
    }


    this.status.encumbrance.current = Math.floor(this.status.encumbrance.current);
    this.status.encumbrance.mods = this.getItemTypes("vehicleMod").reduce((prev, current) => prev + current.encumbrance.value, 0)
    this.status.encumbrance.over = this.status.encumbrance.mods - this.status.encumbrance.initial
    this.status.encumbrance.over = this.status.encumbrance.over < 0 ? 0 : this.status.encumbrance.over
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
      shield: 0
    }

    this.getItemTypes("armour").filter(a => a.isEquipped).forEach(a => a._addAPLayer(AP))

    this.getItemTypes("weapon").filter(i => i.properties.qualities.shield && i.isEquipped).forEach(i =>
      AP.shield += i.properties.qualities.shield.value - i.damageToItem.shield
    )

    this.status.armour = AP
  }

  _getTokenSize() {
    let tokenData = {}
    let tokenSize = game.wfrp4e.config.tokenSizes[this.details.size.value];
    if (tokenSize < 1)
      tokenData.scale = tokenSize;
    else {
      tokenData.scale = 1;
      tokenData.height = tokenSize;
      tokenData.width = tokenSize;
    }
    return tokenData;
  }


  //  Update hook?
  checkWounds() {
    if (this.data.flags.autoCalcWounds) {
      let wounds = this._calculateWounds()

      if (this.status.wounds.max != wounds) // If change detected, reassign max and current wounds
      {
        if (this.compendium || !game.actors || !this.inCollection) // Initial setup, don't send update
        {
          this.status.wounds.max = wounds;
          this.status.wounds.value = wounds;
        }
        else
          this.update({ "data.status.wounds.max": wounds, "data.status.wounds.value": wounds });
      }
    }
  }





  /**
 * Adds all missing basic skills to the Actor.
 *
 * This function will add all mising basic skills, used when an Actor is created (see create())
 * as well as from the right click menu from the Actor directory.
 *
 */
  async addBasicSkills() {
    let ownedBasicSkills = this.getItemTypes("skill").filter(i => i.advanced.value == "bsc");
    let allBasicSkills = await WFRP_Utility.allBasicSkills()

    // Filter allBasicSkills with ownedBasicSkills, resulting in all the missing skills
    let skillsToAdd = allBasicSkills.filter(s => !ownedBasicSkills.find(ownedSkill => ownedSkill.name == s.name))

    // Add those missing basic skills
    this.createEmbeddedDocuments("Item", skillsToAdd);
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
  _calculateWounds() {
    // Easy to reference bonuses
    let sb = this.characteristics.s.bonus + (this.characteristics.s.calculationBonusModifier || 0);
    let tb = this.characteristics.t.bonus + (this.characteristics.t.calculationBonusModifier || 0);
    let wpb = this.characteristics.wp.bonus + (this.characteristics.wp.calculationBonusModifier || 0);
    let multiplier = {
      sb: 0,
      tb: 0,
      wpb: 0,
    }

    if (this.data.flags.autoCalcCritW)
      this.status.criticalWounds.max = tb;

    let effectArgs = { sb, tb, wpb, multiplier, actor: this.data }
    this.runEffects("preWoundCalc", effectArgs);
    ({ sb, tb, wpb } = effectArgs);

    let wounds = this.status.wounds.max;

    if (this.data.flags.autoCalcWounds) {
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

    effectArgs = { wounds, actor: this.data }
    this.runEffects("woundCalc", effectArgs);
    wounds = effectArgs.wounds;


    return wounds
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
  applyDamage(opposedTest, damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL) {
    if (!opposedTest.result.damage)
      return `<b>Error</b>: ${game.i18n.localize("CHAT.DamageAppliedError")}`
    // If no damage value, don't attempt anything
    if (!opposedTest.result.damage.value)
      return game.i18n.localize("CHAT.DamageAppliedErrorTiring");
    // Get actor/tokens for those in the opposed test
    let actor = this
    let attacker = opposedTest.attacker
    let soundContext = { item: {}, action: "hit" };

    let args = { actor, attacker, opposedTest, damageType }
    actor.runEffects("preTakeDamage", args)
    attacker.runEffects("preApplyDamage", args)
    damageType = args.damageType

    // Start wound loss at the damage value
    let totalWoundLoss = opposedTest.result.damage.value
    let newWounds = actor.status.wounds.value;
    let applyAP = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let applyTB = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let AP = actor.status.armour[opposedTest.result.hitloc.value];

    // Start message update string
    let updateMsg = `<b>${game.i18n.localize("CHAT.DamageApplied")}</b><span class = 'hide-option'>: `;
    let messageElements = []
    // if (damageType !=  game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL)
    //   updateMsg += " ("

    let weaponProperties
    // If weapon is undamaging
    let undamaging = false;
    // If weapon has Hack
    let hack = false;
    // If weapon has Impale
    let impale = false;
    // If weapon has Penetrating
    let penetrating = false;

    // if weapon has pummel - only used for audio
    let pummel = false

    // Reduce damage by TB
    if (applyTB) {
      totalWoundLoss -= actor.characteristics.t.bonus
      messageElements.push(`${actor.characteristics.t.bonus} ${game.i18n.localize("TBRed")}`)
    }

    // If the actor has the Robust talent, reduce damage by times taken
    //totalWoundLoss -= actor.data.flags.robust || 0;

    // if (actor.data.flags.robust)
    //   messageElements.push(`${actor.data.flags.robust} ${game.i18n.localize("Robust")}`)

    if (applyAP) {
      AP.ignored = 0;
      if (opposedTest.attackerTest.weapon) // If the attacker is using a weapon
      {
        // Determine its qualities/flaws to be used for damage calculation
        weaponProperties = opposedTest.attackerTest.weapon.properties
        penetrating = weaponProperties.qualities.penetrating
        undamaging = weaponProperties.flaws.undamaging
        hack = weaponProperties.qualities.hack
        impale = weaponProperties.qualities.impale
        pummel = weaponProperties.qualities.pummel
      }
      // see if armor flaws should be triggered
      let ignorePartial = opposedTest.attackerTest.result.roll % 2 == 0 || opposedTest.attackerTest.result.critical
      let ignoreWeakpoints = opposedTest.attackerTest.result.critical && impale

      // Mitigate damage with armor one layer at a time
      for (let layer of AP.layers) {
        if (ignoreWeakpoints && layer.weakpoints) {
          AP.ignored += layer.value
        }
        else if (ignorePartial && layer.partial) {
          AP.ignored += layer.value;
        }
        else if (penetrating) // If penetrating - ignore 1 or all armor depending on material
        {
          if (!game.settings.get("wfrp4e", "mooPenetrating")) 
            AP.ignored += layer.metal ? 1 : layer.value
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

      //@HOUSE
      if (penetrating && game.settings.get("wfrp4e", "mooPenetrating")) {
        game.wfrp4e.utility.logHomebrew("mooPenetrating")
        AP.ignored += penetrating.value || 2
      }
      //@/HOUSE
      // AP.used is the actual amount of AP considered
      AP.used = AP.value - AP.ignored
      AP.used = AP.used < 0 ? 0 : AP.used;           // AP minimum 0
      AP.used = undamaging ? AP.used * 2 : AP.used;  // Double AP if undamaging

      // show the AP usage in the updated message
      if (AP.ignored)
        messageElements.push(`${AP.used}/${AP.value} ${game.i18n.localize("AP")}`)
      else
        messageElements.push(`${AP.used} ${game.i18n.localize("AP")}`)

      // If using a shield, add that AP as well
      let shieldAP = 0;
      if (opposedTest.defenderTest.weapon) {
        if (opposedTest.defenderTest.weapon.properties.qualities.shield)
          shieldAP = opposedTest.defenderTest.weapon.properties.qualities.shield.value
      }

      //@HOUSE
      if (game.settings.get("wfrp4e", "mooShieldAP") && opposedTest.defenderTest.result.outcome == "failure") {
        game.wfrp4e.utility.logHomebrew("mooShieldAP")
        shieldAP = 0;
      }
      //@/HOUSE

      if (shieldAP)
        messageElements.push(`${shieldAP} ${game.i18n.localize("CHAT.DamageShield")}`)

      // Reduce damage done by AP
      totalWoundLoss -= (AP.used + shieldAP)

      // Minimum 1 wound if not undamaging
      if (!undamaging)
        totalWoundLoss = totalWoundLoss <= 0 ? 1 : totalWoundLoss
      else
        totalWoundLoss = totalWoundLoss <= 0 ? 0 : totalWoundLoss


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
      catch (e) { console.log("wfrp4e | Sound Context Error: " + e) } // Ignore sound errors
    }

    let scriptArgs = { actor, opposedTest, totalWoundLoss, AP, damageType, updateMsg, messageElements, attacker }
    actor.runEffects("takeDamage", scriptArgs)
    attacker.runEffects("applyDamage", scriptArgs)
    Hooks.call("wfrp4e:applyDamage", scriptArgs)

    let item = opposedTest.attackerTest.item
    let itemDamageEffects = item.effects.filter(e => e.application == "damage")
    for (let effect of itemDamageEffects) {
      try {
        let func = new Function("args", effect.script).bind({ actor, effect, item })
        func(scriptArgs)
      }
      catch (ex) {
        ui.notifications.error(game.i18n.format("ERROR.EFFECT", {effect: effect.label} ))
        console.error("Error when running effect " + effect.label + " - If this effect comes from an official module, try replacing the actor/item from the one in the compendium. If it still throws this error, please use the Bug Reporter and paste the details below, as well as selecting which module and 'Effect Report' as the label.")
        console.error(`REPORT\n-------------------\nEFFECT:\t${effect.label}\nACTOR:\t${actor.name} - ${actor.id}\nERROR:\t${ex}`)
      }
    }
    totalWoundLoss = scriptArgs.totalWoundLoss


    newWounds -= totalWoundLoss
    updateMsg += "</span>"
    updateMsg += " " + totalWoundLoss;

    updateMsg += ` (${messageElements.join(" + ")})`

    WFRP_Audio.PlayContextAudio(soundContext)

    // If damage taken reduces wounds to 0, show Critical
    if (newWounds <= 0) {
      //WFRP_Audio.PlayContextAudio(opposedTest.attackerTest.weapon, {"type": "hit", "equip": "crit"})
      let critAmnt = game.settings.get("wfrp4e", "dangerousCritsMod")
      if (game.settings.get("wfrp4e", "dangerousCrits") && critAmnt && (Math.abs(newWounds) - actor.characteristics.t.bonus) > 0) {
        let critModifier = (Math.abs(newWounds) - actor.characteristics.t.bonus) * critAmnt;
        updateMsg += `<br><a class ="table-click critical-roll" data-modifier=${critModifier} data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")} +${critModifier}</a>`
      }
      //@HOUSE
      else if (game.settings.get("wfrp4e", "mooCritModifiers")) {
        game.wfrp4e.utility.logHomebrew("mooCritModifiers")
        let critModifier = (Math.abs(newWounds) - actor.characteristics.t.bonus) * critAmnt;
        if(critModifier)
          updateMsg += `<br><a class ="table-click critical-roll" data-modifier=${critModifier} data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")} ${critModifier > 0 ? "+" + critModifier : critModifier}</a>`
        else
          updateMsg += `<br><a class ="table-click critical-roll" data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")}</a>`
      }
      //@/HOUSE
      else if (Math.abs(newWounds) < actor.characteristics.t.bonus)
        updateMsg += `<br><a class ="table-click critical-roll" data-modifier="-20" data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")} (-20)</a>`
      else
        updateMsg += `<br><a class ="table-click critical-roll" data-table = "crit${opposedTest.result.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")}</a>`
    }
    if (hack)
      updateMsg += `<br>${game.i18n.localize("CHAT.DamageAP")} ${game.wfrp4e.config.locations[opposedTest.result.hitloc.value]}`

    if (newWounds <= 0)
      newWounds = 0; // Do not go below 0 wounds


    let daemonicTrait = actor.has(game.i18n.localize("NAME.Daemonic"))
    let wardTrait = actor.has(game.i18n.localize("NAME.Ward"))
    if (daemonicTrait) {
      let daemonicRoll = Math.ceil(CONFIG.Dice.randomUniform()*10);
      let target = daemonicTrait.specification.value
      // Remove any non numbers
      if (isNaN(target))
        target = target.split("").filter(char => /[0-9]/.test(char)).join("")

      if (Number.isNumeric(target) && daemonicRoll >= parseInt(daemonicTrait.specification.value)) {
        updateMsg = `<span style = "text-decoration: line-through">${updateMsg}</span><br>${game.i18n.format("OPPOSED.Daemonic", { roll: daemonicRoll })}`
        return updateMsg;
      }
      else if (Number.isNumeric(target)){
        updateMsg += `<br>${game.i18n.format("OPPOSED.DaemonicRoll", {roll : daemonicRoll})}`
      }

    }

    if (wardTrait) {
      let wardRoll = Math.ceil(CONFIG.Dice.randomUniform()*10);
      let target = wardTrait.specification.value
      // Remove any non numbers
      if (isNaN(target))
        target = target.split("").filter(char => /[0-9]/.test(char)).join("")

      if (Number.isNumeric(target) && wardRoll >= parseInt(wardTrait.specification.value)) {
        updateMsg = `<span style = "text-decoration: line-through">${updateMsg}</span><br>${game.i18n.format("OPPOSED.Ward", { roll: wardRoll })}`
        return updateMsg;
      }
      else if (Number.isNumeric(target)){
        updateMsg += `<br>${game.i18n.format("OPPOSED.WardRoll", {roll : wardRoll})}`
      }

    }

    // Update actor wound value
    actor.update({ "data.status.wounds.value": newWounds })

    return updateMsg;
  }



  /**
   * Unlike applyDamage(), which is for opposed damage calculation, this function just takes a number and damage type and applies the damage.
   * 
   * @param {Number} damage Amount of damage
   * @param {Object} options Type of damage, minimum 1
   */
  async applyBasicDamage(damage, { damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL, minimumOne = true, loc = "body", suppressMsg = false } = {}) {
    let newWounds = this.status.wounds.value;
    let modifiedDamage = damage;
    let applyAP = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let applyTB = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let msg = game.i18n.format("CHAT.ApplyDamageBasic", { name: this.data.token.name });

    if (applyAP) {
      modifiedDamage -= this.data.AP[loc].value
      msg += `(${this.data.AP[loc].value} ${game.i18n.localize("AP")})`
      if (!applyTB)
        msg += ")"
      else
        msg += " + "
    }

    if (applyTB) {
      modifiedDamage -= this.characteristics.t.bonus;
      if (!applyAP)
        msg += "("
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
    await this.update({ "data.status.wounds.value": newWounds })

    if (!suppressMsg)
      return ChatMessage.create({ content: msg })
    else return msg;
  }


    /**
   * Display changes to health as scrolling combat text.
   * Adapt the font size relative to the Actor's HP total to emphasize more significant blows.
   * @param {number} daamge
   * @private
   */
  _displayScrollingChange(change, options={}) {
    if ( !change ) return;
    change = Number(change);
    const tokens = this.isToken ? [this.token?.object] : this.getActiveTokens(true);
    for ( let t of tokens ) {
      if ( !t?.hud?.createScrollingText ) continue;  // This is undefined prior to v9-p2
      t.hud.createScrollingText(change.signedString(), {
        anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
        fontSize: 30,
        fill: options.advantage ? "0x6666FF" : change < 0 ?  "0xFF0000" : "0x00FF00", // I regret nothing
        stroke: 0x000000,
        strokeThickness: 4,
        jitter: 0.25
      });
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
      console.log("wfrp4e | Could not find species " + this.details.species.value + ": " + error);
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
      console.log("wfrp4e | Could not find species " + this.details.species.value + ": " + error);
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
      existingSkill.data.advances.value = (existingSkill.data.advances.value < advances) ? advances : existingSkill.data.advances.value;
      await this.updateEmbeddedDocuments("Item", [existingSkill]);
      return;
    }

    // If the actor does not already own skill, search through compendium and add it
    try {
      // See findSkill() for a detailed explanation of how it works
      // Advanced find function, returns the skill the user expects it to return, even with skills not included in the compendium (Lore (whatever))
      let skillToAdd = (await WFRP_Utility.findSkill(skillName)).toObject()
      skillToAdd.data.advances.value = advances;
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
  async _advanceNPC(careerData) {
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
      let value = getProperty(this.data, term);
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
      let data = duplicate(message.data.flags.data);
      let test = data.testData
      let html = `<h3 class="center"><b>${game.i18n.localize("FORTUNE.Use")}</b></h3>`;
      //First we send a message to the chat
      if (type == "reroll")
        html += `${game.i18n.format("FORTUNE.UsageRerollText", { character: '<b>' + this.name + '</b>' })}<br>`;
      else
        html += `${game.i18n.format("FORTUNE.UsageAddSLText", { character: '<b>' + this.name + '</b>' })}<br>`;

      html += `<b>${game.i18n.localize("FORTUNE.PointsRemaining")} </b>${this.status.fortune.value - 1}`;
      ChatMessage.create(WFRP_Utility.chatDataSetup(html));

      let cardOptions = this.preparePostRollAction(message);
      //Then we do the actual fortune action
      if (type == "reroll") {
        cardOptions.fortuneUsedReroll = true;
        cardOptions.hasBeenCalculated = false;
        cardOptions.calculatedMessage = [];
        //It was an unopposed targeted test who failed
        if (data.originalTargets && data.originalTargets.size > 0) {
          game.user.targets = data.originalTargets;
          //Foundry has a circular reference to the user in its targets set so we do it too
          game.user.targets.user = game.user;
        }
        //It it is an ongoing opposed test, we transfer the list of the startMessages to update them
        if (!data.defenderMessage && data.startMessagesList) {
          cardOptions.startMessagesList = data.startMessagesList;
        }
        test.context.previousResult = data.result
        test.context.reroll = true;
        delete test.result.roll;
        delete test.preData.SL;
        this[`${test.context.postFunction}`]({ testData: test, cardOptions });

        //We also set fortuneUsedAddSL to force the player to use it on the new roll
        message.update({
          "flags.data.fortuneUsedReroll": true,
          "flags.data.fortuneUsedAddSL": true
        });

      }
      else //addSL
      {
        test.preData.SL = Math.trunc(test.result.SL) + 1;
        test.preData.slBonus = 0;
        test.preData.successBonus = 0;
        test.preData.roll = Math.trunc(test.result.roll);
        test.preData.hitloc = test.preData.hitloc;

        //We deselect the token, 
        //2020-04-25 : Currently the foundry function is bugged so we do it ourself
        //game.user.updateTokenTargets([]);
        game.user.targets.forEach(t => t.setTarget(false, { user: game.user, releaseOthers: false, groupSelection: true }));

        cardOptions.fortuneUsedAddSL = true;
        this[`${test.context.postFunction}`]({ testData: test, cardOptions }, { rerenderMessage: message });
        message.update({
          "flags.data.fortuneUsedAddSL": true
        });
      }
      this.update({ "data.status.fortune.value": this.status.fortune.value - 1 });
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
    this.update({ "data.status.corruption.value": corruption }).then(() => {
      this.checkCorruption();
    });

    let data = duplicate(message.data.flags.data);
    let test = data.testData
    let cardOptions = this.preparePostRollAction(message);
    cardOptions.fortuneUsedReroll = data.fortuneUsedReroll;
    cardOptions.fortuneUsedAddSL = data.fortuneUsedAddSL;
    cardOptions.hasBeenCalculated = false;
    cardOptions.calculatedMessage = [];

    //It was an unopposed targeted test who failed
    if (data.originalTargets && data.originalTargets.size > 0) {
      game.user.targets = data.originalTargets;
      //Foundry has a circular reference to the user in its targets set so we do it too
      game.user.targets.user = game.user;
    }
    //It it is an ongoing opposed test, we transfer the list of the startMessages to update them
    if (!data.defenderMessage && data.startMessagesList) {
      cardOptions.startMessagesList = data.startMessagesList;
    }
    test.context.previousResult = duplicate(test.result)
    test.context.reroll = true;
    delete test.preData.roll;
    delete test.result.roll;
    delete test.preData.SL;
    this[`${test.context.postFunction}`]({ testData: test, cardOptions });
  }

  /**
   * This helper can be used to prepare cardOptions to reroll/edit a test card
   * It uses the informations of the roll located in the message entry
   * from game.messages
   * @param {Object} message 
   * @returns {Object} cardOptions
   */
  preparePostRollAction(message) {
    //recreate the initial (virgin) cardOptions object
    //add a flag for reroll limit
    let data = message.data.flags.data;
    let cardOptions = {
      flags: { img: message.data.flags.img },
      rollMode: data.rollMode,
      sound: message.data.sound,
      speaker: message.data.speaker,
      template: data.template,
      title: data.title.replace(` - ${game.i18n.localize("Opposed")}`, ""),
      user: message.data.user
    };
    if (data.attackerMessage)
      cardOptions.attackerMessage = data.attackerMessage;
    if (data.defenderMessage)
      cardOptions.defenderMessage = data.defenderMessage;
    if (data.unopposedStartMessage)
      cardOptions.unopposedStartMessage = data.unopposedStartMessage;
    return cardOptions;
  }


  async corruptionDialog(strength) {
    new Dialog({
      title: game.i18n.localize("DIALOG.CorruptionTitle"),
      content: `<p>${game.i18n.format("DIALOG.CorruptionContent", { name: this.name })}</p>`,
      buttons: {
        endurance: {
          label: game.i18n.localize("NAME.Endurance"),
          callback: () => {
            let skill = this.getItemTypes("skill").find(i => i.name == game.i18n.localize("NAME.Endurance"))
            if (skill) {
              this.setupSkill(skill, { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: skill.name }), corruption: strength }).then(setupData => this.basicTest(setupData))
            }
            else {
              this.setupCharacteristic("t", { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: game.wfrp4e.config.characteristics["t"] }), corruption: strength }).then(setupData => this.basicTest(setupData))
            }
          }
        },
        cool: {
          label: game.i18n.localize("NAME.Cool"),
          callback: () => {
            let skill = this.getItemTypes("skill").find(i => i.name == game.i18n.localize("NAME.Cool"))
            if (skill) {
              this.setupSkill(skill, { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: skill.name }), corruption: strength }).then(setupData => this.basicTest(setupData))
            }
            else {
              this.setupCharacteristic("wp", { title: game.i18n.format("DIALOG.CorruptionTestTitle", { test: game.wfrp4e.config.characteristics["wp"] }), corruption: strength }).then(setupData => this.basicTest(setupData))
            }
          }
        }

      }
    }).render(true)
  }


  has(traitName, type = "trait") {
    return this.getItemTypes(type).find(i => i.name == traitName && i.included)
  }



  getDialogChoices() {
    let effects = this.effects.filter(e => e.trigger == "dialogChoice" && !e.isDisabled).map(e => {
      return e.prepareDialogChoice()
    })

    let dedupedEffects = []

    effects.forEach(e => {
      let existing = dedupedEffects.find(ef => ef.description == e.description)
      if (existing) {
        existing.modifier += e.modifier
        existing.slBonus += e.slBonus
        existing.successBonus += e.successBonus
      }
      else
        dedupedEffects.push(e)
    })
    return dedupedEffects
  }

  getTalentTests() {
    let talents = this.getItemTypes("talent").filter(t => t.tests.value)
    let noDups = []
    for (let t of talents) {
      if (!noDups.find(i => i.name == t.name))
        noDups.push(t)
    }
    return noDups
  }


  /**
   * Provides a centralized method to determine how to prefill the roll dialog
   * 
   * @param {String} type   "characteristic", "skill", "weapon", etc. Corresponding to setup____
   * @param {Object} item   For when an object is being used, such as any test except characteristic
   * @param {*} options     Optional parameters, such as if "resting", or if testing for corruption
   */
  getPrefillData(type, item, options = {}) {
    let modifier = 0,
      difficulty = "challenging",
      slBonus = 0,
      successBonus = 0

    let tooltip = []

    try {

      // Overrides default difficulty to Average depending on module setting and combat state
      if (game.settings.get("wfrp4e", "testDefaultDifficulty") && (game.combat != null))
        difficulty = game.combat.started ? "challenging" : "average";
      else if (game.settings.get("wfrp4e", "testDefaultDifficulty"))
        difficulty = "average";

      if (this.type != "vehicle") {
        if (type != "channelling") {

          if (!game.settings.get("wfrp4e", "mooAdvantage")) {
            modifier += game.settings.get("wfrp4e", "autoFillAdvantage") ? (this.status.advantage.value * game.settings.get("wfrp4e", "advantageBonus") || 0) : 0
            if (parseInt(this.status.advantage.value) && game.settings.get("wfrp4e", "autoFillAdvantage"))
              tooltip.push(game.i18n.localize("Advantage"))
          }
        }


        // @HOUSE
        if (type != "cast") {
          if (game.settings.get("wfrp4e", "mooAdvantage")) {
            successBonus += game.settings.get("wfrp4e", "autoFillAdvantage") ? (this.status.advantage.value * 1 || 0) : 0
            if (parseInt(this.status.advantage.value) && game.settings.get("wfrp4e", "autoFillAdvantage"))
              tooltip.push(game.i18n.localize("Advantage"))
          }
        }
        // @/HOUSE


        if (type == "characteristic") {
          if (options.dodge && this.isMounted) {
            modifier -= 20
            tooltip.push(game.i18n.localize("EFFECT.DodgeMount"))
          }
        }

        if (type == "skill") {
          if (item.name == game.i18n.localize("NAME.Dodge") && this.isMounted) {
            modifier -= 20
            tooltip.push(game.i18n.localize("EFFECT.DodgeMount"))
          }

        }

        if (options.corruption || options.mutate)
          difficulty = "challenging"

        if (options.rest || options.income)
          difficulty = "average"
      }

      let attacker = this.attacker
      if (attacker && attacker.test.weapon && attacker.test.weapon.properties.flaws.slow) {
        if (!game.settings.get("wfrp4e", "mooQualities") || ((type == "skill" && item.name == game.i18n.localize("NAME.Dodge")) || (type=="characteristic" && options.dodge)))
        {
          slBonus += 1
          tooltip.push(game.i18n.localize('CHAT.TestModifiers.SlowDefend'))
        }
      }

      if (type == "weapon" || type == "trait") {
        let { wepModifier, wepSuccessBonus, wepSLBonus } = this.weaponPrefillData(item, options, tooltip);
        modifier += wepModifier;
        slBonus += wepSLBonus;
        successBonus += wepSuccessBonus
      }

      if (type == "weapon" || type == "trait") {
        let { sizeModifier, sizeSuccessBonus, sizeSLBonus } = this.sizePrefillModifiers(item, type, options, tooltip);
        modifier += sizeModifier;
        slBonus += sizeSLBonus;
        successBonus += sizeSuccessBonus
      }

      modifier += this.armourPrefillModifiers(item, type, options, tooltip);

      if (type == "trait")
        difficulty = item.rollable.defaultDifficulty || difficulty


      if (options.modify) {
        modifier = modifier += (options.modify.modifier || 0)
        slBonus = slBonus += (options.modify.slBonus || 0)
        successBonus = successBonus += (options.modify.successBonus || 0)

        if (options.modify.difficulty)
          difficulty = game.wfrp4e.utility.alterDifficulty(difficulty, options.modify.difficulty)

      }


    let effectModifiers = { modifier, difficulty, slBonus, successBonus }
    let effects = this.runEffects("prefillDialog", { prefillModifiers: effectModifiers, type, item, options })
    tooltip = tooltip.concat(effects.map(e => e.label))
    if (game.user.targets.size) {
      effects = this.runEffects("targetPrefillDialog", { prefillModifiers: effectModifiers, type, item, options })
      tooltip = tooltip.concat(effects.map(e => game.i18n.localize("EFFECT.Target") + e.label))
    }

      modifier = effectModifiers.modifier;
      difficulty = effectModifiers.difficulty;
      slBonus = effectModifiers.slBonus;
      successBonus = effectModifiers.successBonus;



      if (options.absolute) {
        modifier = options.absolute.modifier || modifier
        difficulty = options.absolute.difficulty || difficulty
        slBonus = options.absolute.slBonus || slBonus
        successBonus = options.absolute.successBonus || successBonus
      }
    }
    catch(e)
    {
      ui.notifications.error("Something went wrong with applying general modifiers: " + e)
      slBonus = 0;
      successBonus = 0;
      modifier = 0;
    }

    return {
      testModifier: modifier,
      testDifficulty: difficulty,
      slBonus,
      successBonus,
      prefillTooltip: game.i18n.localize("EFFECT.Tooltip") + "\n" + tooltip.map(t => t.trim()).join("\n")
    }

  }



  weaponPrefillData(item, options, tooltip = []) {
    let slBonus = 0;
    let successBonus = 0;
    let modifier = 0;

    // If offhand and should apply offhand penalty (should apply offhand penalty = not parry, not defensive, and not twohanded)
    if (item.type == "weapon" && item.offhand.value && !item.twohanded.value && !(item.weaponGroup.value == "parry" && item.properties.qualities.defensive)) {
      modifier = -20
      tooltip.push(game.i18n.localize("SHEET.Offhand"))
      modifier += Math.min(20, this.data.flags.ambi * 10)
      if (this.data.flags.ambi)
        tooltip.push(game.i18n.localize("NAME.Ambi"))
    }



    try {

      let target = game.user.targets.size ? Array.from(game.user.targets)[0].actor : undefined
      let attacker = this.attacker


      if (this.defensive && attacker) {
        tooltip.push(game.i18n.localize("PROPERTY.Defensive"))
        slBonus += this.defensive;
      }

      //if attacker is fast, and the defender is either 1. using a melee trait to defend, or 2. using a weapon without fast
      if (attacker && attacker.test.item.type == "weapon" && attacker.test.item.properties.qualities.fast && item.attackType == "melee" && (item.type == "trait" || (item.type == "weapon" && !item.properties.qualities.fast))) {
        tooltip.push(game.i18n.localize('CHAT.TestModifiers.FastWeapon'))
        modifier += -10;
      }
      

      if (item.type == "weapon") {
        // Prefill dialog according to qualities/flaws
        if (item.properties.qualities.accurate) {
          modifier += 10;
          tooltip.push(game.i18n.localize("PROPERTY.Accurate"))
        }

        if (item.properties.qualities.precise && game.user.targets.size) {
          successBonus += 1;
          tooltip.push(game.i18n.localize("PROPERTY.Precise"))

        }
        if (item.properties.flaws.imprecise && game.user.targets.size) {
          slBonus -= 1;
          tooltip.push(game.i18n.localize("PROPERTY.Imprecise"))
        }
      }

      if (attacker && attacker.test.item.type == "weapon" && attacker.test.item.properties.qualities.wrap) {
        slBonus -= 1
        tooltip.push(game.i18n.localize('CHAT.TestModifiers.WrapDefend'))
      }

      modifier += this.rangePrefillModifiers(item, options, tooltip);

    }
    catch (e) { // If something went wrong, default to 0 for all prefilled data
      ui.notifications.error("Something went wrong with applying weapon modifiers: " + e)
      slBonus = 0;
      successBonus = 0;
      modifier = 0;
    }

    return {
      wepModifier: modifier,
      wepSuccessBonus: successBonus,
      wepSLBonus: slBonus
    }
  }


  rangePrefillModifiers(weapon, options, tooltip = []) {
    let modifier = 0;

    let token
    if (this.isToken)
      token = this.token
    else
      token = this.getActiveTokens()[0]?.document

    if (!game.settings.get("wfrp4e", "rangeAutoCalculation") || !token || !game.user.targets.size == 1 || !weapon.range?.bands)
      return 0

    let target = Array.from(game.user.targets)[0].document

    let distance = canvas.grid.measureDistances([{ ray: new Ray({ x: token.data.x, y: token.data.y }, { x: target.data.x, y: target.data.y }) }], { gridSpaces: true })[0]
    let currentBand

    for (let band in weapon.range.bands) {
      if (distance >= weapon.range.bands[band].range[0] && distance <= weapon.range.bands[band].range[1]) {
        currentBand = band;
        break;
      }
    }

    modifier += weapon.range.bands[currentBand]?.modifier || 0


    if (modifier) {
      tooltip.push(`${game.i18n.localize("Range")} - ${currentBand}`)
    }
    return modifier
  }



  sizePrefillModifiers(item, type, options, tooltip) {
    let slBonus = 0;
    let successBonus = 0;
    let modifier = 0;

    try {
      let target = game.user.targets.size ? Array.from(game.user.targets)[0].actor : undefined
      let attacker
      if (this.data.flags.oppose) {
        let attackMessage = game.messages.get(this.data.flags.oppose.messageId) // Retrieve attacker's test result message
        // Organize attacker/defender data
        attacker = {
          speaker: this.data.flags.oppose.speaker,
          test: attackMessage.getTest(),
          messageId: attackMessage.id,
          img: WFRP_Utility.getSpeaker(this.data.flags.oppose.speaker).data.img
        };
      }


      if (attacker) {
        //Size Differences
        let sizeDiff = game.wfrp4e.config.actorSizeNums[attacker.test.size] - this.sizeNum
        //Positive means attacker is larger, negative means defender is larger
        if (sizeDiff >= 1) {
          //Defending against a larger target with a weapon
          if (item.attackType == "melee") {
            tooltip.push(game.i18n.localize('CHAT.TestModifiers.DefendingLarger'))
            slBonus += (-2 * sizeDiff);
          }
        }
      }
      else if (target) {
        let sizeDiff = this.sizeNum - target.sizeNum

        // Attacking a larger creature with melee
        if (sizeDiff < 0 && (item.attackType == "melee" || target.sizeNum <= 3)) {
          modifier += 10;
          tooltip.push(game.i18n.localize('CHAT.TestModifiers.AttackingLarger'))
          // Attacking a larger creature with ranged
        }
        else if (item.attackType == "ranged") {
          let sizeModifier = 0
          if (target.details.size.value == "tiny")
            sizeModifier -= 30
          if (target.details.size.value == "ltl")
            sizeModifier -= 20
          if (target.details.size.value == "sml")
            sizeModifier -= 10
          if (target.details.size.value == "lrg")
            sizeModifier += 20
          if (target.details.size.value == "enor")
            sizeModifier += 40
          if (target.details.size.value == "mnst")
            sizeModifier += 60

          modifier += sizeModifier
          options.sizeModifier = sizeModifier

          if (target.sizeNum > 3 || target.sizeNum < 3)
            tooltip.push(game.i18n.format('CHAT.TestModifiers.ShootingSizeModifier', { size: game.wfrp4e.config.actorSizes[target.details.size.value] }))
        }
      }

      // Attacking a smaller creature from a mount
      if (this.isMounted && item.attackType == "melee" && target) {
        let mountSizeDiff = this.mount.sizeNum - target.sizeNum
        if (target.isMounted)
          mountSizeDiff = this.mount.sizeNum - target.sizeNum

        if (mountSizeDiff >= 1) {
          tooltip.push((game.i18n.localize('CHAT.TestModifiers.AttackerMountLarger')))
          modifier += 20;
        }
      }
      // Attacking a creature on a larger mount
      else if (item.attackType == "melee" && target && target.isMounted) {
        let mountSizeDiff = target.sizeNum - this.sizeNum
        if (this.isMounted)
          mountSizeDiff = target.sizeNum - this.mount.sizeNum
        if (mountSizeDiff >= 1) {
          tooltip.push(game.i18n.localize('CHAT.TestModifiers.DefenderMountLarger'))
          modifier -= 10;
        }
      }
    }
    catch (e) {
      console.error("Something went wrong with applying weapon modifiers: " + e)
      slBonus = 0;
      successBonus = 0;
      modifier = 0;
    }


    return {
      sizeModifier: modifier,
      sizeSuccessBonus: successBonus,
      sizeSLBonus: slBonus
    }
  }

  /**
   * Construct armor penalty string based on armors equipped.
   *
   * For each armor, compile penalties and concatenate them into one string.
   * Does not stack armor *type* penalties.
   * 
   * @param {Array} armorList array of processed armor items 
   * @return {string} Penalty string
   */
  armourPrefillModifiers(item, type, options, tooltip = []) {

    let modifier = 0;
    let stealthPenaltyValue = 0;

    // Armor type penalties do not stack, only apply if you wear any of that type
    let wearingMail = false;
    let wearingPlate = false;
    let practicals = 0;

    for (let a of this.getItemTypes("armour").filter(i => i.isEquipped)) {
      // For each armor, apply its specific penalty value, as well as marking down whether
      // it qualifies for armor type penalties (wearingMail/Plate)
      if (a.armorType.value == "mail")
        wearingMail = true;
      if (a.armorType.value == "plate")
        wearingPlate = true;
      if (a.practical)
        practicals++;
    }

    // Apply armor type penalties at the end
    if (wearingMail || wearingPlate) {
      let stealthPenaltyValue = 0;
      if (wearingMail)
        stealthPenaltyValue += -10;
      if (wearingPlate)
        stealthPenaltyValue += -10;

      if (stealthPenaltyValue && practicals)
        stealthPenaltyValue += 10 * practicals

      if (stealthPenaltyValue > 0)
        stealthPenaltyValue = 0;

      if (type == "skill" && item.name.includes(game.i18n.localize("NAME.Stealth"))) {
        if (stealthPenaltyValue) {
          modifier += stealthPenaltyValue
          tooltip.push(game.i18n.localize("SHEET.ArmourPenalties"))
        }
      }
    }
    return modifier;
  }



  runEffects(trigger, args, options={}) {
    let effects = this.effects.filter(e => e.trigger == trigger && e.script && !e.isDisabled)

    if (trigger == "oneTime") {
      effects = effects.filter(e => e.application != "apply" && e.application != "damage");
      if (effects.length)
        this.deleteEmbeddedDocuments("ActiveEffect", effects.map(e => e.id))
    }

    if (trigger == "targetPrefillDialog" && game.user.targets.size) {
      effects = game.user.targets.values().next().value.actor.effects.filter(e => e.trigger == "targetPrefillDialog" && !e.data.disabled).map(e => e)
      let secondaryEffects = game.user.targets.values().next().value.actor.effects.filter(e => getProperty(e.data, "flags.wfrp4e.secondaryEffect.effectTrigger") == "targetPrefillDialog" && !e.isDisabled) // A kludge that supports 2 effects. Specifically used by conditions
      effects = effects.concat(secondaryEffects.map(e => {
        let newEffect = e.toObject()
        newEffect.flags.wfrp4e.effectTrigger = newEffect.flags.wfrp4e.secondaryEffect.effectTrigger;
        newEffect.flags.wfrp4e.script = newEffect.flags.wfrp4e.secondaryEffect.script;
        return new EffectWfrp4e(newEffect, {parent : e.parent })
      }))
    }

    effects.forEach(e => {
      try {
        let func
        if (!options.async)
          func = new Function("args", e.script).bind({ actor: this, effect: e, item: e.item })
        else if (options.async)
        {
          let asyncFunction = Object.getPrototypeOf(async function () { }).constructor
          func = new asyncFunction("args", e.script).bind({ actor: this, effect: e, item: e.item })
        }
        func(args)
      }
      catch (ex) {
        ui.notifications.error(game.i18n.format("ERROR.EFFECT", {effect: e.label} ))
        console.error("Error when running effect " + e.label + " - If this effect comes from an official module, try replacing the actor/item from the one in the compendium. If it still throws this error, please use the Bug Reporter and paste the details below, as well as selecting which module and 'Effect Report' as the label.")
        console.error(`REPORT\n-------------------\nEFFECT:\t${e.label}\nACTOR:\t${this.name} - ${this.id}\nERROR:\t${ex}`)
      }
    })
    return effects
  }

  async decrementInjuries() {
    this.data.injuries.forEach(i => this.decrementInjury(i))
  }

  async decrementInjury(injury) {
    if (isNaN(injury.data.duration.value))
      return ui.notifications.notify(game.i18n.format("CHAT.InjuryError", {injury: injury.name} ))

    injury = duplicate(injury)
    injury.data.duration.value--

    if (injury.data.duration.value < 0)
      injury.data.duration.value = 0;

    if (injury.data.duration.value == 0) {
      let chatData = game.wfrp4e.utility.chatDataSetup(game.i18n.format("CHAT.InjuryFinish", {injury: injury.name}), "gmroll")
      chatData.speaker = { alias: this.name }
      ChatMessage.create(chatData)
    }
    this.updateEmbeddedDocuments("Item", [injury]);
  }


  async decrementDiseases() {
    this.data.diseases.forEach(d => this.decrementDisease(d))
  }

  async decrementDisease(disease) {
    let d = duplicate(disease)
    if (!d.data.duration.active) {
      if (Number.isNumeric(d.data.incubation.value)) {

        d.data.incubation.value--
        if (d.data.incubation.value <= 0) {
          this.activateDisease(d)
          d.data.incubation.value = 0;
        }
      }
      else {
        let chatData = game.wfrp4e.utility.chatDataSetup(`Attempted to decrement ${d.name} incubation but value is non-numeric`, "gmroll", false)
        chatData.speaker = { alias: this.name }
        ChatMessage.create(chatData)
      }
    }
    else {
      if (Number.isNumeric(d.data.duration.value)) {

        d.data.duration.value--
        if (d.data.duration.value == 0)
          this.finishDisease(d)
      }
      else {
        let chatData = game.wfrp4e.utility.chatDataSetup(`Attempted to decrement ${d.name} duration but value is non-numeric`, "gmroll", false)
        chatData.speaker = { alias: this.name }
        ChatMessage.create(chatData)
      }
    }
    this.updateEmbeddedDocuments("Item", [d])
  }

  async activateDisease(disease) {
    disease.data.duration.active = true;
    disease.data.incubation.value = 0;
    let msg = game.i18n.format("CHAT.DiseaseIncubation", { disease: disease.name })
    try {
      let durationRoll = (await new Roll(disease.data.duration.value).roll()).total
      msg += game.i18n.format("CHAT.DiseaseDuration", { duration: durationRoll, unit: disease.data.duration.unit })
      disease.data.duration.value = durationRoll;
    }
    catch (e) {
      msg += game.i18n.localize("CHAT.DiseaseDurationError")
    }

    let chatData = game.wfrp4e.utility.chatDataSetup(msg, "gmroll", false)
    chatData.speaker = { alias: this.name }
    ChatMessage.create(chatData)
  }

  async finishDisease(disease) {

    let msg = game.i18n.format("CHAT.DiseaseFinish", { disease: disease.name })

    if (disease.data.symptoms.includes("lingering")) {
      let lingering = disease.effects.find(e => e.label.includes("Lingering"))
      if (lingering) {
        let difficulty = lingering.label.substring(lingering.label.indexOf("(") + 1, lingeringLabel.indexOf(")")).toLowerCase()

        this.setupSkill("Endurance", { difficulty }).then( setupData => this.basicTest(setupData).then(async test => {
          if (test.result.outcome == "failure") {
            let negSL = Math.abs(test.result.SL)
            if (negSL <= 1) {
              let roll = (await new Roll("1d10").roll()).total
              msg += game.i18n.format("CHAT.LingeringExtended", { duration: roll })
            }
            else if (negSL <= 5) {
              msg += game.i18n.localize("CHAT.LingeringFestering")
              fromUuid("Compendium.wfrp4e-core.diseases.kKccDTGzWzSXCBOb").then(disease => {
                this.createEmbeddedDocuments("Item", [disease.toObject()])
              })
            }
            else if (negSL >= 6) {
              msg += game.i18n.localize("CHAT.LingeringRot")
              fromUuid("Compendium.wfrp4e-core.diseases.M8XyRs9DN12XsFTQ").then(disease => {
                this.createEmbeddedDocuments("Item", [disease.toObject()])
              })
            }
          }
        }))
      }
    }
    else {
      await this.deleteEmbeddedDocuments("ActiveEffect", [removeEffects])
      this.deleteEffectsFromItem(disease._id)
    }
    let chatData = game.wfrp4e.utility.chatDataSetup(msg, "gmroll", false)
    chatData.speaker = { alias: this.name }
    ChatMessage.create(chatData)

  }


  _applyStatusModifier({ standing, tier }) {
    let modifier = this.details.status.modifier || 0

    if (modifier < 0)
      this.details.status.modified = "negative"
    else if (modifier > 0)
      this.details.status.modified = "positive"

    let temp = standing
    standing += modifier
    modifier = -(Math.abs(temp))

    if (standing <= 0 && tier != "b") {
      standing = 5 + standing
      if (tier == "g")
        tier = "s"
      else if (tier == "s")
        tier = "b"

      // If modifier is enough to subtract 2 whole tiers
      if (standing <= 0 && tier != "b") {
        standing = 5 + standing
        tier = "b" // only possible case here
      }

      if (standing < 0)
        standing = 0
    }
    // If rock bottom
    else if (standing <= 0 && tier == "b") {
      standing = 0
    }
    else if (standing > 5 && tier != "g") {
      standing = standing - 5
      if (tier == "s")
        tier = "g"
      else if (tier == "b")
        tier = "s"

      // If modifier is enough to get you 2 whole tiers
      if (standing > 5 && tier != "g") {
        standing -= 5
        tier = "g" // Only possible case here
      }
    }
    return { standing, tier }
  }


  async handleIncomeTest(roll) {
    let { standing, tier } = roll.options.income
    let result = roll.result;

    let dieAmount = game.wfrp4e.config.earningValues[tier] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    dieAmount = parseInt(dieAmount) * standing;     // Multilpy that first letter by your standing (Brass 4 = 8d10 pennies)
    let moneyEarned;
    if (tier != "g") // Don't roll for gold, just use standing value
    {
      dieAmount = dieAmount + "d10";
      moneyEarned = (await new Roll(dieAmount).roll()).total;
    }
    else
      moneyEarned = dieAmount;

    // After rolling, determined how much, if any, was actually earned
    if (result.outcome == "success") {
      roll.result.incomeResult = game.i18n.localize("INCOME.YouEarn") + " " + moneyEarned;
      switch (tier) {
        case "b":
          result.incomeResult += ` ${game.i18n.localize("NAME.BPPlural").toLowerCase()}.`
          break;
        case "s":
          result.incomeResult += ` ${game.i18n.localize("NAME.SSPlural").toLowerCase()}.`
          break;
        case "g":
          if (moneyEarned > 1)
            result.incomeResult += ` ${game.i18n.localize("NAME.GC").toLowerCase()}.`
          else
            result.incomeResult += ` ${game.i18n.localize("NAME.GCPlural").toLowerCase()}.`
          break;
      }
    }
    else if (Number(result.SL) > -6) {
      moneyEarned /= 2;
      result.incomeResult = game.i18n.localize("INCOME.YouEarn") + " " + moneyEarned;
      switch (tier) {
        case "b":
          result.incomeResult += ` ${game.i18n.localize("NAME.BPPlural").toLowerCase()}.`
          break;
        case "s":
          result.incomeResult += ` ${game.i18n.localize("NAME.SSPlural").toLowerCase()}.`
          break;
        case "g":
          if (moneyEarned > 1)
            result.incomeResult += ` ${game.i18n.localize("NAME.GC").toLowerCase()}.`
          else
            result.incomeResult += ` ${game.i18n.localize("NAME.GCPlural").toLowerCase()}.`
          break;
      }
    }
    else {
      result.incomeResult = game.i18n.localize("INCOME.Failure")
      moneyEarned = 0;
    }
    // let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(test))
    // cardOptions.sound = contextAudio.file || cardOptions.sound
    result.moneyEarned = moneyEarned + tier;

    return result
  }


  async handleCorruptionResult(test) {
    let strength = test.options.corruption;
    let failed = test.result.outcome == "failure"
    let corruption = 0 // Corruption GAINED
    switch (strength) {
      case "minor":
        if (failed)
          corruption++;
        break;

      case "moderate":
        if (failed)
          corruption += 2
        else if (test.result.SL < 2)
          corruption += 1
        break;

      case "major":
        if (failed)
          corruption += 3
        else if (test.result.SL < 2)
          corruption += 2
        else if (test.result.SL < 4)
          corruption += 1
        break;
    }

    // Revert previous test if rerolled
    if (test.context.reroll) {
      let previousFailed = test.context.previousResult.result == "failure"
      switch (strength) {
        case "minor":
          if (previousFailed)
            corruption--;
          break;

        case "moderate":
          if (previousFailed)
            corruption -= 2
          else if (test.context.previousResult.SL < 2)
            corruption -= 1
          break;

        case "major":
          if (previousFailed)
            corruption -= 3
          else if (test.context.previousResult.SL < 2)
            corruption -= 2
          else if (test.context.previousResult.SL < 4)
            corruption -= 1
          break;
      }
    }
    let newCorruption = Number(this.status.corruption.value) + corruption
    if (newCorruption < 0) newCorruption = 0

    if (!test.context.reroll)
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.format("CHAT.CorruptionFail", { name: this.name, number: corruption }), "gmroll", false))
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.format("CHAT.CorruptionReroll", { name: this.name, number: corruption }), "gmroll", false))

    await this.update({ "data.status.corruption.value": newCorruption })
    if (corruption > 0)
      this.checkCorruption();

  }

  async checkCorruption() {

    if (this.status.corruption.value > this.status.corruption.max) {
      let skill = this.has(game.i18n.localize("NAME.Endurance"), "skill")
      if (skill) {
        this.setupSkill(skill, { title: game.i18n.format("DIALOG.MutateTitle", { test: skill.name }), mutate: true }).then(setupData => {
          this.basicTest(setupData)
        });
      }
      else {
        this.setupCharacteristic("t", { title: game.i18n.format("DIALOG.MutateTitle", { test: game.wfrp4e.config.characteristics["t"] }), mutate: true }).then(setupData => {
          this.basicTest(setupData)
        });
      }
    }
  }

  async handleMutationResult(test) {
    let failed = test.result.outcome == "failure"

    if (failed) {
      let wpb = this.characteristics.wp.bonus;
      let tableText = game.i18n.localize("CHAT.MutateTable") + "<br>" + game.wfrp4e.config.corruptionTables.map(t => `@Table[${t}]<br>`).join("")
      ChatMessage.create(WFRP_Utility.chatDataSetup(`
      <h3>${game.i18n.localize("CHAT.DissolutionTitle")}</h3> 
      <p>${game.i18n.localize("CHAT.Dissolution")}</p>
      <p>${game.i18n.format("CHAT.CorruptionLoses", { name: this.name, number: wpb })}
      <p>${tableText}</p>`,
        "gmroll", false))
      this.update({ "data.status.corruption.value": Number(this.status.corruption.value) - wpb })
    }
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.localize("CHAT.MutateSuccess"), "gmroll", false))

  }

  deleteEffectsFromItem(itemId) {
    let removeEffects = this.allEffects.filter(e => {
      if (!e.data.origin)
        return false
      return e.data.origin.includes(itemId)
    }).map(e => e.id).filter(id => this.effects.has(id))

    this.deleteEmbeddedDocuments("ActiveEffect", removeEffects)

  }

  // /** @override */
  // async deleteEmbeddedEntity(embeddedName, data, options = {}) {
  //   if (embeddedName === "OwnedItem")
  //     await this._deleteItemActiveEffects(data);
  //   const deleted = await super.deleteEmbeddedEntity(embeddedName, data, options);
  //   return deleted;
  // }

  async handleExtendedTest(test) {
    let item = this.items.get(test.options.extended).toObject();

    if (game.settings.get("wfrp4e", "extendedTests") && test.result.SL == 0)
      test.SL = test.result.roll <= test.result.target ? 1 : -1

    if (item.data.failingDecreases.value) {
      item.data.SL.current += Number(test.result.SL)
      if (!item.data.negativePossible.value && item.data.SL.current < 0)
        item.data.SL.current = 0;
    }
    else if (test.result.SL > 0)
      item.data.SL.current += Number(test.result.SL)

    let displayString = `${item.name} ${item.data.SL.current} / ${item.data.SL.target} ${game.i18n.localize("SuccessLevels")}`

    if (item.data.SL.current >= item.data.SL.target) {

      if (getProperty(item, "flags.wfrp4e.reloading")) {
        let actor
        if (getProperty(item, "flags.wfrp4e.vehicle"))
          actor = WFRP_Utility.getSpeaker(getProperty(item, "flags.wfrp4e.vehicle"))

        actor = actor ? actor : this
        let weapon = actor.items.get(getProperty(item, "flags.wfrp4e.reloading"))
        weapon.update({ "flags.wfrp4e.-=reloading": null, "data.loaded.amt": weapon.loaded.max, "data.loaded.value": true })
      }

      if (item.data.completion.value == "reset")
        item.data.SL.current = 0;
      else if (item.data.completion.value == "remove") {
        await this.deleteEmbeddedDocuments("Item", [item._id])
        this.deleteEffectsFromItem(item._id)
        item = undefined
      }
      displayString = displayString.concat(`<br><b>${game.i18n.localize("Completed")}</b>`)
    }

    test.result.other.push(displayString)

    if (item)
      this.updateEmbeddedDocuments("Item", [item]);
  }

  checkReloadExtendedTest(weapon) {

    if (!weapon.loading)
      return

    let reloadingTest = this.items.get(weapon.getFlag("wfrp4e", "reloading"))

    if (weapon.loaded.amt > 0) {
      if (reloadingTest) {
        reloadingTest.delete()
        weapon.update({ "flags.wfrp4e.-=reloading": null })
        return ui.notifications.notify(game.i18n.localize("ITEM.ReloadFinish"))
      }
    }
    else {
      let reloadExtendedTest = duplicate(game.wfrp4e.config.systemItems.reload);

      reloadExtendedTest.name = game.i18n.format("ITEM.ReloadingWeapon", { weapon: weapon.name })
      if (weapon.skillToUse)
        reloadExtendedTest.data.test.value = weapon.skillToUse.name
      else
        reloadExtendedTest.data.test.value = game.i18n.localize("CHAR.BS")
      reloadExtendedTest.flags.wfrp4e.reloading = weapon.id

      reloadExtendedTest.data.SL.target = weapon.properties.flaws.reload?.value || 1

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
        reloadingTest.delete()

      this.createEmbeddedDocuments("Item", [reloadExtendedTest]).then(item => {
        ui.notifications.notify(game.i18n.format("ITEM.CreateReloadTest", { weapon: weapon.name }))
        weapon.update({ "flags.wfrp4e.reloading": item[0].id })
      })
    }


  }


  setAdvantage(val) {
    let advantage = duplicate(this.status.advantage);
    if (game.settings.get("wfrp4e", "capAdvantageIB"))
      advantage.max = this.characteristics.i.bonus;
    else
      advantage.max = 10;

    advantage.value = Math.clamped(val, 0, advantage.max)

    this.update({ "data.status.advantage": advantage })
  }
  modifyAdvantage(val) {
    this.setAdvantage(this.status.advantage.value + val)
  }

  setWounds(val) {
    let wounds = duplicate(this.status.wounds);

    wounds.value = Math.clamped(val, 0, wounds.max)
    return this.update({ "data.status.wounds": wounds })
  }
  modifyWounds(val) {
    return this.setWounds(this.status.wounds.value + val)
  }


  showCharging(item) {
    if (item.attackType == "melee")
      return true
  }

  get isMounted() {
    return getProperty(this, "data.data.status.mount.mounted") && this.status.mount.id
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

  showDualWielding(weapon) {
    if (!weapon.offhand.value && this.has(game.i18n.localize("NAME.DualWielder"), "talent")) {
      return !this.noOffhand
    }
    return false;
  }


  async addCondition(effect, value = 1) {
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
      return existing.setFlag("wfrp4e", "value", existing.conditionValue + value)
    }
    else if (!existing) {
      if (game.combat && (effect.id == "blinded" || effect.id == "deafened"))
        effect.flags.wfrp4e.roundReceived = game.combat.round
      effect.label = game.i18n.localize(effect.label);

      if (Number.isNumeric(effect.flags.wfrp4e.value))
        effect.flags.wfrp4e.value = value;
      // effect["flags.core.statusId"] = effect.id;
      if (effect.id == "dead")
        effect["flags.core.overlay"] = true;
      if (effect.id == "unconscious")
        await this.addCondition("prone")
      //delete effect.id
      return this.createEmbeddedDocuments("ActiveEffect", [effect])
    }
  }

  async removeCondition(effect, value = 1) {
    if (typeof (effect) === "string")
      effect = duplicate(game.wfrp4e.config.statusEffects.find(e => e.id == effect))
    if (!effect)
      return "No Effect Found"

    if (!effect.id)
      return "Conditions require an id field"

    let existing = this.hasCondition(effect.id)



    if (existing && !existing.isNumberedCondition) {
      if (effect.id == "unconscious")
        await this.addCondition("fatigued")
      return existing.delete()
    }
    else if (existing) {
      await existing.setFlag("wfrp4e", "value", existing.conditionValue - value);

      if (existing.conditionValue == 0 && (effect.id == "bleeding" || effect.id == "poisoned" || effect.id == "broken" || effect.id == "stunned"))
      {
        if (!game.settings.get("wfrp4e", "mooConditions") || !effect.id == "broken") // Homebrew rule prevents broken from causing fatigue
          await this.addCondition("fatigued")        
        
      }

      if (existing.conditionValue <= 0)
        return existing.delete()
    }
  }


  hasCondition(conditionKey) {
    let existing = this.effects.find(i => i.conditionId == conditionKey)
    return existing
  }




  applyFear(value, name = undefined) {
    value = value || 0
    let fear = duplicate(game.wfrp4e.config.systemItems.fear)
    fear.data.SL.target = value;

    if (name)
      fear.effects[0].flags.wfrp4e.fearName = name

    this.createEmbeddedDocuments("Item", [fear]);
  }


  applyTerror(value, name = undefined) {
    value = value || 1
    let terror = duplicate(game.wfrp4e.config.systemItems.terror)
    terror.flags.wfrp4e.terrorValue = value
    game.wfrp4e.utility.applyOneTimeEffect(terror, this)
  }

  awardExp(amount, reason) {
    let experience = duplicate(this.details.experience)
    experience.total += amount
    experience.log.push({ reason, amount, spent: experience.spent, total: experience.total, type: "total" })
    this.update({ "data.details.experience": experience });
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


  populateEffect(effectId, item, test) {
    if (typeof item == "string")
      item = this.items.get(item)

    let effect = item.effects.get(effectId).toObject()
    effect.origin = this.uuid;

    let multiplier = 1
    if (test && test.result.overcast && test.result.overcast.usage.duration)
      multiplier += test.result.overcast.usage.duration.count

    if (item.duration && item.duration.value.toLowerCase().includes(game.i18n.localize("minutes")))
      effect.duration.seconds = parseInt(item.Duration) * 60 * multiplier

    else if (item.duration && item.duration.value.toLowerCase().includes(game.i18n.localize("hours")))
      effect.duration.seconds = parseInt(item.Duration) * 60 * 60 * multiplier

    else if (item.duration && item.duration.value.toLowerCase().includes(game.i18n.localize("rounds")))
      effect.duration.rounds = parseInt(item.Duration) * multiplier


    let script = getProperty(effect, "flags.wfrp4e.script")
    if (test && script) {
      let regex = /{{(.+?)}}/g
      let matches = [...script.matchAll(regex)]
      matches.forEach(match => {
        script = script.replace(match[0], getProperty(test.result, match[1]))
      })
      setProperty(effect, "flags.wfrp4e.script", script)
    }

    return effect
  }


  checkSystemEffects() {
    let encumbrance = this.status.encumbrance.state
    let state

    if (encumbrance > 3) {
      state = "enc3"
      if (!this.hasSystemEffect(state)) {
        this.addSystemEffect(state)
        return
      }
      this.removeSystemEffect("enc2")
      this.removeSystemEffect("enc1")
    }
    else if (encumbrance > 2) {
      state = "enc2"
      if (!this.hasSystemEffect(state)) {
        this.addSystemEffect(state)
        return
      }
      this.removeSystemEffect("enc1")
      this.removeSystemEffect("enc3")
    }
    else if (encumbrance > 1) {
      state = "enc1"
      if (!this.hasSystemEffect(state)) {
        this.addSystemEffect(state)
        return
      }
      this.removeSystemEffect("enc2")
      this.removeSystemEffect("enc3")
    }
    else {
      this.removeSystemEffect("enc1")
      this.removeSystemEffect("enc2")
      this.removeSystemEffect("enc3")
    }

  }


  addSystemEffect(key) {
    let systemEffects = game.wfrp4e.utility.getSystemEffects()
    let effect = systemEffects[key];
    setProperty(effect, "flags.core.statusId", key);
    this.createEmbeddedDocuments("ActiveEffect", [effect])
  }

  removeSystemEffect(key) {
    let effect = this.effects.find(e => e.statusId == key)
    if (effect)
      this.deleteEmbeddedDocuments("ActiveEffect", [effect.id])
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
      round = game.i18n.format("CondRound", {round: round});

    let displayConditions = this.effects.map(e => {
      if (e.statusId) {
        return e.label + " " + (e.conditionValue || "")
      }
    }).filter(i => !!i)

    // Aggregate conditions to be easily displayed (bleeding4 and bleeding1 turns into Bleeding 5)

    let chatOptions = {
      rollMode: game.settings.get("core", "rollMode")
    };
    if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;
    chatOptions["template"] = "systems/wfrp4e/templates/chat/combat-status.html"


    let chatData = {
      name: nameOverride || (this.token ? this.token.name : this.data.token.name),
      conditions: displayConditions,
      modifiers: this.data.flags.modifier,
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

  /**
   * Returns items for new actors: money and skills
   */
  async _getNewActorItems() {

    let basicSkills = await WFRP_Utility.allBasicSkills() || [];
    let moneyItems = ((await WFRP_Utility.allMoneyItems()) || [])
      .map(m => { // Set money items to descending in value and set quantity to 0
        m.update({ "data.quantity.value": 0 });
        return m;
      })
      .sort((a, b) => (a.data.coinValue.value >= b.data.coinValue.value) ? -1 : 1)
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



  // I don't want to have to rerun `this.itemTypes` each time this is called, so itemCategories, which is set once in prerpareData, is preferred.
  getItemTypes(type) {
    return (this.itemCategories || this.itemTypes)[type]
  }


  // @@@@@@@@ BOOLEAN GETTERS
  get isUniqueOwner() {
    return game.user.id == game.users.find(u => u.active && (this.data.permission[u.id] >= 3 || u.isGM))?.id
  }

  get inCollection() {
    return game.actors && game.actors.get(this.id)
  }

  get hasSpells() {
    return !!this.getItemTypes("spell").length > 0
  }

  get hasPrayers() {
    return !!this.getItemTypes("prayer").length > 0
  }

  get noOffhand() {
    return !this.getItemTypes("weapon").find(i => i.offhand.value)
  }

  get isOpposing() {
    return !!this.data.flags.oppose
  }

  
  get speakerData() {
    if (this.isToken)
    {
        return {
            token : this.token.id,
            scene : this.token.parent.id
        }
    }
    else
    {
        return {
            actor : this.id
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
    return this.getItemTypes("weapon").reduce((prev, current) => {
      if (current.isEquipped)
        prev += current.twohanded.value ? 2 : 1
      return prev
    }, 0)
  }

  get equipPointsAvailable() {
    return Number.isNumeric(this.data.flags.equipPoints) ? this.data.flags.equipPoints : 2
  }

  get defensive() {
    return this.getItemTypes("weapon").reduce((prev, current) => {
      if (current.isEquipped)
        prev += current.properties.qualities.defensive ? 1 : 0
      return prev
    }, 0)
  }

  get currentCareer() {
    return this.getItemTypes("career").find(c => c.current.value)
  }

  get passengers() {
    return this.data.data.passengers.map(p => {
      let actor = game.actors.get(p?.id);
      if (actor)
        return {
          actor: actor,
          linked: actor.data.token.actorLink,
          count: p.count,
          enc: game.wfrp4e.config.actorSizeEncumbrance[actor.details.size.value] * p.count
        }
    })
  }

  get attacker() {
    try {
      if (this.data.flags.oppose) {
        let attackMessage = game.messages.get(this.data.flags.oppose.messageId) // Retrieve attacker's test result message
        // Organize attacker/defender data
        if (attackMessage)
          return {
            speaker: this.data.flags.oppose.speaker,
            test: attackMessage.getTest(),
            messageId: attackMessage.data._id,
            img: WFRP_Utility.getSpeaker(this.data.flags.oppose.speaker).data.img
          };
        else
          this.update({ "flags.-=oppose": null })
      }
    }
    catch (e)
    {
      this.update({ "flags.-=oppose": null })
    }

  }

  // @@@@@@@@@@@ DATA GETTERS @@@@@@@@@@@@@
  get characteristics() { return this.data.data.characteristics }
  get status() { return this.data.data.status }
  get details() { return this.data.data.details }
  get excludedTraits() { return this.data.data.excludedTraits }
  get roles() { return this.data.data.roles }

  // @@@@@@@@@@ DERIVED DATA GETTERS
  get armour() { return this.status.armour }



  /**
   * Transform the Document data to be stored in a Compendium pack.
   * Remove any features of the data which are world-specific.
   * This function is asynchronous in case any complex operations are required prior to exporting.
   * @param {CompendiumCollection} [pack]   A specific pack being exported to
   * @return {object}                       A data object of cleaned data suitable for compendium import
   * @memberof ClientDocumentMixin#
   * @override - Retain ID
   */
  toCompendium(pack) {
    let data = super.toCompendium(pack)
    data._id = this.id; // Replace deleted ID so it is preserved
    return data;
  }
}
