import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP4E from "../system/config-wfrp4e.js"
import DiceWFRP from "../system/dice-wfrp4e.js";
import OpposedWFRP from "../system/opposed-wfrp4e.js";
import WFRP_Audio from "../system/audio-wfrp4e.js";
import WFRP_Tables from "../system/tables-wfrp4e.js";

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
    if (data.items) {
      return super.create(data, options);
    }

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
    try {
      super.prepareData();
      const data = this.data;



      // For each characteristic, calculate the total and bonus value
      for (let ch of Object.values(data.data.characteristics)) {
        ch.value = ch.initial + ch.advances + (ch.modifier || 0);
        ch.bonus = Math.floor(ch.value / 10)
        ch.cost = WFRP_Utility._calculateAdvCost(ch.advances, "characteristic")
      }

      if (this.data.type == "character")
        this.prepareCharacter();
      if (this.data.type == "creature")
        this.prepareCreature();

      // Only characters have experience
      if (data.type === "character")
        data.data.details.experience.current = data.data.details.experience.total - data.data.details.experience.spent;

      // Auto calculation values - only calculate if user has not opted to enter ther own values
      if (data.flags.autoCalcWalk)
        data.data.details.move.walk = parseInt(data.data.details.move.value) * 2;

      if (data.flags.autoCalcRun)
        data.data.details.move.run = parseInt(data.data.details.move.value) * 4;

      if (data.flags.autoCalcEnc)
        data.data.status.encumbrance.max = data.data.characteristics.t.bonus + data.data.characteristics.s.bonus;

      if (game.settings.get("wfrp4e", "capAdvantageIB"))
        data.data.status.advantage.max = data.data.characteristics.i.bonus
      else
        data.data.status.advantage.max = 10;


      if (!hasProperty(this, "data.flags.autoCalcSize"))
        data.flags.autoCalcSize = true;


      // Find size based on Traits/Talents
      let size;
      let trait = data.items.find(t => t.type == "trait" && t.name.toLowerCase().includes(game.i18n.localize("NAME.Size").toLowerCase()));
      if (this.data.type == "creature") {
        trait = data.items.find(t => t.type == "trait" && t.included && t.name.toLowerCase().includes(game.i18n.localize("NAME.Size").toLowerCase()))
      }
      if (trait)
        size = trait.data.specification.value;
      else {
        size = data.items.find(x => x.type == "talent" && x.name.toLowerCase() == game.i18n.localize("NAME.Small").toLowerCase());
        if (size)
          size = size.name;
        else
          size = game.i18n.localize("SPEC.Average")
      }

      // If the size has been changed since the last known value, update the value 
      data.data.details.size.value = WFRP_Utility.findKey(size, WFRP4E.actorSizes) || "avg"

      // Now that we have size, calculate wounds and token size
      if (data.flags.autoCalcWounds) {
        let wounds = this._calculateWounds()
        if (data.data.status.wounds.max != wounds) // If change detected, reassign max and current wounds
        {
          data.data.status.wounds.max = wounds;
          data.data.status.wounds.value = wounds;
        }
      }

      if (data.flags.autoCalcSize) {
        let tokenSize = WFRP4E.tokenSizes[data.data.details.size.value]
        if (this.isToken) {
          this.token.update({"height" : tokenSize, "width" : tokenSize });
        }
        data.token.height = tokenSize;
        data.token.width = tokenSize;
      }




      // Auto calculation flags - if the user hasn't disabled various autocalculated values, calculate them
      if (data.flags.autoCalcRun) {
        // This is specifically for the Stride trait
        if (data.items.find(t => t.type == "trait" && t.name.toLowerCase() == game.i18n.localize("NAME.Stride").toLowerCase()))
          data.data.details.move.run += data.data.details.move.walk;
      }

      let talents = data.items.filter(t => t.type == "talent")
      // talentTests is used to easily reference talent bonuses (e.g. in setupTest function and dialog)
      // instead of iterating through every item again to find talents when rolling
      data.flags.talentTests = [];
      for (let talent of talents) // For each talent, if it has a Tests value, push it to the talentTests array
        if (talent.data.tests.value)
          data.flags.talentTests.push({ talentName: talent.name, test: talent.data.tests.value, SL: talent.data.advances.value });

      // ------------------------ Talent Modifications ------------------------
      // These consist of Strike Mighty Blow, Accurate Shot, and Robust. Each determines
      // how many advances there are according to preparedData, then modifies the flag value
      // if there's any difference.

      // Strike Mighty Blow Talent
      let smb = talents.filter(t => t.name.toLowerCase() == game.i18n.localize("NAME.SMB").toLowerCase()).reduce((advances, talent) => advances + talent.data.advances.value, 0)
      if (smb)
        data.flags.meleeDamageIncrease = smb
      else if (!smb)
        data.flags.meleeDamageIncrease = 0

      // Accurate Shot Talent
      let accshot = talents.filter(t => t.name.toLowerCase() == game.i18n.localize("NAME.AS").toLowerCase()).reduce((advances, talent) => advances + talent.data.advances.value, 0)
      if (accshot)
        data.flags.rangedDamageIncrease = accshot;
      else if (!accshot)
        data.flags.rangedDamageIncrease = 0

      // Robust Talent
      let robust = talents.filter(t => t.name.toLowerCase() == game.i18n.localize("NAME.Robust").toLowerCase()).reduce((advances, talent) => advances + talent.data.advances.value, 0)
      if (robust)
        data.flags.robust = robust;
      else
        data.flags.robust = 0

      let ambi = talents.filter(t => t.name.toLowerCase() == game.i18n.localize("NAME.Ambi").toLowerCase()).reduce((advances, talent) => advances + talent.data.advances.value, 0)
      data.flags.ambi = ambi;

    }
    catch (error) {
      console.error("Something went wrong with preparing actor data: " + error)
      ui.notifications.error(game.i18n.localize("ACTOR.PreparationError") + error)
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
      let pureSoulTalent = this.data.items.find(x => x.type == "talent" && x.name.toLowerCase() == (game.i18n.localize("NAME.PS")).toLowerCase())
      if (pureSoulTalent)
        this.data.data.status.corruption.max += pureSoulTalent.data.advances.value;
    }
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
    for (let trait of this.data.items.filter(i => i.type == "trait")) {
      if (this.data.data.excludedTraits.includes(trait._id))
        trait.included = false;
      else
        trait.included = true;
    }

  }

  /* --------------------------------------------------------------------------------------------------------- */
  /* Setting up Rolls
  /*
  /* All "setup______" functions gather the data needed to roll a certain test. These are in 3 main objects.
  /* These 3 objects are then given to DiceWFRP.setupDialog() to show the dialog, see that function for its usage.
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
    let title = game.i18n.localize(char.label) + " " + game.i18n.localize("Test");

    let testData = {
      target: char.value,
      hitLocation: false,
      extra: {
        size : this.data.data.details.size.value,
        actor : this.data,
        options: options
      }
    };

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
        talents: this.data.flags.talentTests,
        advantage: this.data.data.status.advantage.value || 0,
        rollMode: options.rollMode
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = WFRP4E.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        // Target value is the final value being tested against, after all modifiers and bonuses are added
        testData.target = testData.target + testData.testModifier + testData.testDifficulty;
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');
        let talentBonuses = html.find('[name = "talentBonuses"]').val();

        // Combine all Talent Bonus values (their times taken) into one sum
        testData.successBonus += talentBonuses.reduce(function (prev, cur) {
          return prev + Number(cur)
        }, 0)
        return { testData, cardOptions };
      }
    };

    if (options.corruption) {
      title = `Corrupting Influence - ${game.i18n.localize(char.label)} Test`
      dialogOptions.title = title;
      dialogOptions.data.testDifficulty = "challenging"
    }
    if (options.mutate) {
      title = `Dissolution of Body and Mind - ${game.i18n.localize(char.label)} Test`
      dialogOptions.title = title;
      dialogOptions.data.testDifficulty = "challenging"
    }

    if (options.rest) {
      dialogOptions.data.testDifficulty = "average"
    }

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/characteristic-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return DiceWFRP.setupDialog({
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
    let title = skill.name + " " + game.i18n.localize("Test");
    let testData = {
      hitLocation: false,
      income: options.income,
      target: this.data.data.characteristics[skill.data.characteristic.value].value + skill.data.advances.value,
      extra: {
        size: this.data.data.details.size.value,
        actor : this.data,
        options: options,
        skill: skill
      }
    };

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
        talents: this.data.flags.talentTests,
        characteristicList: WFRP4E.characteristics,
        characteristicToUse: skill.data.characteristic.value,
        advantage: this.data.data.status.advantage.value || 0,
        rollMode: options.rollMode
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = WFRP4E.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        let characteristicToUse = html.find('[name="characteristicToUse"]').val();
        // Target value is the final value being tested against, after all modifiers and bonuses are added
        testData.target =
          this.data.data.characteristics[characteristicToUse].value
          + testData.testModifier
          + testData.testDifficulty
          + skill.data.advances.value
          + skill.data.modifier.value

        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');
        let talentBonuses = html.find('[name = "talentBonuses"]').val();

        // Combine all Talent Bonus values (their times taken) into one sum
        testData.successBonus += talentBonuses.reduce(function (prev, cur) {
          return prev + Number(cur)
        }, 0)

        return { testData, cardOptions };
      }
    };

    // If Income, use the specialized income roll handler and set testDifficulty to average
    if (testData.income) {
      dialogOptions.data.testDifficulty = "average";
    }
    if (options.corruption) {
      title = `Corrupting Influence - ${skill.name} Test`
      dialogOptions.title = title;
      dialogOptions.data.testDifficulty = "challenging"
    }
    if (options.mutate) {
      title = `Dissolution of Body and Mind - ${skill.name} Test`
      dialogOptions.title = title;
      dialogOptions.data.testDifficulty = "challenging"
    }

    // If Rest & Recover, set testDifficulty to average
    if (options.rest) { dialogOptions.data.testDifficulty = "average"; }

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/skill-card.html", title)
    if (options.corruption)
      cardOptions.rollMode = "gmroll"

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return DiceWFRP.setupDialog({
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
    let slBonus = 0   // Used when wielding Defensive weapons
    let modifier = 0; // Used when attacking with Accurate weapons
    let successBonus = 0;
    let title = game.i18n.localize("WeaponTest") + " - " + weapon.name;

    // Prepare the weapon to have the complete data object, including qualities/flaws, damage value, etc.
    let wep = this.prepareWeaponCombat(duplicate(weapon));
    let testData = {
      target: 0,
      hitLocation: true,
      extra: { // Store this extra weapon/ammo data for later use
        weapon: wep,
        size: this.data.data.details.size.value,
        actor : this.data,
        champion: !!this.items.find(i => i.data.name.toLowerCase() == game.i18n.localize("NAME.Champion").toLowerCase() && i.type == "trait"),
        riposte: !!this.items.find(i => i.data.name.toLowerCase() == game.i18n.localize("NAME.Riposte").toLowerCase() && i.type == "talent"),
        options: options
      }
    };

    if (wep.attackType == "melee")
      skillCharList.push(game.i18n.localize("Weapon Skill"))

    else if (wep.attackType == "ranged") {
      // If Ranged, default to Ballistic Skill, but check to see if the actor has the specific skill for the weapon
      skillCharList.push(game.i18n.localize("Ballistic Skill"))
      if (weapon.data.weaponGroup.value != "throwing" && weapon.data.weaponGroup.value != "explosives" && weapon.data.weaponGroup.value != "entangling") {
        // Check to see if they have ammo if appropriate
        testData.extra.ammo = duplicate(this.getEmbeddedEntity("OwnedItem", weapon.data.currentAmmo.value))
        if (!testData.extra.ammo || weapon.data.currentAmmo.value == 0 || testData.extra.ammo.data.quantity.value == 0) {
          AudioHelper.play({ src: "systems/wfrp4e/sounds/no.wav" }, false)
          ui.notifications.error(game.i18n.localize("Error.NoAmmo"))
          return
        }
      }
      else if (weapon.data.weaponGroup.value != "entangling" && weapon.data.quantity.value == 0) {
        // If this executes, it means it uses its own quantity for ammo (e.g. throwing), which it has none of
        AudioHelper.play({ src: "systems/wfrp4e/sounds/no.wav" }, false)
        ui.notifications.error(game.i18n.localize("Error.NoAmmo"))
        return;
      }
      else {
        // If this executes, it means it uses its own quantity for ammo (e.g. throwing)
        testData.extra.ammo = weapon;
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

    // ***** Automatic Test Data Fill Options ******

    // If offhand and should apply offhand penalty (should apply offhand penalty = not parry, not defensive, and not twohanded)
    if (getProperty(wep, "data.offhand.value") && !wep.data.twohanded.value && !(weapon.data.weaponGroup.value == "parry" && wep.properties.qualities.includes(game.i18n.localize("PROPERTY.Defensive"))))
    {
      modifier = -20
      modifier += Math.min(20, this.data.flags.ambi * 10)
    }

    // Try to automatically fill the dialog with values based on context
    // If the auto-fill setting is true, and there is combat....
    if (game.settings.get("wfrp4e", "testAutoFill") && (game.combat && game.combat.data.round != 0 && game.combat.turns)) {
      try {
        let currentTurn = game.combat.turns.find(t => t.active)


        // If actor is a token
        if (this.data.token.actorLink) {
          // If it is NOT the actor's turn
          if (currentTurn && this.data.token != currentTurn.actor.data.token)
            slBonus = this.data.flags.defensive; // Prefill Defensive values (see prepareItems() for how defensive flags are assigned)

          else // If it is the actor's turn
          {
            // Prefill dialog according to qualities/flaws
            if (wep.properties.qualities.includes(game.i18n.localize("PROPERTY.Accurate")))
              modifier += 10;
            if (wep.properties.qualities.includes(game.i18n.localize("PROPERTY.Precise")))
              successBonus += 1;
            if (wep.properties.flaws.includes(game.i18n.localize("PROPERTY.Imprecise")))
              slBonus -= 1;
          }
        }
        else // If the actor is not a token
        {
          // If it is NOT the actor's turn
          if (currentTurn && currentTurn.tokenId != this.token._id)
            slBonus = this.data.flags.defensive;

          else // If it is the actor's turn
          {
            // Prefill dialog according to qualities/flaws
            if (wep.properties.qualities.includes(game.i18n.localize("PROPERTY.Accurate")))
              modifier += 10;
            if (wep.properties.qualities.includes(game.i18n.localize("PROPERTY.Precise")))
              successBonus += 1;
            if (wep.properties.flaws.includes(game.i18n.localize("PROPERTY.Imprecise")))
              slBonus -= 1;
          }
        }
      }
      catch // If something went wrong, default to 0 for all prefilled data
      {
        slBonus = 0;
        successBonus = 0;
        modifier = 0;
      }
    }

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/weapon-dialog.html",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        talents: this.data.flags.talentTests,
        skillCharList: skillCharList,
        slBonus: slBonus || 0,
        successBonus: successBonus || 0,
        testDifficulty: options.difficulty,
        modifier: modifier || 0,
        defaultSelection: defaultSelection,
        advantage: this.data.data.status.advantage.value || 0,
        rollMode: options.rollMode
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = WFRP4E.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
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

        let talentBonuses = html.find('[name = "talentBonuses"]').val();

        // Combine all Talent Bonus values (their times taken) into one sum
        testData.successBonus += talentBonuses.reduce(function (prev, cur) {
          return prev + Number(cur)
        }, 0)

        return { testData, cardOptions };
      }

    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/weapon-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return DiceWFRP.setupDialog({
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
    let title = game.i18n.localize("CastingTest") + " - " + spell.name;

    // castSkill array holds the available skills/characteristics to cast with - Casting: Intelligence
    let castSkills = [{ key: "int", name: game.i18n.localize("CHAR.Int") }]

    // if the actor has Language (Magick), add it to the array.
    castSkills = castSkills.concat(this.items.filter(i => i.name.toLowerCase() == `${game.i18n.localize("Language")} (${game.i18n.localize("Magick")})`.toLowerCase() && i.type == "skill"))

    // Default to Language Magick if it exists
    let defaultSelection = castSkills.findIndex(i => i.name.toLowerCase() == `${game.i18n.localize("Language")} (${game.i18n.localize("Magick")})`.toLowerCase())

    // Whether the actor has Instinctive Diction is important in the test rolling logic
    let instinctiveDiction = (this.data.flags.talentTests.findIndex(x => x.talentName.toLowerCase() == game.i18n.localize("NAME.ID").toLowerCase()) > -1) // instinctive diction boolean

    // Prepare the spell to have the complete data object, including damage values, range values, CN, etc.
    let preparedSpell = this.prepareSpellOrPrayer(spell);
    let testData = {
      target: 0,
      extra: { // Store this data to be used by the test logic
        spell: preparedSpell,
        malignantInfluence: false,
        ingredient: false,
        ID: instinctiveDiction,
        size: this.data.data.details.size.value,
        actor : this.data,
        options: options
      }
    };

    // If the spell does damage, default the hit location to checked
    if (preparedSpell.damage)
      testData.hitLocation = true;

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
        rollMode: options.rollMode

      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = WFRP4E.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());

        let skillSelected = castSkills[Number(html.find('[name="skillSelected"]').val())];

        // If an actual skill (Language Magick) was selected, use that skill to calculate the target number
        if (skillSelected.key != "int") {
          testData.target = this.data.data.characteristics[skillSelected.data.data.characteristic.value].value
            + skillSelected.data.data.advances.value
            + skillSelected.data.data.modifier.value
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

        let talentBonuses = html.find('[name = "talentBonuses"]').val();
        // Combine all Talent Bonus values (their times taken) into one sum
        testData.successBonus += talentBonuses.reduce(function (prev, cur) {
          return prev + Number(cur)
        }, 0)

        return { testData, cardOptions };
      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/spell-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return DiceWFRP.setupDialog({
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
    let title = game.i18n.localize("ChannellingTest") + " - " + spell.name;

    // channellSkills array holds the available skills/characteristics to  with - Channelling: Willpower
    let channellSkills = [{ key: "wp", name: game.i18n.localize("CHAR.WP") }]

    // if the actor has any channel skills, add them to the array.
    channellSkills = channellSkills.concat(this.items.filter(i => i.name.toLowerCase().includes(game.i18n.localize("NAME.Channelling").toLowerCase()) && i.type == "skill"))

    // Find the spell lore, and use that to determine the default channelling selection
    let spellLore = spell.data.lore.value;
    let defaultSelection
    if (spell.data.wind && spell.data.wind.value) {
      defaultSelection = channellSkills.indexOf(channellSkills.find(x => x.name.includes(spell.data.wind.value)))
      if (defaultSelection == -1) {
        let customChannellSkill = this.items.find(i => i.name.toLowerCase().includes(spell.data.wind.value.toLowerCase()) && i.type == "skill");
        if (customChannellSkill) {
          channellSkills.push(customChannellSkill)
          defaultSelection = channellSkills.length - 1
        }
      }
    }
    else {
      defaultSelection = channellSkills.indexOf(channellSkills.find(x => x.name.includes(WFRP4E.magicWind[spellLore])));
    }

    if (spellLore == "witchcraft")
      defaultSelection = channellSkills.indexOf(channellSkills.find(x => x.name.toLowerCase().includes(game.i18n.localize("NAME.Channelling").toLowerCase())))

    // Whether the actor has Aethyric Attunement is important in the test rolling logic
    let aethyricAttunement = (this.data.flags.talentTests.findIndex(x => x.talentName.toLowerCase() == game.i18n.localize("NAME.AA").toLowerCase()) > -1) // aethyric attunement boolean

    let testData = {
      target: 0,
      extra: { // Store data to be used by the test logic
        spell: this.prepareSpellOrPrayer(spell),
        malignantInfluence: false,
        actor : this.data,
        ingredient: false,
        AA: aethyricAttunement,
        size: this.data.data.details.size.value,
        options: options
      }
    };

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
        rollMode: options.rollMode

      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = WFRP4E.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        testData.extra.malignantInfluence = html.find('[name="malignantInfluence"]').is(':checked');

        let skillSelected = channellSkills[Number(html.find('[name="skillSelected"]').val())];
        // If an actual Channelling skill was selected, use that skill to calculate the target number
        if (skillSelected.key != "wp") {
          testData.target = testData.testModifier + testData.testDifficulty
            + this.data.data.characteristics[skillSelected.data.data.characteristic.value].value
            + skillSelected.data.data.advances.value
            + skillSelected.data.data.modifier.value
            testData.extra.channellSkill = skillSelected.data
        }
        else // if the ccharacteristic was selected, use just the characteristic
          testData.target = testData.testModifier + testData.testDifficulty + this.data.data.characteristics.wp.value

        let talentBonuses = html.find('[name = "talentBonuses"]').val();
        // Combine all Talent Bonus values (their times taken) into one sum
        testData.successBonus += talentBonuses.reduce(function (prev, cur) {
          return prev + Number(cur)
        }, 0)

        return { testData, cardOptions };

      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/channel-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return DiceWFRP.setupDialog({
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
    let title = game.i18n.localize("PrayerTest") + " - " + prayer.name;

    // ppraySkills array holds the available skills/characteristics to pray with - Prayers: Fellowship
    let praySkills = [{ key: "fel", name: game.i18n.localize("CHAR.Fel") }]

    // if the actor has the Pray skill, add it to the array.
    praySkills = praySkills.concat(this.items.filter(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase() && i.type == "skill"));

    // Default to Pray skill if available
    let defaultSelection = praySkills.findIndex(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase())

    // Prepare the prayer to have the complete data object, including damage values, range values, etc.
    let preparedPrayer = this.prepareSpellOrPrayer(prayer);
    let testData = { // Store this data to be used in the test logic
      target: 0,
      hitLocation: false,
      target: defaultSelection != -1 ? this.data.data.characteristics[praySkills[defaultSelection].data.data.characteristic.value].value + praySkills[defaultSelection].data.data.advances.value : this.data.data.characteristics.fel.value,
      extra: {
        prayer: preparedPrayer,
        size: this.data.data.details.size.value,
        actor : this.data,
        sin: this.data.data.status.sin.value,
        options: options,
        rollMode: options.rollMode
      }
    };


    // If the spell does damage, default the hit location to checked
    if (preparedPrayer.damage)
      testData.hitLocation = true;

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
        defaultSelection: defaultSelection
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = WFRP4E.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());

        let skillSelected = praySkills[Number(html.find('[name="skillSelected"]').val())];
        // If an actual skill (Pray) was selected, use that skill to calculate the target number
        if (skillSelected.key != "fel") {
          testData.target = this.data.data.characteristics[skillSelected.data.data.characteristic.value].value
            + skillSelected.data.data.advances.value
            + testData.testDifficulty
            + testData.testModifier;
            + skillSelected.data.data.modifier.value
        }
        else // if a characteristic was selected, use just the characteristic
        {
          testData.target = this.data.data.characteristics.fel.value
            + testData.testDifficulty
            + testData.testModifier;
        }

        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');

        let talentBonuses = html.find('[name = "talentBonuses"]').val();
        // Combine all Talent Bonus values (their times taken) into one sum
        testData.successBonus += talentBonuses.reduce(function (prev, cur) {
          return prev + Number(cur)
        }, 0)

        return { testData, cardOptions };
      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/prayer-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return DiceWFRP.setupDialog({
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
      return;
    let title = WFRP4E.characteristics[trait.data.rollable.rollCharacteristic] + ` ${game.i18n.localize("Test")} - ` + trait.name;
    let testData = {
      hitLocation: false,
      target: this.data.data.characteristics[trait.data.rollable.rollCharacteristic].value,
      extra: { // Store this trait data for later use
        trait: trait,
        size: this.data.data.details.size.value,
        actor : this.data,
        champion: !!this.items.find(i => i.data.name.toLowerCase() == game.i18n.localize("NAME.Champion").toLowerCase()),
        options: options,
        rollMode: options.rollMode
      }
    };

    // Default hit location checked if the rollable trait's characteristic is WS or BS
    if (trait.data.rollable.rollCharacteristic == "ws" || trait.data.rollable.rollCharacteristic == "bs")
      testData.hitLocation = true;

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/skill-dialog.html", // Reuse skill dialog
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        talents: this.data.flags.talentTests,
        characteristicList: WFRP4E.characteristics,
        characteristicToUse: trait.data.rollable.rollCharacteristic,
        advantage: this.data.data.status.advantage.value || 0,
        testDifficulty: trait.data.rollable.defaultDifficulty
      },
      callback: (html) => {
        // When dialog confirmed, fill testData dialog information
        // Note that this does not execute until DiceWFRP.setupDialog() has finished and the user confirms the dialog
        cardOptions.rollMode = html.find('[name="rollMode"]').val();
        testData.testModifier = Number(html.find('[name="testModifier"]').val());
        testData.testDifficulty = WFRP4E.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
        testData.successBonus = Number(html.find('[name="successBonus"]').val());
        testData.slBonus = Number(html.find('[name="slBonus"]').val());
        let characteristicToUse = html.find('[name="characteristicToUse"]').val();
        // Target value is the final value being tested against, after all modifiers and bonuses are added
        testData.target = this.data.data.characteristics[characteristicToUse].value
          + testData.testModifier
          + testData.testDifficulty
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');
        let talentBonuses = html.find('[name = "talentBonuses"]').val();

        // Combine all Talent Bonus values (their times taken) into one sum
        testData.successBonus += talentBonuses.reduce(function (prev, cur) {
          return prev + Number(cur)
        }, 0)

        return { testData, cardOptions };
      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/skill-card.html", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return DiceWFRP.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    });
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

    return cardOptions
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
   * basicTest is the default roll override (see DiceWFRP.setupDialog() for where it's assigned). This follows
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
    let result = DiceWFRP.rollTest(testData);

    result.postFunction = "basicTest";
    if (testData.extra)
      mergeObject(result, testData.extra);

    if (result.options.corruption) {
      this.handleCorruptionResult(result);
    }
    if (result.options.mutate) {
      this.handleMutationResult(result)
    }

    if (result.options.extended)
    {
      this.handleExtendedTest(result)
    }

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
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
    return {result, cardOptions};
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
    let result = DiceWFRP.rollTest(testData);
    result.postFunction = "incomeTest"

    Hooks.call("wfrp4e:rollIncomeTest", result, cardOptions)


    if (game.user.targets.size) {
      cardOptions.title += ` - ${game.i18n.localize("Opposed")}`,
        cardOptions.isOpposedTest = true
    }

    let status = testData.income.value.split(' ')

    let dieAmount = WFRP4E.earningValues[WFRP_Utility.findKey(status[0], WFRP4E.statusTiers)][0] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    dieAmount = Number(dieAmount) * status[1];     // Multilpy that first letter by your standing (Brass 4 = 8d10 pennies)
    let moneyEarned;
    if (WFRP_Utility.findKey(status[0], WFRP4E.statusTiers) != "g") // Don't roll for gold, just use standing value
    {
      dieAmount = dieAmount + "d10";
      moneyEarned = new Roll(dieAmount).roll().total;
    }
    else
      moneyEarned = dieAmount;

    // After rolling, determined how much, if any, was actually earned
    if (result.description.includes("Success")) {
      result.incomeResult = game.i18n.localize("INCOME.YouEarn") + " " + moneyEarned;
      switch (WFRP_Utility.findKey(status[0], WFRP4E.statusTiers)) {
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
      switch (WFRP_Utility.findKey(status[0], WFRP4E.statusTiers)) {
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
    result.moneyEarned = moneyEarned + WFRP_Utility.findKey(status[0], WFRP4E.statusTiers);
    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg)
      })
    return {result, cardOptions};
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
    let result = DiceWFRP.rollWeaponTest(testData);
    result.postFunction = "weaponTest";

    // Reduce ammo if necessary
    if (result.ammo && result.weapon.data.weaponGroup.value != game.i18n.localize("SPEC.Entangling").toLowerCase()) {
      result.ammo.data.quantity.value--;
      this.updateEmbeddedEntity("OwnedItem", { _id: result.ammo._id, "data.quantity.value": result.ammo.data.quantity.value });
    }

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    Hooks.call("wfrp4e:rollWeaponTest", result, cardOptions)


    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return {result, cardOptions};
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
    testData = await DiceWFRP.rollDices(testData, cardOptions);
    let result = DiceWFRP.rollCastTest(testData);
    result.postFunction = "castTest";


    // Find ingredient being used, if any
    let ing = duplicate(this.getEmbeddedEntity("OwnedItem", testData.extra.spell.data.currentIng.value))
    if (ing) {
      // Decrease ingredient quantity
      testData.extra.ingredient = true;
      ing.data.quantity.value--;
      this.updateEmbeddedEntity("OwnedItem", ing);
    }
    // If quantity of ingredient is 0, disregard the ingredient
    else if (!ing || ing.data.data.quantity.value <= 0)
      testData.extra.ingredient = false;

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    Hooks.call("wfrp4e:rollCastTest", result, cardOptions)


    // Update spell to reflect SL from channelling resetting to 0
    WFRP_Utility.getSpeaker(cardOptions.speaker).updateEmbeddedEntity("OwnedItem", { _id: testData.extra.spell._id, 'data.cn.SL': 0 });


    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return {result, cardOptions};
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
    testData = await DiceWFRP.rollDices(testData, cardOptions);
    let result = DiceWFRP.rollChannellTest(testData, WFRP_Utility.getSpeaker(cardOptions.speaker));
    result.postFunction = "channelTest";

    // Find ingredient being used, if any
    let ing = duplicate(this.getEmbeddedEntity("OwnedItem", testData.extra.spell.data.currentIng.value))
    if (ing) {
      // Decrease ingredient quantity
      testData.extra.ingredient = true;
      ing.data.quantity.value--;
      this.updateEmbeddedEntity("OwnedItem", ing);
    }
    // If quantity of ingredient is 0, disregard the ingredient
    else if (!ing || ing.data.data.quantity.value <= 0)
      testData.extra.ingredient = false;

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    Hooks.call("wfrp4e:rollChannelTest", result, cardOptions)

    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return {result, cardOptions};
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
    let result = DiceWFRP.rollPrayTest(testData, WFRP_Utility.getSpeaker(cardOptions.speaker));
    result.postFunction = "prayerTest";

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    Hooks.call("wfrp4e:rollPrayerTest", result, cardOptions)

    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return {result, cardOptions};
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
    let result = DiceWFRP.rollTest(testData);
    result.postFunction = "traitTest";
    try {
      // If the specification of a trait is a number, it's probably damage. (Animosity (Elves) - not a number specification: no damage)
      if (!isNaN(testData.extra.trait.data.specification.value) || testData.extra.trait.data.rollable.rollCharacteristic == "ws" || testData.extra.trait.data.rollabble.rollCharacteristic == "bs") //         (Bite 7 - is a number specification, do damage)
      {
        testData.extra.damage = Number(result.SL) // Start damage off with SL
        testData.extra.damage += Number(testData.extra.trait.data.specification.value) || 0

        if (testData.extra.trait.data.rollable.bonusCharacteristic) // Add the bonus characteristic (probably strength)
          testData.extra.damage += Number(this.data.data.characteristics[testData.extra.trait.data.rollable.bonusCharacteristic].bonus) || 0;
      }
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("CHAT.DamageError") + " " + error)
    } // If something went wrong calculating damage, do nothing and still render the card

    if (testData.extra)
      mergeObject(result, testData.extra);

    try {
      let contextAudio = await WFRP_Audio.MatchContextAudio(WFRP_Audio.FindContext(result))
      cardOptions.sound = contextAudio.file || cardOptions.sound
    }
    catch
    { }
    Hooks.call("wfrp4e:rollTraitTest", result, cardOptions)

    if (!options.suppressMessage)
      DiceWFRP.renderRollCard(cardOptions, result, options.rerenderMessage).then(msg => {
        OpposedWFRP.handleOpposedTarget(msg) // Send to handleOpposed to determine opposed status, if any.
      })
    return {result, cardOptions};
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
    let preparedData = duplicate(this.data)
    // Call prepareItems first to organize and process OwnedItems
    mergeObject(preparedData, this.prepareItems())

    // Add speciality functions for each Actor type
    if (preparedData.type == "character")
      this.prepareCharacter(preparedData)

    if (preparedData.type == "npc")
      this.prepareNPC(preparedData)

    if (preparedData.type == "creature")
      this.prepareCreature(preparedData)

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
    let actorData = duplicate(this.data)
    // These containers are for the various different tabs
    const careers = [];
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
        label : game.i18n.localize("Head"),
        show: true,
      },
      body: {
        value: 0,
        layers: [],
        label : game.i18n.localize("Body"),
        show: true
      },
      rArm: {
        value: 0,
        layers: [],
        label : game.i18n.localize("Left Arm"),
        show: true
      },
      lArm: {
        value: 0,
        layers: [],
        label : game.i18n.localize("Right Arm"),
        show: true
      },
      rLeg: {
        value: 0,
        layers: [],
        label : game.i18n.localize("Right Leg"),
        show: true
      
      },
      lLeg: {
        value: 0,
        layers: [],
        label : game.i18n.localize("Left Leg"),
        show: true
      },
      shield: 0
    }

    for(let loc in AP)
    {
      if (loc == "shield")
        continue
      let row = WFRP_Tables[actorData.data.details.hitLocationTable.value].rows.find(r => r.result == loc)
      if (row)
        AP[loc].label = game.i18n.localize(row.description)
      else 
        AP[loc].show = false;
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
    let showOffhand  = true;   // Show offhand checkboxes if no offhand equipped
    let defensiveCounter = 0; // Counter for weapons with the defensive quality

    actorData.items = actorData.items.sort((a, b) => (a.sort || 0) - (b.sort || 0))

    // Iterate through items, allocating to containers
    // Items that need more intense processing are sent to a specialized function (see preparation functions below)
    // Physical items are also placed into containers instead of the inventory object if their 'location' is not 0
    // A location of 0 means not in a container, otherwise, the location corresponds to the id of the container the item is in
    for (let i of actorData.items) {
      try {
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
        }

        // *********** Ammunition ***********
        else if (i.type === "ammunition") {
          i.encumbrance = (i.data.encumbrance.value * i.data.quantity.value).toFixed(2);
          if (i.data.location.value == 0) {
            inventory.ammunition.items.push(i);
            inventory.ammunition.show = true
            totalEnc += Number(i.encumbrance);
          }
          else {
            inContainers.push(i);
          }
        }

        // *********** Weapons ***********
        // Weapons are "processed" at the end for efficency
        else if (i.type === "weapon") {
          i.encumbrance = Math.floor(i.data.encumbrance.value * i.data.quantity.value);
          if (i.data.location.value == 0) {
            i.toggleValue = i.data.equipped || false;
            inventory.weapons.items.push(i);
            inventory.weapons.show = true;
            totalEnc += i.encumbrance;
          }
          else {
            inContainers.push(i);
          }
        }

        // *********** Armour ***********
        // Armour is prepared only if it is worn, otherwise, it is just pushed to inventory and encumbrance is calculated
        else if (i.type === "armour") {
          i.encumbrance = Math.floor(i.data.encumbrance.value * i.data.quantity.value);
          if (i.data.location.value == 0) {
            i.toggleValue = i.data.worn.value || false;
            if (i.data.worn.value) {
              i.encumbrance = i.encumbrance - 1;
              i.encumbrance = i.encumbrance < 0 ? 0 : i.encumbrance;
            }
            inventory.armor.items.push(i);
            inventory.armor.show = true;
            totalEnc += i.encumbrance;
          }
          else {
            inContainers.push(i);
          }

          if (i.data.worn.value)
            armour.push(this.prepareArmorCombat(i, AP));

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
          i.encumbrance = i.data.encumbrance.value;

          if (i.data.location.value == 0) {
            if (i.data.worn.value) {
              i.encumbrance = i.encumbrance - 1;
              i.encumbrance = i.encumbrance < 0 ? 0 : i.encumbrance;
            }
            totalEnc += i.encumbrance;
          }
          else {
            inContainers.push(i);
          }
          containers.items.push(i);
          containers.show = true;
        }

        // *********** Trappings ***********
        // Trappings have several sub-categories, most notably Ingredients
        // The trappings tab does not have a "Trappings" section, but sections for each type of trapping instead
        else if (i.type === "trapping") {
          i.encumbrance = i.data.encumbrance.value * i.data.quantity.value;
          if (i.data.location.value == 0) {
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
            totalEnc += i.encumbrance;
          }
          else {
            inContainers.push(i);
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
          if (i.data.specification.value) {
            if (i.data.rollable.bonusCharacteristic)  // Bonus characteristic adds to the specification (Weapon +X includes SB for example)
            {
              i.data.specification.value = parseInt(i.data.specification.value) || 0
              i.data.specification.value += actorData.data.characteristics[i.data.rollable.bonusCharacteristic].bonus;
            }
            i.name = i.name + " (" + i.data.specification.value + ")";
          }
          traits.push(i);
        }

        // *********** Psychologies ***********   
        else if (i.type === "psychology") {
          psychology.push(i);
        }

        // *********** Diseases ***********   
        // .roll is the roll result. If it doesn't exist, show the formula instead
        else if (i.type === "disease") {
          i.data.incubation.roll = i.data.incubation.roll || i.data.incubation.value;
          i.data.duration.roll = i.data.duration.roll || i.data.duration.value;
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
          if (i.data.location.value == 0) {
            money.coins.push(i);
            totalEnc += Number(i.encumbrance);
          }
          else {
            inContainers.push(i);
          }
          money.total += i.data.quantity.value * i.data.coinValue.value;
        }

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
      }
      catch (error) {
        console.error("Something went wrong with preparing item " + i.name + ": " + error)
        ui.notifications.error("Something went wrong with preparing item " + i.name + ": " + error)
        // ui.notifications.error("Deleting " + i.name);
        // this.deleteEmbeddedEntity("OwnedItem", i._id);
      }
    } // END ITEM SORTING

    // Prepare weapons for combat after items passthrough for efficiency - weapons need to know the ammo possessed, so instead of iterating through
    // all items to find, iterate through the inventory.ammo array we just made
    let totalShieldDamage = 0; // Used for damage tooltip
    let eqpPoints = 0 // Weapon equipment value, only 2 one handed weapons or 1 two handed weapon
    for (let wep of inventory.weapons.items) {
      // We're only preparing equipped items here - this is for displaying weapons in the combat tab after all
      if (wep.data.equipped) {
        if (getProperty(wep, "data.offhand.value"))
          showOffhand = false; // Don't show offhand checkboxes if a weapon is offhanded
        // Process weapon taking into account actor data, skills, and ammo
        weapons.push(this.prepareWeaponCombat(wep, inventory.ammo, basicSkills.concat(advancedOrGroupedSkills)));
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



    // ******************************** Container Setup ***********************************

    // containerMissing is an array of items whose container does not exist (needed for when a container is deleted)
    var containerMissing = inContainers.filter(i => !containers.items.find(c => c._id == i.data.location.value));
    for (var itemNoContainer of containerMissing) // Reset all items without container references (items that were removed from a contanier)
      itemNoContainer.data.location.value = 0;

    // If there were missing containers, reset the items that are orphaned
    if (containerMissing.length)
      this.updateEmbeddedEntity("OwnedItem", containerMissing)

    for (var cont of containers.items) // For each container
    {
      // All items referencing (inside) that container
      var itemsInside = inContainers.filter(i => i.data.location.value == cont._id);
      itemsInside.map(function (item) { // Add category of item to be displayed
        if (item.type == "trapping")
          item.type = WFRP4E.trappingCategories[item.data.trappingType.value];
        else
          item.type = WFRP4E.trappingCategories[item.type];
      })
      cont["carrying"] = itemsInside.filter(i => i.type != "Container");    // cont.carrying -> items the container is carrying
      cont["packsInside"] = itemsInside.filter(i => i.type == "Container"); // cont.packsInside -> containers the container is carrying
      cont["holding"] = itemsInside.reduce(function (prev, cur) {           // cont.holding -> total encumbrance the container is holding
        return Number(prev) + Number(cur.encumbrance);
      }, 0);
      cont.holding = Math.floor(cont.holding)
    }

    containers.items = containers.items.filter(c => c.data.location.value == 0); // Do not show containers inside other containers as top level (a location value of 0 means not inside a container)


    // ******************************** Penalties Setup ***********************************        

    // Penalties box setup
    // If too much text, divide the penalties into groups
    let penaltyOverflow = false;
    penalties[game.i18n.localize("Armour")].value += this.calculateArmorPenalties(armour);
    if ((penalties[game.i18n.localize("Armour")].value + penalties[game.i18n.localize("Mutation")].value + penalties[game.i18n.localize("Injury")].value + penalties[game.i18n.localize("Criticals")].value).length > 50) // ~50 characters is when the text box overflows
    {                                                                                                                                     // When that happens, break it up into categories 
      penaltyOverflow = true;
      for (let penaltyType in penalties) {
        if (penalties[penaltyType].value)
          penalties[penaltyType].show = true;
        else
          penalties[penaltyType].show = false; // Don't show categories without any penalties 
      }
    }

    // Penalties flag is teh string that shows when the actor's turn in combat starts
    let penaltiesFlag = penalties[game.i18n.localize("Armour")].value + " " + penalties[game.i18n.localize("Mutation")].value + " " + penalties[game.i18n.localize("Injury")].value + " " + penalties[game.i18n.localize("Criticals")].value + " " + this.data.data.status.penalties.value
    penaltiesFlag = penaltiesFlag.trim();

    // This is for the penalty string in flags, for combat turn message
    if (this.data.flags.modifier != penaltiesFlag)
      this.update({ "flags.modifier": penaltiesFlag })

    // Add armor trait to AP object
    let armorTrait = traits.find(t => t.name.toLowerCase().includes(game.i18n.localize("NAME.Armour").toLowerCase()))
    if (armorTrait && (!this.data.data.excludedTraits || !this.data.data.excludedTraits.includes(armorTrait._id))) {
      for (let loc in AP) {
        try {
          let traitDamage = 0;
          if (armorTrait.APdamage)
            traitDamage = armorTrait.APdamage[loc] || 0;
          if (loc != "shield")
            AP[loc].value += (parseInt(armorTrait.data.specification.value) || 0) - traitDamage;
        }
        catch {//ignore armor traits with invalid values
        }
      }
    }

    // keep defensive counter in flags to use for test auto fill (see setupWeapon())
    this.data.flags.defensive = defensiveCounter;

    // Encumbrance is initially calculated in prepareItems() - this area augments it based on talents
    if (actorData.flags.autoCalcEnc) {
      let strongBackTalent = talents.find(t => t.name.toLowerCase() == game.i18n.localize("NAME.StrongBack").toLowerCase())
      let sturdyTalent = talents.find(t => t.name.toLowerCase() == game.i18n.localize("NAME.Sturdy").toLowerCase())

      if (strongBackTalent)
        actorData.data.status.encumbrance.max += strongBackTalent.data.advances.value;
      if (sturdyTalent)
        actorData.data.status.encumbrance.max += sturdyTalent.data.advances.value * 2;
    }


    // enc used for encumbrance bar in trappings tab
    let enc;
    totalEnc = Math.floor(totalEnc);
    enc = {
      max: actorData.data.status.encumbrance.max,
      value: Math.round(totalEnc * 10) / 10,
    };
    // percentage of the bar filled
    enc.pct = Math.min(enc.value * 100 / enc.max, 100);
    enc.state = enc.value / enc.max; // state is how many times over you are max encumbrance
    if (enc.state > 3) {
      enc["maxEncumbered"] = true
      enc.penalty = WFRP4E.encumbrancePenalties["maxEncumbered"];
    }
    else if (enc.state > 2) {
      enc["veryEncumbered"] = true
      enc.penalty = WFRP4E.encumbrancePenalties["veryEncumbered"];
    }
    else if (enc.state > 1) {
      enc["encumbered"] = true
      enc.penalty = WFRP4E.encumbrancePenalties["encumbered"];
    }
    else
      enc["notEncumbered"] = true;

    // Return all processed objects
    return {
      inventory,
      containers,
      basicSkills: basicSkills.sort(WFRP_Utility.nameSorter),
      advancedOrGroupedSkills: advancedOrGroupedSkills.sort(WFRP_Utility.nameSorter),
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
      hasSpells,
      hasPrayers,
      showOffhand
    }
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
    let actorData = this.data
    skill.data.characteristic.num = actorData.data.characteristics[skill.data.characteristic.value].value;
    if (skill.data.modifier)
    {
      if (skill.data.modifier.value > 0)
        skill.modified = "positive";
      else if (skill.data.modifier.value < 0)
        skill.modified = "negative"
    }
    skill.data.characteristic.abrev = WFRP4E.characteristicsAbbrev[skill.data.characteristic.value];
    skill.data.cost = WFRP_Utility._calculateAdvCost(skill.data.advances.value, "skill", skill.data.advances.costModifier)
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

        case 'none':
          talent["numMax"] = "-";
          break;

        default:
          talent["numMax"] = actorData.data.characteristics[talent.data.max.value].bonus;
      }
      talent.cost = 200;
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
    let actorData = this.data

    if (!skills) // If a skill list isn't provided, filter all items to find skills
      skills = actorData.items.filter(i => i.type == "skill");

    weapon.attackType = WFRP4E.groupToType[weapon.data.weaponGroup.value]
    weapon.data.reach.value = WFRP4E.weaponReaches[weapon.data.reach.value];
    weapon.data.weaponGroup.value = WFRP4E.weaponGroups[weapon.data.weaponGroup.value] || "basic";

    // Attach the available skills to use to the weapon.
    weapon.skillToUse = skills.find(x => x.name.toLowerCase().includes(`(${weapon.data.weaponGroup.value.toLowerCase()})`))

    // prepareQualitiesFlaws turns the comma separated qualities/flaws string into a string array
    // Does not include qualities if no skill could be found above
    weapon["properties"] = WFRP_Utility._prepareQualitiesFlaws(weapon, !!weapon.skillToUse);

    // Special flail rule - if no skill could be found, add the Dangerous property
    if (weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Flail") && !weapon.skillToUse && !weapon.properties.includes(game.i18n.localize("PROPERTY.Dangerous")))
      weapon.properties.push(game.i18n.localize("PROPERTY.Dangerous"));

    // Turn range into a numeric value (important for ranges including SB, see the function for details)
    weapon.data.range.value = this.calculateRangeOrDamage(weapon.data.range.value);

    // Melee Damage calculation
    if (weapon.attackType == "melee") {
      weapon["meleeWeaponType"] = true;
      // Turn melee damage formula into a numeric value (SB + 4 into a number)         Melee damage increase flag comes from Strike Mighty Blow talent
      weapon.data.damage.value = this.calculateRangeOrDamage(weapon.data.damage.value) + (actorData.flags.meleeDamageIncrease || 0);

      // Very poor wording, but if the weapon has suffered damage (weaponDamage), subtract that amount from meleeValue (melee damage the weapon deals)
      if (weapon.data.weaponDamage)
        weapon.data.damage.value -= weapon.data.weaponDamage
      else
        weapon.data["weaponDamage"] = 0;
    }
    // Ranged Damage calculation
    else {
      weapon["rangedWeaponType"] = true;

      // Turn ranged damage formula into numeric value, same as melee                 Ranged damage increase flag comes from Accurate Shot
      weapon.data.damage.value = this.calculateRangeOrDamage(weapon.data.damage.value) + (actorData.flags.rangedDamageIncrease || 0)
      // Very poor wording, but if the weapon has suffered damage (weaponDamage), subtract that amount from rangedValue (ranged damage the weapon deals)
      if (weapon.data.weaponDamage)
        weapon.data.damage.value -= weapon.data.weaponDamage
      else
        weapon.data["weaponDamage"] = 0;
    }

    // If the weapon uses ammo...
    if (weapon.data.ammunitionGroup.value != "none") {
      weapon["ammo"] = [];
      // If a list of ammo has been provided, filter it by ammo that is compatible with the weapon type
      if (ammoList) {
        weapon.ammo = ammoList.filter(a => a.data.ammunitionType.value == weapon.data.ammunitionGroup.value)
      }
      else // If no ammo has been provided, filter through all items and find ammo that is compaptible
        for (let a of actorData.items)
          if (a.type == "ammunition" && a.data.ammunitionType.value == weapon.data.ammunitionGroup.value) // If is ammo and the correct type of ammo
            weapon.ammo.push(a);

      // Send to prepareWeaponWithAmmo for further calculation (Damage/range modifications based on ammo)
      this.prepareWeaponWithAmmo(weapon);
    }
    // If throwing or explosive weapon, its ammo is its own quantity
    else if (weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Throwing") || weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Explosives")) {
      weapon.data.ammunitionGroup.value = "";
    }
    // If entangling, it has no ammo
    else if (weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Entangling")) {
      weapon.data.ammunitionGroup.value = "";
    }
    // Separate qualities and flaws into their own arrays: weapon.properties.qualities/flaws
    weapon.properties = WFRP_Utility._separateQualitiesFlaws(weapon.properties);

    if (weapon.properties.spec)
    {
      for(let prop of weapon.properties.spec)
      {
        let spec
        if (prop == game.i18n.localize("Special"))
          weapon.properties.special = weapon.data.special.value;
        if (prop == game.i18n.localize("Special Ammo"))
          weapon.properties.specialammo = weapon.ammo.find(a => a._id == weapon.data.currentAmmo.value).data.special.value
      }

    }
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
    // Turn comma separated qualites/flaws into a more structured 'properties.qualities/flaws` string array
    armor.properties = WFRP_Utility._separateQualitiesFlaws(WFRP_Utility._prepareQualitiesFlaws(armor));

    // Iterate through armor locations covered
    for (let apLoc in armor.data.currentAP) {
      // -1 is what all newly created armor's currentAP is initialized to, so if -1: currentAP = maxAP (undamaged)
      if (armor.data.currentAP[apLoc] == -1) {
        armor.data.currentAP[apLoc] = armor.data.maxAP[apLoc];
      }
    }
    // If the armor protects a certain location, add the AP value of the armor to the AP object's location value
    // Then pass it to addLayer to parse out important information about the armor layer, namely qualities/flaws
    if (armor.data.maxAP.head > 0) {
      armor["protectsHead"] = true;
      AP.head.value += armor.data.currentAP.head;
      WFRP_Utility.addLayer(AP, armor, "head")
    }
    if (armor.data.maxAP.body > 0) {
      armor["protectsBody"] = true;
      AP.body.value += armor.data.currentAP.body;
      WFRP_Utility.addLayer(AP, armor, "body")
    }
    if (armor.data.maxAP.lArm > 0) {
      armor["protectslArm"] = true;
      AP.lArm.value += armor.data.currentAP.lArm;
      WFRP_Utility.addLayer(AP, armor, "lArm")
    }
    if (armor.data.maxAP.rArm > 0) {
      armor["protectsrArm"] = true;
      AP.rArm.value += armor.data.currentAP.rArm;
      WFRP_Utility.addLayer(AP, armor, "rArm")
    }
    if (armor.data.maxAP.lLeg > 0) {
      armor["protectslLeg"] = true;
      AP.lLeg.value += armor.data.currentAP.lLeg;
      WFRP_Utility.addLayer(AP, armor, "lLeg")
    }
    if (armor.data.maxAP.rLeg > 0) {
      armor["protectsrLeg"] = true
      AP.rLeg.value += armor.data.currentAP.rLeg;
      WFRP_Utility.addLayer(AP, armor, "rLeg")
    }
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
  prepareWeaponWithAmmo(weapon) {
    // Find the current ammo equipped to the weapon, if none, return
    let ammo = weapon.ammo.find(a => a._id == weapon.data.currentAmmo.value);
    if (!ammo)
      return;

    let ammoProperties = WFRP_Utility._prepareQualitiesFlaws(ammo);
    // If ammo properties include a "special" value, rename the property as "Special Ammo" to not overlap
    // with the weapon's "Special" property
    let specialPropInd = ammoProperties.indexOf(ammoProperties.find(p => p && p.toLowerCase() == game.i18n.localize("Special").toLowerCase()));
    if (specialPropInd != -1)
      ammoProperties[specialPropInd] = game.i18n.localize("Special Ammo")

    let ammoRange = ammo.data.range.value || "0";
    let ammoDamage = ammo.data.damage.value || "0";

    // If range modification was handwritten, process it
    if (ammoRange.toLowerCase() == "as weapon") { }
    // Do nothing to weapon's range
    else if (ammoRange.toLowerCase() == "half weapon")
      weapon.data.range.value /= 2;
    else if (ammoRange.toLowerCase() == "third weapon")
      weapon.data.range.value /= 3;
    else if (ammoRange.toLowerCase() == "quarter weapon")
      weapon.data.range.value /= 4;
    else if (ammoRange.toLowerCase() == "twice weapon")
      weapon.data.range.value *= 2;
    else // If the range modification is a formula (supports +X -X /X *X)
    {
      try // Works for + and -
      {
        ammoRange = eval(ammoRange);
        weapon.data.range.value = Math.floor(eval(weapon.data.range.value + ammoRange));
      }
      catch // if *X and /X
      {                                      // eval (50 + "/5") = eval(50/5) = 10
        weapon.data.range.value = Math.floor(eval(weapon.data.range.value + ammoRange));
      }
    }

    try // Works for + and -
    {
      ammoDamage = eval(ammoDamage);
      weapon.data.damage.value = Math.floor(eval(weapon.data.damage.value + ammoDamage));
    }
    catch // if *X and /X
    {                                      // eval (5 + "*2") = eval(5*2) = 10
      weapon.data.damage.value = Math.floor(eval(weapon.data.damage.value + ammoDamage)); // Eval throws exception for "/2" for example. 
    }

    // The following code finds qualities or flaws of the ammo that add to the weapon's qualities
    // Example: Blast +1 should turn a weapon's Blast 4 into Blast 5
    ammoProperties = ammoProperties.filter(p => p != undefined);
    let propertyChange = ammoProperties.filter(p => p.includes("+") || p.includes("-")); // Properties that increase or decrease another (Blast +1, Blast -1)

    // Normal properties (Impale, Penetrating) from ammo that need to be added to the equipped weapon
    let propertiesToAdd = ammoProperties.filter(p => !(p.includes("+") || p.includes("-")));


    for (let change of propertyChange) {
      // Using the example of "Blast +1" to a weapon with "Blast 3"
      let index = change.indexOf(" ");
      let property = change.substring(0, index).trim();   // "Blast"
      let value = change.substring(index, change.length); // "+1"

      if (weapon.properties.find(p => p.includes(property))) // Find the "Blast" quality in the main weapon
      {
        let basePropertyIndex = weapon.properties.findIndex(p => p.includes(property))
        let baseValue = weapon.properties[basePropertyIndex].split(" ")[1]; // Find the Blast value of the weapon (3)
        let newValue = eval(baseValue + value) // Assign the new value of Blast 4

        weapon.properties[basePropertyIndex] = `${property} ${newValue}`; // Replace old Blast
      }
      else // If the weapon does not have the Blast quality to begin with
      {
        propertiesToAdd.push(property + " " + Number(value)); // Add blast as a new quality (Blast 1)
      }
    }
    // Add the new Blast property to the rest of the qualities the ammo adds to the weapon
    weapon.properties = weapon.properties.concat(propertiesToAdd);
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
    // Turns targets and duration into a number - (e.g. Willpower Bonus allies -> 4 allies, Willpower Bonus Rounds -> 4 rounds, Willpower Yards -> 46 yards)
    item['target'] = this.calculateSpellAttributes(item.data.target.value, item.data.target.aoe);
    item['duration'] = this.calculateSpellAttributes(item.data.duration.value);
    item['range'] = this.calculateSpellAttributes(item.data.range.value);

    item.overcasts = {
      available: 0,
      range: undefined,
      duration: undefined,
      target: undefined,
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

    // Add the + to the duration if it's extendable
    if (item.data.duration.extendable)
      item.duration += "+";

    // Calculate the damage different if it's a Magic Misile spell versus a prayer
    if (item.type == "spell")
      item['damage'] = this.calculateSpellDamage(item.data.damage.value, item.data.magicMissile.value);
    else
      item['damage'] = this.calculateSpellDamage(item.data.damage.value, false);

    // If it's a spell, augment the description (see _spellDescription() and CN based on memorization) 
    if (item.type == "spell") {
      item.data.description.value = WFRP_Utility._spellDescription(item);
      if (!item.data.memorized.value)
        item.data.cn.value *= 2;
    }

    return item;
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
    let actorData = this.data
    formula = formula.toLowerCase();

    // Do not process these special values
    if (formula != game.i18n.localize("You").toLowerCase() && formula != game.i18n.localize("Special").toLowerCase() && formula != game.i18n.localize("Instant").toLowerCase()) {
      // Iterate through characteristics
      for (let ch in actorData.data.characteristics) {
        // If formula includes characteristic name
        if (formula.includes(WFRP4E.characteristics[ch].toLowerCase())) {
          // Determine if it's looking for the bonus or the value
          if (formula.includes('bonus'))
            formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase().concat(" bonus"), actorData.data.characteristics[ch].bonus);
          else
            formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase(), actorData.data.characteristics[ch].value);
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
    let actorData = this.data
    formula = formula.toLowerCase();

    if (isMagicMissile) // If it's a magic missile, damage includes willpower bonus
    {
      formula += "+ willpower bonus"
    }

    // Iterate through characteristics
    for (let ch in actorData.data.characteristics) {
      // If formula includes characteristic name
      while (formula.includes(game.i18n.localize(actorData.data.characteristics[ch].label).toLowerCase())) {
        // Determine if it's looking for the bonus or the value
        if (formula.includes('bonus'))
          formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase().concat(" bonus"), actorData.data.characteristics[ch].bonus);
        else
          formula = formula.replace(WFRP4E.characteristics[ch].toLowerCase(), actorData.data.characteristics[ch].value);
      }
    }

    return eval(formula);
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
  calculateArmorPenalties(armorList) {
    let armorPenaltiesString = "";

    // Armor type penalties do not stack, only apply if you wear any of that type
    let wearingMail = false;
    let wearingPlate = false;

    for (let a of armorList) {
      // For each armor, apply its specific penalty value, as well as marking down whether
      // it qualifies for armor type penalties (wearingMail/Plate)
      armorPenaltiesString += a.data.penalty.value + " ";
      if (a.data.armorType.value == "mail")
        wearingMail = true;
      if (a.data.armorType.value == "plate")
        wearingPlate = true;
    }

    // Apply armor type penalties at the end
    if (wearingMail || wearingPlate) {
      let stealthPenaltyValue = 0;
      if (wearingMail)
        stealthPenaltyValue += -10;
      if (wearingPlate)
        stealthPenaltyValue += -10;
      // Add the penalties together to reduce redundancy
      armorPenaltiesString += (stealthPenaltyValue + ` ${game.i18n.localize("NAME.Stealth")}`);
    }
    return armorPenaltiesString;
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
  calculateRangeOrDamage(formula) {
    let actorData = this.data
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
    let hardies = this.data.items.filter(t => (t.type == "trait" || t.type == "talent") && t.name.toLowerCase().includes(game.i18n.localize("NAME.Hardy").toLowerCase()))
    let traits = this.data.items.filter(t => t.type == "trait")

    let tbMultiplier = hardies.length

    tbMultiplier += hardies.filter(h => h.type == "talent").reduce((extra, talent) => extra + talent.data.advances.value - 1, 0) // Add extra advances if some of the talents had multiple advances (rare, usually there are multiple talent items, not advances)


    // Easy to reference bonuses
    let sb = this.data.data.characteristics.s.bonus;
    let tb = this.data.data.characteristics.t.bonus;
    let wpb = this.data.data.characteristics.wp.bonus;

    if (this.data.flags.autoCalcCritW)
      this.data.data.status.criticalWounds.max = tb;

    let wounds = this.data.data.status.wounds.max;

    if (this.data.flags.autoCalcWounds) {
      // Construct trait means you use SB instead of WPB 
      if (traits.find(t => t.name.toLowerCase().includes(game.i18n.localize("NAME.Construct").toLowerCase()) || traits.find(t => t.name.toLowerCase().includes(game.i18n.localize("NAME.Mindless").toLowerCase()))))
        wpb = sb;
      switch (this.data.data.details.size.value) // Use the size to get the correct formula (size determined in prepare())
      {
        case "tiny":
          wounds = 1 + tb * tbMultiplier;
          break;

        case "ltl":
          wounds = tb + tb * tbMultiplier;
          break;

        case "sml":
          wounds = 2 * tb + wpb + tb * tbMultiplier;
          break;

        case "avg":
          wounds = sb + 2 * tb + wpb + tb * tbMultiplier;
          break;

        case "lrg":
          wounds = 2 * (sb + 2 * tb + wpb + tb * tbMultiplier);
          break;

        case "enor":
          wounds = 4 * (sb + 2 * tb + wpb + tb * tbMultiplier);
          break;

        case "mnst":
          wounds = 8 * (sb + 2 * tb + wpb + tb * tbMultiplier);
          break;
      }
    }

    let swarmTrait = traits.find(t => t.name.toLowerCase().includes(game.i18n.localize("NAME.Swarm").toLowerCase()))
    if (swarmTrait)
      wounds *= 5;


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
  static applyDamage(victim, opposeData, damageType = WFRP4E.DAMAGE_TYPE.NORMAL) {
    if (!opposeData.damage)
      return `<b>Error</b>: ${game.i18n.localize("CHAT.DamageAppliedError")}`
    // If no damage value, don't attempt anything
    if (!opposeData.damage.value)
      return game.i18n.localize("CHAT.DamageAppliedErrorTiring");

    // Get actor/tokens for those in the opposed test
    let actor = WFRP_Utility.getSpeaker(victim);
    let attacker = WFRP_Utility.getSpeaker(opposeData.speakerAttack)
    let soundContext = { item: {}, action: "hit" };

    // Start wound loss at the damage value
    let totalWoundLoss = opposeData.damage.value
    let newWounds = actor.data.data.status.wounds.value;
    let applyAP = (damageType == WFRP4E.DAMAGE_TYPE.IGNORE_TB || damageType == WFRP4E.DAMAGE_TYPE.NORMAL)
    let applyTB = (damageType == WFRP4E.DAMAGE_TYPE.IGNORE_AP || damageType == WFRP4E.DAMAGE_TYPE.NORMAL)
    let AP = {};

    // Start message update string
    let updateMsg = `<b>${game.i18n.localize("CHAT.DamageApplied")}</b><span class = 'hide-option'>: @TOTAL`;
    if (damageType != WFRP4E.DAMAGE_TYPE.IGNORE_ALL)
      updateMsg += " ("

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
      updateMsg += actor.data.data.characteristics.t.bonus + " TB"
    }

    // If the actor has the Robust talent, reduce damage by times taken
    totalWoundLoss -= actor.data.flags.robust || 0;

    if (actor.data.flags.robust)
      updateMsg += ` + ${actor.data.flags.robust} Robust`

    if (applyAP) {
      AP = actor.prepareItems().AP[opposeData.hitloc.value]
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
        updateMsg += ` + ${AP.used}/${AP.value} ${game.i18n.localize("AP")}`
      else
        updateMsg += ` + ${AP.used} ${game.i18n.localize("AP")}`

      // If using a shield, add that AP as well
      let shieldAP = 0;
      if (opposeData.defenderTestResult.weapon) {
        if (opposeData.defenderTestResult.weapon.properties.qualities.find(q => q.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase())))
          shieldAP = Number(opposeData.defenderTestResult.weapon.properties.qualities.find(q => q.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase())).split(" ")[1]);
      }

      if (shieldAP)
        updateMsg += ` + ${shieldAP} ${game.i18n.localize("CHAT.DamageShield")})`
      else
        updateMsg += ")"

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
    else updateMsg += ")"

    newWounds -= totalWoundLoss

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
      updateMsg += `<br>${game.i18n.localize("CHAT.DamageAP")} ${WFRP4E.locations[opposeData.hitloc.value]}`

    if (newWounds <= 0)
      newWounds = 0; // Do not go below 0 wounds


    updateMsg += "</span>"
    updateMsg = updateMsg.replace("@TOTAL", totalWoundLoss)

    // Update actor wound value
    actor.update({ "data.status.wounds.value": newWounds })
    return updateMsg;
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
      skillList = WFRP4E.speciesSkills[this.data.data.details.species.value];
      if (!skillList) {
        // findKey() will do an inverse lookup of the species key in the species object defined in config.js, and use that if 
        // user-entered species value does not work (which it probably will not)
        skillList = WFRP4E.speciesSkills[WFRP_Utility.findKey(this.data.data.details.species.value, WFRP4E.species)]
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
      talentList = WFRP4E.speciesTalents[this.data.data.details.species.value];
      if (!talentList) {
        // findKey() will do an inverse lookup of the species key in the species object defined in config.js, and use that if 
        // user-entered species value does not work (which it probably will not)
        talentList = WFRP4E.speciesTalents[WFRP_Utility.findKey(this.data.data.details.species.value, WFRP4E.species)]
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
          let result = WFRP_Tables.rollTable("talents")
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
        new ActorWfrp4e(data.postData.actor)[`${data.postData.postFunction}`]({testData : data.preData, cardOptions});

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
        new ActorWfrp4e(data.postData.actor)[`${data.postData.postFunction}`]({testData : newTestData, cardOptions}, {rerenderMessage : message});
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
    new ActorWfrp4e(data.postData.actor)[`${data.postData.postFunction}`]({testData : data.preData, cardOptions});
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
      title: "Corrupting Influence",
      content: `<p>How does ${this.name} resist this corruption?`,
      buttons: {
        endurance: {
          label: game.i18n.localize("NAME.Endurance"),
          callback: () => {
            let skill = this.items.find(i => i.name == game.i18n.localize("NAME.Endurance") && i.type == "skill")
            if (skill) {
              this.setupSkill(skill.data, { corruption: strength }).then(setupData => this.basicTest(setupData))
            }
            else {
              this.setupCharacteristic("t", { corruption: strength }).then(setupData => this.basicTest(setupData))
            }
          }
        },
        cool: {
          label: game.i18n.localize("NAME.Cool"),
          callback: () => {
            let skill = this.items.find(i => i.name == game.i18n.localize("NAME.Cool") && i.type == "skill")
            if (skill) {
              this.setupSkill(skill.data, { corruption: strength }).then(setupData => this.basicTest(setupData))
            }
            else {
              this.setupCharacteristic("wp", { corruption: strength }).then(setupData => this.basicTest(setupData))
            }
          }
        }

      }
    }).render(true)
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
        this.setupSkill(skill.data, { mutate: true }).then(setupData => {
          this.basicTest(setupData)
        });
      }
      else {
        this.setupCharacteristic("t", { mutate: true }).then(setupData => {
          this.basicTest(setupData)
        });
      }
    }
  }

  async handleMutationResult(testResult) {
    let failed = testResult.target < testResult.roll;

    if (failed) {
      let wpb = this.data.data.characteristics.wp.bonus;
      let tableText = "Roll on a Corruption Table:<br>" + WFRP4E.corruptionTables.map(t => `@Table[${t}]<br>`).join("")
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

  
  async handleExtendedTest(testResult) {
    let test = duplicate(this.getEmbeddedEntity("OwnedItem", testResult.options.extended));

    if(game.settings.get("wfrp4e", "extendedTests") && testResult.SL == 0)
      testResult.SL = testResult.roll <= testResult.target ? 1 : -1 

    if (test.data.failingDecreases.value)
    {
      test.data.SL.current += Number(testResult.SL)
      if (!test.data.negativePossible.value && test.data.SL.current < 0)
        test.data.SL.current = 0;
    }
    else if(testResult.SL > 0)
      test.data.SL.current += Number(testResult.SL)

    
    testResult.other.push(`${test.name} ${test.data.SL.current} / ${test.data.SL.target} SL`)
    
    this.updateEmbeddedEntity("OwnedItem", test);
  }



}