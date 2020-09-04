/**
 * DiceWFRP is the centralized object that handles all things involving rolling logic. At the base of roll evaluation, there is
 * rollTest() which provides the basics of roll evaluation - determining success, SL, etc. This function is used by more complex
 * test evaluation functions like rollWeaponTest, which calls rollTest, then extends upon it with more logic concerning weapons.
 * Another noteworthy function is renderRollCard, which is used to display the roll results of all tests. Lastly, this object
 * is where chat listeners are defined, which add interactivity to chat, usually in the form of button clickss.
 */

import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import GeneratorWfrp4e from "../apps/char-gen.js";
import MarketWfrp4e from "../apps/market-wfrp4e.js";
import TravelDistanceWfrp4e from "../apps/travel-distance-wfrp4e.js";
import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";
import WFRP4E from "./config-wfrp4e.js"
import WFRP_Tables from "./tables-wfrp4e.js";
import OpposedWFRP from "./opposed-wfrp4e.js";
import AOETemplate from "./aoe.js"


export default class DiceWFRP {
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
  static async setupDialog({dialogOptions, testData, cardOptions,}) {
    let rollMode = game.settings.get("core", "rollMode");

    var sceneStress = "challenging";
    // Overrides default difficulty to Average depending on module setting and combat state
    if (game.settings.get("wfrp4e", "testDefaultDifficulty") && (game.combat != null))
      sceneStress = game.combat.started ? "challenging" : "average";
    else if (game.settings.get("wfrp4e", "testDefaultDifficulty"))
      sceneStress = "average";

    // Merge input with generic properties constant between all tests
    mergeObject(testData,
      {
        testDifficulty: sceneStress,
        testModifier: 0,
        slBonus: 0,
        successBonus: 0,
      });

    // Sets/overrides default test difficulty (eg, with Income or Rest & Recover tests), based on dialogOptions.data.testDifficulty passed through from skillSetup
    sceneStress = dialogOptions.data.testDifficulty || sceneStress;

    let advantageBonus = game.settings.get("wfrp4e", "autoFillAdvantage") ? (dialogOptions.data.advantage * 10 || 0) : 0

    mergeObject(dialogOptions.data,
      {
        testDifficulty: dialogOptions.data.testDifficulty || sceneStress,
        difficultyLabels: WFRP4E.difficultyLabels,
        testModifier: (dialogOptions.data.modifier || 0) + advantageBonus,
        slBonus: dialogOptions.data.slBonus || 0,
        successBonus: dialogOptions.data.successBonus || 0,
      });
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


    if (!testData.extra.options.bypass) {
      // Render Test Dialog
      let html = await renderTemplate(dialogOptions.template, dialogOptions.data);

      return new Promise((resolve, reject) => {
        new Dialog(
          {
            title: dialogOptions.title,
            content: html,
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
    else {
      testData.testModifier = testData.extra.options.testModifier || testData.testModifier
      testData.target = testData.target + testData.testModifier;
      testData.slBonus = testData.extra.options.slBonus || testData.slBonus
      testData.successBonus = testData.extra.options.successBonus || testData.successBonus
      cardOptions.rollMode = testData.extra.options.rollMode || rollMode
      resolve({testData, cardOptions})
    }
    reject()
  }


  /**
   * Provides the basic evaluation of a test.
   * 
   * This function, when given the necessary data (target number, SL bonus, etc.) provides the
   * basic test evaluation - rolling the test (if not already given), determining SL, success, description, critical/fumble if needed.
   * 
   * @param {Object} testData  Test info: target number, SL bonus, success bonus, (opt) roll, etc
   */
  static rollTest(testData) {
    let roll;
    testData.function = "rollTest"

    if (testData.roll)
      roll = {
        total: testData.roll
      }
    else
      roll = new Roll("1d100").roll(); // Use input roll if exists, otherwise, roll randomly (used for editing a test result)

    let successBonus = testData.successBonus;
    let slBonus = testData.slBonus;
    let targetNum = testData.target;


    // Post opposed result modifiers
    if (testData.modifiers)
    {
      targetNum += testData.modifiers.target
      slBonus += testData.modifiers.SL
    }

    let SL
    if (testData.SL == 0)
      SL = testData.SL
    else
      SL = testData.SL || ((Math.floor(targetNum / 10) - Math.floor(roll.total / 10)) + slBonus); // Use input SL if exists, otherwise, calculate from roll (used for editing a test result)
    let description = "";

    // Test determination logic can be complicated due to SLBonus
    // SLBonus is always applied, but doesn't change a failure to a success or vice versa
    // Therefore, in this case, a positive SL can be a failure and a negative SL can be a success
    // Additionally, the auto-success/failure range can complicate things even more.
    // ********** Failure **********
    if (roll.total >= 96 || roll.total > targetNum && roll.total > 5) {
      description = game.i18n.localize("Failure")
      if (roll.total >= 96 && SL > -1)
        SL = -1;

      switch (Math.abs(Number(SL))) {
        case 6:
          description = game.i18n.localize("Astounding") + " " + description;
          break;

        case 5:
        case 4:
          description = game.i18n.localize("Impressive") + " " + description;
          break;

        case 3:
        case 2:
          break;

        case 1:
        case 0:
          description = game.i18n.localize("Marginal") + " " + description;
          break;

        default:
          if (Math.abs(Number(SL)) > 6)
            description = game.i18n.localize("Astounding") + " " + description;
      }
      if (SL > 0) {
        description = game.i18n.localize("Marginal") + " " + game.i18n.localize("Failure");
        SL = "+" + SL.toString();
      }
      if (SL == 0)
        SL = "-" + SL.toString()
    }

    // ********** Success **********
    else if (roll.total <= 5 || roll.total <= targetNum) {
      description = game.i18n.localize("Success")
      if (game.settings.get("wfrp4e", "fastSL")) {
        let rollString = roll.total.toString();
        if (rollString.length == 2)
          SL = Number(rollString.split('')[0])
        else
          SL = 0;
        SL += slBonus
      }
      SL += successBonus;
      if (roll.total <= 5 && SL < 1)
        SL = 1;

      switch (Math.abs(Number(SL))) {
        case 6:
          description = game.i18n.localize("Astounding") + " " + description;
          break;

        case 5:
        case 4:
          description = game.i18n.localize("Impressive") + " " + description;
          break;

        case 3:
        case 2:
          break;

        case 1:
        case 0:
          description = game.i18n.localize("Marginal") + " " + description;
          break;

        default:
          if (Math.abs(Number(SL)) > 6)
            description = game.i18n.localize("Astounding") + " " + description;
      }
      if (SL < 0)
        description = game.i18n.localize("Marginal") + " " + game.i18n.localize("Success");

      // Add 1 SL for each whole 10 the target number is above 100 (120 target: +2 SL) if the option is selected
      if (game.settings.get("wfrp4e", "testAbove100")) {
        if (targetNum > 100) {
          let addSL = Math.floor((targetNum - 100) / 10)
          SL += addSL;
        }
      }

      // Add a + sign if succeeded
      if (SL >= 0)
        SL = "+" + SL.toString()

    }

    let rollResults = {
      target: targetNum,
      roll: roll.total,
      SL: SL,
      description: description,
      preData: testData,
      modifiers : testData.modifiers,
      extra:
        {}
    }



    mergeObject(rollResults, testData.extra)

    rollResults.other = []; // Container for miscellaneous data that can be freely added onto

    if (rollResults.options && rollResults.options.rest) {
      rollResults.woundsHealed = Math.max(Math.trunc(SL) + rollResults.options.tb, 0);
      rollResults.other.push(`${rollResults.woundsHealed} ${game.i18n.localize("Wounds Healed")}`)
    }

    if (testData.hitLocation) {
      if (testData.hitloc)
        rollResults.hitloc = WFRP_Tables.rollTable("hitloc", { lookup: testData.hitloc });
      else
        rollResults.hitloc = WFRP_Tables.rollTable("hitloc");

      rollResults.hitloc.roll = eval(rollResults.hitloc.roll) // Cleaner number when editing chat card
      rollResults.hitloc.description = game.i18n.localize(rollResults.hitloc.description)
    }

    // If hit location is being ussed, we can assume we should lookup critical hits
    if (testData.hitLocation) {
      if (roll.total > targetNum && roll.total % 11 == 0 || roll.total == 100) {
        rollResults.extra.color_red = true;
        rollResults.extra.fumble = game.i18n.localize("Fumble");
      }
      else if (roll.total <= targetNum && roll.total % 11 == 0) {
        rollResults.extra.color_green = true;
        rollResults.extra.critical = game.i18n.localize("Critical");
      }
    }

    // If optional rule of criticals/fumbles on all tessts - assign Astounding Success/Failure accordingly
    if (game.settings.get("wfrp4e", "criticalsFumblesOnAllTests") && !testData.hitLocation) {
      if (roll.total > targetNum && roll.total % 11 == 0 || roll.total == 100) {
        rollResults.extra.color_red = true;
        rollResults.description = game.i18n.localize("Astounding") + " " + game.i18n.localize("Failure")
      }
      else if (roll.total <= targetNum && roll.total % 11 == 0) {
        rollResults.extra.color_green = true;
        rollResults.description = game.i18n.localize("Astounding") + " " + game.i18n.localize("Success")
      }
    }
    return rollResults
  }

  /**
   * Extends the basic evaluation of a test to include weapon considerations.
   * 
   * This function, when given the necessary data (target number, SL bonus, etc.)calls
   * rollTest to provide the basic evaluation, then extends that to mainly account for
   * qualities/flaws of the weapon
   * 
   * @param {Object} testData  Test info: weapon, target number, SL bonus, success bonus, etc
   */
  static rollWeaponTest(testData) {

    let testResults = this.rollTest(testData);
    let weapon = testResults.weapon;

    testData.function = "rollWeaponTest"


    if (testResults.description.includes(game.i18n.localize("Failure"))) {
      // Dangerous weapons fumble on any failed tesst including a 9
      if (testResults.roll % 11 == 0 || testResults.roll == 100 || (weapon.properties.flaws.includes(game.i18n.localize("PROPERTY.Dangerous")) && testResults.roll.toString().includes("9"))) {
        testResults.extra.fumble = game.i18n.localize("Fumble")
        // Blackpowder/engineering/explosive weapons misfire on an even fumble
        if ((weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Blackpowder") ||
          weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Engineering") ||
          weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Explosives")) && testResults.roll % 2 == 0) {
          testResults.extra.misfire = game.i18n.localize("Misfire")
          testResults.extra.misfireDamage = eval(parseInt(testResults.roll.toString().split('').pop()) + weapon.data.damage.value)
        }
      }
      if (weapon.properties.flaws.includes(game.i18n.localize("PROPERTY.Unreliable")))
        testResults.SL--;
      if (weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Practical")))
        testResults.SL++;

      if (weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Throwing"))
        testResults.extra.scatter = game.i18n.localize("Scatter");
    }
    else // if success
    {
      if (weapon.properties.qualities.find(q => q.includes(game.i18n.localize("PROPERTY.Blast")))) {
        let property = weapon.properties.qualities.find(q => q.includes(game.i18n.localize("PROPERTY.Blast")))
        testResults.other.push(`<a class='aoe-template'><i class="fas fa-ruler-combined"></i>${property[property.length - 1]} yard Blast</a>`)
      }

      if (testResults.roll % 11 == 0)
        testResults.extra.critical = game.i18n.localize("Critical")

      // Impale weapons crit on 10s numbers
      if (weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Impale")) && testResults.roll % 10 == 0)
        testResults.extra.critical = game.i18n.localize("Critical")
    }

    if (testResults.extra.critical) {
      testResults.extra.color_green = true;
    }
    if (testResults.extra.fumble)
      testResults.extra.color_red = true;

    // *** Weapon Damage Calculation ***

    let damageToUse = testResults.SL; // Start out normally, with SL being the basis of damage
    testResults.standardDamage = eval(weapon.data.damage.value + damageToUse);

    let unitValue = Number(testResults.roll.toString().split("").pop())
    unitValue = unitValue == 0 ? 10 : unitValue; // If unit value == 0, use 10

    if (weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Damaging")) && unitValue > Number(testResults.SL))
      damageToUse = unitValue; // If damaging, instead use the unit value if it's higher

    testResults.damage = eval(weapon.data.damage.value + damageToUse);

    // Add unit die value to damage if impact
    if (weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Impact")))
      testResults.damage += unitValue;

    // If Tiring, instead provide both normal damage and increased damage as an option - clickable to select which damage is used
    if (weapon.properties.flaws.includes(game.i18n.localize("PROPERTY.Tiring")) && (damageToUse != testResults.SL || weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Impact")))) {
      testResults.damage = `<a class = "damage-select">${eval(weapon.data.damage.value + testResults.SL)}</a> | <a class = "damage-select">${testResults.damage}</a>`;
    }

    return testResults;
  }

  /**
   * Extends the basic evaluation of a test to include spell considerations.
   * 
   * This function, when given the necessary data (target number, SL bonus, etc.)calls
   * rollTest to provide the basic evaluation, then extends that to mainly account for
   * miscasting or critical castings
   * 
   * @param {Object} testData  Test info: spell, target number, SL bonus, success bonus, etc
   */
  static rollCastTest(testData) {
    let testResults = this.rollTest(testData);
    let spell = testResults.spell;

    let miscastCounter = 0;
    testData.function = "rollCastTest"

    let CNtoUse = spell.data.cn.value
    // Partial channelling - reduce CN by SL so far
    if (game.settings.get("wfrp4e", "partialChannelling")) {
      CNtoUse -= spell.data.cn.SL;
    }
    // Normal Channelling - if SL has reached CN, CN is considered 0
    else if (spell.data.cn.SL >= spell.data.cn.value) {
      CNtoUse = 0;
    }

    // If malignant influence AND roll has an 8 in the ones digit, miscast
    if (testData.extra.malignantInfluence)
      if (Number(testResults.roll.toString().split('').pop()) == 8)
        miscastCounter++;

    // Witchcraft automatically miscast
    if (spell.data.lore.value == "witchcraft")
      miscastCounter++;

    // slOver is the amount of SL over the CN achieved
    let slOver = (Number(testResults.SL) - CNtoUse)

    // Test itself was failed
    if (testResults.description.includes(game.i18n.localize("Failure"))) {
      testResults.description = game.i18n.localize("ROLL.CastingFailed")
      // Miscast on fumble
      if (testResults.roll % 11 == 0 || testResults.roll == 100) {
        testResults.extra.color_red = true;
        miscastCounter++;
      }
    }
    else if (slOver < 0) // Successful test, but unable to cast due to not enough SL
    {
      testResults.description = game.i18n.localize("ROLL.CastingFailed")

      // Critical Casting - succeeds only if the user chooses Total Power option (which is assumed)
      if (testResults.roll % 11 == 0) {
        testResults.extra.color_green = true;
        testResults.description = game.i18n.localize("ROLL.CastingSuccess")
        testResults.extra.critical = game.i18n.localize("ROLL.TotalPower")

        if (!testData.extra.ID)
          miscastCounter++;
      }
    }

    else // Successful test, casted - determine overcasts
    {
      testResults.description = game.i18n.localize("ROLL.CastingSuccess")
      let overcasts = Math.floor(slOver / 2);
      testResults.overcasts = overcasts;
      spell.overcasts.available = overcasts;


      if (testResults.roll % 11 == 0) {
        testResults.extra.critical = game.i18n.localize("ROLL.CritCast")
        testResults.extra.color_green = true;

        if (!testData.extra.ID)
          miscastCounter++;
      }

    }

    // Use the number of miscasts to determine what miscast it becomes (null<miscast> is from ingredients)
    switch (miscastCounter) {
      case 1:
        if (testData.extra.ingredient)
          testResults.extra.nullminormis = game.i18n.localize("ROLL.MinorMis")
        else {
          testResults.extra.minormis = game.i18n.localize("ROLL.MinorMis")
        }
        break;
      case 2:
        if (testData.extra.ingredient) {
          testResults.extra.nullmajormis = game.i18n.localize("ROLL.MajorMis")
          testResults.extra.minormis = game.i18n.localize("ROLL.MinorMis")
        }
        else {
          testResults.extra.majormis = game.i18n.localize("ROLL.MajorMis")
        }
        break;
      case 3:
        testResults.extra.majormis = game.i18n.localize("ROLL.MajorMis")
        break;
    }

    if (testData.extra.ingredient)
      miscastCounter--;
    if (miscastCounter < 0)
      miscastCounter = 0;
    if (miscastCounter > 2)
      miscastCounter = 2

    // Calculate Damage if the spell has it specified and succeeded in casting
    try {
      if (testData.extra.spell.damage && testResults.description.includes(game.i18n.localize("ROLL.CastingSuccess")))
        testResults.damage = Number(testResults.SL) +
          Number(testData.extra.spell.damage)
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("Error.DamageCalc") + ": " + error)
    } // If something went wrong calculating damage, do nothing and continue


    return testResults;
  }

  /**
   * Extends the basic evaluation of a test to include spell considerations.
   * 
   * This function, when given the necessary data (target number, SL bonus, etc.)calls
   * rollTest to provide the basic evaluation, then extends that to mainly account for
   * miscasting or critical castings
   * 
   * @param {Object} testData  Test info: spell, target number, SL bonus, success bonus, etc
   */
  static rollChannellTest(testData, actor) {
    let spell = testData.extra.spell;
    let miscastCounter = 0;

    let testResults = this.rollTest(testData);
    testData.function = "rollChannellTest"

    let SL = testResults.SL;

    // If malignant influence AND roll has an 8 in the ones digit, miscast
    if (testData.extra.malignantInfluence)
      if (Number(testResults.roll.toString().split('').pop()) == 8)
        miscastCounter++;

    // Witchcraft automatically miscast
    if (spell.data.lore.value == "witchcraft")
      miscastCounter++;

    // Test itself was failed
    if (testResults.description.includes(game.i18n.localize("Failure"))) {
      // Optional Rule: If SL in extended test is -/+0, counts as -/+1
      if (Number(SL) == 0 && game.settings.get("wfrp4e", "extendedTests"))
        SL = -1;

      testResults.description = game.i18n.localize("ROLL.ChannelFailed")
      // Major Miscast on fumble
      if (testResults.roll % 11 == 0 || testResults.roll % 10 == 0 || testResults.roll == 100) {
        testResults.extra.color_red = true;
        miscastCounter += 2;
      }
    }
    else // Successs - add SL to spell for further use
    {
      testResults.description = game.i18n.localize("ROLL.ChannelSuccess")

      // Optional Rule: If SL in extended test is -/+0, counts as -/+1
      if (Number(SL) == 0 && game.settings.get("wfrp4e", "extendedTests"))
        SL = 1;

      // Critical Channel - miscast and set SL gained to CN
      if (testResults.roll % 11 == 0) {
        testResults.extra.color_green = true;
        SL = spell.data.cn.value;
        testResults.extra.criticalchannell = game.i18n.localize("ROLL.CritChannel")
        if (!testData.extra.AA)
          miscastCounter++;
      }
    }

    // Add SL to CN and update actor
    SL = spell.data.cn.SL + Number(SL);
    if (SL > spell.data.cn.value)
      SL = spell.data.cn.value;
    else if (SL < 0)
      SL = 0;

    actor.updateEmbeddedEntity("OwnedItem",
      {
        _id: spell._id,
        'data.cn.SL': SL
      });

    // Use the number of miscasts to determine what miscast it becomes (null<miscast> is from ingredients)
    switch (miscastCounter) {
      case 1:
        if (testData.extra.ingredient)
          testResults.extra.nullminormis = game.i18n.localize("ROLL.MinorMis")
        else
          testResults.extra.minormis = game.i18n.localize("ROLL.MinorMis")
        break;
      case 2:
        if (testData.extra.ingredient) {
          testResults.extra.nullmajormis = game.i18n.localize("ROLL.MajorMis")
          testResults.extra.minormis = game.i18n.localize("ROLL.MinorMis")
        }
        else
          testResults.extra.majormis = game.i18n.localize("ROLL.MajorMis")
        break;
      case 3:
        testResults.extra.majormis = game.i18n.localize("ROLL.MajorMis")
        break;
    }

    if (testData.extra.ingredient)
      miscastCounter--;
    if (miscastCounter < 0)
      miscastCounter = 0;
    if (miscastCounter > 2)
      miscastCounter = 2
    return testResults;
  }

  /**
   * Extends the basic evaluation of a test to include prayer considerations.
   * 
   * This function, when given the necessary data (target number, SL bonus, etc.)calls
   * rollTest to provide the basic evaluation, then extends that to mainly account for
   * wrath of the gods
   * 
   * @param {Object} testData  Test info: prayer, target number, SL bonus, success bonus, etc
   */
  static rollPrayTest(testData, actor) {

    let testResults = this.rollTest(testData);
    let prayer = testResults.prayer;
    testData.function = "rollPrayTest"

    let SL = testResults.SL;
    let currentSin = actor.data.data.status.sin.value;


    // Test itself failed
    if (testResults.description.includes(game.i18n.localize("Failure"))) {
      testResults.description = game.i18n.localize("ROLL.PrayRefused")

      // Wrath of the gads activates if ones digit is equal or less than current sin
      let unitResult = Number(testResults.roll.toString().split('').pop())
      if (unitResult == 0)
        unitResult = 10;
      if (testResults.roll % 11 == 0 || unitResult <= currentSin) {
        if (testResults.roll % 11 == 0)
          testResults.extra.color_red = true;

        testResults.extra.wrath = game.i18n.localize("ROLL.Wrath")
        testResults.extra.wrathModifier = Number(currentSin) * 10;
        currentSin--;
        if (currentSin < 0)
          currentSin = 0;

        actor.update({ "data.status.sin.value": currentSin });
      }
    }
    // Test succeeded
    else {
      testResults.description = game.i18n.localize("ROLL.PrayGranted")

      // Wrath of the gads activates if ones digit is equal or less than current sin      
      let unitResult = Number(testResults.roll.toString().split('').pop())
      if (unitResult == 0)
        unitResult = 10;
      if (unitResult <= currentSin) {
        testResults.extra.wrath = game.i18n.localize("ROLL.Wrath")
        testResults.extra.wrathModifier = Number(currentSin) * 10;
        currentSin--;
        if (currentSin < 0)
          currentSin = 0;
        actor.update({ "data.status.sin.value": currentSin });
      }
      testResults.overcasts = Math.floor(SL / 2); // For allocatable buttons
      prayer.overcasts.available = testResults.overcasts;
    }

    // Calculate damage if prayer specifies
    try {
      if (testData.extra.prayer.damage && testResults.description.includes(game.i18n.localize("ROLL.PrayGranted")))
        testData.extra.damage = Number(testResults.SL) +
          Number(testData.extra.prayer.damage)
    }
    catch (error) {
      ui.notifications.error(game.i18n.localize("Error.DamageCalc") + ": " + error)
    } // If something went wrong calculating damage, do nothing and still render the card

    return testResults;
  }

  /** Take roll data and display it in a chat card template.
   * 
   * 
   * 
   * @param {Object} chatOptions - Object concerning display of the card like the template or which actor is testing
   * @param {Object} testData - Test results, values to display, etc.
   * @param {Object} rerenderMessage - Message object to be updated, instead of rendering a new message
   */
  static async renderRollCard(chatOptions, testData, rerenderMessage) {

    // Blank if manual chat cards
    if (game.settings.get("wfrp4e", "manualChatCards") && !rerenderMessage)
      testData.roll = testData.SL = null;

    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active && chatOptions.sound?.includes("dice"))
      chatOptions.sound = undefined;

    testData.other = testData.other.join("<br>")

    let chatData = {
      title: chatOptions.title,
      testData: testData,
      hideData: game.user.isGM
    }

    if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperIDs("GM");
    if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;
    else if (chatOptions.rollMode === "selfroll") chatOptions["whisper"] = [game.user];

    // All the data need to recreate the test when chat card is edited
    chatOptions["flags.data"] = {
      preData: chatData.testData.preData,
      postData: chatData.testData,
      template: chatOptions.template,
      rollMode: chatOptions.rollMode,
      title: chatOptions.title,
      hideData: chatData.hideData,
      fortuneUsedReroll: chatOptions.fortuneUsedReroll,
      fortuneUsedAddSL: chatOptions.fortuneUsedAddSL,
      isOpposedTest: chatOptions.isOpposedTest,
      attackerMessage: chatOptions.attackerMessage,
      defenderMessage: chatOptions.defenderMessage,
      unopposedStartMessage: chatOptions.unopposedStartMessage,
      startMessagesList: chatOptions.startMessagesList
    };

    if (!rerenderMessage) {
      // Generate HTML from the requested chat template
      return renderTemplate(chatOptions.template, chatData).then(html => {
        // Emit the HTML as a chat message
        if (game.settings.get("wfrp4e", "manualChatCards")) {
          let blank = $(html)
          let elementsToToggle = blank.find(".display-toggle")

          for (let elem of elementsToToggle) {
            if (elem.style.display == "none")
              elem.style.display = ""
            else
              elem.style.display = "none"
          }
          html = blank.html();
        }

        chatOptions["content"] = html;
        if (chatOptions.sound)
          console.log(`wfrp4e | Playing Sound: ${chatOptions.sound}`)
        return ChatMessage.create(chatOptions, false);
      });
    }
    else // Update message 
    {
      // Generate HTML from the requested chat template
      return renderTemplate(chatOptions.template, chatData).then(html => {

        // Emit the HTML as a chat message
        chatOptions["content"] = html;
        if (chatOptions.sound) {
          console.log(`wfrp4e | Playing Sound: ${chatOptions.sound}`)
          AudioHelper.play({ src: chatOptions.sound }, true)
        }
        return rerenderMessage.update(
          {
            content: html,
            ["flags.data"]: chatOptions["flags.data"]
          }).then(newMsg => {
            ui.chat.updateMessage(newMsg);
            return newMsg;
          });
      });
    }
  }


  /**
   * Activate event listeners using the chat log html.
   * @param html {HTML}  Chat log html
   */
  static async chatListeners(html) {
    // item lookup tag looks for an item based on the location attribute (compendium), then posts that item to chat.
    html.on("click", ".item-lookup", async ev => {
      let itemType = $(ev.currentTarget).attr("data-type");
      let location = $(ev.currentTarget).attr("data-location");
      let name = $(ev.currentTarget).attr("data-name"); // Use name attribute if available, otherwis, use text clicked.
      let item;
      if (name)
        item = await WFRP_Utility.findItem(name, itemType, location);
      else if (location)
        item = await WFRP_Utility.findItem(ev.currentTarget.text, itemType, location);

      if (!item)
        WFRP_Utility.findItem(ev.currentTarget.text, itemType).then(item => item.postItem());
      else
        item.postItem()
    })

    // Lookp function uses specialized skill and talent lookup functions that improve searches based on specializations
    html.on("click", ".talent-lookup", async ev => {
      WFRP_Utility.findTalent(ev.target.text).then(talent => talent.sheet.render(true));
    })

    html.on("click", ".skill-lookup", async ev => {
      WFRP_Utility.findSkill(ev.target.text).then(skill => skill.sheet.render(true));
    })

    // If draggable skill/talent, right click to open sheet
    html.on("mousedown", ".talent-drag", async ev => {
      if (ev.button == 2)
        WFRP_Utility.findTalent(ev.target.text).then(talent => talent.sheet.render(true));
    })
    html.on("mousedown", ".skill-drag", async ev => {
      if (ev.button == 2)
        WFRP_Utility.findSkill(ev.target.text).then(skill => skill.sheet.render(true));
    })

    // Custom entity clicks
    html.on("click", ".chat-roll", ev => {
      WFRP_Utility.handleRollClick(ev)
    })

    html.on("click", ".symptom-tag", ev => {
      WFRP_Utility.handleSymptomClick(ev)
    })

    html.on("click", ".condition-chat", ev => {
      WFRP_Utility.handleConditionClick(ev)
    })

    html.on('mousedown', '.table-click', ev => {
      WFRP_Utility.handleTableClick(ev)
    })

    html.on('mousedown', '.travel-click', ev => {
      TravelDistanceWfrp4e.handleTravelClick(ev)
    })

    html.on('mousedown', '.pay-link', ev => {
      WFRP_Utility.handlePayClick(ev)
    })

    html.on('mousedown', '.credit-link', ev => {
      WFRP_Utility.handleCreditLink(ev)
    })

    html.on('mousedown', '.corruption-link', ev => {
      WFRP_Utility.handleCorruptionClick(ev)
    })

    // Respond to editing chat cards - take all inputs and call the same function used with the data filled out
    html.on('change', '.card-edit', ev => {
      let button = $(ev.currentTarget),
        messageId = button.parents('.message').attr("data-message-id"),
        message = game.messages.get(messageId);
      let data = message.data.flags.data
      let newTestData = data.preData;
      newTestData[button.attr("data-edit-type")] = parseInt(ev.target.value)

      if (button.attr("data-edit-type") == "hitloc") // If changing hitloc, keep old value for roll
        newTestData["roll"] = $(message.data.content).find(".card-content.test-data").attr("data-roll")
      else // If not changing hitloc, use old value for hitloc
        newTestData["hitloc"] = $(message.data.content).find(".card-content.test-data").attr("data-loc")

      if (button.attr("data-edit-type") == "SL") // If changing SL, keep both roll and hitloc
      {
        newTestData["roll"] = $(message.data.content).find(".card-content.test-data").attr("data-roll")
        newTestData.slBonus = 0;
        newTestData.successBonus = 0;
      }

      if (button.attr("data-edit-type") == "target") // If changing target, keep both roll and hitloc
        newTestData["roll"] = $(message.data.content).find(".card-content.test-data").attr("data-roll")


      let chatOptions = {
        template: data.template,
        rollMode: data.rollMode,
        title: data.title,
        speaker: message.data.speaker,
        user: message.user.data._id
      }

      if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperIDs("GM");
      if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;

      // Send message as third argument (rerenderMessage) so that the message will be updated instead of rendering a new one
      new ActorWfrp4e(data.preData.extra.actor)[`${data.postData.postFunction}`]({testData : newTestData, cardOptions: chatOptions}, {rerenderMessage: message});
    })

    // Change card to edit mode
    html.on('click', '.edit-toggle', ev => {
      ev.preventDefault();
      this.toggleEditable(ev.currentTarget)
    });

    // Start an opposed test (or finish one)
    html.on('click', '.opposed-toggle', ev => {
      ev.preventDefault();
      OpposedWFRP.opposedClicked(ev)
    });

    // Post an item property (quality/flaw) description when clicked
    html.on("click", '.item-property', event => {
      event.preventDefault();
      WFRP_Utility.postProperty(event.target.text);
    });

    // Character generation - select specific species
    html.on("click", '.species-select', event => {
      event.preventDefault();
      GeneratorWfrp4e.rollSpecies(
        $(event.currentTarget).parents('.message').attr("data-message-id"),
        $(event.currentTarget).attr("data-species")); // Choose selected species
    });

    // Respond to character generation button clicks
    html.on("click", '.chargen-button, .chargen-button-nostyle', event => {
      event.preventDefault();
      // data-button tells us what button was clicked
      switch ($(event.currentTarget).attr("data-button")) {
        case "rollSpecies":
          GeneratorWfrp4e.rollSpecies($(event.currentTarget).parents('.message').attr("data-message-id"))
          break;
        case "rollCareer":
          GeneratorWfrp4e.rollCareer($(event.currentTarget).attr("data-species"), WFRP4E.randomExp.careerRand)
          break;
        case "rerollCareer":
          GeneratorWfrp4e.rollCareer($(event.currentTarget).attr("data-species"), WFRP4E.randomExp.careerReroll, true)
          GeneratorWfrp4e.rollCareer($(event.currentTarget).attr("data-species"), WFRP4E.randomExp.careerReroll, true)
          break;
        case "chooseCareer":
          GeneratorWfrp4e.chooseCareer($(event.currentTarget).attr("data-species"))
          break;
        case "rollSpeciesSkillsTalents":
          GeneratorWfrp4e.speciesSkillsTalents($(event.currentTarget).attr("data-species"))
          break;
        case "rollDetails":
          GeneratorWfrp4e.rollDetails($(event.currentTarget).attr("data-species"))
          break;

        case "rerollAttributes":
          GeneratorWfrp4e.rollAttributes($(event.currentTarget).attr("data-species"), Number($(event.currentTarget).attr("data-exp")), true)
          break;
      }
    });

    // Respond to overcast button clicks
    html.on("mousedown", '.overcast-button', event => {
      event.preventDefault();
      let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
      if (!msg.owner && !msg.isAuthor)
        return ui.notifications.error("You do not have permission to edit this ChatMessage")


      let spell;
      if (msg.data.flags.data.postData.spell)
        spell = duplicate(msg.data.flags.data.postData.spell);
      else
        spell = duplicate(msg.data.flags.data.postData.prayer);

      let overcastData = spell.overcasts
      let overcastChoice = $(event.currentTarget).attr("data-overcast")

      if (!overcastData.available)
        return

      overcastData.available = msg.data.flags.data.postData.overcasts

      if (typeof overcastData[overcastChoice].initial != "number")
        return

      // data-button tells us what button was clicked
      switch (overcastChoice) {
        case "range":
          overcastData[overcastChoice].current += overcastData[overcastChoice].initial
          break
        case "target":
          overcastData[overcastChoice].current += overcastData[overcastChoice].initial
          break
        case "duration":
          overcastData[overcastChoice].current += overcastData[overcastChoice].initial
          break
      }
      overcastData[overcastChoice].count++
      let sum = 0;
      for (let overcastType in overcastData)
        if (overcastData[overcastType].count)
          sum += overcastData[overcastType].count

      overcastData.available -= sum;

      let cardContent = $(event.currentTarget).parents('.message-content')

      cardContent.find(".overcast-count").text(`${overcastData.available}/${msg.data.flags.data.postData.overcasts}`)

      if (overcastData[overcastChoice].AoE)
        cardContent.find(`.overcast-value.${overcastChoice}`)[0].innerHTML = ('<i class="fas fa-ruler-combined"></i> ' + overcastData[overcastChoice].current + " " + overcastData[overcastChoice].unit)
      else
        cardContent.find(`.overcast-value.${overcastChoice}`)[0].innerHTML = (overcastData[overcastChoice].current + " " + overcastData[overcastChoice].unit)

      msg.update({ content: cardContent.html() })
      msg.update({ "flags.data.postData.spell": spell })
    });

    // Button to reset the overcasts
    html.on("mousedown", '.overcast-reset', event => {
      event.preventDefault();
      let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
      let cardContent = $(event.currentTarget).parents('.message-content')
      if (!msg.owner && !msg.isAuthor)
        return ui.notifications.error("You do not have permission to edit this ChatMessage")

      let spell = duplicate(msg.data.flags.data.postData.spell);
      let overcastData = spell.overcasts
      for (let overcastType in overcastData) {
        if (overcastData[overcastType].count) {
          overcastData[overcastType].count = 0
          overcastData[overcastType].current = overcastData[overcastType].initial
          if (overcastData[overcastType].AoE)
            cardContent.find(`.overcast-value.${overcastType}`)[0].innerHTML = ('<i class="fas fa-ruler-combined"></i> ' + overcastData[overcastType].current + " " + overcastData[overcastType].unit)
          else
            cardContent.find(`.overcast-value.${overcastType}`)[0].innerHTML = (overcastData[overcastType].current + " " + overcastData[overcastType].unit)
        }

      }
      overcastData.available = msg.data.flags.data.postData.overcasts;
      cardContent.find(".overcast-count").text(`${overcastData.available}/${msg.data.flags.data.postData.overcasts}`)
      msg.update({ content: cardContent.html() })
      msg.update({ "flags.data.postData.spell": spell })
    });

    // Respond to template button clicks
    html.on("click", '.aoe-template', event => {
      AOETemplate.fromString(event.currentTarget.text).drawPreview(event);
    });

    // Character generation - select specific career
    html.on("click", '.career-select', event => {
      event.preventDefault();
      let careerSelected = $(event.currentTarget).attr("data-career")
      let species = $(event.currentTarget).attr("data-species")
      GeneratorWfrp4e.displayCareer(careerSelected, species, 0, false, true)
    });

    // Proceed with an opposed test as unopposed
    html.on("click", '.unopposed-button', event => {
      event.preventDefault()
      let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");

      OpposedWFRP.resolveUnopposed(game.messages.get(messageId));
    })

    // Used to select damage dealt (there's 2 numbers if Tiring + impact/damaging)
    html.on("click", '.damage-select', event => {
      event.preventDefault()
      let messageId = $(event.currentTarget).parents('.message').attr("data-message-id")
      let message = game.messages.get(messageId)
      let msgContent = $(message.data.content)
      msgContent.find(".card-damage").replaceWith(`(${event.target.text} Damage)`)
      let newContent = msgContent.html()

      message.update(
        {
          content: newContent,
          "flags.data.postData.damage": Number(event.target.text)
        })
    })

    // Show hidden tables ('/table help' menu)
    html.on("click", '.hidden-table', event => {
      event.preventDefault()
      let html = WFRP_Tables.tableMenu(true);
      let chatData = WFRP_Utility.chatDataSetup(html)
      ChatMessage.create(chatData);
    })

    // Cancel an opposed test - triggered by deleting the opposed message
    html.on("click", ".message-delete", event => {
      let message = game.messages.get($(event.currentTarget).parents(".message").attr("data-message-id"))
      let targeted = message.data.flags.unopposeData // targeted opposed test
      let manual = message.data.flags.opposedStartMessage // manual opposed test
      if (!targeted && !manual)
        return;

      if (targeted) {
        let target = canvas.tokens.get(message.data.flags.unopposeData.targetSpeaker.token)
        target.actor.update(
          {
            "-=flags.oppose": null
          }) // After opposing, remove oppose
      }
      if (manual) {
        game.messages.get(OpposedWFRP.attacker.messageId).update(
          {
            "flags.data.isOpposedTest": false
          });
        OpposedWFRP.clearOpposed();
      }
      ui.notifications.notify(game.i18n.localize("ROLL.CancelOppose"))
    })

    // Click on botton related to the market/pay system
    html.on("click", '.market-button', event => {
      event.preventDefault();
      // data-button tells us what button was clicked
      switch ($(event.currentTarget).attr("data-button")) {
        case "rollAvailability":
          MarketWfrp4e.generateSettlementChoice($(event.currentTarget).attr("data-rarity"));
          break;
        case "payItem":
          if (!game.user.isGM) {
            let actor = game.user.character;
            money = MarketWfrp4e.payCommand($(event.currentTarget).attr("data-pay"), actor);
            if (money) {
              WFRP_Audio.PlayContextAudio({ item: { "type": "money" }, action: "lose" })
              actor.updateEmbeddedEntity("OwnedItem", money);
            }
          }
          break;
        case "creditItem":
          if (!game.user.isGM) {
            let actor = game.user.character;
            let dataExchange = $(event.currentTarget).attr("data-amount");
            money = MarketWfrp4e.creditCommand(dataExchange, actor);
            if (money) {
              WFRP_Audio.PlayContextAudio({ item: { type: "money" }, action: "gain" })
              actor.updateEmbeddedEntity("OwnedItem", money);
            }
          }
          break;
        case "rollAvailabilityTest":
          let options = {
            settlement: $(event.currentTarget).attr("data-settlement").toLowerCase(),
            rarity: $(event.currentTarget).attr("data-rarity").toLowerCase(),
            modifier: 0
          };
          MarketWfrp4e.testForAvailability(options);
          break;
      }
    });

    html.on("click", ".corrupt-button", event => {
      let strength = $(event.currentTarget).attr("data-strength").toLowerCase();
      if (strength != "moderate" && strength != "minor" && strength != "major")
        return ui.notifications.error("Invalid Corruption Type")

      let actors = canvas.tokens.controlled.map(t => t.actor)
      if (!actors)
        actors = [game.user.character]
      if (!actors)
        return ui.notifications.error("No character found to apply corruption to. Either control a token or assign a character to this user.")

      actors.forEach(a => {
        a.corruptionDialog(strength);
      })
    })

  }

  /**
   * Toggles a chat card from to edit mode - switches to using <input>
   * 
   * @param {Object} html  chat card html
   */
  static toggleEditable(html) {
    let elementsToToggle = $(html).parents(".chat-card").find(".display-toggle")
    if (!elementsToToggle.length)
      elementsToToggle = $(html).find(".display-toggle")

    for (let elem of elementsToToggle) {
      if (elem.style.display == "none")
        elem.style.display = ""
      else
        elem.style.display = "none"
    }
  }


  // /**
  //  * Extracts the necessary data from a message to send it back to renderRollCard for rerendering
  //  */
  // static getMessageData(messageId)
  // {
  //   let message = game.messages.get(messageId)
  //   let msgdata = message.data.flags.data
  //   let testData = msgdata.preData;
  //   let chatOptions = {
  //     template: msgdata.template,
  //     rollMode: msgdata.rollMode,
  //     title: msgdata.title,
  //     speaker: message.data.speaker,
  //     user: message.user.data._id
  //   }

  //   if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperIDs("GM");
  //   if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;

  //   let data = {
  //     testData,
  //     chatOptions,
  //     message
  //   }
  //   return data
  // }

  /**
   * Start a dice roll
   * Used by the rollTest method and its overrides
   * @param {Object} testData
   */
  static async rollDices(testData, cardOptions) {
    if (!testData.roll) {
      let roll = new Roll("1d100").roll();
      await DiceWFRP.showDiceSoNice(roll, cardOptions.rollMode);
      testData.roll = roll.total;
    }
    return testData;
  }

  /**
   * Add support for the Dice So Nice module
   * @param {Object} roll 
   * @param {String} rollMode 
   */
  static async showDiceSoNice(roll, rollMode) {
    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active) {
      let whisper = null;
      let blind = false;
      switch (rollMode) {
        case "blindroll": //GM only
          blind = true;
        case "gmroll": //GM + rolling player
          let gmList = game.users.filter(user => user.isGM);
          let gmIDList = [];
          gmList.forEach(gm => gmIDList.push(gm.data._id));
          whisper = gmIDList;
          break;
        case "roll": //everybody
          let userList = game.users.filter(user => user.active);
          let userIDList = [];
          userList.forEach(user => userIDList.push(user.data._id));
          whisper = userIDList;
          break;
      }
      await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
    }
  }
}