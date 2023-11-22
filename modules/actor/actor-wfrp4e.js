import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP_Audio from "../system/audio-wfrp4e.js";
import RollDialog from "../apps/roll-dialog.js";
import { EffectWfrp4eV2 } from "../system/effect-v2.js";
import WFRP4eDocumentMixin from "./mixin.js"
import AreaHelpers from "../system/area-helpers.js";
import CharacteristicDialog from "../apps/roll-dialog/characteristic-dialog.js";
import CharacteristicTest from "../system/rolls/characteristic-test.js";
import SkillDialog from "../apps/roll-dialog/skill-dialog.js";
import SkillTest from "../system/rolls/skill-test.js";
import WeaponDialog from "../apps/roll-dialog/weapon-dialog.js";
import WeaponTest from "../system/rolls/weapon-test.js";
import CastDialog from "../apps/roll-dialog/cast-dialog.js";
import ChannellingDialog from "../apps/roll-dialog/channelling-dialog.js";
import ChannelTest from "../system/rolls/channel-test.js";
import TraitDialog from "../apps/roll-dialog/trait-dialog.js";
import TraitTest from "../system/rolls/trait-test.js";

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

    if (data._id)
      options.keepId = WFRP_Utility._keepID(data._id, this)


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
    if (game.user.id != user) {
      return
    }


    await super._onUpdate(data, options, user);
    this.runScripts("update", {})
    // this.system.checkSize();
  }

  async _onCreate(data, options, user) {
    if (game.user.id != user) {
      return
    }

    await super._onCreate(data, options, user);
    this.runScripts("update", {})
    // this.system.checkSize();
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
1


  get conditions() {
    return this.effects.filter(e => e.isCondition)
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
  async setupDialog({ dialogOptions, testData, cardOptions }, type) {
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

    testData.targets = Array.from(game.user.targets).map(t => t.document.actor.speakerData(t.document))
    if (canvas.scene) {
      game.user.updateTokenTargets([]);
      game.user.broadcastActivity({ targets: [] });
    }
    testData.speaker = this.speakerData();

    if (!testData.options.bypass) {
      // Render Test Dialog
      let html = await renderTemplate(dialogOptions.template, dialogOptions.data);

      return new Promise((resolve, reject) => {
        new RollDialog(
          {
            title: dialogOptions.title,
            content: html,
            actor: this,
            testData,
            buttons:
            {
              rollButton:
              {
                label: game.i18n.localize("Roll"),
                callback: html => resolve(dialogOptions.callback(html))
              }
            },
            default: "rollButton"
          }).render(true, {type});
      })
    }
    else if (testData.options.bypass) {
      testData.testModifier = testData.options.testModifier || testData.testModifier
      testData.slBonus = testData.options.slBonus || testData.slBonus
      testData.successBonus = testData.options.successBonus || testData.successBonus
      cardOptions.rollMode = testData.options.rollMode || rollMode
      testData.rollMode = cardOptions.rollMode
      testData.cardOptions = cardOptions;
      return new testData.rollClass(testData)
    }
    reject()
  }


  _setupTest(dialogData, dialogClass, testClass)
  {
    dialogData.data.targets = Array.from(game.user.targets);
    dialogData.fields.advantage = this.system.status.advantage.value;
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
  async  setupCharacteristic(characteristic, options = {}) {
    dialogData = {
      fields : options.fields,  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        characteristic,
      },    
      options : options         // Application/optional properties
    }
    // TODO: handle abort
    this._setupTest(dialogData, CharacteristicDialog, CharacteristicTest)

    // let testData = {
    //   title,
    //   rollClass: game.wfrp4e.rolls.CharacteristicTest,
    //   item: characteristicId,
    //   hitLocation: ((characteristicId == "ws" || characteristicId == "bs") && !options.reload) ? "roll" : "none", // Default a WS or BS test to have hit location
    //   options: options,
    //   postFunction: "basicTest",
    //   hitLocationTable : game.wfrp4e.tables.getHitLocTable(game.user.targets.values().next().value?.actor.details.hitLocationTable.value || "hitloc"),
    //   deadeyeShot : this.has(game.i18n.localize("NAME.DeadeyeShot"), "talent") && characteristicId == "bs"
    // };

    // mergeObject(testData, await this.getPrefillData("characteristic", characteristicId, options))

    // // Setup dialog data: title, template, buttons, prefilled data
    // let dialogOptions = {
    //   title: title,
    //   template: "/systems/wfrp4e/templates/dialog/characteristic-dialog.hbs",
    //   // Prefilled dialog data
    //   data: {
    //     hitLocation: testData.hitLocation,
    //     advantage: this.status.advantage.value || 0,
    //     talents: this.getTalentTests(),
    //     rollMode: options.rollMode,
    //     dialogEffects: this.getDialogChoices()
    //   },
    //   callback: (html) => {
    //     // When dialog confirmed, fill testData dialog information
    //     // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
    //     cardOptions.rollMode = html.find('[name="rollMode"]').val();
    //     testData.rollMode = cardOptions.rollMode;
    //     testData.testModifier = Number(html.find('[name="testModifier"]').val());
    //     testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
    //     testData.successBonus = Number(html.find('[name="successBonus"]').val());
    //     testData.slBonus = Number(html.find('[name="slBonus"]').val());
    //     testData.hitLocation = html.find('[name="selectedHitLocation"]').val();
    //     testData.cardOptions = cardOptions;
    //     return new testData.rollClass(testData);
    //   }
    // };

    // // Call the universal cardOptions helper
    // let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/characteristic-card.hbs", title)

    // // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    // return await this.setupDialog({
    //   dialogOptions: dialogOptions,
    //   testData: testData,
    //   cardOptions: cardOptions
    // });
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

    dialogData = {
      fields : options.fields,  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        skill
      },    
      options : options         // Application/optional properties
    }

    this._setupTest(dialogData, SkillDialog, SkillTest)

    // let testData = {
    //   title,
    //   rollClass: game.wfrp4e.rolls.SkillTest,
    //   income: options.income,
    //   item: skill.id,
    //   skillName : skill.name,
    //   options: options,
    //   postFunction: "basicTest",
    //   hitLocationTable : game.wfrp4e.tables.getHitLocTable(game.user.targets.values().next().value?.actor.details.hitLocationTable.value || "hitloc"),
    //   deadeyeShot : this.has(game.i18n.localize("NAME.DeadeyeShot"), "talent") && skill.characteristic.key == "bs"
    // };

    // mergeObject(testData, await this.getPrefillData("skill", skill, options))

    // // Default a WS, BS, Melee, or Ranged to have hit location checked
    // if ((skill.characteristic.key == "ws" ||
    //   skill.characteristic.key == "bs" ||
    //   skill.name.includes(game.i18n.localize("NAME.Melee")) ||
    //   skill.name.includes(game.i18n.localize("NAME.Ranged")))
    //   && !options.reload) {
    //   testData.hitLocation = "roll";
    // }
    // else 
    //   testData.hitLocation = "none"

    // // Setup dialog data: title, template, buttons, prefilled data
    // let dialogOptions = {
    //   title: title,
    //   template: "/systems/wfrp4e/templates/dialog/skill-dialog.hbs",
    //   // Prefilled dialog data

    //   data: {
    //     hitLocation: testData.hitLocation, // Empty string = "roll"
    //     advantage: this.status.advantage.value || 0,
    //     talents: this.getTalentTests(),
    //     characteristicToUse: skill.characteristic.key,
    //     rollMode: options.rollMode,
    //     dialogEffects: this.getDialogChoices()
    //   },
    //   callback: (html) => {
    //     // When dialog confirmed, fill testData dialog information
    //     // Note that this does not execute until this.setupDialog() has finished and the user confirms the dialog
    //     cardOptions.rollMode = html.find('[name="rollMode"]').val();
    //     testData.rollMode = cardOptions.rollMode;
    //     testData.testModifier = Number(html.find('[name="testModifier"]').val());
    //     testData.testDifficulty = game.wfrp4e.config.difficultyModifiers[html.find('[name="testDifficulty"]').val()];
    //     testData.successBonus = Number(html.find('[name="successBonus"]').val());
    //     testData.slBonus = Number(html.find('[name="slBonus"]').val());
    //     testData.characteristicToUse = html.find('[name="characteristicToUse"]').val();
    //     testData.hitLocation = html.find('[name="selectedHitLocation"]').val();
    //     testData.cardOptions = cardOptions;
    //     return new testData.rollClass(testData);
    //   }
    // };
    // // Call the universal cardOptions helper
    // let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/skill-card.hbs", title)
    // if (options.corruption)
    //   cardOptions.rollMode = "gmroll"

    // // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    // return await this.setupDialog({
    //   dialogOptions: dialogOptions,
    //   testData: testData,
    //   cardOptions: cardOptions
    // });
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

    dialogData = {
      fields : options.fields,  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        weapon
      },    
      options : options         // Application/optional properties
    }

    this._setupTest(dialogData, WeaponDialog, WeaponTest)


    // let skillCharList = []; // This array is for the different options available to roll the test (Skills and characteristics)
    // let title = options.title || game.i18n.localize("WeaponTest") + " - " + weapon.name;
    // title += options.appendTitle || "";

    // if (!weapon.id)
    //   weapon = new CONFIG.Item.documentClass(weapon, { parent: this })

    // let testData = {
    //   title,
    //   rollClass: game.wfrp4e.rolls.WeaponTest,
    //   hitLocation: "roll",
    //   item: weapon.id || weapon.toObject(), // Store item data directly if unowned item (system item like unarmed)
    //   charging: options.charging || false,
    //   champion: !!this.has(game.i18n.localize("NAME.Champion")),
    //   riposte: !!this.has(game.i18n.localize("NAME.Riposte"), "talent"),
    //   infighter: !!this.has(game.i18n.localize("NAME.Infighter"), "talent"),
    //   resolute: this.flags.resolute || 0,
    //   options: options,
    //   postFunction: "weaponTest",
    //   hitLocationTable : game.wfrp4e.tables.getHitLocTable(game.user.targets.values().next().value?.actor.details.hitLocationTable.value || "hitloc"),
    //   deadeyeShot : this.has(game.i18n.localize("NAME.DeadeyeShot"), "talent") && weapon.attackType == "ranged",
    //   strikeToStun : this.has(game.i18n.localize("NAME.StrikeToStun"), "talent") && weapon.properties.qualities.pummel
    // };



    // if (weapon.attackType == "melee")
    //   skillCharList.push({ char: true, key: "ws", name: game.i18n.localize("CHAR.WS") })

    // else if (weapon.attackType == "ranged") {
    //   // If Ranged, default to Ballistic Skill, but check to see if the actor has the specific skill for the weapon
    //   skillCharList.push({ char: true, key: "bs", name: game.i18n.localize("CHAR.BS") })
    //   if (weapon.consumesAmmo.value && weapon.ammunitionGroup.value != "none" && weapon.ammunitionGroup.value) {
    //     // Check to see if they have ammo if appropriate
    //     if (options.ammo)
    //       testData.ammo = options.ammo.find(a => a.id == weapon.currentAmmo.value)
    //     if (!testData.ammo)
    //       testData.ammo = this.items.get(weapon.currentAmmo.value)

    //     if (!testData.ammo || !weapon.currentAmmo.value || testData.ammo.quantity.value == 0) {
    //       AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
    //       ui.notifications.error(game.i18n.localize("ErrorNoAmmo"))
    //       return
    //     }

    //   }
    //   else if (weapon.consumesAmmo.value && weapon.quantity.value == 0) {
    //     // If this executes, it means it uses its own quantity for ammo (e.g. throwing), which it has none of
    //     AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
    //     ui.notifications.error(game.i18n.localize("ErrorNoAmmo"))
    //     return;
    //   }
    //   else {
    //     // If this executes, it means it uses its own quantity for ammo (e.g. throwing)
    //     testData.ammo = weapon;
    //   }


    //   if (weapon.loading && !weapon.loaded.value) {
    //     await this.rollReloadTest(weapon)
    //     ui.notifications.notify(game.i18n.localize("ErrorNotLoaded"))
    //     return ({ abort: true })
    //   }
    // }

    // let defaultSelection // The default skill/characteristic being used

    // let skillToUse = weapon.system.getSkillToUse(this)
    // if (skillToUse) {
    //   // If the actor has the appropriate skill, default to that.
    //   skillCharList.push(skillToUse)
    //   defaultSelection = skillCharList.findIndex(i => i.name == skillToUse.name)
    // }

    // mergeObject(testData, await this.getPrefillData("weapon", weapon, options))

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/weapon-dialog.hbs",
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
        testData.hitLocation = html.find('[name="selectedHitLocation"]').val();
        testData.cardOptions = cardOptions;
        
        if (this.isMounted && testData.charging) {
          cardOptions.title += " (Mounted)"
        }
        
        testData.skillSelected = skillCharList[Number(html.find('[name="skillSelected"]').val())];
        
        return new testData.rollClass(testData);
      }

    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/weapon-card.hbs", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return await this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    }, "weapon");
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

    dialogData = {
      fields : options.fields,  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        spell,
      },    
      options : options         // Application/optional properties
    }

    this._setupTest(dialogData, CastDialog, game.settings.get("wfrp4e", "useWoMOvercast") ? game.wfrp4e.rolls.WomCastTest : game.wfrp4e.rolls.CastTest,)

    // let title = options.title || game.i18n.localize("CastingTest") + " - " + spell.name;
    // title += options.appendTitle || "";

    // // castSkill array holds the available skills/characteristics to cast with - Casting: Intelligence
    // let castSkills = [{ char: true, key: "int", name: game.i18n.localize("CHAR.Int") }]

    // // if the actor has Language (Magick), add it to the array.
    // let skill = spell.skillToUse
    // if (skill)
    //   castSkills.push(skill)

    // // Default to Language Magick if it exists
    // let defaultSelection = castSkills.findIndex(i => i.name == spell.skillToUse?.name)

    // // Prepare the spell to have the complete data object, including damage values, range values, CN, etc.
    // let testData = {
    //   title,
    //   rollClass: game.settings.get("wfrp4e", "useWoMOvercast") ? game.wfrp4e.rolls.WomCastTest : game.wfrp4e.rolls.CastTest,
    //   item: spell.id,
    //   malignantInfluence: false,
    //   options: options,
    //   postFunction: "castTest"
    // };


    // // If the spell does damage, default the hit location to checked
    // if (spell.damage.value)
    //   testData.hitLocation = true;

    // mergeObject(testData, await this.getPrefillData("cast", spell, options))


    //@HOUSE
    testData.unofficialGrimoire = game.settings.get("wfrp4e", "unofficialgrimoire");
    let advantages = this.status.advantage.value || 0;
    if (testData.unofficialGrimoire) {
      game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
      advantages = "N/A";
    } else {
      this.status.advantage.value || 0
    }
    //@HOUSE

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/spell-dialog.hbs",
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation,
        malignantInfluence: testData.malignantInfluence,
        talents: this.getTalentTests(),
        advantage: advantages,
        defaultSelection: defaultSelection,
        castSkills: castSkills,
        rollMode: options.rollMode,
        unofficialGrimoire: testData.unofficialGrimoire,
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
        if (testData.unofficialGrimoire) {
          game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
          testData.unofficialGrimoire = {}
          testData.unofficialGrimoire.ingredientMode = html.find('[name="ingredientTypeSelected"]').val();
          testData.unofficialGrimoire.overchannelling = Number(html.find('[name="overchannelling"]').val());
          testData.unofficialGrimoire.quickcasting = html.find('[name="quickcasting"]').is(':checked');
        }
        testData.skillSelected = castSkills[Number(html.find('[name="skillSelected"]').val())];
        testData.hitLocation = html.find('[name="hitLocation"]').is(':checked');
        testData.malignantInfluence = html.find('[name="malignantInfluence"]').is(':checked');
        testData.cardOptions = cardOptions;
        return new testData.rollClass(testData);
      }
    };

    //@HOUSE
    if (game.settings.get("wfrp4e", "mooMagicAdvantage")) {
      game.wfrp4e.utility.logHomebrew("mooMagicAdvantage")
      dialogOptions.data.advantage = "N/A"
    }
    //@/HOUSE

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/spell-card.hbs", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return await this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    }, "cast");
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

    dialogData = {
      fields : options.fields,  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        spell,
      },    
      options : options         // Application/optional properties
    }

    this._setupTest(dialogData, ChannellingDialog, ChannelTest)

    // let title = options.title || game.i18n.localize("ChannellingTest") + " - " + spell.name;
    // title += options.appendTitle || "";

    // channellSkills array holds the available skills/characteristics to  with - Channelling: Willpower
    let channellSkills = [{ char: true, key: "wp", name: game.i18n.localize("CHAR.WP") }]

    // if the actor has any channel skills, add them to the array.
    let skills = this.itemTypes["skill"].filter(i => i.name.toLowerCase().includes(game.i18n.localize("NAME.Channelling").toLowerCase()))
    if (skills.length)
      channellSkills = channellSkills.concat(skills)

    // Find the spell lore, and use that to determine the default channelling selection
    let spellLore = spell.lore.value;
    let defaultSelection
    if (spell.wind && spell.wind.value) {
      defaultSelection = channellSkills.indexOf(channellSkills.find(x => x.name.includes(spell.wind.value)))
      if (defaultSelection == -1) {
        let customChannellSkill = this.itemTypes["skill"].find(i => i.name.toLowerCase() == spell.wind.value.toLowerCase());
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
      channelUntilSuccess: false,
      options: options,
      postFunction: "channelTest"
    };

    mergeObject(testData, await this.getPrefillData("channelling", spell, options))
    testData.unofficialGrimoire = game.settings.get("wfrp4e", "unofficialgrimoire");

    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/channel-dialog.hbs",
      // Prefilled dialog data
      data: {
        malignantInfluence: testData.malignantInfluence,
        channellSkills: channellSkills,
        defaultSelection: defaultSelection,
        talents: this.getTalentTests(),
        advantage: "N/A",
        rollMode: options.rollMode,
        unofficialGrimoire: testData.unofficialGrimoire,
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
        if (testData.unofficialGrimoire) {
          game.wfrp4e.utility.logHomebrew("unofficialgrimoire");
          testData.unofficialGrimoire = {};
          testData.unofficialGrimoire.ingredientMode = html.find('[name="ingredientTypeSelected"]').val();
        }
        testData.malignantInfluence = html.find('[name="malignantInfluence"]').is(':checked');
        testData.channelUntilSuccess = html.find('[name="channelUntilSuccess"]').is(':checked');
        testData.skillSelected = channellSkills[Number(html.find('[name="skillSelected"]').val())];
        testData.cardOptions = cardOptions;
        return new testData.rollClass(testData);
      }
    };

    //@HOUSE
    if (game.settings.get("wfrp4e", "mooMagicAdvantage")) {
      game.wfrp4e.utility.logHomebrew("mooMagicAdvantage")
      dialogOptions.data.advantage = this.status.advantage.value || 0
    }
    //@/HOUSE

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/channel-card.hbs", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return await this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    }, "channel");
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

    dialogData = {
      fields : options.fields,  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        prayer,
      },    
      options : options         // Application/optional properties
    }

    this._setupTest(dialogData, ChannellingDialog, ChannelTest)


    // let title = options.title || game.i18n.localize("PrayerTest") + " - " + prayer.name;
    // title += options.appendTitle || "";

    // ppraySkills array holds the available skills/characteristics to pray with - Prayers: Fellowship
    let praySkills = [{ char: true, key: "fel", name: game.i18n.localize("CHAR.Fel") }]

    // if the actor has the Pray skill, add it to the array.
    let skill = this.itemTypes["skill"].find(i => i.name.toLowerCase() == game.i18n.localize("NAME.Pray").toLowerCase());
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


    mergeObject(testData, await this.getPrefillData("prayer", prayer, options))


    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/prayer-dialog.hbs",
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
        testData.cardOptions = cardOptions;
        return new testData.rollClass(testData);
      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/prayer-card.hbs", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return await this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    }, "prayer");
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

    dialogData = {
      fields : options.fields,  // Fields are data properties in the dialog template
      data : {                  // Data is internal dialog data
        trait,
      },    
      options : options         // Application/optional properties
    }

    this._setupTest(dialogData, TraitDialog, TraitTest)

    if (!trait.id)
      trait = new CONFIG.Item.documentClass(trait, { parent: this })

    if (!trait.rollable.value)
      return ui.notifications.notify("Non-rollable trait");

    let title = options.title || game.wfrp4e.config.characteristics[trait.rollable.rollCharacteristic] + ` ${game.i18n.localize("Test")} - ` + trait.name;
    title += options.appendTitle || "";

    let skill = this.itemTypes["skill"].find(sk => sk.name == trait.rollable.skill)
    if (skill) {
      title = skill.name + ` ${game.i18n.localize("Test")} - ` + trait.name;
    }
    let testData = {
      title,
      rollClass: game.wfrp4e.rolls.TraitTest,
      item: trait.id || trait.toObject(),  // Store item data directly if unowned item (system item like unarmed)
      hitLocation: false,
      charging: options.charging || false,
      champion: !!this.has(game.i18n.localize("NAME.Champion")),
      options: options,
      postFunction: "traitTest",
      hitLocationTable : game.wfrp4e.tables.getHitLocTable(game.user.targets.values().next().value?.actor.details.hitLocationTable.value || "hitloc"),
      deadeyeShot : this.has(game.i18n.localize("NAME.DeadeyeShot"), "talent") && weapon.attackType == "ranged"
    };


    // Default hit location checked if the rollable trait's characteristic is WS or BS
    if (trait.rollable.rollCharacteristic == "ws" || trait.rollable.rollCharacteristic == "bs")
      testData.hitLocation = "roll";
    else 
      testData.hitLocation = "none"

    mergeObject(testData, await this.getPrefillData("trait", trait, options))


    // Setup dialog data: title, template, buttons, prefilled data
    let dialogOptions = {
      title: title,
      template: "/systems/wfrp4e/templates/dialog/skill-dialog.hbs", // Reuse skill dialog
      // Prefilled dialog data
      data: {
        hitLocation: testData.hitLocation, // Empty string = "roll"
        talents: this.getTalentTests(),
        chargingOption: this.showCharging(trait),
        charging: testData.charging,
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
        testData.charging = html.find('[name="charging"]').is(':checked');
        testData.characteristicToUse = html.find('[name="characteristicToUse"]').val();
        testData.hitLocation = html.find('[name="selectedHitLocation"]').val();
        testData.cardOptions = cardOptions;
        return new testData.rollClass(testData);
      }
    };

    // Call the universal cardOptions helper
    let cardOptions = this._setupCardOptions("systems/wfrp4e/templates/chat/roll/weapon-card.hbs", title)

    // Provide these 3 objects to setupDialog() to create the dialog and assign the roll function
    return await this.setupDialog({
      dialogOptions: dialogOptions,
      testData: testData,
      cardOptions: cardOptions
    }, "trait");
  }


  async setupExtendedTest(item, options = {}) {

    let defaultRollMode = item.hide.test || item.hide.progress ? "gmroll" : "roll"

    if (item.SL.target <= 0)
      return ui.notifications.error(game.i18n.localize("ExtendedError1"))

    options.extended = item.id;
    options.rollMode = defaultRollMode;
    options.hitLocation = false;
    options.absolute = {difficulty : item.system.difficulty.value || "challenging"}

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
        alias: this.token?.name || this.prototypeToken.name,
        actor: this.id,
      },
      title: title,
      template: template,
      flags: { img: this.prototypeToken.randomImg ? this.img : this.prototypeToken.texture.src }
      // img to be displayed next to the name on the test card - if it's a wildcard img, use the actor image
    }

    // If the test is coming from a token sheet
    if (this.token) {
      cardOptions.speaker.alias = this.token.name; // Use the token name instead of the actor name
      cardOptions.speaker.token = this.token.id;
      cardOptions.speaker.scene = canvas.scene.id
      cardOptions.flags.img = this.token.texture.src; // Use the token image instead of the actor image

      if (this.token.hidden) {
        cardOptions.speaker.alias = "???"
        cardOptions.flags.img = "systems/wfrp4e/tokens/unknown.png"
      }
    }
    else // If a linked actor - use the currently selected token's data if the actor id matches
    {
      let speaker = ChatMessage.getSpeaker()
      if (speaker.actor == this.id) {
        let token = speaker.token ? canvas.tokens.get(speaker.token) : null;
        cardOptions.speaker.alias = speaker.alias
        cardOptions.speaker.token = speaker.token
        cardOptions.speaker.scene = speaker.scene
        cardOptions.flags.img = token ? token.document.texture.src : cardOptions.flags.img
        if (token?.document.hidden) {
          cardOptions.speaker.alias = "???"
          cardOptions.flags.img = "systems/wfrp4e/tokens/unknown.png"
        }
      }
    }

    if (this.isMounted && this.mount) {
      cardOptions.flags.mountedImg = this.mount.prototypeToken.texture.src;
      cardOptions.flags.mountedName = this.mount.prototypeToken.name;
    }

    if (VideoHelper.hasVideoExtension(cardOptions.flags.img))
      game.video.createThumbnail(cardOptions.flags.img, { width: 50, height: 50 }).then(img => cardOptions.flags.img = img)

    return cardOptions
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
    let AP = actor.status.armour[opposedTest.result.hitloc.value];

    // Start message update string
    let updateMsg = `<b>${game.i18n.localize("CHAT.DamageApplied")}</b><span class = 'hide-option'>: `;
    let messageElements = []
    let extraMessages = [];
    // if (damageType !=  game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL)
    //   updateMsg += " ("

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

    let args = { actor, attacker, opposedTest, damageType, weaponProperties, applyAP, applyTB, totalWoundLoss, AP, extraMessages }
    await actor.runScripts("preTakeDamage", args)
    await attacker.runScripts("preApplyDamage", args)
    await opposedTest.attackerTest.item?.runScripts("preApplyDamage", args)
    damageType = args.damageType
    applyAP = args.applyAP 
    applyTB = args.applyTB
    totalWoundLoss = args.totalWoundLoss

    // Reduce damage by TB
    if (applyTB) {
      totalWoundLoss -= actor.characteristics.t.bonus
      messageElements.push(`${actor.characteristics.t.bonus} ${game.i18n.localize("TBRed")}`)
    }

    if (applyAP) {
      AP.ignored = 0;

      // Determine its qualities/flaws to be used for damage calculation
      penetrating = weaponProperties?.qualities?.penetrating
      undamaging = weaponProperties?.flaws?.undamaging
      hack = weaponProperties?.qualities?.hack
      impale = weaponProperties?.qualities?.impale
      pummel = weaponProperties?.qualities?.pummel
      zzap = weaponProperties?.qualities?.zzap

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
        else if (zzap && layer.metal) // ignore 1 AP (below) and all metal AP 
        {
            AP.ignored += layer.value
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

      if (zzap) // ignore 1 AP and all metal AP (above)
      {
        AP.ignored += 1
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
      if (game.settings.get("wfrp4e", "uiaShields") && !opposedTest.defenderTest.context.unopposed) // UIA shields don't need to be used, just equipped
      {
        shieldAP = this.status.armour.shield
      }
      else // RAW Shields required the shield to be used
      {
        if (opposedTest.defenderTest.weapon) {
          if (opposedTest.defenderTest.weapon.properties.qualities.shield)
            shieldAP = this.status.armour.shield
        }
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
      catch (e) { WFRP_Utility.log("Sound Context Error: " + e, true) } // Ignore sound errors
    }

    let scriptArgs = { actor, opposedTest, totalWoundLoss, AP, damageType, updateMsg, messageElements, attacker, extraMessages }
    await actor.runScripts("takeDamage", scriptArgs)
    await attacker.runScripts("applyDamage", scriptArgs)
    await opposedTest.attackerTest.item?.runScripts("applyDamage", scriptArgs)
    Hooks.call("wfrp4e:applyDamage", scriptArgs)

    totalWoundLoss = scriptArgs.totalWoundLoss


    newWounds -= totalWoundLoss
    updateMsg += "</span>"
    updateMsg += " " + totalWoundLoss;

    updateMsg += ` (${messageElements.join(" + ")})`

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
      updateMsg += `<br>${game.i18n.localize("CHAT.DamageAP")} ${game.wfrp4e.config.locations[opposedTest.result.hitloc.value]}`

    if (newWounds <= 0)
      newWounds = 0; // Do not go below 0 wounds


    let item = opposedTest.attackerTest.item
    if (item?.properties && item?.properties.qualities.slash && updateMsg.includes("critical-roll"))
    {
      updateMsg += `<br>${game.i18n.format("PROPERTY.SlashAlert", {value : parseInt(item?.properties.qualities.slash.value)})}`
    }


    let daemonicTrait = actor.has(game.i18n.localize("NAME.Daemonic"))
    let wardTrait = actor.has(game.i18n.localize("NAME.Ward"))
    if (daemonicTrait) {
      let daemonicRoll = Math.ceil(CONFIG.Dice.randomUniform() * 10);
      let target = daemonicTrait.specification.value
      // Remove any non numbers
      if (isNaN(target))
        target = target.split("").filter(char => /[0-9]/.test(char)).join("")

      if (Number.isNumeric(target) && daemonicRoll >= parseInt(daemonicTrait.specification.value)) {
        updateMsg = `<span style = "text-decoration: line-through">${updateMsg}</span><br>${game.i18n.format("OPPOSED.Daemonic", { roll: daemonicRoll })}`
        return updateMsg;
      }
      else if (Number.isNumeric(target)) {
        updateMsg += `<br>${game.i18n.format("OPPOSED.DaemonicRoll", { roll: daemonicRoll })}`
      }

    }

    if (wardTrait) {
      let wardRoll = Math.ceil(CONFIG.Dice.randomUniform() * 10);
      let target = wardTrait.specification.value
      // Remove any non numbers
      if (isNaN(target))
        target = target.split("").filter(char => /[0-9]/.test(char)).join("")

      if (Number.isNumeric(target) && wardRoll >= parseInt(wardTrait.specification.value)) {
        updateMsg = `<span style = "text-decoration: line-through">${updateMsg}</span><br>${game.i18n.format("OPPOSED.Ward", { roll: wardRoll })}`
        return updateMsg;
      }
      else if (Number.isNumeric(target)) {
        updateMsg += `<br>${game.i18n.format("OPPOSED.WardRoll", { roll: wardRoll })}`
      }

    }

    if (extraMessages.length > 0)
    {
      updateMsg += `<p>${extraMessages.join(`</p><p>`)}</p>`
    }

    if (totalWoundLoss > 0)
    {
      let damageEffects = opposedTest.attackerTest.item?.damageEffects;
      await actor.applyEffect({effectUuids: damageEffects.map(i => i.uuid), messageId : opposedTest.attackerTest.message.id});
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
  async applyBasicDamage(damage, { damageType = game.wfrp4e.config.DAMAGE_TYPE.NORMAL, minimumOne = true, loc = "body", suppressMsg = false } = {}) {
    let newWounds = this.status.wounds.value;
    let modifiedDamage = damage;
    let applyAP = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let applyTB = (damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP || damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
    let msg = game.i18n.format("CHAT.ApplyDamageBasic", { name: this.prototypeToken.name });


    if (loc == "roll")
    {
      loc = (await game.wfrp4e.tables.rollTable("hitloc")).result
    }

    if (applyAP) {
      modifiedDamage -= this.status.armour[loc].value
      msg += ` (${this.status.armour[loc].value} ${game.i18n.localize("AP")}`
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
    const tokens = this.isToken ? [this.token?.object] : this.getActiveTokens(true);
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
                let effect = fromUuidSync(uuid);
                let message = game.messages.get(messageId);
                await ActiveEffect.implementation.create(effect.convertToApplied(), {parent: this, message : message?.id});
            }
            for(let data of effectData)
            {
                await ActiveEffect.implementation.create(data, {parent: this, message : messageId});
            }
        }   
        else 
        {
            SocketHandlers.executeOnOwner(this, "applyEffect", {effectUuids, effectData, actorUuid : this.uuid, messageId});
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
    this.update({ "system.status.corruption.value": corruption }).then(() => {
      this.checkCorruption();
    });

    let test = message.getTest()
    test.reroll()
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
    let data = message.flags.data;
    let cardOptions = {
      flags: { img: message.flags.img },
      rollMode: data.rollMode,
      sound: message.sound,
      speaker: message.speaker,
      template: data.template,
      title: data.title.replace(` - ${game.i18n.localize("Opposed")}`, ""),
      user: message.user
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
            let skill = this.itemTypes["skill"].find(i => i.name == game.i18n.localize("NAME.Endurance"))
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
            let skill = this.itemTypes["skill"].find(i => i.name == game.i18n.localize("NAME.Cool"))
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
    return this.itemTypes[type].find(i => i.name == traitName && i.included)
  }

  /**
   * Provides a centralized method to determine how to prefill the roll dialog
   * 
   * @param {String} type   "characteristic", "skill", "weapon", etc. Corresponding to setup____
   * @param {Object} item   For when an object is being used, such as any test except characteristic
   * @param {*} options     Optional parameters, such as if "resting", or if testing for corruption
   */
  async getPrefillData(type, item, options = {}) {
    let modifier = 0,
      difficulty = "challenging",
      slBonus = 0,
      successBonus = 0

    let tooltip = []

    try {

      // TODO vehicles?
      if (this.type != "vehicle") {}

      let effectModifiers = { modifier, difficulty, slBonus, successBonus }
      let effects = await this.runScripts("prefillDialog", { prefillModifiers: effectModifiers, type, item, options })
      tooltip = tooltip.concat(effects.map(e => e.tooltip));
      if (game.user.targets.size) {
        effects = await this.runScripts("targetPrefillDialog", { prefillModifiers: effectModifiers, type, item, options })
        tooltip = tooltip.concat(effects.map(e => `${game.i18n.localize("EFFECT.Target")} ${e.tooltip}`));
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
    catch (e) {
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
      prefillTooltip: `${game.i18n.localize("EFFECT.Tooltip")} <ul> <li>${tooltip.map(t => t.trim()).join("</li><li>")}</li></ul>`,
      prefillTooltipCount: tooltip.length
    }

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
    }).map(i => new EffectWfrp4eV2(i.toObject(), { parent: item }));

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

  async decrementInjuries() {
    this.injuries.forEach(i => this.decrementInjury(i))
  }

  async decrementInjury(injury) {
    if (isNaN(injury.system.duration.value))
      return ui.notifications.notify(game.i18n.format("CHAT.InjuryError", { injury: injury.name }))

    injury = duplicate(injury)
    injury.system.duration.value--

    if (injury.system.duration.value < 0)
      injury.system.duration.value = 0;

    if (injury.system.duration.value == 0) {
      let chatData = game.wfrp4e.utility.chatDataSetup(game.i18n.format("CHAT.InjuryFinish", { injury: injury.name }), "gmroll")
      chatData.speaker = { alias: this.name }
      ChatMessage.create(chatData)
    }
    this.updateEmbeddedDocuments("Item", [injury]);
  }


  async decrementDiseases() {
    this.diseases.forEach(d => this.decrementDisease(d))
  }

  async decrementDisease(disease) {
    let d = duplicate(disease)
    if (!d.system.duration.active) {
      if (Number.isNumeric(d.system.incubation.value)) {

        d.system.incubation.value--
        if (d.system.incubation.value <= 0) {
          this.activateDisease(d)
          d.system.incubation.value = 0;
        }
      }
      else {
        let chatData = game.wfrp4e.utility.chatDataSetup(`Attempted to decrement ${d.name} incubation but value is non-numeric`, "gmroll", false)
        chatData.speaker = { alias: this.name }
        ChatMessage.create(chatData)
      }
    }
    else {
      if (Number.isNumeric(d.system.duration.value)) {

        d.system.duration.value--
        if (d.system.duration.value == 0)
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
    disease.system.duration.active = true;
    disease.system.incubation.value = 0;
    let msg = game.i18n.format("CHAT.DiseaseIncubation", { disease: disease.name })
    try {
      let durationRoll = (await new Roll(disease.system.duration.value).roll()).total
      msg += game.i18n.format("CHAT.DiseaseDuration", { duration: durationRoll, unit: disease.system.duration.unit })
      disease.system.duration.value = durationRoll;
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

    if (disease.system.symptoms.includes("lingering")) {
      let lingering = disease.effects.find(e => e.name.includes("Lingering"))
      if (lingering) {
        let difficulty = lingering.name.substring(lingering.name.indexOf("(") + 1, lingering.name.indexOf(")")).toLowerCase()

        this.setupSkill(game.i18n.localize("NAME.Endurance"), { difficulty }).then(setupData => this.basicTest(setupData).then(async test => {
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
      await this.deleteEffectsFromItem(disease._id)
    }
    let chatData = game.wfrp4e.utility.chatDataSetup(msg, "gmroll", false)
    chatData.speaker = { alias: this.name }
    ChatMessage.create(chatData)

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
    if (test.context.reroll || test.context.fortuneUsedAddSL) {
      let previousFailed = test.context.previousResult.outcome == "failure"
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

    if (!test.context.reroll && !test.context.fortuneUsedAddSL)
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.format("CHAT.CorruptionFail", { name: this.name, number: corruption }), "gmroll", false))
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.format("CHAT.CorruptionReroll", { name: this.name, number: corruption }), "gmroll", false))

    await this.update({ "system.status.corruption.value": newCorruption })
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
      this.update({ "system.status.corruption.value": Number(this.status.corruption.value) - wpb })
    }
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(game.i18n.localize("CHAT.MutateSuccess"), "gmroll", false))

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
      test.result.SL = test.result.roll <= test.result.target ? 1 : -1

    if (item.system.failingDecreases.value) {
      item.system.SL.current += Number(test.result.SL)
      if (!item.system.negativePossible.value && item.system.SL.current < 0)
        item.system.SL.current = 0;
    }
    else if (test.result.SL > 0)
      item.system.SL.current += Number(test.result.SL)

    let displayString = `${item.name} ${item.system.SL.current} / ${item.system.SL.target} ${game.i18n.localize("SuccessLevels")}`

    if (item.system.SL.current >= item.system.SL.target) {

      if (getProperty(item, "flags.wfrp4e.reloading")) {
        let actor
        if (getProperty(item, "flags.wfrp4e.vehicle"))
          actor = WFRP_Utility.getSpeaker(getProperty(item, "flags.wfrp4e.vehicle"))

        actor = actor ? actor : this
        let weapon = actor.items.get(getProperty(item, "flags.wfrp4e.reloading"))
        await weapon.update({ "flags.wfrp4e.-=reloading": null, "system.loaded.amt": weapon.loaded.max, "system.loaded.value": true })
      }

      if (item.system.completion.value == "reset")
        item.system.SL.current = 0;
      else if (item.system.completion.value == "remove") {
        await this.deleteEmbeddedDocuments("Item", [item._id])
        await this.deleteEffectsFromItem(item._id)
        item = undefined
      }
      displayString = displayString.concat(`<br><b>${game.i18n.localize("Completed")}</b>`)
    }

    test.result.other.push(displayString)

    if (item)
      await this.updateEmbeddedDocuments("Item", [item]);
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
    this.update({ "system.status.advantage.value": val })
  }
  modifyAdvantage(val) {
    this.setAdvantage(this.status.advantage.value + val)
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

    if (name)
      fear.effects[0].flags.wfrp4e.fearName = name

    return this.createEmbeddedDocuments("Item", [fear]).then(items => {
      this.setupExtendedTest(items[0], {appendTitle : ` - ${items[0].name}`});
    });
  }


  applyTerror(value, name = undefined) {
    value = value || 1
    let terror = duplicate(game.wfrp4e.config.systemItems.terror)
    terror.flags.wfrp4e.terrorValue = value
    return game.wfrp4e.utility.applyOneTimeEffect(terror, this)
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


  populateEffect(effectId, item, test) {
    if (typeof item == "string")
      item = this.items.get(item)

    let effect;
    if (item)
    {
      // If lore, take from config, else take the effect from the item
      effect = effectId == "lore" ? item.system.lore.effect.toObject() :  item?.effects.get(effectId)?.toObject()
    }
    else 
    {
      effect = this.effects.get(effectId);
    }

    if (!effect && item?.ammo)
      effect = item.ammo.effects.get(effectId)?.toObject();
    if (!effect)
      return ui.notifications.error(game.i18n.localize("ERROR.EffectNotFound"))

    effect.origin = this.uuid;
    let duration
    if (test && test.result.overcast && test.result.overcast.usage.duration) {
      duration = test.result.overcast.usage.duration.current;
    } else if(item?.Duration) {
      duration = parseInt(item.Duration);
    }

    if (duration) {
      if (item.duration.value.toLowerCase().includes(game.i18n.localize("Seconds")))
        effect.duration.seconds = duration;

      else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Minutes")))
        effect.duration.seconds = duration * 60

      else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Hours")))
        effect.duration.seconds = duration * 60 * 60

      else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Days")))
        effect.duration.seconds = duration * 60 * 60 * 24

      else if (item.duration.value.toLowerCase().includes(game.i18n.localize("Rounds")))
        effect.duration.rounds = duration;
    }


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

  /**
   * This function stores temporary active effects on an actor
   * Generally used by effect scripts to add conditional effects
   * that are removed when the source effect is removed
   * 
   * @param {Object} data Active Effect Data
   */
  createConditionalEffect(data)
  {
    let conditionalEffects = foundry.utils.deepClone(this.flags.wfrp4e?.conditionalEffects || [])

    if (!data.id)
    {
      data.id == randomID()
    }

    conditionalEffects.push(data);
    setProperty(this, "flags.wfrp4e.conditionalEffects", conditionalEffects);
  }

  // @@@@@@@@ BOOLEAN GETTERS
  get isUniqueOwner() {
    return game.user.id == game.users.find(u => u.active && (this.ownership[u.id] >= 3 || u.isGM))?.id
  }

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
    // TODO: more filtering is needed, maybe a toggle on/off, and shouldn't include targeted auras
    return this.items.reduce((acc, item) => acc.concat(item.effects.contents), []).filter(e => e.applicationData.type == "aura")
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
