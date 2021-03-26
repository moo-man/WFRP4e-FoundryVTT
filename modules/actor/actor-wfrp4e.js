import WFRP_Utility from "../system/utility-wfrp4e.js";

import DiceWFRP from "../system/dice-wfrp4e.js";
import OpposedWFRP from "../system/opposed-wfrp4e.js";
import WFRP_Audio from "../system/audio-wfrp4e.js";
import RollDialog from "../apps/roll-dialog.js";

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
 * @see   DiceWFRP4e - Sends test data to roll tests.
 */
export default class ActorWfrp4e extends Actor {

  /**
   * Override the create() function to provide additional WFRP4e functionality.
   *
   * This overrided create() function adds initial items and flags to an actor
   * upon creation. Namely: Basic skills, the 3 default coin values (brass
   * pennies, silver shillings, gold crowns) at a quantity of 0, and setting
   * up the default Automatic Calculation flags to be true. We still want to
   * use the upstream create method, so super.create() is called at the end.
   * Additionally - See the preCreateActor hook for more initial settings 
   * upon creation
   *
   * @param {Object} data        Barebones actor data which this function adds onto.
   * @param {Object} options     (Unused) Additional options which customize the creation workflow.
   *
   */
  static async create(data, options) {
    // If the created actor has items (only applicable to duplicated actors) bypass the new actor creation logic

    if (data instanceof Array)
      return super.create(data, options);

    if (data.items || data.type == "vehicle")
      return super.create(data, options);

    // Initialize empty items
    data.items = [];

    // Default auto calculation to true
    data.flags =
    {
      autoCalcRun: true,
      autoCalcWalk: true,
      autoCalcWounds: true,
      autoCalcCritW: true,
      autoCalcCorruption: true,
      autoCalcEnc: true,
      autoCalcSize: true,
    }
    let basicSkills = await WFRP_Utility.allBasicSkills() || [];
    let moneyItems = await WFRP_Utility.allMoneyItems() || [];
    moneyItems = moneyItems.sort((a, b) => (a.data.coinValue.value > b.data.coinValue.value) ? -1 : 1);

    // If character, automatically add basic skills and money items
    if (data.type == "character") {
      data.items = data.items.concat(basicSkills);

      // Set all money items to 0, add to actor
      data.items = data.items.concat(moneyItems.map(m => {
        m.data.quantity.value = 0
        return m
      }))
      super.create(data, options); // Follow through the the rest of the Actor creation process upstream
    }
    // If not a character, ask the user whether they want to add basic skills / money
    else if (data.type == "npc" || data.type == "creature") {
      new Dialog({
        title: game.i18n.localize("ACTOR.BasicSkillsTitle"),
        content: `<p>${game.i18n.localize("ACTOR.BasicSkillsPrompt")}</p>`,
        buttons: {
          yes: {
            label: game.i18n.localize("Yes"),
            callback: async dlg => {
              data.items = data.items.concat(basicSkills);

              // Set all money items to 0, add to actor
              data.items = data.items.concat(moneyItems.map(m => {
                m.data.quantity.value = 0
                return m
              }))
              super.create(data, options); // Follow through the the rest of the Actor creation process upstream
            }
          },
          no: {
            label: game.i18n.localize("No"),
            callback: async dlg => {
              super.create(data, options); // Do not add new items, continue with the rest of the Actor creation process upstream
            }
          },
        },
        default: 'yes'
      }).render(true);
    }
  }




  prepareBaseData() {
    // For each characteristic, calculate the total and bonus value
    for (let ch of Object.values(this.data.data.characteristics)) {
      ch.value = ch.initial + ch.advances + (ch.modifier || 0);
      ch.bonus = Math.floor(ch.value / 10)
      ch.cost = WFRP_Utility._calculateAdvCost(ch.advances, "characteristic")
    }

    if (this.data.flags.autoCalcEnc)
      this.data.data.status.encumbrance.max = this.data.data.characteristics.t.bonus + this.data.data.characteristics.s.bonus;

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

    // Copied and rearranged from Actor class
    this.data = duplicate(this._data);
    if (!this.data.img) this.data.img = CONST.DEFAULT_TOKEN;
    if (!this.data.name) this.data.name = "New " + this.entity;
    this.prepareBaseData();
    this.prepareEmbeddedEntities();
    this.applyActiveEffects();
    this.runEffects("prePrepareData", { actor: this })

    this.prepareBaseData();
    this.prepareDerivedData();

    this.runEffects("prePrepareItems", { actor: this })
    this.prepareItems();


    if (this.isUniqueOwner)
      this.runEffects("oneTime", { actor: this })

    if (this.data.type == "character")
      this.prepareCharacter();
    if (this.data.type == "creature")
      this.prepareCreature();
    if (this.data.type == "vehicle")
      this.prepareVehicle()

    if (this.data.type != "vehicle")
    {
      this.prepareNonVehicle()
    }

    this.runEffects("prepareData", { actor: this })

    if (this.data.type != "vehicle")
    {
      if(game.actors) // Only check system effects if past this isn't an on-load prepareData
        this.checkSystemEffects()
    }

  }


  /** @override **/
  prepareEmbeddedEntities() {
    super.prepareEmbeddedEntities();
    let remove = []
    this.effects.forEach(e => {
      let effectApplication = e.getFlag("wfrp4e", "effectApplication")

      try {
          if (e.data.origin) // If effect comes from an item
          {
            let origin = e.data.origin.split(".")
            let id = origin[origin.length - 1]
            let item = this.items.get(id)
            if (item.data.type == "disease") { // If disease, don't show symptoms until disease is actually active
              if (!item.data.data.duration.active)
                remove.push(e.id)
            }
            else if (item.data.type == "spell" || item.data.type == "prayer")
            {
              remove.push(e.id)
            }

            else if (item.data.type == "trait" && this.data.type == "creature" && this.data.data.excludedTraits.includes(item._id))
            {
              remove.push(e.id)
            }

            else if (effectApplication) 
            { // if not equipped, remove if effect specifies it needs to be equipped
              if (effectApplication == "equipped") 
              {
                if (!item.isEquipped)
                  remove.push(e.id);

              }
              else if (effectApplication != "actor") // Otherwise (if effect is targeted), remove it. 
                remove.push(e.id)
            }
        }
        else // If not an item effect
        {
          if (effectApplication == "apply")
            remove.push(e.id)
        }
      }

      catch (e) {
        // Do not remove if error
      }

    })

    for (let id of remove) {
      this.effects.delete(id);
    }
  }

  /**
   * Calculates derived data for all actor types except vehicle.
   */
  prepareNonVehicle() {
    const data = this.data
    // Auto calculation values - only calculate if user has not opted to enter ther own values
    if (data.flags.autoCalcWalk)
      data.data.details.move.walk = parseInt(data.data.details.move.value) * 2;

    if (data.flags.autoCalcRun)
      data.data.details.move.run = parseInt(data.data.details.move.value) * 4;



    if (game.settings.get("wfrp4e", "capAdvantageIB"))
    {
      data.data.status.advantage.max = data.data.characteristics.i.bonus
      data.data.status.advantage.value = Math.clamped(data.data.status.advantage.value, 0, data.data.status.advantage.max)
    }
    else
      data.data.status.advantage.max = 10;


    if (!hasProperty(this, "data.flags.autoCalcSize"))
      data.flags.autoCalcSize = true;


    // Find size based on Traits/Talents
    let size;
    let trait = data.traits.find(t => t.included != false && t.name.toLowerCase().includes(game.i18n.localize("NAME.Size").toLowerCase()))
    if (trait)
      size = WFRP_Utility.findKey(trait.data.specification.value, game.wfrp4e.config.actorSizes);
    if (!size) // Could not find specialization
    {
      let smallTalent = data.talents.find(x => x.name.toLowerCase() == game.i18n.localize("NAME.Small").toLowerCase());
      if (smallTalent)
        size = "sml";
      else
        size = "avg";
    }

    // If the size has been changed since the last known value, update the value 
    data.data.details.size.value = size || "avg"

    if (data.flags.autoCalcSize) {
      let tokenData = this._getTokenSize();
      if (this.isToken) {
        this.token.update(tokenData)
      }
      else if (canvas) {
        this.getActiveTokens().forEach(t => t.update(tokenData));
      }
      delete tokenData._id
      mergeObject(data.token, tokenData, { overwrite: true })
    }

    this.checkWounds();




    // Auto calculation flags - if the user hasn't disabled various autocalculated values, calculate them
    if (data.flags.autoCalcRun) {
      // This is specifically for the Stride trait
      // if (data.traits.find(t => t.name.toLowerCase() == game.i18n.localize("NAME.Stride").toLowerCase() && t.included != false))
      //   data.data.details.move.run += data.data.details.move.walk;
    }

    // talentTests is used to easily reference talent bonuses (e.g. in setupTest function and dialog)
    // instead of iterating through every item again to find talents when rolling
    data.flags.talentTests = [];
    for (let talent of data.talents) // For each talent, if it has a Tests value, push it to the talentTests array
      if (talent.data.tests.value) {
        let existingTalent = data.flags.talentTests.find(i => i.test == talent.data.tests.value)
        if (existingTalent)
          existingTalent.SL += talent.data.advances.value
        else
          data.flags.talentTests.push({ talentName: talent.name, test: talent.data.tests.value, SL: talent.data.advances.value });

      }


    if (this.isMounted && !game.actors) {
      game.postReadyPrepare.push(this);
    }
    else if (this.isMounted && this.data.data.status.mount.isToken && !canvas) {
      game.postReadyPrepare.push(this);
    }
    else if (this.isMounted) {
      let mount = this.mount

      if (mount)
      {
        if (mount.data.data.status.wounds.value == 0)
          this.data.data.status.mount.mounted = false;
        else {

          data.data.details.move.value = mount.data.data.details.move.value;

          if (data.flags.autoCalcWalk)
            data.data.details.move.walk = mount.data.data.details.move.walk;

          if (data.flags.autoCalcRun)
            data.data.details.move.run = mount.data.data.details.move.run;
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
 * Note that this functions requires actorData to be prepared, by this.prepare().
 * 
 * @param {Object} actorData  prepared actor data to augment 
 */
  prepareCharacter() {
    if (this.data.type != "character")
      return;

    let tb = this.data.data.characteristics.t.bonus;
    let wpb = this.data.data.characteristics.wp.bonus;

    // If the user has not opted out of auto calculation of corruption, add pure soul value
    if (this.data.flags.autoCalcCorruption) {
      this.data.data.status.corruption.max = tb + wpb;
    }


    // TODO Move more here
    let currentCareer = this.data.careers.find(c => c.data.current.value)
    if (currentCareer)
      this.data.data.details.status.value = game.wfrp4e.config.statusTiers[currentCareer.data.status.tier] + " " + currentCareer.data.status.standing
    else
      this.data.data.details.status.value = ""

    this.data.data.details.experience.current = this.data.data.details.experience.total - this.data.data.details.experience.spent;

  }


  prepareNPC() {

  }


  /**
   * Augments actor preparation with additional calculations for Creatures.
   * 
   * preparing for Creatures mainly involves excluding traits that were marked to be excluded,
   * then replacing the traits array with only the included traits (which is used by prepare()).
   * 
   * Note that this functions requires actorData to be prepared, by this.prepare().
   *  
   * @param {Object} actorData  prepared actor data to augment 
   */
  prepareCreature() {
    if (this.data.type != "creature")
      return;

    // mark each trait as included or not
    for (let trait of this.data.traits) {
      if (this.data.data.excludedTraits.includes(trait._id))
        trait.included = false;
      else
        trait.included = true;
    }

  }

  prepareVehicle() {
    if (this.data.type != "vehicle")
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
  async setupDialog({dialogOptions, testData, cardOptions}) {
    let rollMode = game.settings.get("core", "rollMode");

    // Prefill dialog
    mergeObject(dialogOptions.data, testData);
    dialogOptions.data.difficultyLabels = game.wfrp4e.config.difficultyLabels;

    // TODO: Refactor to replace cardOptoins.sound with the sound effect instead of just suppressing
    //Suppresses roll sound if the test has it's own sound associated
    mergeObject(cardOptions,
      {
        user: game.user._id,
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
        modifiers.push(e.modifier +  " " + game.i18n.localize("Modifier"))
      if (e.slBonus)
        modifiers.push(e.slBonus +  " " + game.i18n.localize("DIALOG.SLBonus"))
      if (e.successBonus)
        modifiers.push(e.successBonus +  " " + game.i18n.localize("DIALOG.SuccessBonus"))
      if (e.difficultyStep)
        modifiers.push(e.difficultyStep +  " " + game.i18n.localize("DIALOG.DifficultyStep"))
      
      e.effectSummary = modifiers.join(", ")
    })

    testData.extra.other = []; // Container for miscellaneous data that can be freely added onto

    if (testData.extra.options.context)
    {
      if (typeof testData.extra.options.context.general === "string")
        testData.extra.options.context.general = [testData.extra.options.context.general]
      if (typeof testData.extra.options.context.success === "string")
        testData.extra.options.context.success = [testData.extra.options.context.success]
      if (typeof testData.extra.options.context.failure === "string")
        testData.extra.options.context.failure = [testData.extra.options.context.failure]
    } 


    if (!testData.extra.options.bypass) {
      // Render Test Dialog
      let html = await renderTemplate(dialogOptions.template, dialogOptions.data);

      return new Promise((resolve, reject) => {
        new RollDialog(
          {
            title: dialogOptions.title,
            content: html,
            actor : this,
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
    else if (testData.extra.options.bypass){
      testData.testModifier = testData.extra.options.testModifier || testData.testModifier
      testData.target = testData.target + testData.testModifier;
      testData.slBonus = testData.extra.options.slBonus || testData.slBonus
      testData.successBonus = testData.extra.options.successBonus || testData.successBonus
      cardOptions.rollMode = testData.extra.options.rollMode || rollMode
      return {testData, cardOptions}
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
    let char = this.data.data.characteristics[characteristicId];
   let title = options.title || game.i18n.localize(char.label) + " " + game.i18n.localize("Test");

    let testData = {
      target: char.value,
      hitLocation: false,
      extra: {
        size: this.data.data.details.size.value,
        options: options,
        characteristic : characteristicId
      }
    };
    if (this.isToken)
      testData.extra.speaker = {
        token: this.options.token.id,
        scene: this.options.token.scene.id
      }
    else
      testData.extra.speaker = {
        actor: this.id
      }

      
    mergeObject(testData, this.getPrefillData("characteristic", characteristicId, options))
    if (options.rest)
      testData.extra.options["tb"] = char.bonus;

    // Default a WS or BS test to have hit location checked
    if (characteristicId == "ws" || characteristicId == "bs")
      testData.hitLocation = true;

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/characteristic-dialog.html",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        advantage: this.data.data.status.advantage.value || 0,
        talents: this.data.flags.talentTests,
        rollMode: options.rollMode,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        // Target value is the final value being tested against, after all modifiers and bonuses are added
        testData.target = testData.target + testData.testModifier + testData.testDifficulty;
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
      skill = this.data.items.find(sk => sk.name == skill && sk.type == "skill")
      if (!skill)
        return ui.notifications.error(`${skillName} could not be found`)
    }

   let title = options.title || skill.name + " " + game.i18n.localize("Test");
    let testData = {
      hitLocation: false,
      income: options.income,
      target: this.data.data.characteristics[skill.data.characteristic.value].value + skill.data.advances.value,
      extra: {
        size: this.data.data.details.size.value,
        options: options,
        skill: skill
      }
    };
    if (this.isToken)
      testData.extra.speaker = {
        token: this.options.token.id,
        scene: this.options.token.scene.id
      }
    else
      testData.extra.speaker = {
        actor: this.id
      }

      mergeObject(testData, this.getPrefillData("skill", skill, options))


    // Default a WS, BS, Melee, or Ranged to have hit location checked
    if (skill.data.characteristic.value == "ws" ||
      skill.data.characteristic.value == "bs" ||
      skill.name.includes(game.i18n.localize("NAME.Melee")) ||
      skill.name.includes(game.i18n.localize("NAME.Ranged"))) {
      testData.hitLocation = true;
    }

    // Setup dialog data: title, template, buttons, prefilled data   
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/skill-dialog.html",
      // Prefilled dialog data

      data: {
        hitLocation: testData.hitLocation,
        advantage: this.data.data.status.advantage.value || 0,
        talents: this.data.flags.talentTests,
        characteristicList: game.wfrp4e.config.characteristics,
        characteristicToUse: skill.data.characteristic.value,
        rollMode: options.rollMode,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = html.find('[name="testDifficulty"]').val();
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        let characteristicToUse = html.find('[name="characteristicToUse"]').val();

        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');
        // let talentBonuses = html.find('[name = "talentBonuses"]');

        // let totalDifficultyDiff = 0;
        // talentBonuses.find("option").filter((o, option) => option.selected).each((o, option) => {
        //   if (option.dataset.modifier)
        //     testData.testModifier += Number(option.dataset.modifier)
        //   if (option.dataset.successbonus)
        //     testData.successBonus += Number(option.dataset.successbonus)
        //   if (option.dataset.slbonus)
        //     testData.slBonus += Number(option.dataset.slbonus)
        //   if (option.dataset.difficultystep)
        //     totalDifficultyDiff += Number(option.dataset.difficultystep)
        //  })
        //  testData.testDifficulty = game.wfrp4e.utility.alterDifficulty(testData.testDifficulty, totalDifficultyDiff)

        // Target value is the final value being tested against, after all modifiers and bonuses are added
        testData.target =
          this.data.data.characteristics[characteristicToUse].value
          + testData.testModifier
          + game.wfrp4e.config.difficultyModifiers[testData.testDifficulty]
          + skill.data.advances.value
          + skill.data.modifier.value

        // // Combine all Talent Bonus values (their times taken) into one sum
        // testData.successBonus += talentBonuses.reduce(function (prev, cur) {
        //   return prev + Number(cur)
        // }, 0)

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

    if (!weapon.prepared)
      this.prepareWeaponCombat(weapon, options.ammo);

    // Prepare the weapon to have the complete data object, including qualities/flaws, damage value, etc.
    let wep = duplicate(weapon);
    let testData = {
      target: 0,
      hitLocation: true,
      extra: { // Store this extra weapon/ammo data for later use
        weapon: wep,
        effects: weapon.effects.filter(e => getProperty(e, "flags.wfrp4e.effectApplication") == "apply"),
        charging: options.charging || false,
        size: this.data.data.details.size.value,
        champion: !!this.has(game.i18n.localize("NAME.Champion")),
        riposte: !!this.has(game.i18n.localize("NAME.Riposte"), "talents"),
        infighter : !!this.has(game.i18n.localize("NAME.Infighter"), "talents"),
        resolute: this.data.flags.resolute || 0,
        options: options
      }
    };
    if (this.isToken)
      testData.extra.speaker = {
        token: this.options.token.id,
        scene: this.options.token.scene.id
      }
    else
      testData.extra.speaker = {
        actor: this.id
      }

    if (wep.attackType == "melee")
      skillCharList.push(game.i18n.localize("CHAR.WS"))

    else if (wep.attackType == "ranged") {
      // If Ranged, default to Ballistic Skill, but check to see if the actor has the specific skill for the weapon
      skillCharList.push(game.i18n.localize("CHAR.BS"))
      if (weapon.data.consumesAmmo.value && weapon.data.ammunitionGroup.value != "none") 
      {
        // Check to see if they have ammo if appropriate
        if (options.ammo)
          testData.extra.ammo = options.ammo.find(a => a._id == weapon.data.currentAmmo.value)
        if (!testData.extra.ammo)
          testData.extra.ammo = duplicate(this.getEmbeddedEntity("OwnedItem", weapon.data.currentAmmo.value))
          
        if (!testData.extra.ammo || weapon.data.currentAmmo.value == 0 || testData.extra.ammo.data.quantity.value == 0) {
          AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav`}, false)
          ui.notifications.error(game.i18n.localize("Error.NoAmmo"))
          return
        }

      }
      else if (weapon.data.consumesAmmo.value && weapon.data.quantity.value == 0) {
        // If this executes, it means it uses its own quantity for ammo (e.g. throwing), which it has none of
        AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav`}, false)
        ui.notifications.error(game.i18n.localize("Error.NoAmmo"))
        return;
      }
      else {
        // If this executes, it means it uses its own quantity for ammo (e.g. throwing)
        testData.extra.ammo = weapon;
      }


      if (wep.loading && !wep.data.loaded.value) {
        this.rollReloadTest(weapon)
        return ui.notifications.notify(game.i18n.localize("Error.NotLoaded"))
      }
    }

    let defaultSelection // The default skill/characteristic being used
    if (wep.skillToUse) {
      // If the actor has the appropriate skill, default to that.
      skillCharList.push(wep.skillToUse.name)
      defaultSelection = skillCharList.indexOf(wep.skillToUse.name)
      testData.target = this.data.data.characteristics[wep.skillToUse.data.characteristic.value].value + wep.skillToUse.data.advances.value;

    }

    // Bypass macro default values
    if (!testData.target)
      testData.target = wep.attackType == "melee" ? this.data.data.characteristics["ws"].value : this.data.data.characteristics["bs"].value

    mergeObject(testData, this.getPrefillData("weapon", wep, options))

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/weapon-dialog.html",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        talents: this.data.flags.talentTests,
        skillCharList: skillCharList,
        defaultSelection: defaultSelection,
        advantage: this.data.data.status.advantage.value || 0,
        rollMode: options.rollMode,
        chargingOption: this.showCharging(wep),
        dualWieldingOption: this.showDualWielding(wep),
        charging: testData.extra.charging,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.extra.charging = html.find('[name="charging"]').is(':checked');
        testData.extra.dualWielding = html.find('[name="dualWielding"]').is(':checked');
        testData.extra.isMounted = this.isMounted;
        if (testData.extra.isMounted)
          testData.extra.mountSize = this.mount.data.data.details.size.value

        if (testData.extra.isMounted && testData.extra.charging) {
          testData.extra.weapon = this.prepareWeaponMount(testData.extra.weapon);
          //testData.extra.actor.data.details.size.value = testData.extra.mountSize;
          cardOptions.title += " (Mounted)"
        }

        let skillSelected = skillCharList[Number(html.find('[name="skillSelected"]').val())];

        // Determine final target if a characteristic was selected
        if (skillSelected == game.i18n.localize("CHAR.WS") || skillSelected == game.i18n.localize("CHAR.BS")) {
          if (skillSelected == game.i18n.localize("CHAR.WS"))
            testData.target = this.data.data.characteristics.ws.value
          else if (skillSelected == game.i18n.localize("CHAR.BS"))
            testData.target = this.data.data.characteristics.bs.value

          testData.target += testData.testModifier + testData.testDifficulty;
        }
        else // If a skill was selected
        {
          // If using the appropriate skill, set the target number to characteristic value + advances + modifiers
          // Target value is the final value being tested against, after all modifiers and bonuses are added
          let skillUsed = testData.extra.weapon.skillToUse;

          testData.target =
            this.data.data.characteristics[skillUsed.data.characteristic.value].value
            + testData.testModifier
            + testData.testDifficulty
            + skillUsed.data.advances.value
            + skillUsed.data.modifier.value
        }
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');
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
   * is selected will automatically be used and negate one miscast. For the spell rolling logic, see DiceWFRP.rollCastTest
   * where all this data is passed to in order to calculate the roll result.
   *
   * @param {Object} spell    The spell Item being Casted. The spell item has information like CN, lore, and current ingredient ID
   *
   */
  setupCast(spell, options = {}) {
   let title = options.title || game.i18n.localize("CastingTest") + " - " + spell.name;

    // castSkill array holds the available skills/characteristics to cast with - Casting: Intelligence
    let castSkills = [{ key: "int", name: game.i18n.localize("CHAR.Int") }]

    // if the actor has Language (Magick), add it to the array.
    let skill = this.data.skills.find(i => i.name.toLowerCase() == `${game.i18n.localize("Language")} (${game.i18n.localize("Magick")})`.toLowerCase())
    if (skill)
      castSkills.push(skill)

    // Default to Language Magick if it exists
    let defaultSelection = castSkills.findIndex(i => i.name.toLowerCase() == `${game.i18n.localize("Language")} (${game.i18n.localize("Magick")})`.toLowerCase())

    // Whether the actor has Instinctive Diction is important in the test rolling logic
    let instinctiveDiction = (this.data.flags.talentTests.findIndex(x => x.talentName.toLowerCase() == game.i18n.localize("NAME.ID").toLowerCase()) > -1) // instinctive diction boolean

    if (!spell.prepared)
      this.prepareSpellOrPrayer(spell);

    // Prepare the spell to have the complete data object, including damage values, range values, CN, etc.
    let testData = {
      target: 0,
      extra: { // Store this data to be used by the test logic
        spell: spell,
        malignantInfluence: false,
        effects: spell.effects.filter(e => getProperty(e, "flags.wfrp4e.effectApplication") == "apply"),
        ingredient: false,
        ID: false,
        size: this.data.data.details.size.value,
        options: options
      }
    };
    if (this.isToken)
      testData.extra.speaker = {
        token: this.options.token.id,
        scene: this.options.token.scene.id
      }
    else
      testData.extra.speaker = {
        actor: this.id
      }

    // If the spell does damage, default the hit location to checked
    if (spell.damage)
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
        talents: this.data.flags.talentTests,
        advantage: this.data.data.status.advantage.value || 0,
        defaultSelection: defaultSelection,
        castSkills: castSkills,
        rollMode: options.rollMode,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());

        let skillSelected = castSkills[Number(html.find('[name="skillSelected"]').val())];

        // If an actual skill (Language Magick) was selected, use that skill to calculate the target number
        if (skillSelected.key != "int") {
          testData.target = this.data.data.characteristics[skillSelected.data.characteristic.value].value
            + skillSelected.data.advances.value
            + skillSelected.data.modifier.value
            + testData.testDifficulty
            + testData.testModifier;
        }
        else // if a characteristic was selected, use just the characteristic
        {
          testData.target = this.data.data.characteristics.int.value
            + testData.testDifficulty
            + testData.testModifier;
        }

        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');
        testData.extra.malignantInfluence = html.find('[name="malignantInfluence"]').is(':checked');

        return { testData, cardOptions };
      }
    };

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
   * is selected will automatically be used and mitigate miscasts. For the spell rolling logic, see DiceWFRP.rollChannellTest
   * where all this data is passed to in order to calculate the roll result.
   *
   * @param {Object} spell    The spell Item being Channelled. The spell item has information like CN, lore, and current ingredient ID
   * This spell SL will then be updated accordingly.
   *
   */
  setupChannell(spell, options = {}) {
   let title = options.title || game.i18n.localize("ChannellingTest") + " - " + spell.name;

    // channellSkills array holds the available skills/characteristics to  with - Channelling: Willpower
    let channellSkills = [{ key: "wp", name: game.i18n.localize("CHAR.WP") }]

    // if the actor has any channel skills, add them to the array.
    let skill = this.data.skills.find(i => i.name.toLowerCase().includes(game.i18n.localize("NAME.Channelling").toLowerCase()))
    if (skill)
      channellSkills.push(skill)

    if (!spell.prepared)
      this.prepareSpellOrPrayer(spell);

    // Find the spell lore, and use that to determine the default channelling selection
    let spellLore = spell.data.lore.value;
    let defaultSelection
    if (spell.data.wind && spell.data.wind.value) {
      defaultSelection = channellSkills.indexOf(channellSkills.find(x => x.name.includes(spell.data.wind.value)))
      if (defaultSelection == -1) {
        let customChannellSkill = this.data.skills.find(i => i.name.toLowerCase().includes(spell.data.wind.value.toLowerCase()));
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

    // Whether the actor has Aethyric Attunement is important in the test rolling logic
    let aethyricAttunement = (this.data.flags.talentTests.findIndex(x => x.talentName.toLowerCase() == game.i18n.localize("NAME.AA").toLowerCase()) > -1) // aethyric attunement boolean

    let testData = {
      target: 0,
      extra: { // Store data to be used by the test logic
        spell: spell,
        malignantInfluence: false,
        ingredient: false,
        AA: undefined,//aethyricAttunement,
        size: this.data.data.details.size.value,
        options: options
      }
    };
    if (this.isToken)
      testData.extra.speaker = {
        token: this.options.token.id,
        scene: this.options.token.scene.id
      }
    else
      testData.extra.speaker = {
        actor: this.id
      }

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
        talents: this.data.flags.talentTests,
        advantage: "N/A",
        rollMode: options.rollMode,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.extra.malignantInfluence = html.find('[name="malignantInfluence"]').is(':checked');

        let skillSelected = channellSkills[Number(html.find('[name="skillSelected"]').val())];
        // If an actual Channelling skill was selected, use that skill to calculate the target number
        if (skillSelected.key != "wp") {
          testData.target = testData.testModifier + testData.testDifficulty
            + this.data.data.characteristics[skillSelected.data.characteristic.value].value
            + skillSelected.data.advances.value
            + skillSelected.data.modifier.value
          testData.extra.channellSkill = skillSelected.data
        }
        else // if the ccharacteristic was selected, use just the characteristic
          testData.target = testData.testModifier + testData.testDifficulty + this.data.data.characteristics.wp.value

        return { testData, cardOptions };

      }
    };

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
   * the logic of which can be found in DiceWFRP.rollPrayerTest, where all this data here is passed
   * to in order to calculate the roll result.
   *
   * @param {Object} prayer    The prayer Item being used, compared to spells, not much information
   * from the prayer itself is needed.
   */
  setupPrayer(prayer, options = {}) {
   let title = options.title || game.i18n.localize("PrayerTest") + " - " + prayer.name;

    // ppraySkills array holds the available skills/characteristics to pray with - Prayers: Fellowship
    let praySkills = [{ key: "fel", name: game.i18n.localize("CHAR.Fel") }]

    // if the actor has the Pray skill, add it to the array.
    let skill = this.data.skills.find(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase());
    if (skill)
      praySkills.push(skill)

    // Default to Pray skill if available
    let defaultSelection = praySkills.findIndex(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase())

    if (!prayer.prepared)
      this.prepareSpellOrPrayer(prayer);

    // Prepare the prayer to have the complete data object, including damage values, range values, etc.
    let testData = { // Store this data to be used in the test logic
      target: 0,
      hitLocation: false,
      target: defaultSelection != -1 ? this.data.data.characteristics[praySkills[defaultSelection].data.characteristic.value].value + praySkills[defaultSelection].data.advances.value : this.data.data.characteristics.fel.value,
      extra: {
        prayer: prayer,
        effects: prayer.effects.filter(e => getProperty(e, "flags.wfrp4e.effectApplication") == "apply"),
        size: this.data.data.details.size.value,
        sin: this.data.data.status.sin.value,
        options: options,
        rollMode: options.rollMode
      }
    };
    if (this.isToken)
      testData.extra.speaker = {
        token: this.options.token.id,
        scene: this.options.token.scene.id
      }
    else
      testData.extra.speaker = {
        actor: this.id
      }



    // If the spell does damage, default the hit location to checked
    if (prayer.damage)
      testData.hitLocation = true;


    mergeObject(testData, this.getPrefillData("prayer", prayer, options))


    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/prayer-dialog.html",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        talents: this.data.flags.talentTests,
        advantage: this.data.data.status.advantage.value || 0,
        praySkills: praySkills,
        defaultSelection: defaultSelection,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());

        let skillSelected = praySkills[Number(html.find('[name="skillSelected"]').val())];
        // If an actual skill (Pray) was selected, use that skill to calculate the target number
        if (skillSelected.key != "fel") {
          testData.target = this.data.data.characteristics[skillSelected.data.characteristic.value].value
            + skillSelected.data.advances.value
            + testData.testDifficulty
            + testData.testModifier;
          + skillSelected.data.modifier.value
        }
        else // if a characteristic was selected, use just the characteristic
        {
          testData.target = this.data.data.characteristics.fel.value
            + testData.testDifficulty
            + testData.testModifier;
        }

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
    if (!trait.data.rollable.value)
      return ui.notifications.notify("Non-rollable trait");

    if (!trait.prepared)
      this.prepareTrait(trait);

   let title = options.title || game.wfrp4e.config.characteristics[trait.data.rollable.rollCharacteristic] + ` ${game.i18n.localize("Test")} - ` + trait.name;
    let skill = this.data.skills.find(sk => sk.name == trait.data.rollable.skill)
    if (skill)
    {
      title = skill.name + ` ${game.i18n.localize("Test")} - ` + trait.name;
      trait.skill = skill;
    }
    let testData = {
      hitLocation: false,
      target: this.data.data.characteristics[trait.data.rollable.rollCharacteristic].value,
      extra: { // Store this trait data for later use
        trait: trait,
        effects: trait.effects.filter(e => getProperty(e, "flags.wfrp4e.effectApplication") == "apply"),
        size: this.data.data.details.size.value,
        champion: !!this.items.find(i => i.data.name.toLowerCase() == game.i18n.localize("NAME.Champion").toLowerCase()),
        options: options,
        rollMode: options.rollMode
      }
    };
    if (this.isToken)
      testData.extra.speaker = {
        token: this.options.token.id,
        scene: this.options.token.scene.id
      }
    else
      testData.extra.speaker = {
        actor: this.id
      }

    // Default hit location checked if the rollable trait's characteristic is WS or BS
    if (trait.data.rollable.rollCharacteristic == "ws" || trait.data.rollable.rollCharacteristic == "bs")
      testData.hitLocation = true;

    mergeObject(testData, this.getPrefillData("trait", trait, options))


    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/skill-dialog.html", // Reuse skill dialog
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        talents: this.data.flags.talentTests,
        characteristicList: game.wfrp4e.config.characteristics,
        characteristicToUse: trait.data.rollable.rollCharacteristic,
        advantage: this.data.data.status.advantage.value || 0,
        dialogEffects: this.getDialogChoices()
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        let characteristicToUse = html.find('[name="characteristicToUse"]').val();
        // Target value is the final value being tested against, after all modifiers and bonuses are added
        testData.target = this.data.data.characteristics[characteristicToUse].value
          + testData.testModifier
          + testData.testDifficulty

        if (testData.extra.trait.skill)
          testData.target += testData.extra.trait.skill.data.advances.value;
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

    let defaultRollMode = item.data.hide.test || item.data.hide.progress ? "gmroll" : "roll"

    if (item.data.SL.target <= 0)
      return ui.notifications.error("Please enter a positive integer for the Extended Test's Target")

      options.extended = item._id;
      options.rollMode = defaultRollMode;
     
    let characteristic = WFRP_Utility.findKey(item.data.test.value, game.wfrp4e.config.characteristics)
    if (characteristic) {
      return this.setupCharacteristic(characteristic, options).then(setupData => {
        this.basicTest(setupData)
      })
    }
    else {
      let skill = this.data.skills.find(i => i.name == item.data.test.value)
      if (skill) {
        return this.setupSkill(skill, options).then(setupData => {
          this.basicTest(setupData)
        })
      }
      ui.notifications.error("Could not find characteristic or skill to match: " + item.data.test.value)
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
        actor: this.data._id,
      },
      title: title,
      template: template,
      flags: { img: this.data.token.randomImg ? this.data.img : this.data.token.img }
      // img to be displayed next to the name on the test card - if it's a wildcard img, use the actor image
    }

    // If the test is coming from a token sheet
    if (this.token) {
      cardOptions.speaker.alias = this.token.data.name; // Use the token name instead of the actor name
      cardOptions.speaker.token = this.token.data._id;
      cardOptions.speaker.scene = canvas.scene._id
      cardOptions.flags.img = this.token.data.img; // Use the token image instead of the actor image
    }
    else // If a linked actor - use the currently selected token's data if the actor id matches
    {
      let speaker = ChatMessage.getSpeaker()
      if (speaker.actor == this.data._id) {
        cardOptions.speaker.alias = speaker.alias
        cardOptions.speaker.token = speaker.token
        cardOptions.speaker.scene = speaker.scene
        cardOptions.flags.img = speaker.token ? canvas.tokens.get(speaker.token).data.img : cardOptions.flags.img
      }
    }

    if (this.isMounted) {
      cardOptions.flags.mountedImg = this.mount.data.token.img;
      cardOptions.flags.mountedName = this.mount.data.token.name;
    }

    if (VideoHelper.hasVideoExtension(cardOptions.flags.img))
      game.video.createThumbnail(cardOptions.flags.img, {width: 50, height: 50}).then(img => cardOptions.flags.img = img)

    return cardOptions
  }


  rollReloadTest(weapon) {
    let testId = getProperty(weapon, "flags.wfrp4e.reloading")
    let extendedTest = this.getEmbeddedEntity("OwnedItem", testId)
    if (!extendedTest) {

      //return ui.notifications.error(game.i18n.localize("ITEM.ReloadError"))
      return this.checkReloadExtendedTest(weapon);
    }
    this.setupExtendedTest(extendedTest, {reload : true, weapon});
  }


  /* --------------------------------------------------------------------------------------------------------- */
  /* --------------------------------------------- Roll Overides --------------------------------------------- */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * Roll overrides are specialized functions for different types of rolls. In each override, DiceWFRP is called
   * to perform the test logic, which has its own specialized functions for different types of tests. For exapmle,
   * weaponTest() calls DiceWFRP.rollWeaponTest(). Additionally, any post-roll logic that needs to be performed
   * is done here. For example, Income tests use incomeTest, which determines how much money is made after the
   * roll is completed. A normal Skill Test does not go through this process, instead using basicTest override,
   * however both overrides just use the standard DiceWFRP.rollTest().
   *
  /* --------------------------------------------------------------------------------------------------------- */

  /**
   * Default Roll override, the standard rolling method for general tests.
   *
   * basicTest is the default roll override (see this.setupDialog() for where it's assigned). This follows
   * the basic steps. Call DiceWFRP.rollTest for standard test logic, send the result and display data to
   * if(!options.suppressMessage)
DiceWFRP.renderRollCard() as well as handleOpposedTarget().
   *
   * @param {Object} testData         All the data needed to evaluate test results - see setupSkill/Characteristic
   * @param {Object} cardOptions      Data for the card display, title, template, etc.
   * @param {Object} rerenderMessage  The message to be updated (used if editing the chat card)
   */
  async basicTest({ testData, cardOptions }, options = {}) {
    testData = await DiceWFRP.rollDices(testData, cardOptions);
    this.runEffects("preRollTest", {testData, cardOptions})
    let result = DiceWFRP.rollTest(testData);

    result.postFunction = "basicTest";

    if (result.options.corruption) {
      this.handleCorruptionResult(result);
    }
    if (result.options.mutate) {
      this.handleMutationResult(result)
    }

    if (result.options.extended) {
      this.handleExtendedTest(result)
    }

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { result, cardOptions })
    Hooks.call("wfrp4e:rollTest", result, cardOptions)

    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`;
      cardOptions.isOpposedTest = true
    }

    if (!options.suppressMessage)
      if (!options.suppressMessage)
        DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
          OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
        })
    return { result, cardOptions };
  }

  /**
   * incomeTest is used to add income calculation to Skill tests.
   *
   * Normal skill Tests just use basicTest() override, however, when testing Income, this override is used instead
   * because it adds 'post processing' in the form of determining how much money was earned. See this.setupSkill()
   * for how this override is assigned.
   *
   * @param {Object} testData         All the data needed to evaluate test results - see setupSkill()
   * @param {Object} cardOptions      Data for the card display, title, template, etc.
   * @param {Object} rerenderMessage  The message to be updated (used if editing the chat card)
   */
  async incomeTest({ testData, cardOptions }, options = {}) {
    testData = await DiceWFRP.rollDices(testData, cardOptions);
    this.runEffects("preRollTest", {testData, cardOptions})
    let result = DiceWFRP.rollTest(testData);
    result.postFunction = "incomeTest"



    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`,
        cardOptions.isOpposedTest = true
    }

    let status = testData.income.value.split(' ')

    let dieAmount = game.wfrp4e.config.earningValues[WFRP_Utility.findKey(status[0], game.wfrp4e.config.statusTiers)][0] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    dieAmount = Number(dieAmount) * status[1];     // Multilpy that first letter by your standing (Brass 4 = 8d10 pennies)
    let moneyEarned;
    if (WFRP_Utility.findKey(status[0], game.wfrp4e.config.statusTiers) != "g") // Don't roll for gold, just use standing value
    {
      dieAmount = dieAmount + "d10";
      moneyEarned = new Roll(dieAmount).roll().total;
    }
    else
      moneyEarned = dieAmount;

    // After rolling, determined how much, if any, was actually earned
    if (result.description.includes("Success")) {
      result.incomeResult = game.i18n.localize("INCOME.YouEarn") + " " + moneyEarned;
      switch (WFRP_Utility.findKey(status[0], game.wfrp4e.config.statusTiers)) {
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
      switch (WFRP_Utility.findKey(status[0], game.wfrp4e.config.statusTiers)) {
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
    // let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
    // cardOptions.sound = contextAudio.file || cardOptions.sound
    result.moneyEarned = moneyEarned + WFRP_Utility.findKey(status[0], game.wfrp4e.config.statusTiers);

    this.runEffects("rollTest", { result, cardOptions })
    this.runEffects("rollIncomeTest", { result, cardOptions })
    Hooks.call("wfrp4e:rollIncomeTest", result, cardOptions)

    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg)
      })
    return { result, cardOptions };
  }

  /**
   * weaponTest is used for weapon tests, see setupWeapon for how it's assigned.
   *
   * weaponTest doesn't add any special functionality, it's main purpose being to call
   * DiceWFRP.rollWeaponTest() instead of the generic DiceWFRP.rollTest()
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

    testData = await DiceWFRP.rollDices(testData, cardOptions);
    this.runEffects("preRollTest", {testData, cardOptions})
    this.runEffects("preRollWeaponTest", {testData, cardOptions})
    let result = DiceWFRP.rollWeaponTest(testData);
    result.postFunction = "weaponTest";

    let owningActor = testData.extra.options.vehicle ? game.actors.get(testData.extra.options.vehicle) : this // Update the vehicle's owned item if it's from a vehicle
    // Reduce ammo if necessary
    if (result.ammo && result.weapon.data.consumesAmmo.value) {
      result.ammo.data.quantity.value--;
      owningActor.updateEmbeddedEntity("OwnedItem", { _id: result.ammo._id, "data.quantity.value": result.ammo.data.quantity.value });
    }


    if (result.weapon.loading) {
      result.weapon.data.loaded.amt--;
      if (result.weapon.data.loaded.amt <= 0) {
        result.weapon.data.loaded.amt = 0
        result.weapon.data.loaded.value = false;

        owningActor.updateEmbeddedEntity("OwnedItem", { _id: result.weapon._id, "data.loaded.amt": result.weapon.data.loaded.amt, "data.loaded.value": result.weapon.data.loaded.value })

        this.checkReloadExtendedTest(result.weapon)
      }
      else {
        owningActor.updateEmbeddedEntity("OwnedItem", { _id: result.weapon._id, "data.loaded.amt": result.weapon.data.loaded.amt })
      }
    }

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { result, cardOptions })
    this.runEffects("rollWeaponTest", { result, cardOptions })
    Hooks.call("wfrp4e:rollWeaponTest", result, cardOptions)


    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })

    if (testData.extra.dualWielding && result.result == "success") {
      let offHandData = duplicate(testData)

      let offhandWeapon = this.data.weapons.find(w => w.data.offhand.value);
      if (testData.roll % 11 == 0 || testData.roll == 100)
        delete offHandData.roll
      else {
        let offhandRoll = testData.roll.toString();
        if (offhandRoll.length == 1)
          offhandRoll = offhandRoll[0] + "0"
        else
          offhandRoll = offhandRoll[1] + offhandRoll[0]
        offHandData.roll = Number(offhandRoll);
      }

      offHandData.extra.dualWielding = false;
      offHandData.extra.weapon = offhandWeapon;

      let offHandModifier = -20
      offHandModifier += Math.min(20, this.data.flags.ambi * 10)

      offHandData.target += offHandModifier;

      let offHandCard = duplicate(cardOptions)
      offHandCard.title = game.i18n.localize("WeaponTest") + " - " + offhandWeapon.name + " (" + game.i18n.localize("SHEET.Offhand") + ")";
      offHandCard.sound = ""
      this.weaponTest({ testData: offHandData, cardOptions: offHandCard })
    }

    return { result, cardOptions };
  }

  /**
   * castTest is used for casting tests, see setupCast for how it's assigned.
   *
   * The only special functionality castTest adds is reseting spell SL channelled back to 0, other than that,
   * it's main purpose is to call DiceWFRP.rollCastTest() instead of the generic DiceWFRP.rollTest().
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

    // Find ingredient being used, if any
    let ing = duplicate(this.getEmbeddedEntity("OwnedItem", testData.extra.spell.data.currentIng.value))
    if (ing && ing.data.quantity.value > 0) {
      // Decrease ingredient quantity
      testData.extra.ingredient = true;
      ing.data.quantity.value--;
      this.updateEmbeddedEntity("OwnedItem", ing);
    }
    // If quantity of ingredient is 0, disregard the ingredient
    else if (!ing || ing.data.quantity.value <= 0)
      testData.extra.ingredient = false;

    testData = await DiceWFRP.rollDices(testData, cardOptions);
    this.runEffects("preRollTest", {testData, cardOptions})
    this.runEffects("preRollCastTest", {testData, cardOptions})
    let result = DiceWFRP.rollCastTest(testData);
    result.postFunction = "castTest";

    // Set initial extra overcasting options to SL if checked
    if (result.spell.data.overcast.enabled)
    {
      if (getProperty(result.spell, "data.overcast.initial.type") == "SL")
      {
        setProperty(result.spell, "overcasts.other.initial", parseInt(result.SL) + (parseInt(this.calculateSpellAttributes(result.spell.data.overcast.initial.additional)) || 0))
        setProperty(result.spell, "overcasts.other.current", parseInt(result.SL) + (parseInt(this.calculateSpellAttributes(result.spell.data.overcast.initial.additional)) || 0))
      }

    }


    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { result, cardOptions })
    this.runEffects("rollCastTest", { result, cardOptions })
    Hooks.call("wfrp4e:rollCastTest", result, cardOptions)


    // Update spell to reflect SL from channelling resetting to 0
    WFRP_Utility.getSpeaker(cardOptions.speaker).updateEmbeddedEntity("OwnedItem", { _id: testData.extra.spell._id, 'data.cn.SL': 0 });


    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return { result, cardOptions };
  }

  /**
   * channelTest is used for casting tests, see setupCast for how it's assigned.
   *
   * channellOveride doesn't add any special functionality, it's main purpose being to call
   * DiceWFRP.rollChannellTest() instead of the generic DiceWFRP.rollTest()
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

    // Find ingredient being used, if any
    let ing = duplicate(this.getEmbeddedEntity("OwnedItem", testData.extra.spell.data.currentIng.value))
    if (ing && ing.data.quantity.value > 0) {
      // Decrease ingredient quantity
      testData.extra.ingredient = true;
      ing.data.quantity.value--;
      this.updateEmbeddedEntity("OwnedItem", ing);
    }
    // If quantity of ingredient is 0, disregard the ingredient
    else if (!ing || ing.data.quantity.value <= 0)
      testData.extra.ingredient = false;

    testData = await DiceWFRP.rollDices(testData, cardOptions);
    this.runEffects("preRollTest", {testData, cardOptions})
    this.runEffects("preChannellingTest", {testData, cardOptions})
    let result = DiceWFRP.rollChannellTest(testData, WFRP_Utility.getSpeaker(cardOptions.speaker));
    result.postFunction = "channelTest";

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { result, cardOptions })
    this.runEffects("rollChannellingTest", { result, cardOptions })
    Hooks.call("wfrp4e:rollChannelTest", result, cardOptions)

    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return { result, cardOptions };
  }

  /**
   * prayerTest is used for casting tests, see setupCast for how it's assigned.
   *
   * prayerTest doesn't add any special functionality, it's main purpose being to call
   * DiceWFRP.rollPrayerTest() instead of the generic DiceWFRP.rollTest()
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
    testData = await DiceWFRP.rollDices(testData, cardOptions);
    this.runEffects("preRollTest", {testData, cardOptions})
    this.runEffects("preRollPrayerTest", {testData, cardOptions})
    let result = DiceWFRP.rollPrayTest(testData, WFRP_Utility.getSpeaker(cardOptions.speaker));
    result.postFunction = "prayerTest";

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { result, cardOptions })
    this.runEffects("rollPrayerTest", { result, cardOptions })
    Hooks.call("wfrp4e:rollPrayerTest", result, cardOptions)

    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return { result, cardOptions };
  }

  /**
   * traitTest is used for Trait tests, see setupTrait for how it's assigned.
   *
   * Since traitTest calls the generic DiceWFRP.rollTest(), which does not consider damage,
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
    testData = await DiceWFRP.rollDices(testData, cardOptions);
    this.runEffects("preRollTest", {testData, cardOptions})
    this.runEffects("preRollTraitTest", {testData, cardOptions})
    let result = DiceWFRP.rollTraitTest(testData);
    result.postFunction = "traitTest";
   
    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    this.runEffects("rollTest", { result, cardOptions })
    this.runEffects("rollTraitTest", { result, cardOptions })
    Hooks.call("wfrp4e:rollTraitTest", result, cardOptions)

    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return { result, cardOptions };
  }


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

  /**
   * Prepares actor data for display and other features.
   * 
   * prepare() is the principal function behind taking every aspect of an actor and processing them
   * for display (getData() - see ActorSheetWfrp4e) and other needs. This is where all items (call to 
   * prepareItems()) are prepared and  organized, then used to calculate different Actor features, 
   * such as the Size trait influencing wounds and token size, or how talents might affect damage. 
   * In many areas here, these talents/traits that affect some calculation are updated only if a 
   * difference is detected to avoid infinite loops, I would like an alternative but I'm not sure 
   * where to go instead.
   * 
   * NOTE: THIS FUNCTION IS NOT TO BE CONFUSED WITH prepareData(). That function is called upon updating 
   * an actor. This function is called whenever the sheet is rendered.
   */
  prepare() {
    
    try {
    if (this.data.type != "vehicle" && this.isMounted)
      this.prepareData(); // reprepare just in case any mount changes occurred
    }
    catch (e) {
      console.error("Error repreparing data: " + e)
    }

    let preparedData = duplicate(this.data)

    // Change out hit locations if using custom table
    for (let loc in preparedData.AP) {
      if (loc == "shield")
        continue
      let row = game.wfrp4e.tables[preparedData.data.details.hitLocationTable.value].rows.find(r => r.result == loc)
      if (row)
        preparedData.AP[loc].label = game.i18n.localize(row.description)
      else
        preparedData.AP[loc].show = false;
    }


    return preparedData;
  }


  /**
   * Iterates through the Owned Items, processes them and organizes them into containers.
   * 
   * This behemoth of a function goes through all Owned Items, separating them into individual arrays
   * that the html templates use. Before adding them into the array, they are typically processed with
   * the actor data, which can either be a large function itself (see prepareWeaponCombat) or not, such
   * as career items which have minimal processing. These items, as well as some auxiliary data (e.g.
   * encumbrance, AP) are bundled into an return object
   * 
   */
  prepareItems() {

    let actorData = this.data;
    // These containers are for the various different tabs
    const careers = [];
    const skills = [];
    const basicSkills = [];
    const advancedOrGroupedSkills = [];
    const talents = [];
    const traits = [];
    const weapons = [];
    const armour = [];
    const injuries = [];
    const grimoire = [];
    const petty = [];
    const blessings = [];
    const miracles = [];
    const psychology = [];
    const mutations = [];
    const diseases = [];
    const criticals = [];
    const extendedTests = [];
    const vehicleMods = [];
    let penalties = {
      [game.i18n.localize("Armour")]: {
        value: ""
      },
      [game.i18n.localize("Injury")]: {
        value: ""
      },
      [game.i18n.localize("Mutation")]: {
        value: ""
      },
      [game.i18n.localize("Criticals")]: {
        value: ""
      },
    };

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





    // Inventory object is for the Trappings tab - each sub object is for an individual inventory section
    const inventory = {
      weapons: {
        label: game.i18n.localize("WFRP4E.TrappingType.Weapon"), // Label - what is displayed in the inventory section header
        items: [],                                  // Array of items in the section
        toggle: true,                               // Is there a toggle in the section? (Equipped, worn, etc.)
        toggleName: game.i18n.localize("Equipped"), // What is the name of the toggle in the header
        show: false,                                // Should this section be shown (if an item exists in this list, it is set to true)
        dataType: "weapon"                          // What type of FVTT Item is in this section (used by the + button to add an item of this type)
      },
      armor: {
        label: game.i18n.localize("WFRP4E.TrappingType.Armour"),
        items: [],
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        dataType: "armour"
      },
      ammunition: {
        label: game.i18n.localize("WFRP4E.TrappingType.Ammunition"),
        items: [],
        show: false,
        dataType: "ammunition"
      },
      clothingAccessories: {
        label: game.i18n.localize("WFRP4E.TrappingType.ClothingAccessories"),
        items: [],
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        dataType: "trapping"
      },
      booksAndDocuments: {
        label: game.i18n.localize("WFRP4E.TrappingType.BooksDocuments"),
        items: [],
        show: false,
        dataType: "trapping"
      },
      toolsAndKits: {
        label: game.i18n.localize("WFRP4E.TrappingType.ToolsKits"),
        items: [],
        show: false,
        dataType: "trapping"
      },
      foodAndDrink: {
        label: game.i18n.localize("WFRP4E.TrappingType.FoodDrink"),
        items: [],
        show: false,
        dataType: "trapping"
      },
      drugsPoisonsHerbsDraughts: {
        label: game.i18n.localize("WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts"),
        items: [],
        show: false,
        dataType: "trapping"
      },
      misc: {
        label: game.i18n.localize("WFRP4E.TrappingType.Misc"),
        items: [],
        show: true,
        dataType: "trapping"
      },
      cargo: {
        label: game.i18n.localize("WFRP4E.TrappingType.Cargo"),
        items: [],
        show: false,
        dataType: "cargo"
      }
    };

    // Money and ingredients are not in inventory object because they need more customization - note in actor-inventory.html that they do not exist in the main inventory loop
    const ingredients = {
      label: game.i18n.localize("WFRP4E.TrappingType.Ingredient"),
      items: [],
      show: false,
      dataType: "trapping"
    };
    const money = {
      coins: [],
      total: 0,     // Total coinage value
      show: true
    };
    const containers = {
      items: [],
      show: false
    };
    const inContainers = []; // inContainers is the temporary storage for items within a container


    let totalEnc = 0;         // Total encumbrance of items
    let hasSpells = false;    // if the actor has atleast a single spell - used to display magic tab
    let hasPrayers = false;   // if the actor has atleast a single prayer - used to display religion tab
    let showOffhand = true;   // Show offhand checkboxes if no offhand equipped
    let defensiveCounter = 0; // Counter for weapons with the defensive quality

    actorData.items = actorData.items.sort((a, b) => (a.sort || 0) - (b.sort || 0))

    // Iterate through items, allocating to containers
    // Items that need more intense processing are sent to a specialized function (see preparation functions below)
    // Physical items are also placed into containers instead of the inventory object if their 'location' is not 0
    // A location of 0 means not in a container, otherwise, the location corresponds to the id of the container the item is in
    for (let i of actorData.items) {
      if (getProperty(i, "data.location.value") && i.type != "critical" && i.type != "injury") {
        i.inContainer = true;
        inContainers.push(i);
      }

      //try {
      i.img = i.img || DEFAULT_TOKEN;

      // *********** TALENTS ***********
      if (i.type === "talent") {
        this.prepareTalent(i, talents);
      }

      // *********** Skills ***********
      else if (i.type === "skill") {
        this.prepareSkill(i);
        if (i.data.grouped.value == "isSpec" || i.data.advanced.value == "adv")
          advancedOrGroupedSkills.push(i)
        else
          basicSkills.push(i);
        skills.push(i);
      }

      // *********** Ammunition ***********
      else if (i.type === "ammunition") {
        i.encumbrance = (i.data.encumbrance.value * i.data.quantity.value).toFixed(2);
        if (!i.inContainer) {
          inventory.ammunition.show = true
          totalEnc += Number(i.encumbrance);
        }
        inventory.ammunition.items.push(i);
      }

      // *********** Weapons ***********
      // Weapons are "processed" at the end for efficency
      else if (i.type === "weapon") {
        i.encumbrance = Math.floor(i.data.encumbrance.value * i.data.quantity.value);
        if (!i.inContainer) {
          i.toggleValue = i.data.equipped || false;
          inventory.weapons.show = true;
          totalEnc += i.encumbrance;
        }
        inventory.weapons.items.push(i);
      }

      // *********** Armour ***********
      // Armour is prepared only if it is worn, otherwise, it is just pushed to inventory and encumbrance is calculated
      else if (i.type === "armour") {
        i.encumbrance = Math.floor(i.data.encumbrance.value * i.data.quantity.value);
        if (!i.inContainer) {
          i.toggleValue = i.data.worn.value || false;
          if (i.data.worn.value) {
            i.encumbrance = i.encumbrance - 1;
            i.encumbrance = i.encumbrance < 0 ? 0 : i.encumbrance;
          }
          inventory.armor.show = true;
          totalEnc += i.encumbrance;
        }
        //armour.push(this.prepareArmorCombat(i, AP));
        inventory.armor.items.push(this.prepareArmorCombat(i, AP));
        if (i.data.worn.value)
          armour.push(i);

      }
      // *********** Injuries ***********
      else if (i.type == "injury") {
        injuries.push(i);
        penalties[game.i18n.localize("Injury")].value += i.data.penalty.value;
      }

      // *********** Criticals ***********
      else if (i.type == "critical") {
        criticals.push(i);
        penalties[game.i18n.localize("Criticals")].value += i.data.modifier.value;
      }

      // *********** Containers ***********
      // Items within containers are organized at the end
      else if (i.type === "container") {
        this.runEffects("prePrepareItem", {item : i})
        i.encumbrance = i.data.encumbrance.value;

        if (!i.inContainer) {
          if (i.data.worn.value) {
            i.encumbrance = i.encumbrance - 1;
            i.encumbrance = i.encumbrance < 0 ? 0 : i.encumbrance;
          }
          if (i.data.countEnc.value)
            totalEnc += i.encumbrance;
        }
        this.runEffects("prepareItem", {item : i})
        containers.items.push(i);
        containers.show = true;
      }

      // *********** Trappings ***********
      // Trappings have several sub-categories, most notably Ingredients
      // The trappings tab does not have a "Trappings" section, but sections for each type of trapping instead
      else if (i.type === "trapping") {
        this.runEffects("prePrepareItem", {item : i})
        i.encumbrance = i.data.encumbrance.value * i.data.quantity.value;
        if (!i.inContainer) {
          // Push ingredients to a speciality array for futher customization in the trappings tab
          if (i.data.trappingType.value == "ingredient") {
            ingredients.items.push(i)
          }
          // The trapping will fall into one of these if statements and set the array accordingly
          else if (i.data.trappingType.value == "clothingAccessories") {
            i.toggleValue = i.data.worn || false;
            inventory[i.data.trappingType.value].items.push(i);
            inventory[i.data.trappingType.value].show = true;
            if (i.data.worn) {
              i.encumbrance = i.encumbrance - 1;                      // Since some trappings are worn, they need special treatment
              i.encumbrance = i.encumbrance < 0 ? 0 : i.encumbrance;  // This if statement is specific to worn clothing Trappings
            }
          }
          else if (i.data.trappingType.value == "tradeTools") {
            inventory["toolsAndKits"].items.push(i)             // I decided not to separate "Trade Tools" and "Tools and Kits"
            inventory["toolsAndKits"].show = true;              // Instead, merging them both into "Tools and Kits"
          }
          else if (i.data.trappingType.value) {
            inventory[i.data.trappingType.value].items.push(i); // Generic - add anything else to their appropriate array
            inventory[i.data.trappingType.value].show = true;
          }
          else {
            inventory.misc.items.push(i); // If somehow it didn't fall into the other categories (it should)
            inventory.misc.show = true;   // Just push it to miscellaneous
          }
          this.runEffects("prepareItem", {item : i})
          totalEnc += i.encumbrance;
        }
      }

      // *********** Spells ***********
      // See this.prepareSpellOrPrayer() for how these items are processed 
      else if (i.type === "spell") {
        hasSpells = true;
        if (i.data.lore.value == "petty")
          petty.push(this.prepareSpellOrPrayer(i));
        else
          grimoire.push(this.prepareSpellOrPrayer(i));
      }
      // *********** Prayers ***********
      // See this.prepareSpellOrPrayer() for how these items are processed 
      else if (i.type === "prayer") {
        hasPrayers = true;
        if (i.data.type.value == "blessing")
          blessings.push(this.prepareSpellOrPrayer(i));
        else
          miracles.push(this.prepareSpellOrPrayer(i));
      }

      // *********** Careers ***********   
      else if (i.type === "career") {
        careers.push(i);
      }

      // *********** Trait ***********   
      // Display Traits as Trait-Name (Specification)
      // Such as Animosity (Elves)
      else if (i.type === "trait") {
        traits.push(this.prepareTrait(i));
      }

      // *********** Psychologies ***********   
      else if (i.type === "psychology") {
        psychology.push(i);
      }

      // *********** Diseases ***********   
      // .roll is the roll result. If it doesn't exist, show the formula instead
      else if (i.type === "disease") {
        diseases.push(i);
      }

      // *********** Mutations ***********   
      // Some mutations have modifiers - see the penalties section below 
      else if (i.type === "mutation") {
        mutations.push(i);
        if (i.data.modifiesSkills.value)
          penalties[game.i18n.localize("Mutation")].value += i.data.modifier.value;
      }

      // *********** Money ***********   
      // Keep a running total of the coin value the actor has outside of containers
      else if (i.type === "money") {
        i.encumbrance = (i.data.encumbrance.value * i.data.quantity.value).toFixed(2);
        if (!i.inContainer) {
          money.coins.push(i);
          totalEnc += Number(i.encumbrance);
        }

        money.total += i.data.quantity.value * i.data.coinValue.value;
      }

      // TODO move this to getDisplayData
      else if (i.type === "extendedTest") {
        i.pct = 0;
        if (i.data.SL.target > 0)
          i.pct = i.data.SL.current / i.data.SL.target * 100
        if (i.pct > 100)
          i.pct = 100
        if (i.pct < 0)
          i.pct = 0;

        extendedTests.push(i);
      }


      // *********** Vehicle Mod ***********   
      else if (i.type === "vehicleMod") {
        i.encumbrance = i.data.encumbrance.value
        i.modType = game.wfrp4e.config.modTypes[i.data.modType.value]
        vehicleMods.push(i)
      }


     // *********** Cargo ***********
      else if (i.type === "cargo") {
        i.encumbrance = Math.floor(i.data.encumbrance.value);
        if (!i.inContainer) {
          inventory.cargo.show = true;
          totalEnc += i.encumbrance;
        }
        inventory.cargo.items.push(i);
      }



      //this.runEffects("prepareItem", {item : i})

      // catch (error) {
      //   console.error("Something went wrong with preparing item " + i.name + ": " + error)
      //   ui.notifications.error("Something went wrong with preparing item " + i.name + ": " + error)
      // }
    } // END ITEM SORTING


    let totalShieldDamage = 0; // Used for damage tooltip
    if (this.data.type != "vehicle") {
      // Prepare weapons for combat after items passthrough for efficiency - weapons need to know the ammo possessed, so instead of iterating through
      // all items to find, iterate through the inventory.ammo array we just made
      let eqpPoints = 0 // Weapon equipment value, only 2 one handed weapons or 1 two handed weapon
      for (let wep of inventory.weapons.items) {
        weapons.push(this.prepareWeaponCombat(wep, inventory.ammunition.items, basicSkills.concat(advancedOrGroupedSkills)));

        // TODO Move to display
        // We're only preparing equipped items here - this is for displaying weapons in the combat tab after all
        if (wep.data.equipped) {
          if (getProperty(wep, "data.offhand.value"))
            showOffhand = false; // Don't show offhand checkboxes if a weapon is offhanded
          // Process weapon taking into account actor data, skills, and ammo
          // Add shield AP to AP object
          let shieldProperty = wep.properties.qualities.find(q => q.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase()))
          if (shieldProperty) {
            let shieldDamage = wep.data.APdamage || 0;
            AP.shield += (parseInt(shieldProperty.split(" ")[1]) - shieldDamage);
            totalShieldDamage += shieldDamage;
          }
          // Keep a running total of defensive weapons equipped
          if (wep.properties.qualities.find(q => q.toLowerCase().includes(game.i18n.localize("PROPERTY.Defensive").toLowerCase()))) {
            defensiveCounter++;
          }
          eqpPoints += wep.data.twohanded.value ? 2 : 1
        }
      }

      this.data.flags.eqpPoints = eqpPoints


      // If you have no spells, just put all ingredients in the miscellaneous section, otherwise, setup the ingredients to be available
      if (grimoire.length > 0 && ingredients.items.length > 0) {
        ingredients.show = true;
        // For each spell, set available ingredients to ingredients that have been assigned to that spell
        for (let s of grimoire)
          s.data.ingredients = ingredients.items.filter(i => i.data.spellIngredient.value == s._id && i.data.quantity.value > 0)
      }
      else
        inventory.misc.items = inventory.misc.items.concat(ingredients.items);
    }
    else
    {
      inventory.misc.items = inventory.misc.items.concat(ingredients.items); // Vehicles just use misc
      for (let wep of inventory.weapons.items) {
        if (wep.data.weaponGroup.value == "vehicle")
          weapons.push(this.prepareWeaponCombat(wep, inventory.ammunition.items, basicSkills.concat(advancedOrGroupedSkills)))
      }
    }



    // ******************************** Container Setup ***********************************

    // containerMissing is an array of items whose container does not exist (needed for when a container is deleted)
    var containerMissing = inContainers.filter(i => !containers.items.find(c => c._id == i.data.location.value));
    for (var itemNoContainer of containerMissing) // Reset all items without container references (items that were removed from a contanier)
      itemNoContainer.data.location.value = 0;

    for (var cont of containers.items) // For each container
    {
      // All items referencing (inside) that container
      var itemsInside = inContainers.filter(i => i.data.location.value == cont._id);
      itemsInside.map(function (item) { // Add category of item to be displayed
        if (item.type == "trapping")
          item.typeCategory = game.wfrp4e.config.trappingCategories[item.data.trappingType.value];
        else
          item.typeCategory = game.wfrp4e.config.trappingCategories[item.type];
      })
      cont["carrying"] = itemsInside.filter(i => i.type != "Container");    // cont.carrying -> items the container is carrying
      cont["packsInside"] = itemsInside.filter(i => i.type == "Container"); // cont.packsInside -> containers the container is carrying
      cont["holding"] = itemsInside.reduce(function (prev, cur) {           // cont.holding -> total encumbrance the container is holding
        return Number(prev) + Number(cur.encumbrance);
      }, 0);
      cont.holding = Math.floor(cont.holding)
    }

    containers.items = containers.items.filter(c => !c.data.location.value); // Do not show containers inside other containers as top level (a location value of 0 means not inside a container)
    let penaltyOverflow = false;
    let enc;

    // keep defensive counter in flags to use for test auto fill (see setupWeapon())
    this.data.flags.defensive = defensiveCounter;


    if (this.data.type != "vehicle") {
      // enc used for encumbrance bar in trappings tab
      totalEnc = Math.floor(totalEnc);
      enc = {
        max: actorData.data.status.encumbrance.max,
        value: Math.round(totalEnc * 10) / 10,
      };
      // percentage of the bar filled
      enc.pct = Math.min(enc.value * 100 / enc.max, 100);
      enc.state = enc.value / enc.max; // state is how many times over you are max encumbrance
    }
    else {
      this.data.passengers = this.data.data.passengers.map(p => {
        let actor
        if (!game.actors) // game.actors does not exist at startup, use existing data
          game.postReadyPrepare.push(this)
        else {
          actor = game.actors.get(p.id);
          if (actor)
            return {
              actor: actor.data,
              linked: actor.data.token.actorLink,
              count: p.count,
              enc: game.wfrp4e.config.actorSizeEncumbrance[actor.data.data.details.size.value] * p.count
            }
        }
      });
      let totalEnc = 0;
      for (let section in inventory) {
        for (let item of inventory[section].items) {
          totalEnc += item.data.encumbrance.value
        }
      }

      for (let mod of vehicleMods)
      {
        this.data.data.details.encumbrance.value += mod.encumbrance
      }

      if (getProperty(this, "data.flags.actorEnc"))
        for (let passenger of this.data.passengers)
          totalEnc += passenger.enc;

      totalEnc = Math.floor(totalEnc);
      let overEncumbrance = this.data.data.details.encumbrance.value - this.data.data.details.encumbrance.initial // Amount of encumbrance added on;
      overEncumbrance = overEncumbrance < 0 ? 0 : overEncumbrance

      // TODO: organize this into prepare and getdata as needed
      enc = {
        max: this.data.data.status.carries.max,
        value: Math.round(totalEnc * 10) / 10 + overEncumbrance,
        overEncumbrance,
        carrying: totalEnc,
        carryPct: totalEnc / this.data.data.status.carries.max * 100,
        encPct: overEncumbrance / this.data.data.status.carries.max * 100,
        modMsg: game.i18n.format("VEHICLE.ModEncumbranceTT", { amt: overEncumbrance }),
        carryMsg: game.i18n.format("VEHICLE.CarryEncumbranceTT", { amt: Math.round(totalEnc * 10) / 10 })
      }

      if (enc.encPct + enc.carryPct > 100) {
        enc.penalty = Math.floor(((enc.encPct + enc.carryPct) - 100) / 10)
        enc.message = `Handling Tests suffer a -${enc.penalty} SL penalty.`
        enc.overEncumbered = true;
          
      }
      else {
        enc.message = `Encumbrance below maximum: No Penalties`
        if (enc.encPct + enc.carryPct == 100 && enc.carryPct)
          enc.carryPct -= 1
      }
    }

    mergeObject(this.data, {
      inventory,
      containers,
      basicSkills: basicSkills.sort(WFRP_Utility.nameSorter),
      advancedOrGroupedSkills: advancedOrGroupedSkills.sort(WFRP_Utility.nameSorter),
      skills,
      talents,
      traits,
      weapons,
      diseases,
      mutations,
      armour,
      penalties,
      penaltyOverflow,
      AP,
      injuries,
      grimoire,
      petty,
      careers: careers.reverse(),
      blessings,
      miracles,
      money,
      psychology,
      criticals,
      criticalCount: criticals.length,
      encumbrance: enc,
      ingredients,
      totalShieldDamage,
      extendedTests,
      vehicleMods,
      hasSpells,
      hasPrayers,
      showOffhand
    })
  }

  /**
   * Prepares a skill Item.
   * 
   * Preparation of a skill is simply determining the `total` value, which is the base characteristic + advances.
   * 
   * @param   {Object} skill    'skill' type Item 
   * @return  {Object} skill    Processed skill, with total value calculated
   */
  prepareSkill(skill) {
    this.runEffects("prePrepareItem", {item : skill})
    let actorData = this.data

    
    if(!hasProperty(skill, "data.modifier.value"))
      setProperty(skill, "data.modifier.value", 0)
  
    if (!skill.data.total)
      skill.data.total = {};
    skill.data.total.value = skill.data.modifier.value + skill.data.advances.value + actorData.data.characteristics[skill.data.characteristic.value].value

    skill.data.characteristic.num = actorData.data.characteristics[skill.data.characteristic.value].value;
    if (skill.data.modifier) {
      if (skill.data.modifier.value > 0)
        skill.modified = "positive";
      else if (skill.data.modifier.value < 0)
        skill.modified = "negative"
    }
    skill.data.characteristic.abrev = game.wfrp4e.config.characteristicsAbbrev[skill.data.characteristic.value];
    skill.data.cost = WFRP_Utility._calculateAdvCost(skill.data.advances.value, "skill", skill.data.advances.costModifier)
    skill.prepared = true;
    this.runEffects("prepareItem", {item : skill})
    return skill
  }

  /**
   * 
   * Prepares a talent Item.
   * 
   * Prepares a talent with actor data and other talents. Two different ways to prepare a talent:
   * 
   * 1. If a talent with the same name is already prepared, don't prepare this talent and instead
   * add to the advancements of the existing talent.
   * 
   * 2. If the talent does not exist yet, turn its "Max" value into "numMax", in other words, turn
   * "Max: Initiative Bonus" into an actual number value.
   * 
   * @param {Object} talent      'talent' type Item.
   * @param {Array}  talentList  List of talents prepared so far. Prepared talent is pushed here instead of returning.
   */
  prepareTalent(talent, talentList) {
    talent = duplicate(talent)
    this.runEffects("prePrepareItem", {item : talent})
    let actorData = this.data

    // Find an existing prepared talent with the same name
    let existingTalent = talentList.find(t => t.name == talent.name)
    if (existingTalent) // If it exists
    {
      if (!existingTalent.numMax) // If for some reason, it does not have a numMax, assign it one
        talent["numMax"] = actorData.data.characteristics[talent.data.max.value].bonus;
      // Add an advancement to the existing talent
      existingTalent.data.advances.value++;
      existingTalent.cost = (existingTalent.data.advances.value + 1) * 100
    }
    else // If a talent of the same name does not exist
    {
      switch (talent.data.max.value) // Turn its max value into "numMax", which is an actual numeric value
      {
        case '1':
          talent["numMax"] = 1;
          break;

        case '2':
          talent["numMax"] = 2;
          break;

        case '3':
          talent["numMax"] = 3;
          break;
  
        case '4':
          talent["numMax"] = 4;
          break;


        case 'none':
          talent["numMax"] = "-";
          break;

        default:
          talent["numMax"] = actorData.data.characteristics[talent.data.max.value].bonus;
      }
      talent.cost = 200;
      talent.prepared = true;
    this.runEffects("prepareItem", {item : talent})
      talentList.push(talent); // Add the prepared talent to the talent list
    }
  }

  /**
   * Prepares a weapon Item.
   * 
   * Prepares a weapon using actor data, ammunition, properties, and flags. The weapon's raw
   * data is turned into more user friendly / meaningful data with either config values or
   * calculations. Also turns all qualities/flaws into a more structured object.
   * 
   * @param  {Object} weapon      'weapon' type Item
   * @param  {Array}  ammoList    array of 'ammo' type Items
   * @param  {Array}  skills      array of 'skill' type Items
   * 
   * @return {Object} weapon      processed weapon
   */
  prepareWeaponCombat(weapon, ammoList, skills) {
    this.runEffects("prePrepareItem", {item : weapon})

    let actorData = this.data

    weapon.attackType = weapon.data.modeOverride?.value || game.wfrp4e.config.groupToType[weapon.data.weaponGroup.value]
    weapon.reach = game.wfrp4e.config.weaponReaches[weapon.data.reach.value];
    weapon.weaponGroup = game.wfrp4e.config.weaponGroups[weapon.data.weaponGroup.value] || "basic";


    if (!skills) // If a skill list isn't provided, filter all items to find skills
      skills = actorData.skills;

    // Attach the available skills to use to the weapon.
    if (weapon.data.skill?.value)
      weapon.skillToUse = skills.find(x => x.name.toLowerCase() == weapon.data.skill.value.toLowerCase())
    if (!weapon.skillToUse) // Either no override, or override not found, use weapon group
      weapon.skillToUse = skills.find(x => x.name.toLowerCase().includes(`(${weapon.weaponGroup.toLowerCase()})`))

    // prepareQualitiesFlaws turns the comma separated qualities/flaws string into a string array
    // Does not include qualities if no skill could be found above
    weapon.properties = WFRP_Utility._prepareQualitiesFlaws(weapon, !!weapon.skillToUse);

    // Special flail rule - if no skill could be found, add the Dangerous property
    if (weapon.data.weaponGroup.value == "flail" && !weapon.skillToUse && !weapon.properties.flaws.includes(game.i18n.localize("PROPERTY.Dangerous")))
      weapon.properties.flaws.push(game.i18n.localize("PROPERTY.Dangerous"));

    // Turn range into a numeric value (important for ranges including SB, see the function for details)
    weapon.range = this.calculateRangeOrDamage(weapon.data.range.value);

    // Melee Damage calculation
    if (weapon.attackType == "melee") {
      weapon["meleeWeaponType"] = true;
      // Turn melee damage formula into a numeric value (SB + 4 into a number)         Melee damage increase flag comes from Strike Mighty Blow talent

      weapon.damage = this.calculateRangeOrDamage(weapon.data.damage.value) + (actorData.flags.meleeDamageIncrease || 0);


    }
    // Ranged Damage calculation
    else {
      weapon["rangedWeaponType"] = true;

      // Turn ranged damage formula into numeric value, same as melee                 Ranged damage increase flag comes from Accurate Shot
      weapon.damage = this.calculateRangeOrDamage(weapon.data.damage.value) + (actorData.flags.rangedDamageIncrease || 0)

    }

    // Very poor wording, but if the weapon has suffered damage (weaponDamage), subtract that amount from meleeValue (melee damage the weapon deals)
    if (weapon.data.weaponDamage)
      weapon.damage -= weapon.data.weaponDamage
    else
      weapon.data.weaponDamage = 0;

    weapon.damageDice = weapon.data.damage.dice

    // If the weapon uses ammo...
    if (weapon.data.ammunitionGroup.value != "none") {
      weapon.ammo = [];
      // If a list of ammo has been provided, filter it by ammo that is compatible with the weapon type
      if (ammoList)
        weapon.ammo = ammoList.filter(a => a.data.ammunitionType.value == weapon.data.ammunitionGroup.value)
      else // If no ammo has been provided, filter through all items and find ammo that is compaptible
        weapon.ammo = actorData.inventory.ammunition.items.filter(a => a.data.ammunitionType.value == weapon.data.ammunitionGroup.value)

      // Send to _prepareWeaponWithAmmo for further calculation (Damage/range modifications based on ammo)
      this._prepareWeaponWithAmmo(weapon);
    }

    weapon.rangeBands = this.calculateRangeBands(weapon)

    if (weapon.properties.special)
      weapon.properties.special = weapon.data.special.value;


    if (weapon.properties.specialAmmo)
      weapon.properties.specialAmmo = weapon.ammo.find(a => a._id == weapon.data.currentAmmo.value).data.special.value

    if (weapon.properties.flaws.find(p => p.includes(game.i18n.localize("PROPERTY.Reload")))) {
      weapon.loading = true;
      let repeater = weapon.properties.qualities.find(p => p.includes(game.i18n.localize("PROPERTY.Repeater")))
      setProperty(weapon, "data.loaded.repeater", !!repeater)

      if (repeater) {
        weapon.data.loaded.max = Number(repeater[repeater.length - 1])
        if (isNaN(weapon.data.loaded.max)) {
          weapon.data.loaded.repeater = false;
          weapon.data.loaded.max = 1
        }
      }
      else
        weapon.data.loaded.max = 1
    }


    if (weapon.properties.flaws.find(p => p.includes(game.i18n.localize("PROPERTY.Repeater"))))
      weapon.loading = true;

    weapon.prepared = true;
    this.runEffects("prepareItem", {item : weapon})
    return weapon;
  }

  calculateRangeBands(weapon)
  {
    if (!weapon.range)
      return

    let range = weapon.range
    let rangeBands = {}

    rangeBands["Point Blank"] = {
      range : [0, Math.ceil(range / 10)],
      modifier : game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Point Blank"]]
    }
    rangeBands["Short Range"] = {
      range : [Math.ceil(range / 10) + 1,Math.ceil(range / 2)],
      modifier : game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Short Range"]]
    }
    rangeBands["Normal"]      = {
      range : [Math.ceil(range / 2) + 1,range],
      modifier : game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Normal"]]
    }
    rangeBands["Long Range"]  = {
      range : [range + 1,range * 2],
      modifier : game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Long Range"]]
    }
    rangeBands["Extreme"]     = {
      range : [range * 2 + 1,range * 3],
      modifier : game.wfrp4e.config.difficultyModifiers[game.wfrp4e.config.rangeModifiers["Extreme"]]
    }

    return rangeBands
  }

  prepareWeaponMount(weapon) {
    weapon = this.prepareWeaponCombat(weapon)
    if (!weapon.meleeWeaponType || !this.isMounted)
      return weapon;


    if (this.mount.data.data.characteristics.s.value > this.data.data.characteristics.s.value)
      weapon.damage = this.calculateRangeOrDamage(weapon.data.damage.value, this.mount.data);
    return weapon;
  }

  /**
   * Prepares an armour Item.
   * 
   * Takes a an armour item, along with a persistent AP object to process the armour
   * into a useable format. Adding AP values and qualities to the AP object to be used
   * in display and opposed tests.
   * 
   * @param   {Object} armor  'armour' type item
   * @param   {Object} AP      Object consisting of numeric AP value for each location and a layer array to represent each armour layer
   * @return  {Object} armor  processed armor item
   */
  prepareArmorCombat(armor, AP) {
    this.runEffects("prePrepareItem", {item : armor})

    // Turn comma separated qualites/flaws into a more structured 'properties.qualities/flaws` string array
    armor.properties = WFRP_Utility._prepareQualitiesFlaws(armor);
    armor.practical = armor.properties.qualities.includes(game.i18n.localize("PROPERTY.Practical"))

    if (armor.data.worn.value) {
      // Iterate through armor locations covered
      for (let apLoc in armor.data.currentAP) {
        // -1 is what all newly created armor's currentAP is initialized to, so if -1: currentAP = maxAP (undamaged)
        if (armor.data.currentAP[apLoc] == -1) {
          armor.data.currentAP[apLoc] = armor.data.maxAP[apLoc];
        }
      }

      armor.damaged = {}

      // If the armor protects a certain location, add the AP value of the armor to the AP object's location value
      // Then pass it to addLayer to parse out important information about the armor layer, namely qualities/flaws
      if (armor.data.maxAP.head > 0) {
        armor["protectsHead"] = true;
        AP.head.value += armor.data.currentAP.head;
        if (armor.data.currentAP.head < armor.data.maxAP.head)
          armor.damaged.head = true

        WFRP_Utility.addLayer(AP, armor, "head")
      }
      if (armor.data.maxAP.body > 0) {
        armor["protectsBody"] = true;
        AP.body.value += armor.data.currentAP.body;
        if (armor.data.currentAP.body < armor.data.maxAP.body)
          armor.damaged.body = true

        WFRP_Utility.addLayer(AP, armor, "body")
      }
      if (armor.data.maxAP.lArm > 0) {
        armor["protectslArm"] = true;
        AP.lArm.value += armor.data.currentAP.lArm;
        if (armor.data.currentAP.lArm < armor.data.maxAP.lArm)
          armor.damaged.lArm = true

        WFRP_Utility.addLayer(AP, armor, "lArm")
      }
      if (armor.data.maxAP.rArm > 0) {
        armor["protectsrArm"] = true;
        AP.rArm.value += armor.data.currentAP.rArm;
        if (armor.data.currentAP.rArm < armor.data.maxAP.rArm)
          armor.damaged.rArm = true

        WFRP_Utility.addLayer(AP, armor, "rArm")
      }
      if (armor.data.maxAP.lLeg > 0) {
        armor["protectslLeg"] = true;
        AP.lLeg.value += armor.data.currentAP.lLeg;
        if (armor.data.currentAP.lLeg < armor.data.maxAP.lLeg)
          armor.damaged.lLeg = true

        WFRP_Utility.addLayer(AP, armor, "lLeg")
      }
      if (armor.data.maxAP.rLeg > 0) {
        armor["protectsrLeg"] = true
        AP.rLeg.value += armor.data.currentAP.rLeg;
        if (armor.data.currentAP.rLeg < armor.data.maxAP.rLeg)
          armor.damaged.rLeg = true

        WFRP_Utility.addLayer(AP, armor, "rLeg")
      }
    }
    armor.prepared = true;
    this.runEffects("prepareItem", {item : armor})
    return armor;
  }


  /**
   * Augments a prepared weapon based on its equipped ammo.
   * 
   * Ammo can provide bonuses or penalties to the weapon using it, this function
   * takes a weapon, finds its current ammo, and applies those modifiers to the
   * weapon stats. For instance, if ammo that halves weapon range is equipped,
   * this is where it modifies the range of the weapon
   * 
   * @param   {Object} weapon A *prepared* weapon item
   * @return  {Object} weapon Augmented weapon item
   */
  _prepareWeaponWithAmmo(weapon) {
    // Find the current ammo equipped to the weapon, if none, return
    let ammo = weapon.ammo.find(a => a._id == weapon.data.currentAmmo.value);
    if (!ammo)
      return;

    ammo.properties = WFRP_Utility._prepareQualitiesFlaws(ammo);
    weapon.properties.specialAmmo = ammo.properties.special

    let ammoRange = ammo.data.range.value || "0";
    let ammoDamage = ammo.data.damage.value || "0";
    let ammoDice = ammo.data.damage.dice

    // If range modification was handwritten, process it
    if (ammoRange.toLowerCase() == "as weapon") { }
    // Do nothing to weapon's range
    else if (ammoRange.toLowerCase() == "half weapon")
      weapon.range /= 2;
    else if (ammoRange.toLowerCase() == "third weapon")
      weapon.range /= 3;
    else if (ammoRange.toLowerCase() == "quarter weapon")
      weapon.range /= 4;
    else if (ammoRange.toLowerCase() == "twice weapon")
      weapon.range *= 2;
    else // If the range modification is a formula (supports +X -X /X *X)
    {
      try // Works for + and -
      {
        ammoRange = eval(ammoRange);
        weapon.range = Math.floor(eval(weapon.range + ammoRange));
      }
      catch // if *X and /X
      {                                      // eval (50 + "/5") = eval(50/5) = 10
        weapon.range = Math.floor(eval(weapon.range + ammoRange));
      }
    }

    try // Works for + and -
    {
      ammoDamage = eval(ammoDamage);
      weapon.damage = Math.floor(eval(weapon.damage + ammoDamage));
    }
    catch // if *X and /X
    {                                      // eval (5 + "*2") = eval(5*2) = 10
      weapon.damage = Math.floor(eval(weapon.damage + ammoDamage)); // Eval throws exception for "/2" for example. 
    }
    if (ammoDice)
    weapon.damageDice += " + " + ammoDice

    this._addProperties(weapon, ammo.properties);
  }

  _getTokenSize() {
    let tokenData = {}
    let tokenSize = game.wfrp4e.config.tokenSizes[this.data.data.details.size.value];
    if (tokenSize < 1)
      tokenData.scale = tokenSize;
    else {
      tokenData.scale = 1;
      tokenData.height = tokenSize;
      tokenData.width = tokenSize;
    }
    return tokenData;
  }


  checkWounds() {
    if (this.data.flags.autoCalcWounds) {
      let wounds = this._calculateWounds()

      if (this.data.data.status.wounds.max != wounds) // If change detected, reassign max and current wounds
      {
        if (this.compendium || !game.actors) // Initial setup
        {
          this.data.data.status.wounds.max = wounds;
          this.data.data.status.wounds.value = wounds;
        }
        else
          this.update({ "data.status.wounds.max": wounds, "data.status.wounds.value": wounds });
      }
    }
  }

  /**
   * 
   * @param {Object} item item which to add properties to (needs existing properties object)
   * @param {Object} properties properties object to add
   */
  _addProperties(item, properties) {
    let qualityChange = properties.qualities.filter(p => p.includes("+") || p.includes("-")); // Properties that increase or decrease another (Blast +1, Blast -1)
    let flawChange = properties.flaws.filter(p => p.includes("+") || p.includes("-")); // Properties that increase or decrease another (Blast +1, Blast -1)

    // Normal properties (Impale, Penetrating) from ammo that need to be added to the equipped weapon
    let qualitiesToAdd = properties.qualities.filter(p => !(p.includes("+") || p.includes("-")));
    let flawsToAdd = properties.flaws.filter(p => !(p.includes("+") || p.includes("-")));


    for (let change of qualityChange) {
      // Using the example of "Blast +1" to a weapon with "Blast 3"
      let index = change.indexOf(" ");
      let property = change.substring(0, index).trim();   // "Blast"
      let value = change.substring(index, change.length); // "+1"

      if (item.properties.qualities.find(p => p.includes(property))) // Find the "Blast" quality in the main weapon
      {
        let basePropertyIndex = item.properties.qualities.findIndex(p => p.includes(property))
        let baseValue = item.properties.qualities[basePropertyIndex].split(" ")[1]; // Find the Blast value of the weapon (3)
        let newValue = eval(baseValue + value) // Assign the new value of Blast 4

        item.properties.qualities[basePropertyIndex] = `${property} ${newValue}`; // Replace old Blast
      }
      else // If the weapon does not have the Blast quality to begin with
      {
        qualitiesToAdd.push(property + " " + Number(value)); // Add blast as a new quality (Blast 1)
      }
    }

    for (let change of flawChange) {
      // Using the example of "Blast +1" to a weapon with "Blast 3"
      let index = change.indexOf(" ");
      let property = change.substring(0, index).trim();   // "Blast"
      let value = change.substring(index, change.length); // "+1"

      if (item.properties.flaws.find(p => p.includes(property))) // Find the "Blast" quality in the main weapon
      {
        let basePropertyIndex = item.properties.flaws.findIndex(p => p.includes(property))
        let baseValue = item.properties.flaws[basePropertyIndex].split(" ")[1]; // Find the Blast value of the weapon (3)
        let newValue = eval(baseValue + value) // Assign the new value of Blast 4

        item.properties.flaws[basePropertyIndex] = `${property} ${newValue}`; // Replace old Blast
      }
      else // If the weapon does not have the Blast quality to begin with
      {
        flawsToAdd.push(property + " " + Number(value)); // Add blast as a new quality (Blast 1)
      }
    }

    item.properties.qualities = item.properties.qualities.concat(qualitiesToAdd)
    item.properties.flaws = item.properties.flaws.concat(flawsToAdd);
  }

  /**
   * Prepares a 'spell' or 'prayer' Item type.
   * 
   * Calculates many aspects of spells/prayers defined by characteristics - range, duration, damage, aoe, etc.
   * See the calculation function used for specific on how it processes these attributes.
   * 
   * @param   {Object} item   'spell' or 'prayer' Item 
   * @return  {Object} item   Processed spell/prayer
   */
  prepareSpellOrPrayer(item) {
    this.runEffects("prePrepareItem", {item})

    // Turns targets and duration into a number - (e.g. Willpower Bonus allies -> 4 allies, Willpower Bonus Rounds -> 4 rounds, Willpower Yards -> 46 yards)
    item.target = this.calculateSpellAttributes(item.data.target.value, item.data.target.aoe);
    item.duration = this.calculateSpellAttributes(item.data.duration.value);
    item.range = this.calculateSpellAttributes(item.data.range.value);

    item.overcasts = {
      available: 0,
      range: undefined,
      duration: undefined,
      target: undefined,
      other: undefined,
    }

    if (parseInt(item.target)) {
      item.overcasts.target = {
        label: "Target",
        count: 0,
        AoE: false,
        initial: parseInt(item.target) || item.target,
        current: parseInt(item.target) || item.target,
        unit: ""
      }
    }
    else if (item.target.includes("AoE")) {
      let aoeValue = item.target.substring(item.target.indexOf("(") + 1, item.target.length - 1)
      item.overcasts.target = {
        label: "AoE",
        count: 0,
        AoE: true,
        initial: parseInt(aoeValue) || aoeValue,
        current: parseInt(aoeValue) || aoeValue,
        unit: aoeValue.split(" ")[1]
      }
    }
    if (parseInt(item.duration)) {
      item.overcasts.duration = {
        label: "Duration",
        count: 0,
        initial: parseInt(item.duration) || item.duration,
        current: parseInt(item.duration) || item.duration,
        unit: item.duration.split(" ")[1]
      }
    }
    if (parseInt(item.range)) {
      item.overcasts.range = {
        label: "Range",
        count: 0,
        initial: parseInt(item.range) || aoeValue,
        current: parseInt(item.range) || aoeValue,
        unit: item.range.split(" ")[1]
      }
    }

    if (item.data.overcast?.enabled) {
      let other = {
        label: item.data.overcast.label,
        count: 0
      }


      // Set initial overcast option to type assigned, value is arbitrary, characcteristics is based on actor data, SL is a placeholder for tests
      if (item.data.overcast.initial.type == "value")
      { 
        other.initial = parseInt(item.data.overcast.initial.value) || 0
        other.current = parseInt(item.data.overcast.initial.value) || 0      
      }
      else if (item.data.overcast.initial.type == "characteristic")
      {
        let char = this.data.data.characteristics[item.data.overcast.initial.characteristic]

        if (item.data.overcast.initial.bonus)
          other.initial = char.bonus
        else 
          other.initial = char.value

        other.current = other.initial;
      }
      else if (item.data.overcast.initial.type=="SL")
      {
        other.initial = "SL"
        other.current = "SL"
      }

      // See if overcast increments are also based on characteristics, store that value so we don't have to look it up in the roll class
      if (item.data.overcast.valuePerOvercast.type == "characteristic")
      {
        let char = this.data.data.characteristics[item.data.overcast.valuePerOvercast.characteristic]

        if (item.data.overcast.valuePerOvercast.bonus)
          other.increment = char.bonus
        else 
          other.increment = char.value

        other.increment = other.initial;
      }

      item.overcasts.other = other;

    }

    // Add the + to the duration if it's extendable
    if (item.data.duration.extendable)
      item.duration += "+";

    // Calculate the damage different if it's a Magic Misile spell versus a prayer
    try {
    if (item.type == "spell")
      item.damage = this.calculateSpellDamage(item.data.damage.value, item.data.magicMissile.value);
    else
      item.damage = this.calculateSpellDamage(item.data.damage.value, false);
    }
    catch (e)
    {
      console.error(`Could not parse damage for item ${item.name}: damage formula undefined: ${item.data.damage.value}`)
    }


    if (!item.damage && (item.data.damage.dice || item.data.damage.addSL || item.data.damage.value))
      item.damage = 0

    // If it's a spell, augment the description (see _spellDescription() and CN based on memorization) 
    if (item.type == "spell") {
      item.data.description.value = WFRP_Utility._spellDescription(item);
      if (!item.data.memorized.value)
        item.data.cn.value *= 2;
    }

    item.prepared = true;
    this.runEffects("prepareItem", {item})
    return item;
  }

  prepareTrait(trait) {
    this.runEffects("prePrepareItem", {item : trait})

    if (trait.data.specification.value) {
      if (trait.data.rollable.bonusCharacteristic)  // Bonus characteristic adds to the specification (Weapon +X includes SB for example)
      {
        trait.data.specification.value = parseInt(trait.data.specification.value) || 0
        trait.specificationValue = trait.data.specification.value + this.data.data.characteristics[trait.data.rollable.bonusCharacteristic].bonus;

        trait.bonus = this.data.data.characteristics[trait.data.rollable.bonusCharacteristic].bonus;
      }
      else
        trait.specificationValue = trait.data.specification.value


      if (trait.data.rollable.damage)
      {
        trait.damage = trait.specificationValue
        trait.attackType = trait.data.rollable.attackType
      }
    }

    if (this.data.data.excludedTraits && this.data.data.excludedTraits.includes(trait._id))
      trait.included = false
    else
      trait.included = true;

    trait.displayName = trait.data.specification.value ? trait.name + " (" + trait.specificationValue + ")" : trait.name;
    trait.prepared = true;
    this.runEffects("prepareItem", {item : trait})
    return trait;
  }


  /**
   * Turns a formula into a processed string for display
   * 
   * Turns a spell attribute such as "Willpower Bonus Rounds" into a more user friendly, processed value
   * such as "4 Rounds". If the aoe is checked, it wraps the result in AoE (Result).
   * 
   * @param   {String}  formula   Formula to process - "Willpower Bonus Rounds" 
   * @param   {boolean} aoe       Whether or not it's calculating AoE (changes string return)
   * @returns {String}  formula   processed formula
   */
  calculateSpellAttributes(formula, aoe = false) {
    if (Number.isNumeric(formula))
      return formula
    
    let actorData = this.data
    formula = formula.toLowerCase();

    // Do not process these special values
    if (formula != game.i18n.localize("You").toLowerCase() && formula != game.i18n.localize("Special").toLowerCase() && formula != game.i18n.localize("Instant").toLowerCase()) {
      // Iterate through characteristics
      for (let ch in actorData.data.characteristics) {
        // If formula includes characteristic name
        if (formula.includes(game.wfrp4e.config.characteristics[ch].toLowerCase())) {
          // Determine if it's looking for the bonus or the value
          if (formula.includes('bonus'))
            formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase().concat(" bonus"), actorData.data.characteristics[ch].bonus);
          else
            formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase(), actorData.data.characteristics[ch].value);
        }
      }
    }

    // If AoE - wrap with AoE ( )
    if (aoe)
      formula = "AoE (" + formula.capitalize() + ")";

    return formula.capitalize();
  }

  /**
   * Turns a formula into a processed string for display
   * 
   * Processes damage formula based - same as calculateSpellAttributes, but with additional
   * consideration to whether its a magic missile or not
   * 
   * @param   {String}  formula         Formula to process - "Willpower Bonus + 4" 
   * @param   {boolean} isMagicMissile  Whether or not it's a magic missile - used in calculating additional damage
   * @returns {String}  Processed formula
   */
  calculateSpellDamage(formula, isMagicMissile) {
    try {

    let actorData = this.data
    formula = formula.toLowerCase();

    if (isMagicMissile) // If it's a magic missile, damage includes willpower bonus
    {
      formula += "+ " + actorData.data.characteristics["wp"].bonus
    }

    // Iterate through characteristics
    for (let ch in actorData.data.characteristics) {
      // If formula includes characteristic name
      while (formula.includes(game.i18n.localize(actorData.data.characteristics[ch].label).toLowerCase())) {
        // Determine if it's looking for the bonus or the value
        if (formula.includes('bonus'))
          formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase().concat(" bonus"), actorData.data.characteristics[ch].bonus);
        else
          formula = formula.replace(game.wfrp4e.config.characteristics[ch].toLowerCase(), actorData.data.characteristics[ch].value);
      }
    }

    return eval(formula);
    }
    catch (e)
    {
      throw ui.notifications.error("Error: could not parse spell damage. See console for details")
    }
  }

  
  /**
   * Calculates a weapon's range or damage formula.
   * 
   * Takes a weapon formula for Damage or Range (SB + 4 or SBx3) and converts to a numeric value.
   * 
   * @param {String} formula formula to be processed (SBx3 => 9).
   * 
   * @return {Number} Numeric formula evaluation
   */
  calculateRangeOrDamage(formula, actorData) {
    actorData = actorData || this.data
    try {
      formula = formula.toLowerCase();
      // Iterate through characteristics
      for (let ch in actorData.data.characteristics) {
        // Determine if the formula includes the characteristic's abbreviation + B (SB, WPB, etc.)
        if (formula.includes(ch.concat('b'))) {
          // Replace that abbreviation with the Bonus value
          formula = formula.replace(ch.concat('b'), actorData.data.characteristics[ch].bonus.toString());
        }
      }
      // To evaluate multiplication, replace x with *
      formula = formula.replace('x', '*');

      return eval(formula);
    }
    catch
    {
      return formula
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
    let allItems = duplicate(this.data.items)
    let ownedBasicSkills = allItems.filter(i => i.type == "skill" && i.data.advanced.value == "bsc");
    let allBasicSkills = await WFRP_Utility.allBasicSkills()

    // Filter allBasicSkills with ownedBasicSkills, resulting in all the missing skills
    let skillsToAdd = allBasicSkills.filter(s => !ownedBasicSkills.find(ownedSkill => ownedSkill.name == s.name))

    // Add those missing basic skills
    this.createEmbeddedEntity("OwnedItem", skillsToAdd);
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
    let sb = this.data.data.characteristics.s.bonus + (this.data.data.characteristics.s.calculationBonusModifier || 0);
    let tb = this.data.data.characteristics.t.bonus + (this.data.data.characteristics.t.calculationBonusModifier || 0);
    let wpb = this.data.data.characteristics.wp.bonus + (this.data.data.characteristics.wp.calculationBonusModifier || 0);
    let multiplier = {
      sb: 0,
      tb: 0,
      wpb: 0,
    }

    if (this.data.flags.autoCalcCritW)
      this.data.data.status.criticalWounds.max = tb;

    let effectArgs = { sb, tb, wpb, multiplier, actor: this.data }
    this.runEffects("preWoundCalc", effectArgs);
    ({ sb, tb, wpb } = effectArgs);

    let wounds = this.data.data.status.wounds.max;

    if (this.data.flags.autoCalcWounds) {
      switch (this.data.data.details.size.value) // Use the size to get the correct formula (size determined in prepare())
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
  static applyDamage(victim, opposeData, damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL) {
    if (!opposeData.damage)
      return `<b>Error</b>: ${game.i18n.localize("CHAT.DamageAppliedError")}`
    // If no damage value, don't attempt anything
    if (!opposeData.damage.value)
      return game.i18n.localize("CHAT.DamageAppliedErrorTiring");
    // Get actor/tokens for those in the opposed test
    let actor = WFRP_Utility.getSpeaker(victim);
    let attacker = WFRP_Utility.getSpeaker(opposeData.speakerAttack)
    let soundContext = { item: {}, action: "hit" };

    let args = {actor, attacker, opposeData, damageType}
    actor.runEffects("preTakeDamage", args)
    attacker.runEffects("preApplyDamage", args)
    damageType = args.damageType


    // Start wound loss at the damage value
    let totalWoundLoss = opposeData.damage.value
    let newWounds = actor.data.data.status.wounds.value;
    let applyAP = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let applyTB = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let AP = actor.data.AP[opposeData.hitloc.value];

    // Start message update string
    let updateMsg = `<b>${game.i18n.localize("CHAT.DamageApplied")}</b><span class = 'hide-option'>: `;
    let messageElements = []
    // if (damageType !=  game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL)
    //   updateMsg += " ("

    let weaponProperties
    // If armor at hitloc has impenetrable value or not
    let impenetrable = false;
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
      totalWoundLoss -= actor.data.data.characteristics.t.bonus
      messageElements.push(`${actor.data.data.characteristics.t.bonus} TB`)
    }

    // If the actor has the Robust talent, reduce damage by times taken
    //totalWoundLoss -= actor.data.flags.robust || 0;

    // if (actor.data.flags.robust)
    //   messageElements.push(`${actor.data.flags.robust} ${game.i18n.localize("NAME.Robust")}`)

    if (applyAP) {
      AP.ignored = 0;
      if (opposeData.attackerTestResult.weapon) // If the attacker is using a weapon
      {
        // Determine its qualities/flaws to be used for damage calculation
        weaponProperties = opposeData.attackerTestResult.weapon.properties;
        penetrating = weaponProperties.qualities.includes(game.i18n.localize("PROPERTY.Penetrating"))
        undamaging = weaponProperties.flaws.includes(game.i18n.localize("PROPERTY.Undamaging"))
        hack = weaponProperties.qualities.includes(game.i18n.localize("PROPERTY.Hack"))
        impale = weaponProperties.qualities.includes(game.i18n.localize("PROPERTY.Impale"))
        pummel = weaponProperties.qualities.includes(game.i18n.localize("PROPERTY.Pummel"))
      }
      // see if armor flaws should be triggered
      let ignorePartial = opposeData.attackerTestResult.roll % 2 == 0 || opposeData.attackerTestResult.extra.critical
      let ignoreWeakpoints = opposeData.attackerTestResult.extra.critical && impale

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
          AP.ignored += layer.metal ? 1 : layer.value
        }
        if (opposeData.attackerTestResult.roll % 2 != 0 && layer.impenetrable) {
          impenetrable = true;
          soundContext.outcome = "impenetrable"
        }

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
      if (opposeData.defenderTestResult.weapon) {
        if (opposeData.defenderTestResult.weapon.properties.qualities.find(q => q.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase())))
          shieldAP = Number(opposeData.defenderTestResult.weapon.properties.qualities.find(q => q.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase())).split(" ")[1]);
      }

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
        if (opposeData.attackerTestResult.weapon.attackType == "melee") {
          if ((weaponProperties.qualities.concat(weaponProperties.flaws)).every(p => [game.i18n.localize("PROPERTY.Pummel"), game.i18n.localize("PROPERTY.Slow"), game.i18n.localize("PROPERTY.Damaging")].includes(p)))
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

    let scriptArgs = { actor, opposeData, totalWoundLoss, AP, damageType, updateMsg, messageElements, attacker }
    actor.runEffects("takeDamage", scriptArgs)
    attacker.runEffects("applyDamage", scriptArgs)

    let item = opposeData.attackerTestResult.weapon || opposeData.attackerTestResult.trait || opposeData.attackerTestResult.spell || opposeData.attackerTestResult.prayer
    let itemDamageEffects = item.effects.filter(e => getProperty(e, "flags.wfrp4e.effectApplication") == "damage")
    for (let effect of itemDamageEffects)
    {
      let func = new Function("args", getProperty(effect, "flags.wfrp4e.script")).bind({actor, effect, item})
      func(scriptArgs)
    }
    totalWoundLoss = scriptArgs.totalWoundLoss


    newWounds -= totalWoundLoss
    updateMsg += "</span>"
    updateMsg += " " + totalWoundLoss;

    updateMsg += ` (${messageElements.join(" + ")})`

    WFRP_Audio.PlayContextAudio(soundContext)

    // If damage taken reduces wounds to 0, show Critical
    if (newWounds <= 0 && !impenetrable) {
      //WFRP_Audio.PlayContextAudio(opposeData.attackerTestResult.weapon, {"type": "hit", "equip": "crit"})
      let critAmnt = game.settings.get("wfrp4e", "dangerousCritsMod")
      if (game.settings.get("wfrp4e", "dangerousCrits") && critAmnt && (Math.abs(newWounds) - actor.data.data.characteristics.t.bonus) > 0) {
        let critModifier = (Math.abs(newWounds) - actor.data.data.characteristics.t.bonus) * critAmnt;
        updateMsg += `<br><a class ="table-click critical-roll" data-modifier=${critModifier} data-table = "crit${opposeData.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")} +${critModifier}</a>`
      }
      else if (Math.abs(newWounds) < actor.data.data.characteristics.t.bonus)
        updateMsg += `<br><a class ="table-click critical-roll" data-modifier="-20" data-table = "crit${opposeData.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")} (-20)</a>`
      else
        updateMsg += `<br><a class ="table-click critical-roll" data-table = "crit${opposeData.hitloc.value}" ><i class='fas fa-list'></i> ${game.i18n.localize("Critical")}</a>`
    }
    else if (impenetrable)
      updateMsg += `<br>${game.i18n.localize("PROPERTY.Impenetrable")} - ${game.i18n.localize("CHAT.CriticalsNullified")}`

    if (hack)
      updateMsg += `<br>${game.i18n.localize("CHAT.DamageAP")} ${game.wfrp4e.config.locations[opposeData.hitloc.value]}`

    if (newWounds <= 0)
      newWounds = 0; // Do not go below 0 wounds


    let daemonicTrait = actor.has(game.i18n.localize("NAME.Daemonic"))
    let wardTrait = actor.has(game.i18n.localize("NAME.Ward"))
    if (daemonicTrait) {
      let daemonicRoll = new Roll("1d10").roll().total;
      let target = daemonicTrait.data.specification.value
      // Remove any non numbers
      if (isNaN(target))
        target = target.split("").filter(char => /[0-9]/.test(char)).join("")

      if (Number.isNumeric(target) && daemonicRoll >= Number(daemonicTrait.data.specification.value)) {
        updateMsg = `<span style = "text-decoration: line-through">${updateMsg}</span><br>${game.i18n.format("OPPOSED.Daemonic", { roll: daemonicRoll })}`
        return updateMsg;
      }

    }

    if (wardTrait) {
      let wardRoll = new Roll("1d10").roll().total;
      let target = wardTrait.data.specification.value
      // Remove any non numbers
      if (isNaN(target))
        target = target.split("").filter(char => /[0-9]/.test(char)).join("")

      if (Number.isNumeric(target) && wardRoll >= Number(wardTrait.data.specification.value)) {
        updateMsg = `<span style = "text-decoration: line-through">${updateMsg}</span><br>${game.i18n.format("OPPOSED.Ward", { roll: wardRoll })}`
        return updateMsg;
      }

    }



    // Update actor wound value
    actor.update({ "data.status.wounds.value": newWounds })

    // if (totalWoundLoss > 0 && opposeData.attackerTestResult.actor.traits.find(t => t.name == game.i18n.localize("NAME.Infected") && t.included != false))
    //   ChatMessage.create({ content: `<b>Infected: ${actor.name}</b> must pass an <b>Easy (+40) Endurance</b> Test or gain a @Compendium[wfrp4e-core.diseases.kKccDTGzWzSXCBOb]{Festering Wound}`, whisper: ChatMessage.getWhisperRecipients("GM") })

    return updateMsg;
  }



  /**
   * Unlike applyDamage(), which is for opposed damage calculation, this function just takes a number and damage type and applies the damage.
   * 
   * @param {Number} damage Amount of damage
   * @param {Object} options Type of damage, minimum 1
   */
  async applyBasicDamage(damage, { damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL, minimumOne = true, loc = "body", suppressMsg = false } = {}) {
    let newWounds = this.data.data.status.wounds.value;
    let modifiedDamage = damage;
    let applyAP = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let applyTB = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let msg = game.i18n.format("CHAT.ApplyDamageBasic", {name : this.data.token.name});

    if (applyAP) {
      modifiedDamage -= this.data.AP[loc].value
      msg += `(${this.data.AP[loc].value} AP`
      if (!applyTB)
        msg += ")"
      else
        msg += " + "
    }

    if (applyTB) {
      modifiedDamage -= this.data.data.characteristics.t.bonus;
      if (!applyAP)
        msg += "("
      msg += `${this.data.data.characteristics.t.bonus} TB)`
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
      skillList = game.wfrp4e.config.speciesSkills[this.data.data.details.species.value];
      if (!skillList) {
        // findKey() will do an inverse lookup of the species key in the species object defined in config.js, and use that if 
        // user-entered species value does not work (which it probably will not)
        skillList = game.wfrp4e.config.speciesSkills[WFRP_Utility.findKey(this.data.data.details.species.value, game.wfrp4e.config.species)]
        if (!skillList) {
          throw game.i18n.localize("Error.SpeciesSkills") + " " + this.data.data.details.species.value;
        }
      }
    }
    catch (error) {
      ui.notifications.info("Could not find species " + this.data.data.details.species.value)
      console.log("wfrp4e | Could not find species " + this.data.data.details.species.value + ": " + error);
      throw error
    }
    // The Roll class used to randomly select skills
    let skillSelector = new Roll(`1d${skillList.length}- 1`);
    skillSelector.roll().total;

    // Store selected skills
    let skillsSelected = [];
    while (skillsSelected.length < 6) {
      skillSelector = skillSelector.reroll()
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
      talentList = game.wfrp4e.config.speciesTalents[this.data.data.details.species.value];
      if (!talentList) {
        // findKey() will do an inverse lookup of the species key in the species object defined in config.js, and use that if 
        // user-entered species value does not work (which it probably will not)
        talentList = game.wfrp4e.config.speciesTalents[WFRP_Utility.findKey(this.data.data.details.species.value, game.wfrp4e.config.species)]
        if (!talentList)
          throw game.i18n.localize("Error.SpeciesTalents") + " " + this.data.data.details.species.value;
      }
    }
    catch (error) {
      ui.notifications.info("Could not find species " + this.data.data.details.species.value)
      console.log("wfrp4e | Could not find species " + this.data.data.details.species.value + ": " + error);
      throw error
    }
    let talentSelector;
    for (let talent of talentList) {
      if (!isNaN(talent)) // If is a number, roll on random talents
      {
        for (let i = 0; i < talent; i++) {
          let result = game.wfrp4e.tables.rollTable("talents")
          await this._advanceTalent(result.name);
        }
        continue
      }
      // If there is a comma, talent.split() will yield an array of length > 1
      let talentOptions = talent.split(',').map(function (item) {
        return item.trim();
      });

      // Randomly choose a talent option and advance it.
      if (talentOptions.length > 1) {
        talentSelector = new Roll(`1d${talentOptions.length} - 1`)
        await this._advanceTalent(talentOptions[talentSelector.roll().total])
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
    let existingSkill = this.data.items.find(i => i.name.trim() == skillName && i.type == "skill")
    // If so, simply update the skill with the new advancement value. 
    if (existingSkill) {
      existingSkill = duplicate(existingSkill);
      // If the existing skill has a greater amount of advances, use the greater value instead (make no change) - ??? Is this needed? I'm not sure why I did this. TODO: Evaluate.
      existingSkill.data.advances.value = (existingSkill.data.advances.value < advances) ? advances : existingSkill.data.advances.value;
      await this.updateEmbeddedEntity("OwnedItem", existingSkill);
      return;
    }

    // If the actor does not already own skill, search through compendium and add it
    try {
      // See findSkill() for a detailed explanation of how it works
      // Advanced find function, returns the skill the user expects it to return, even with skills not included in the compendium (Lore (whatever))
      let skillToAdd = await WFRP_Utility.findSkill(skillName)
      skillToAdd.data.data.advances.value = advances;
      await this.createEmbeddedEntity("OwnedItem", skillToAdd.data);
    }
    catch (error) {
      console.error("Something went wrong when adding skill " + skillName + ": " + error);
      ui.notifications.error("Something went wrong when adding skill " + skillName + ": " + error);
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
      await this.createEmbeddedEntity("OwnedItem", talent.data);
    }
    catch (error) {
      console.error("Something went wrong when adding talent " + talentName + ": " + error);
      ui.notifications.error("Something went wrong when adding talent " + talentName + ": " + error);
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
   * TODO Refactor for embedded entity along with the helper functions
   */
  async _advanceNPC(careerData) {
    let updateObj = {};
    let advancesNeeded = careerData.level.value * 5; // Tier 1 needs 5, 2 needs 10, 3 needs 15, 4 needs 20 in all characteristics and skills

    // Update all necessary characteristics to the advancesNeeded
    for (let advChar of careerData.characteristics)
      if (this.data.data.characteristics[advChar].advances < 5 * careerData.level.value)
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
    if (this.data.data.status.fortune.value > 0) {
      message.data.flags.data.preData.roll = undefined;
      let data = message.data.flags.data;
      let html = `<h3 class="center"><b>${game.i18n.localize("FORTUNE.Use")}</b></h3>`;
      //First we send a message to the chat
      if (type == "reroll")
        html += `${game.i18n.format("FORTUNE.UsageRerollText", { character: '<b>' + this.name + '</b>' })}<br>`;
      else
        html += `${game.i18n.format("FORTUNE.UsageAddSLText", { character: '<b>' + this.name + '</b>' })}<br>`;

      html += `<b>${game.i18n.localize("FORTUNE.PointsRemaining")} </b>${this.data.data.status.fortune.value - 1}`;
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
        delete data.preData.roll;
        delete data.preData.SL;
        this[`${data.postData.postFunction}`]({ testData: data.preData, cardOptions });

        //We also set fortuneUsedAddSL to force the player to use it on the new roll
        message.update({
          "flags.data.fortuneUsedReroll": true,
          "flags.data.fortuneUsedAddSL": true
        });

      }
      else //addSL
      {
        let newTestData = data.preData;
        newTestData.SL = Math.trunc(data.postData.SL) + 1;
        newTestData.slBonus = 0;
        newTestData.successBonus = 0;
        newTestData.roll = Math.trunc(data.postData.roll);
        newTestData.hitloc = data.preData.hitloc;

        //We deselect the token, 
        //2020-04-25 : Currently the foundry function is bugged so we do it ourself
        //game.user.updateTokenTargets([]);
        game.user.targets.forEach(t => t.setTarget(false, { user: game.user, releaseOthers: false, groupSelection: true }));

        cardOptions.fortuneUsedAddSL = true;
        this[`${data.postData.postFunction}`]({ testData: newTestData, cardOptions }, { rerenderMessage: message });
        message.update({
          "flags.data.fortuneUsedAddSL": true
        });
      }
      this.update({ "data.status.fortune.value": this.data.data.status.fortune.value - 1 });
    }
  }

  /**
   * Take a Dark Deal to reroll for +1 Corruption
   * @param {Object} message 
   */
  useDarkDeal(message) {
    let html = `<h3 class="center"><b>${game.i18n.localize("DARKDEAL.Use")}</b></h3>`;
    html += `${game.i18n.format("DARKDEAL.UsageText", { character: '<b>' + this.name + '</b>' })}<br>`;
    let corruption = Math.trunc(this.data.data.status.corruption.value) + 1;
    html += `<b>${game.i18n.localize("Corruption")}: </b>${corruption}/${this.data.data.status.corruption.max}`;
    ChatMessage.create(WFRP_Utility.chatDataSetup(html));
    this.update({ "data.status.corruption.value": corruption }).then(() => {
      this.checkCorruption();
    });

    message.data.flags.data.preData.roll = undefined;
    let cardOptions = this.preparePostRollAction(message);
    let data = message.data.flags.data;
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
    delete message.data.flags.data.preData.roll;
    delete message.data.flags.data.preData.SL;
    this[`${data.postData.postFunction}`]({ testData: data.preData, cardOptions });
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
      content: `<p>${game.i18n.format("DIALOG.CorruptionContent", {name : this.name})}</p>`,
      buttons: {
        endurance: {
          label: game.i18n.localize("NAME.Endurance"),
          callback: () => {
            let skill = this.items.find(i => i.name == game.i18n.localize("NAME.Endurance") && i.type == "skill")
            if (skill) {
              this.setupSkill(skill.data, {title : game.i18n.format("DIALOG.CorruptionTestTitle", {test : skill.name}), corruption: strength }).then(setupData => this.basicTest(setupData))
            }
            else {
              this.setupCharacteristic("t", {title : game.i18n.format("DIALOG.CorruptionTestTitle", {test : game.wfrp4e.config.characteristics["t"]}),  corruption: strength }).then(setupData => this.basicTest(setupData))
            }
          }
        },
        cool: {
          label: game.i18n.localize("NAME.Cool"),
          callback: () => {
            let skill = this.items.find(i => i.name == game.i18n.localize("NAME.Cool") && i.type == "skill")
            if (skill) {
              this.setupSkill(skill.data, {title : game.i18n.format("DIALOG.CorruptionTestTitle", {test : skill.name}), corruption: strength }).then(setupData => this.basicTest(setupData))
            }
            else {
              this.setupCharacteristic("wp", {title : game.i18n.format("DIALOG.CorruptionTestTitle", {test : game.wfrp4e.config.characteristics["wp"]}),  corruption: strength }).then(setupData => this.basicTest(setupData))
            }
          }
        }

      }
    }).render(true)
  }


  has(traitName, type = "traits")
  {
    return this.data[type].find(i => i.name == traitName && i.included != false)
  }



  getDialogChoices()
  {
    let effects = this.data.effects.filter(e => getProperty(e, "flags.wfrp4e.effectTrigger") == "dialogChoice" && !e.disabled).map(e => {
      let prepDialog = game.wfrp4e.utility._prepareDialogChoice.bind(duplicate(e))
      return prepDialog()
    })
    
    let dedupedEffects = []

    effects.forEach(e => {
      let existing = dedupedEffects.find(ef => ef.description == e.description)
      if (existing)
      {
        existing.modifier += e.modifier
        existing.slBonus += e.slBonus
        existing.successBonus += e.successBonus
      }
      else
        dedupedEffects.push(e)
    })
    return dedupedEffects
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

    // Overrides default difficulty to Average depending on module setting and combat state
    if (game.settings.get("wfrp4e", "testDefaultDifficulty") && (game.combat != null))
      difficulty = game.combat.started ? "challenging" : "average";
    else if (game.settings.get("wfrp4e", "testDefaultDifficulty"))
      difficulty = "average";

    if (this.data.type != "vehicle")
    {
      if (type != "channelling") {
        modifier += game.settings.get("wfrp4e", "autoFillAdvantage") ? (this.data.data.status.advantage.value * 10 || 0) : 0
        if (parseInt(this.data.data.status.advantage.value) && game.settings.get("wfrp4e", "autoFillAdvantage"))
          tooltip.push(game.i18n.localize("Advantage"))
      }

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
    
    if (type == "weapon" || type=="trait") {
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
      difficulty = item.data.rollable.defaultDifficulty || difficulty


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
      tooltip = tooltip.concat(effects.map(e => "Target: " + e.label))
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

    return {
      testModifier: modifier,
      testDifficulty: difficulty,
      slBonus,
      successBonus,
      prefillTooltip: "These effects MAY be causing these bonuses\n" + tooltip.map(t => t.trim()).join("\n")
    }

  }



  weaponPrefillData(item, options, tooltip = []) {
    let slBonus = 0;
    let successBonus = 0;
    let modifier = 0;

    // If offhand and should apply offhand penalty (should apply offhand penalty = not parry, not defensive, and not twohanded)
    if (item.type == "weapon" && getProperty(item, "data.offhand.value") && !item.data.twohanded.value && !(item.data.weaponGroup.value == "parry" && item.properties.qualities.includes(game.i18n.localize("PROPERTY.Defensive")))) {
      modifier = -20
      tooltip.push(game.i18n.localize("SHEET.Offhand"))
      modifier += Math.min(20, this.data.flags.ambi * 10)
      if (this.data.flags.ambi)
        tooltip.push(game.i18n.localize("NAME.Ambi"))
    }



      try {

        let target = game.user.targets.size ? Array.from(game.user.targets)[0].actor : undefined
        let attacker
        if (this.data.flags.oppose) {
          let attackMessage = game.messages.get(this.data.flags.oppose.messageId) // Retrieve attacker's test result message
          // Organize attacker/defender data
          attacker = {
            speaker: this.data.flags.oppose.speaker,
            testResult: attackMessage.data.flags.data.postData,
            messageId: attackMessage.data._id,
            img: WFRP_Utility.getSpeaker(this.data.flags.oppose.speaker).data.img
          };
        }

        if (this.data.flags.defensive && attacker) {
          tooltip.push(game.i18n.localize("PROPERTY.Defensive"))
          slBonus += this.data.flags.defensive;
        }



        if (item.type == "weapon")
        {
          // Prefill dialog according to qualities/flaws
          if (item.properties.qualities.includes(game.i18n.localize("PROPERTY.Accurate"))) {
            modifier += 10;
            tooltip.push(game.i18n.localize("PROPERTY.Accurate"))
          }

          if (item.properties.qualities.includes(game.i18n.localize("PROPERTY.Precise")) && game.user.targets.size) {
            successBonus += 1;
            tooltip.push(game.i18n.localize("PROPERTY.Precise"))

          }
          if (item.properties.flaws.includes(game.i18n.localize("PROPERTY.Imprecise")) && game.user.targets.size) {
            slBonus -= 1;
            tooltip.push(game.i18n.localize("PROPERTY.Imprecise"))
          }
        }

        if (attacker && attacker.testResult.weapon && attacker.testResult.weapon.properties.flaws.includes(game.i18n.localize('PROPERTY.Slow')))
        {
          slBonus += 1
          tooltip.push(game.i18n.localize('CHAT.TestModifiers.SlowDefend'))
        }

        if (attacker && attacker.testResult.weapon && attacker.testResult.weapon.properties.qualities.includes(game.i18n.localize('PROPERTY.Wrap')))
        {
          slBonus -= 1
          tooltip.push(game.i18n.localize('CHAT.TestModifiers.WrapDefend'))
        }

        //Fast Weapon Property
        if (attacker && attacker.testResult.weapon && attacker.testResult.weapon.properties.qualities.includes(game.i18n.localize('PROPERTY.Fast')) && item.type == "weapon" && item.attackType == "melee" && !item.properties.qualities.includes(game.i18n.localize('PROPERTY.Fast'))) {
          tooltip.push(game.i18n.localize('CHAT.TestModifiers.FastWeapon'))
          modifier += -10;
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
      token = this.getActiveTokens()[0]

    if (!game.settings.get("wfrp4e", "rangeAutoCalculation") || !token || !game.user.targets.size == 1 || !weapon.rangeBands)
      return 0
    
    let target = Array.from(game.user.targets)[0]

    let distance = canvas.grid.measureDistance(token, target)

    let currentBand

    for (let band in weapon.rangeBands)
    {
      if (distance >= weapon.rangeBands[band].range[0] && distance <= weapon.rangeBands[band].range[1])
      {
        currentBand = band;
        break;
      }
    }

    modifier += weapon.rangeBands[currentBand]?.modifier || 0


    if (modifier)
    {
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
            testResult: attackMessage.data.flags.data.postData,
            messageId: attackMessage.data._id,
            img: WFRP_Utility.getSpeaker(this.data.flags.oppose.speaker).data.img
          };
        }


        if (attacker) {
          //Size Differences
          let sizeDiff = game.wfrp4e.config.actorSizeNums[attacker.testResult.size] - game.wfrp4e.config.actorSizeNums[this.data.data.details.size.value]
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
          let sizeDiff = game.wfrp4e.config.actorSizeNums[this.data.data.details.size.value] - game.wfrp4e.config.actorSizeNums[target.data.data.details.size.value]

          // Attacking a larger creature with melee
          if (item.attackType == "melee" && sizeDiff < 0) {
            modifier += 10;
            tooltip.push(game.i18n.localize('CHAT.TestModifiers.AttackingLarger'))
            // Attacking a larger creature with ranged
          }
          else if (item.attackType == "ranged") {
            let sizeModifier = 0
            if (target.data.data.details.size.value == "lrg")
              sizeModifier += 20
            if (target.data.data.details.size.value == "enor")
              sizeModifier += 40
            if (target.data.data.details.size.value == "mnst")
              sizeModifier += 60

            modifier += sizeModifier
            item.sizeModifier = sizeModifier

            if (game.wfrp4e.config.actorSizeNums[target.data.data.details.size.value] > 3)
              tooltip.push(game.i18n.localize('CHAT.TestModifiers.ShootingLarger'))
          }
        }

        // Attacking a smaller creature from a mount
        if (this.isMounted && item.attackType == "melee") {
          let mountSizeDiff = game.wfrp4e.config.actorSizeNums[this.mount.data.data.details.size.value] - game.wfrp4e.config.actorSizeNums[target.data.data.details.size.value]
          if (target.isMounted)
            mountSizeDiff = game.wfrp4e.config.actorSizeNums[this.mount.data.data.details.size.value] - game.wfrp4e.config.actorSizeNums[target.mount.data.data.details.size.value]

          if (mountSizeDiff >= 1) {
            tooltip.push((game.i18n.localize('CHAT.TestModifiers.AttackerMountLarger')))
            modifier += 20;
          }
        }
        // Attacking a creature on a larger mount
        else if (item.attackType == "melee" && target && target.isMounted ) {
          let mountSizeDiff = game.wfrp4e.config.actorSizeNums[target.mount.data.data.details.size.value] - game.wfrp4e.config.actorSizeNums[this.data.data.details.size.value]
          if (this.isMounted)
            mountSizeDiff = game.wfrp4e.config.actorSizeNums[target.mount.data.data.details.size.value] - game.wfrp4e.config.actorSizeNums[this.mount.data.data.details.size.value]
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
      sizeModifier : modifier,
      sizeSuccessBonus : successBonus,
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
  armourPrefillModifiers(item, type, options, tooltip = [])  {

    let modifier = 0;
    let stealthPenaltyValue = 0;

    // Armor type penalties do not stack, only apply if you wear any of that type
    let wearingMail = false;
    let wearingPlate = false;
    let practicals = 0;

    for (let a of this.data.armour) {
      // For each armor, apply its specific penalty value, as well as marking down whether
      // it qualifies for armor type penalties (wearingMail/Plate)
      if (a.data.armorType.value == "mail")
        wearingMail = true;
      if (a.data.armorType.value == "plate")
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

      if (type == "skill" && item.name.includes("Stealth"))
      {
        if (stealthPenaltyValue)
        {
          modifier += stealthPenaltyValue
          tooltip.push(game.i18n.localize("SHEET.ArmourPenalties"))
        }
      }
    }
    return modifier;
  }



   runEffects(trigger, args) {
    let effects = this.data.effects.filter(e => {
      return this.effects.get(e._id) &&
      getProperty(e, "flags.wfrp4e.effectTrigger") == trigger && 
      getProperty(e, "flags.wfrp4e.script") &&
      !e.disabled
    })

    if (trigger == "oneTime")
    {
      effects =  effects.filter(e => getProperty(e, "flags.wfrp4e.effectApplication") != "apply" && getProperty(e, "flags.wfrp4e.effectApplication") != "damage");
      this.deleteEmbeddedEntity("ActiveEffect", effects.map(e => e._id))
    }

    if (trigger == "targetPrefillDialog" && game.user.targets.size) {
      effects = game.user.targets.values().next().value.actor.data.effects.filter(e => getProperty(e, "flags.wfrp4e.effectTrigger") == "targetPrefillDialog" && !e.disabled)
      let secondaryEffects = duplicate(game.user.targets.values().next().value.actor.data.effects.filter(e => getProperty(e, "flags.wfrp4e.secondaryEffect.effectTrigger") == "targetPrefillDialog" && !e.disabled)) // A kludge that supports 2 effects. Specifically used by conditions
      effects = effects.concat(secondaryEffects.map(e => {
        e.flags.wfrp4e.effectTrigger = e.flags.wfrp4e.secondaryEffect.effectTrigger;
        e.flags.wfrp4e.script = e.flags.wfrp4e.secondaryEffect.script;
        return e
      }))

    }


    effects.forEach(e => {
      try {
      let func = new Function("args", getProperty(e, "flags.wfrp4e.script")).bind({ actor: this, effect: e, item : this.getEffectItem(e) })
      func(args)
      }
      catch (ex) {
        ui.notifications.error("Error when running effect " + e.label + ": " + ex)
        console.log("Error when running effect " + e.label + ": " + ex)
      }
    })
    return effects
  }
  
  async decrementInjuries() {
    this.data.injuries.forEach(i => this.decrementInjury(i))
  }

  async decrementInjury(injury) {
    if (isNaN(injury.data.duration.value))
      return ui.notifications.notify(`Cannot decrement ${injury.name} as it is not a number.`) 

    injury = duplicate(injury)
    injury.data.duration.value--

    if (injury.data.duration.value < 0)
      injury.data.duration.value = 0;          

    if (injury.data.duration.value == 0)
    {
      let chatData = game.wfrp4e.utility.chatDataSetup(`${injury.name} duration complete.`, "gmroll")
      chatData.speaker = {alias : this.name}
      ChatMessage.create(chatData)
    }
    this.updateEmbeddedEntity("OwnedItem", injury);
  }


  async decrementDiseases() {
    this.data.diseases.forEach(d => this.decrementDisease(d))
  }

  async decrementDisease(disease) {
    let d = duplicate(disease)
    if (!d.data.duration.active) {
      if (Number.isNumeric(d.data.incubation.value)) {

        d.data.incubation.value--
        if (d.data.incubation.value <= 0)
        {
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
    this.updateEmbeddedEntity("OwnedItem", d)
  }

  async activateDisease(disease) {
    disease.data.duration.active = true;
    disease.data.incubation.value = 0;
    let msg = `${disease.name} incubation finished.`
    try {
      let durationRoll = new Roll(disease.data.duration.value).roll().total
      msg += ` Duration of ${durationRoll} ${disease.data.duration.unit} has begun`
      disease.data.duration.value = durationRoll;
    }
    catch (e) {
      msg += " Error occurred when rolling for duration."
    }

    let chatData = game.wfrp4e.utility.chatDataSetup(msg, "gmroll", false)
    chatData.speaker = { alias: this.name }
    ChatMessage.create(chatData)
  }

  async finishDisease(disease) {



    let msg = `${disease.name} duration finished.`

    if (disease.data.symptoms.includes("lingering"))
    {
      let lingering = disease.effects.find(e => e.label.includes("Lingering"))
      if (lingering)
      {
        let difficulty = lingering.label.substring(lingering.label.indexOf("(")+1, lingeringLabel.indexOf(")")).toLowerCase()

        this.setupSkill("Endurance", {difficulty}).then(setupData => this.basicTest(setupData).then(test => {
          if (test.result.result == "failure")
          {
            let negSL = Math.abs(test.result.SL)
            if (negSL <= 1)
            {
              let roll = new Roll("1d10").roll().total
              msg += ` Lingering: Duration extended by ${roll} days`
            }
            else if (negSL <= 5)
            {
              msg += ` Lingering: developed a Festering Wound`
              fromUuid("Compendium.wfrp4e-core.diseases.kKccDTGzWzSXCBOb").then(disease => {
                this.createEmbeddedEntity("OwnedItem", disease.data)
              })
            }
            else if (negSL >= 6)
            {
              msg += ` Lingering: developed Blood Rot`
              fromUuid("Compendium.wfrp4e-core.diseases.M8XyRs9DN12XsFTQ").then(disease => {
                this.createEmbeddedEntity("OwnedItem", disease.data)
              })
            }
          }
        }))
      }
    }
    else {
      this.deleteEmbeddedEntity("ActiveEffect", removeEffects)
      this.deleteEffectsFromItem(disease._id)
    }
    let chatData = game.wfrp4e.utility.chatDataSetup(msg, "gmroll", false)
    chatData.speaker = { alias: this.name }
    ChatMessage.create(chatData)

  }



  async handleCorruptionResult(testResult) {
    let strength = testResult.options.corruption;
    let failed = testResult.target < testResult.roll;
    let corruption = 0 // Corruption GAINED
    switch (strength) {
      case "minor":
        if (failed)
          corruption++;
        break;

      case "moderate":
        if (failed)
          corruption += 2
        else if (testResult.SL < 2)
          corruption += 1
        break;

      case "major":
        if (failed)
          corruption += 3
        else if (testResult.SL < 2)
          corruption += 2
        else if (testResult.SL < 4)
          corruption += 1
        break;
    }
    let newCorruption = Number(this.data.data.status.corruption.value) + corruption
    ChatMessage.create(WFRP_Utility.chatDataSetup(`<b>${this.name}</b> gains ${corruption} Corruption.`, "gmroll", false))
    await this.update({ "data.status.corruption.value": newCorruption })
    if (corruption > 0)
      this.checkCorruption();

  }

  async checkCorruption() {


    if (this.data.data.status.corruption.value > this.data.data.status.corruption.max) {
      let skill = this.items.find(i => i.name == game.i18n.localize("NAME.Endurance") && i.type == "skill")
      if (skill) {
        this.setupSkill(skill.data, {title:  game.i18n.format("DIALOG.MutateTitle", {test: skill.name}), mutate: true }).then(setupData => {
          this.basicTest(setupData)
        });
      }
      else {
        this.setupCharacteristic("t", {title:game.i18n.format("DIALOG.MutateTitle", {test: game.wfrp4e.config.characteristics["t"]}), mutate: true }).then(setupData => {
          this.basicTest(setupData)
        });
      }
    }
  }

  async handleMutationResult(testResult) {
    let failed = testResult.target < testResult.roll;

    if (failed) {
      let wpb = this.data.data.characteristics.wp.bonus;
      let tableText = "Roll on a Corruption Table:<br>" + game.wfrp4e.config.corruptionTables.map(t => `@Table[${t}]<br>`).join("")
      ChatMessage.create(WFRP_Utility.chatDataSetup(`
      <h3>Dissolution of Body and Mind</h3> 
      <p>As corruption ravages your soul, the warping breath of Chaos whispers within, either fanning your flesh into a fresh, new form, or fracturing your psyche with exquisite knowledge it can never unlearn.</p>
      <p><b>${this.name}</b> loses ${wpb} Corruption.
      <p>${tableText}</p>`,
        "gmroll", false))
      this.update({ "data.status.corruption.value": Number(this.data.data.status.corruption.value) - wpb })
    }
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(`You have managed to hold off your corruption. For now.`, "gmroll", false))

  }

  deleteEffectsFromItem(itemId)
  {
    let removeEffects = this.data.effects.filter(e => {
      if (!e.origin)
        return false
      return e.origin.includes(itemId)
    }).map(e => e._id)

    this.deleteEmbeddedEntity("ActiveEffect", removeEffects)
  
}

 getEffectItem(effect)
 {
  if (effect.origin) // If effect comes from an item
  {
    let origin = effect.origin.split(".")
    let id = origin[origin.length - 1]
    return this.items.get(id)
  }
 }



   /** @override */
   async deleteEmbeddedEntity(embeddedName, data, options={}) {
    if ( embeddedName === "OwnedItem" ) 
      await this._deleteItemActiveEffects(data);
    const deleted = await super.deleteEmbeddedEntity(embeddedName, data, options);
    return deleted;
  }

  async handleExtendedTest(testResult) {
    let test = duplicate(this.getEmbeddedEntity("OwnedItem", testResult.options.extended));

    if (game.settings.get("wfrp4e", "extendedTests") && testResult.SL == 0)
      testResult.SL = testResult.roll <= testResult.target ? 1 : -1

    if (test.data.failingDecreases.value) {
      test.data.SL.current += Number(testResult.SL)
      if (!test.data.negativePossible.value && test.data.SL.current < 0)
        test.data.SL.current = 0;
    }
    else if (testResult.SL > 0)
      test.data.SL.current += Number(testResult.SL)

    let displayString = `${test.name} ${test.data.SL.current} / ${test.data.SL.target} SL`

    if (test.data.SL.current >= test.data.SL.target) {

      if (getProperty(test, "flags.wfrp4e.reloading")) {
        let weapon = this.prepareWeaponCombat(duplicate(this.getEmbeddedEntity("OwnedItem", getProperty(test, "flags.wfrp4e.reloading"))))
        this.updateEmbeddedEntity("OwnedItem", { _id: weapon._id, "flags.wfrp4e.-=reloading": null, "data.loaded.amt": weapon.data.loaded.max, "data.loaded.value": true })
      }

      if (test.data.completion.value == "reset")
        test.data.SL.current = 0;
      else if (test.data.completion.value == "remove") {
        this.deleteEmbeddedEntity("OwnedItem", test._id)
        this.deleteEffectsFromItem(test._id)
        test = undefined
      }
      displayString = displayString.concat("<br>" + "<b>Completed</b>")
    }

    testResult.other.push(displayString)

    if (test)
      this.updateEmbeddedEntity("OwnedItem", test);
  }

  checkReloadExtendedTest(weapon) {
    if (!weapon.prepared)
      weapon = this.prepareWeaponCombat(weapon);

    if (!weapon.loading)
      return

    if (weapon.data.loaded.amt > 0) {
      if (getProperty(weapon, "flags.wfrp4e.reloading")) {
        this.deleteEmbeddedEntity("OwnedItem", getProperty(weapon, "flags.wfrp4e.reloading"))
        this.updateEmbeddedEntity("OwnedItem", { _id: weapon._id, "flags.wfrp4e.-=reloading": null })
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
      reloadExtendedTest.flags.wfrp4e.reloading = weapon._id

      let reloadProp = weapon.properties.flaws.find(p => p.includes(game.i18n.localize("PROPERTY.Reload")))

      if (reloadProp)
        reloadExtendedTest.data.SL.target = Number(reloadProp[reloadProp.length - 1])
      if (isNaN(reloadExtendedTest.data.SL.target))
        reloadExtendedTest.data.SL.target = 1;

      if (getProperty(weapon, "flags.wfrp4e.reloading"))
        this.deleteEmbeddedEntity("OwnedItem", { _id: getProperty(weapon, "flags.wfrp4e.reloading") })

      this.createEmbeddedEntity("OwnedItem", reloadExtendedTest).then(item => {
        ui.notifications.notify(game.i18n.format("ITEM.CreateReloadTest", { weapon: weapon.name }))
        this.updateEmbeddedEntity("OwnedItem", { _id: weapon._id, "flags.wfrp4e.reloading": item._id })
      })
    }


  }

  
  setAdvantage(val)
  {
    let advantage = this.data.data.status.advantage;
    if (game.settings.get("wfrp4e", "capAdvantageIB"))
      advantage.max = this.data.data.characteristics.i.bonus;
    else 
      advantage.max = 10;

    advantage.value = Math.clamped(val, 0, advantage.max)
    
    this.update({"data.status.advantage" : advantage})
  }
  modifyAdvantage(val)
  {
    this.setAdvantage(this.data.data.status.advantage.value + val)
  }

  setWounds(val)
  {
    let wounds = this.data.data.status.wounds;

    wounds.value = Math.clamped(val, 0, wounds.max)
    this.update({"data.status.wounds" : wounds})
  }
  modifyWounds(val)
  {
    this.setWounds(this.data.data.status.wounds.value + val)
  }


  showCharging(weapon) {
    return true// weapon.attackType == "melee" && (weapon.properties.flaws.includes(game.i18n.localize("PROPERTY.Tiring")) || this.itemTypes["talent"].find(t => t.data.name.includes(game.i18n.localize("NAME.Resolute"))) || this.isMounted)
  }

  get isMounted() {
    return getProperty(this, "data.data.status.mount.mounted") && this.data.data.status.mount.id
  }

  get mount() {
    if (this.data.data.status.mount.isToken) 
    {
      let scene = game.scenes.get(this.data.data.status.mount.tokenData.scene)
      if (canvas.scene.id != scene.id)
        return ui.notifications.error(game.i18n.localize("ERROR.TokenMount"))

      let token = canvas.tokens.get(this.data.data.status.mount.tokenData.token)

      if (token)
        return token.actor
    }
    let mount = game.actors.get(this.data.data.status.mount.id)
    return mount
      
  }

  showDualWielding(weapon) {
    if (!weapon.data.offhand.value && this.data.talents.find(t => t.name.toLowerCase() == game.i18n.localize("NAME.DualWielder").toLowerCase())) {
      return !!this.data.weapons.find(w => w.data.offhand.value == true);
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

    if (existing && existing.flags.wfrp4e.value == null)
      return existing
    else if (existing) {
      existing = duplicate(existing)
      existing.flags.wfrp4e.value += value;
      return this.updateEmbeddedEntity("ActiveEffect", existing)
    }
    else if (!existing) {
      if (game.combat && (effect.id == "blinded" || effect.id == "deafened"))
        effect.flags.wfrp4e.roundReceived = game.combat.round
      effect.label = game.i18n.localize(effect.label);

      if (Number.isNumeric(effect.flags.wfrp4e.value))
        effect.flags.wfrp4e.value = value;
      effect["flags.core.statusId"] = effect.id;
      if (effect.id == "dead")
        effect["flags.core.overlay"] = true;
      if (effect.id == "unconscious")
        await this.addCondition("prone")
      delete effect.id
      return this.createEmbeddedEntity("ActiveEffect", effect)
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



    if (existing && existing.flags.wfrp4e.value == null) {
      if (effect.id == "unconscious")
        await this.addCondition("fatigued")
      return this.deleteEmbeddedEntity("ActiveEffect", existing._id)
    }
    else if (existing) {
      existing.flags.wfrp4e.value -= value;

      if (existing.flags.wfrp4e.value == 0 && (effect.id == "bleeding" || effect.id == "poisoned" || effect.id == "broken" || effect.id == "stunned"))
        await this.addCondition("fatigued")

      if (existing.flags.wfrp4e.value <= 0)
        return this.deleteEmbeddedEntity("ActiveEffect", existing._id)
      else
        return this.updateEmbeddedEntity("ActiveEffect", existing)
    }
  }


  hasCondition(conditionKey) {
    let existing = this.data.effects.find(i => getProperty(i, "flags.core.statusId") == conditionKey)
    return existing
  }


  

  applyFear(value , name = undefined) {
    value = value || 0
    let fear = duplicate(game.wfrp4e.config.systemItems.fear)
    fear.data.SL.target = value;

    if (name)
      fear.effects[0].flags.wfrp4e.fearName = name

    this.createEmbeddedEntity("OwnedItem", fear);
  }

  
  applyTerror(value, name = undefined) 
  {
    value = value || 1
    let terror = duplicate(game.wfrp4e.config.systemItems.terror)
    terror.flags.wfrp4e.terrorValue = value
    game.wfrp4e.utility.applyOneTimeEffect(terror, this)
  }

  awardExp(amount, reason) 
  {
    let experience = duplicate(this.data.data.details.experience)
    experience.total += amount
    experience.log.push({reason, amount, spent: experience.spent, total : experience.total, type : "total"})
    this.update({"data.details.experience" : experience});
    ChatMessage.create({content : game.i18n.format("CHAT.ExpReceived", {amount, reason}), speaker : {alias: this.name}})
  }

  _addToExpLog(amount, reason, newSpent, newTotal)
  {
    if (!newSpent)
      newSpent = this.data.data.details.experience.spent
    if (!newTotal)
      newTotal = this.data.data.details.experience.total

    let expLog = duplicate(this.data.data.details.experience.log || []) 
    expLog.push({amount, reason, spent:  newSpent, total : newTotal, type : newSpent ? "spent" : "total"});
    return expLog
  }

  
  populateEffect(effectId, item, testResult)
  {
    if (typeof item == "string")
      item = this.getEmbeddedEntity("OwnedItem", item)
      
    item = duplicate(item);
    let effect = duplicate(item.effects.find(e => e._id == effectId))
    effect.origin = this.uuid;
    if (item.type == "spell" || item.type == "prayer")
    {
      if (!item.prepared)
      {
        this.prepareSpellOrPrayer(item)
      }

      let multiplier = 1
      if (item.overcasts.duration)
        multiplier += item.overcasts.duration.count

      if (item.duration.toLowerCase().includes(game.i18n.localize("minutes")))
        effect.duration.seconds = parseInt(item.duration) * 60 * multiplier

      else if (item.duration.toLowerCase().includes(game.i18n.localize("hours")))
        effect.duration.seconds = parseInt(item.duration) * 60 * 60 * multiplier

      else if (item.duration.toLowerCase().includes(game.i18n.localize("rounds")))
        effect.duration.rounds = parseInt(item.duration) * multiplier
    }


    let script = getProperty(effect, "flags.wfrp4e.script")
    if (testResult && script)
    {
      let regex = /{{(.+?)}}/g
      let matches = [...script.matchAll(regex)]
      matches.forEach(match => {
        script = script.replace(match[0], getProperty(testResult, match[1]))
      })
      setProperty(effect, "flags.wfrp4e.script", script)
    }

    return effect
  }


  checkSystemEffects()
  {
    let encumbrance = this.data.encumbrance.state
    let state

    if (encumbrance > 3) 
    {
      state = "enc3"
      if (!this.hasSystemEffect(state))
      {
        this.addSystemEffect(state)
        return
      }
      this.removeSystemEffect("enc2")
      this.removeSystemEffect("enc1")
    }
    else if  (encumbrance > 2) 
    {
      state = "enc2"
      if (!this.hasSystemEffect(state))
      {
        this.addSystemEffect(state)
        return
      }
      this.removeSystemEffect("enc1")
      this.removeSystemEffect("enc3")
    }
    else if (encumbrance > 1)
    {
      state = "enc1"
      if (!this.hasSystemEffect(state))
      {
        this.addSystemEffect(state)
        return
      }
      this.removeSystemEffect("enc2")
      this.removeSystemEffect("enc3")
    }
    else
    {
      this.removeSystemEffect("enc1")
      this.removeSystemEffect("enc2")
      this.removeSystemEffect("enc3")
    }

  }


  addSystemEffect(key)
  {
    let systemEffects = game.wfrp4e.utility.getSystemEffects()
    let effect = systemEffects[key];
    setProperty(effect, "flags.core.statusId", key);
    this.createEmbeddedEntity("ActiveEffect", effect)
  }

  removeSystemEffect(key)
  {
    let effect = this.data.effects.find(e => getProperty(e, "flags.core.statusId") == key)
    if (effect)
      this.deleteEmbeddedEntity("ActiveEffect", effect._id)
  }

  hasSystemEffect(key)
  {
    return this.hasCondition(key) // Same function so just reuse
  }


  get isUniqueOwner() {
        return game.user.id == game.users.find(u => u.active && (this.data.permission[u.id]>=3 || u.isGM))?.id
  }



}