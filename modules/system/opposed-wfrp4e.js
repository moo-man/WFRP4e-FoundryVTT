import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";
import WFRP4E from "./config-wfrp4e.js"
import DiceWFRP from "./dice-wfrp4e.js";
import WFRP_Tables from "./tables-wfrp4e.js";
import ActorWfrp4e from "../actor/actor-wfrp4e.js";

/**
 * This class is where all opposed rolls are calculated, both targeted and manual.
 * 
 * Manual flow: 
 * First click - attacker test result and speaker are stored, opposedInProgress flag raised, opposed roll message created (and stored for editing)
 * Second click - defender test result and speaker stored, opposed values compared, roll message updated with result.
 * 
 * Targeted flow:
 * Every roll (see roll overrides, ActorWfrp4e) checks to see if a target is selected, if so, handleOpposed is called. See this function for details
 * on how targeted opposed rolls are handled.
 */
export default class OpposedWFRP {

  /**
   * The opposed button was clicked, evaluate whether it is an attacker or defender, then proceed
   * to evaluate if necessary.
   * 
   * @param {Object} event Click event for opposed button click
   */
  static opposedClicked(event) {
    let button = $(event.currentTarget),
      messageId = button.parents('.message').attr("data-message-id"),
      message = game.messages.get(messageId);
    let data = message.data.flags.data;

    // If opposed already in progress, the click was for the defender
    if (this.opposedInProgress) {
      // If the startMessage still exists, proceed with the opposed test. Otherwise, start a new opposed test
      if (game.messages.get(this.startMessage._id))
        this.defenderClicked(data.postData, message);
      else {
        this.clearOpposed();
        this.opposedClicked(event);
      }
    }
    else // If no opposed roll in progress, click was for the attacker
    {
      this.opposedInProgress = true;
      this.attackerClicked(data.postData, message, data.rollMode);
    }
  }

  /**
   * Create a new test result when rerolling or adding sl in an opposed test
   * @param {Object} attackerRollMessage 
   * @param {Object} defenderRollMessage 
   */
  static opposedRerolled(attackerRollMessage, defenderRollMessage) {
    let attacker = {
      testResult: attackerRollMessage.data.flags.data.postData,
      speaker: attackerRollMessage.data.speaker,
      messageId: attackerRollMessage.data._id,
    };
    let defender = {
      testResult: defenderRollMessage.data.flags.data.postData,
      speaker: defenderRollMessage.data.speaker,
      messageId: defenderRollMessage.data._id,
    };
    this.evaluateOpposedTest(attacker, defender);
  }

  /**
   * Attacker starts an opposed test.
   * 
   * @param {Object} testResult Test result values
   * @param {Object} message message for update, actor, token, etc. for the attacker
   * @param {String} rollMode the type of roll mode used for the card
   */
  static attackerClicked(testResult, message, rollMode) {
    // Store attacker in object member
    this.attacker = OpposedWFRP.constructCombatantData(testResult, message)

    message.update(
      {
        "flags.data.isOpposedTest": true
      });
    this.createOpposedStartMessage(message.data.speaker, rollMode);
  }

  /**
   * Defender responds to an opposed test - evaluate result
   *
   * @param {Object} testResult Test result values
   * @param {Object} message message for update, actor, token, etc. for the defender
   */
  static async defenderClicked(testResult, message) {
    // Store defender in object member
    this.defender = OpposedWFRP.constructCombatantData(testResult, message)
    //Edit the attacker message to give it a ref to the defender message (used for rerolling)
    game.messages.get(this.attacker.messageId).update(
      {
        "flags.data.defenderMessage": [message.data._id]
      });
    //Edit the defender message to give it a ref to the attacker message (used for rerolling)
    message.update(
      {
        "flags.data.attackerMessage": this.attacker.messageId
      });
    this.completeOpposedProcess(this.attacker, this.defender, this.options)
  }

  static constructCombatantData(testResult, message)
  {
    return {
      testResult,
      speaker: message.data.speaker,
      messageId: message.data._id
    }
  }

  static async completeOpposedProcess(attacker, defender, options)
  {
    let opposedResult = await this.evaluateOpposedTest(attacker.testResult, defender.testResult);
    this.formatOpposedResult(opposedResult, attacker.speaker, defender.speaker);
    this.rerenderMessagesWithModifiers(opposedResult, attacker, defender);
    this.renderOpposedResult(opposedResult, options)
    return opposedResult
  }

  /*Known Bugs: attempting to reroll causes it to not reroll at all, actually. Manually editing cards causes a duplicate result card at the end.
  *
  *
  *
  */
  static checkPostModifiers(attackerTestResult, defenderTestResult) {

    let didModifyAttacker = false, didModifyDefender = false;

    let modifiers = {
      attacker : {
        target : 0,
        SL : 0
      },
      defender : {
        target : 0,
        SL : 0
      },
      message: []
    }

    // Things to Check:
    // Weapon Length DONE
    // Fast Weapon Property DONE
    // Size 
    // Done - Weapon Defending: You suﬀer a penalty of –2 SL for each step larger your opponent is when using Melee to defend an Opposed Test
    // Done - To Hit Modifiers: +10 Bonus if smaller
    // Done - Ranged to Hit Modifiers : You gain a hefty bonus when shooting at larger targets (Ex. +40 to hit Enormous).
    //Shooting at smaller targets?

    if (game.settings.get("wfrp4e", "weaponLength") && attackerTestResult.postFunction == "weaponTest" && defenderTestResult.postFunction == "weaponTest" && attackerTestResult.weapon.attackType == "melee" && defenderTestResult.weapon.attackType == "melee") {
      WFRP_Utility.findKey(attackerTestResult.weapon.data.reach.value, WFRP4E.weaponReaches)
      let attackerReach = WFRP4E.reachNum[WFRP_Utility.findKey(attackerTestResult.weapon.data.reach.value, WFRP4E.weaponReaches)];
      let defenderReach = WFRP4E.reachNum[WFRP_Utility.findKey(defenderTestResult.weapon.data.reach.value, WFRP4E.weaponReaches)];
      if (defenderReach > attackerReach) {
        didModifyAttacker = true;
        modifiers.message.push(game.i18n.format(game.i18n.localize('CHAT.TestModifiers.WeaponLength'), { defender: defenderMessage.data.speaker.alias, attacker: attackerMessage.data.speaker.alias }))
        modifiers.attacker.target += -10;
      }
    }
    //Fast Weapon Property
    if (attackerTestResult.postFunction == "weaponTest" && attackerTestResult.weapon.attackType == "melee" && attackerTestResult.weapon.data.qualities.value.includes(game.i18n.localize('PROPERTY.Fast'))) {
      if (!(defenderTestResult.postFunction == "weaponTest" && defenderTestResult.weapon.data.qualities.value.includes(game.i18n.localize('PROPERTY.Fast')))) {
        didModifyDefender = true;
        modifiers.message.push(game.i18n.format(game.i18n.localize('CHAT.TestModifiers.FastWeapon'), { attacker: attackerMessage.data.speaker.alias, defender: defenderMessage.data.speaker.alias }))
        modifiers.defender.target += -10;
      }
    }

    //Size Differences
    let sizeDiff = WFRP4E.actorSizeNums[attackerTestResult.size] - WFRP4E.actorSizeNums[defenderTestResult.size]
    //Positive means attacker is larger, negative means defender is larger
    if (sizeDiff >= 1) {
      //Defending against a larger target with a weapon
      if (defenderTestResult.postFunction == "weaponTest" && defenderTestResult.weapon.attackType == "melee") {
        didModifyDefender = true;
        modifiers.message.push(game.i18n.format(game.i18n.localize('CHAT.TestModifiers.DefendingLarger'), { defender: defenderTestResult.actor.token.name, sl: (-2 * sizeDiff) }))
        modifiers.defender.SL += (-2 * sizeDiff);
      }
    } else if (sizeDiff <= -1) {
      if (attackerTestResult.postFunction == "weaponTest") {
        if (attackerTestResult.weapon.attackType == "melee") {
          didModifyAttacker = true;
          modifiers.message.push(game.i18n.format(game.i18n.localize('CHAT.TestModifiers.AttackingLarger'), { attacker: attackerTestResult.actor.token.name }))
          modifiers.attacker.target += 10;
        } else if (attackerTestResult.weapon.attackType == "ranged") {
          didModifyAttacker = true;
          modifiers.message.push(game.i18n.format(game.i18n.localize('CHAT.TestModifiers.ShootingLarger'), { attacker: attackerTestResult.actor.token.name, bonus: (10 * -sizeDiff) }))
          modifiers.attacker.target += (10 * -sizeDiff);
        }
      }
    }

    //Apply the modifiers
    if (didModifyAttacker || didModifyDefender) {
      modifiers.message.push(game.i18n.localize('CHAT.TestModifiers.FinalModifiersTitle'))
      if (didModifyAttacker) 
        modifiers.message.push(`${game.i18n.format(game.i18n.localize('CHAT.TestModifiers.FinalModifiers'), { target: modifiers.attacker.target, sl: modifiers.attacker.SL, name: attackerTestResult.actor.token.name })}`)  
   }
   return mergeObject(modifiers, {didModifyAttacker, didModifyDefender});
  }

  /**
   * Main Opposed test evaluation logic. Takes attacker and defender test data and 
   * determines who won, by how much, etc. Displays who won accordingly, with different
   * logic for manual and targeted opposed tests
   * 
   * @param {Object} attacker Attacker data
   * @param {Object} defender Defender Data
   * @param {Object} options Targeted?
   */
  static async evaluateOpposedTest(attackerTest, defenderTest, options = {}) {
    Hooks.call("wfrp4e:preOpposedTestResult", attackerTest, defenderTest)
    try {
      let opposeResult = {};
      let soundContext = {};
      opposeResult.other = [];
      opposeResult.modifiers = this.checkPostModifiers(attackerTest, defenderTest);

      //attackerTest.preData.target += opposeResult.modifiers.attacker.target;
      //attackerTest.preData.SL += opposeResult.modifiers.attacker.SL;
      attackerTest.preData.modifiers = opposeResult.modifiers.attacker
      attackerTest.preData.hitloc = attackerTest.hitloc?.roll;
      attackerTest = DiceWFRP[attackerTest.preData.function](attackerTest.preData)

      if (!defenderTest.unopposed)
      {
        // defenderTest.preData.target += opposeResult.modifiers.defender.target;
        // defenderTest.preData.SL += opposeResult.modifiers.defender.SL;
        defenderTest.preData.modifiers = opposeResult.modifiers.defender
        defenderTest.preData.hitloc = defenderTest.hitloc?.roll;
        defenderTest = DiceWFRP[defenderTest.preData.function](defenderTest.preData)
      } 

      opposeResult.other = opposeResult.other.concat(opposeResult.modifiers.message);

      let attackerSL = parseInt(attackerTest.SL);
      let defenderSL = parseInt(defenderTest.SL);
      opposeResult.differenceSL = 0;
      opposeResult.attackerTestResult = attackerTest;
      opposeResult.defenderTestResult = defenderTest;

      // If attacker has more SL OR the SLs are equal and the attacker's target number is greater than the defender's, then attacker wins. 
      // Note: I know this isn't technically correct by the book, where it states you use the tested characteristic/skill, not the target number, i'll be honest, I don't really care.
      if (attackerSL > defenderSL || (attackerSL === defenderSL && attackerTest.target > defenderTest.target)) {
        opposeResult.winner = "attacker"
        opposeResult.differenceSL = attackerSL - defenderSL;

        // If Damage is a numerical value
        if (!isNaN(opposeResult.attackerTestResult.damage)) {
          let damage = this.calculateOpposedDamage(opposeResult);
          opposeResult.damage = {
            description: `<b>${game.i18n.localize("Damage")}</b>: ${damage}`,
            value: damage
          };
        }
        // If attacker is using a weapon or trait but there wasn't a numerical damage value, output unknown
        else if (opposeResult.attackerTestResult.weapon || opposeResult.attackerTestResult.trait) {
          opposeResult.damage = {
            description: `<b>${game.i18n.localize("Damage")}</b>: ?`,
            value: null
          };
        }
        if (opposeResult.attackerTestResult.hitloc)
        {
          // Remap the hit location roll to the defender's hit location table, note the change if it is different
          let remappedHitLoc = WFRP_Tables.rollTable(opposeResult.defenderTestResult.actor.data.details.hitLocationTable.value, {lookup: opposeResult.attackerTestResult.hitloc.roll})
          if (remappedHitLoc.description != opposeResult.attackerTestResult.hitloc.description)
          {
            remappedHitLoc.description = remappedHitLoc.description + " (Remapped)"
            remappedHitLoc.remapped = true;
            opposeResult.attackerTestResult.hitloc = remappedHitLoc
          }

          opposeResult.hitloc = {
            description: `<b>${game.i18n.localize("ROLL.HitLocation")}</b>: ${opposeResult.attackerTestResult.hitloc.description}`,
            value: opposeResult.attackerTestResult.hitloc.result
          };
        }

        try // SOUND
        {
          if (opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Bow")
            || opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Crossbow")) {
            soundContext = { item: opposeResult.attackerTestResult.weapon, action: "hit" }
          }
          if (opposeResult.attackerTestResult.weapon.data.weaponGroup.value == game.i18n.localize("SPEC.Throwing")) {
            soundContext.item = { type: "throw" }
            if (opposeResult.attackerTestResult.weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Hack"))) {
              soundContext.item = { type: "throw_axe" }
            }
          }
        }
        catch (e) { console.log("wfrp4e | Sound Context Error: " + e) } // Ignore sound errors
      }
      else // Defender won
      {
        try {
          if (opposeResult.attackerTestResult.weapon
            && (opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Bow")
              || opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Crossbow")
              || opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Blackpowder")
              || opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Engineering"))) {
            soundContext = { item: opposeResult.attackerTestResult.weapon, action: "miss" }
          }
          if (opposeResult.defenderTestResult.weapon && opposeResult.defenderTestResult.weapon.properties.qualities.find(p => p.includes(game.i18n.localize("PROPERTY.Shield")))) {
            if (opposeResult.attackerTestResult.weapon.attackType == "melee") {
              soundContext = { item: { type: "shield" }, action: "miss_melee" }
            }
            else {
              if (opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Bow")
                || opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Sling")
                || opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Throwing")
                || opposeResult.attackerTestResult.weapon.data.weaponGroup.value === game.i18n.localize("SPEC.Crossbow")) {
                soundContext = { item: { type: "shield" }, action: "miss_ranged" }
              }
            }
          }
        }
        catch (e) { console.log("wfrp4e | Sound Context Error: " + e) } // Ignore sound errors


        opposeResult.winner = "defender"
        opposeResult.differenceSL = defenderSL - attackerSL;

        let riposte;
        if (opposeResult.defenderTestResult.weapon)
          riposte = opposeResult.defenderTestResult.riposte || !!opposeResult.defenderTestResult.weapon.properties.qualities.find(p => p.includes(game.i18n.localize("PROPERTY.Fast")))

        if (opposeResult.defenderTestResult.champion || riposte) {
          let swappedOppose = {
            attackerTestResult: duplicate(opposeResult.defenderTestResult),
            defenderTestResult: duplicate(opposeResult.attackerTestResult),
          }
          let damage = this.calculateOpposedDamage(swappedOppose);
          opposeResult.damage = {
            description: `<b>${game.i18n.localize("Damage")} (${riposte ? game.i18n.localize("NAME.Riposte") : game.i18n.localize("NAME.Champion")})</b>: ${damage}`,
            value: damage
          };
          let hitloc = WFRP_Tables.rollTable(swappedOppose.defenderTestResult.actor.data.details.hitLocationTable.value)

          opposeResult.hitloc = {
            description: `<b>${game.i18n.localize("ROLL.HitLocation")}</b>: ${hitloc.description}`,
            value: hitloc.result
          };
          // Actually swap so damage is applied to the attacker
          opposeResult.attackerTestResult = swappedOppose.attackerTestResult;
          opposeResult.defenderTestResult = swappedOppose.defenderTestResult;
          opposeResult.swapped = true;

          soundContext = { item: { type: "weapon" }, action: "hit" }
        }
      }

      Hooks.call("wfrp4e:opposedTestResult", opposeResult, attackerTest, defenderTest)
      WFRP_Audio.PlayContextAudio(soundContext)

      return opposeResult

    }
    catch (err) {
      ui.notifications.error(`${game.i18n.localize("Error.Opposed")}: ` + err)
      console.error("Could not complete opposed test: " + err)
      this.clearOpposed()
    }
  }


  static formatOpposedResult(opposeResult, attacker, defender)
  {
      if (opposeResult.winner == "attacker")
      { 
         opposeResult.result = game.i18n.format("OPPOSED.AttackerWins", { attacker: attacker.alias, defender: defender.alias, SL: opposeResult.differenceSL })
         opposeResult.img = attacker.img;
      }
      else if (opposeResult.winner == "defender")
      {
        opposeResult.result = game.i18n.format("OPPOSED.DefenderWins", { defender: defender.alias, attacker: attacker.alias, SL: opposeResult.differenceSL })
        opposeResult.img = defender.img
      }

      opposeResult.speakerAttack = attacker;
      opposeResult.speakerDefend = defender;

      if (opposeResult.swapped)
      {
        opposeResult.speakerAttack = defender;
        opposeResult.speakerDefend = attacker;
      }
      return opposeResult;
    }

  static rerenderMessagesWithModifiers(opposeResult, attacker, defender)
  {
      if (opposeResult.modifiers.didModifyAttacker || attacker.testResult.modifiers) {
        let attackerMessage = game.messages.get(attacker.messageId)
        opposeResult.modifiers.message.push(`${game.i18n.format(game.i18n.localize('CHAT.TestModifiers.FinalModifiers'), { target: opposeResult.modifiers.attacker.target, sl: opposeResult.modifiers.attacker.SL, name: attacker.alias })}`)
        let chatOptions = {
          template: attackerMessage.data.flags.data.template,
          rollMode: attackerMessage.data.flags.data.rollMode,
          title: attackerMessage.data.flags.data.title,
          fortuneUsedReroll: attackerMessage.data.flags.data.fortuneUsedReroll,
          fortuneUsedAddSL: attackerMessage.data.flags.data.fortuneUsedAddSL,
          isOpposedTest: attackerMessage.data.flags.data.isOpposedTest,
          attackerMessage: attackerMessage.data.flags.data.attackerMessage,
          defenderMessage: attackerMessage.data.flags.data.defenderMessage,
          unopposedStartMessage: attackerMessage.data.flags.data.unopposedStartMessage,
          startMessagesList: attackerMessage.data.flags.data.startMessagesList,
          hasBeenCalculated: true,
          calculatedMessage: opposeResult.modifiers.message,
        }

        attackerMessage.data.flags.data.preData.target = attackerMessage.data.flags.data.preData.target + opposeResult.modifiers.attacker.target;
        attackerMessage.data.flags.data.preData.slBonus = attackerMessage.data.flags.data.preData.slBonus + opposeResult.modifiers.attackerSL;
        attackerMessage.data.flags.data.preData.roll = attackerMessage.data.flags.data.postData.roll
        attackerMessage.data.flags.data.hasBeenCalculated = true;
        attackerMessage.data.flags.data.calculatedMessage = opposeResult.modifiers.message;
        if (!opposeResult.swapped)
          DiceWFRP.renderRollCard(chatOptions, opposeResult.attackerTestResult, attackerMessage)
        else 
          DiceWFRP.renderRollCard(chatOptions, opposeResult.defenderTestResult, attackerMessage)

      }
      if (opposeResult.modifiers.didModifyDefender || defender.testResult.modifiers) {
        opposeResult.modifiers.message.push(`${game.i18n.format(game.i18n.localize('CHAT.TestModifiers.FinalModifiers'), { target: opposeResult.modifiers.defender.target, sl: opposeResult.modifiers.defender.SL, name: defender.alias })}`)
        let defenderMessage = game.messages.get(defender.messageId)
        let chatOptions = {
          template: defenderMessage.data.flags.data.template,
          rollMode: defenderMessage.data.flags.data.rollMode,
          title: defenderMessage.data.flags.data.title,
          fortuneUsedReroll: defenderMessage.data.flags.data.fortuneUsedReroll,
          fortuneUsedAddSL: defenderMessage.data.flags.data.fortuneUsedAddSL,
          isOpposedTest: defenderMessage.data.flags.data.isOpposedTest,
          attackerMessage: defenderMessage.data.flags.data.attackerMessage,
          defenderMessage: defenderMessage.data.flags.data.defenderMessage,
          unopposedStartMessage: defenderMessage.data.flags.data.unopposedStartMessage,
          startMessagesList: defenderMessage.data.flags.data.startMessagesList,
          hasBeenCalculated: true,
          calculatedMessage: opposeResult.modifiers.message,
        }

        defenderMessage.data.flags.data.preData.target = defenderMessage.data.flags.data.preData.target + opposeResult.modifiers.defender.target;
        defenderMessage.data.flags.data.preData.slBonus = defenderMessage.data.flags.data.preData.slBonus + opposeResult.modifiers.defenderSL;
        defenderMessage.data.flags.data.preData.roll = defenderMessage.data.flags.data.postData.roll
        defenderMessage.data.flags.data.hasBeenCalculated = true;
        defenderMessage.data.flags.data.calculatedMessage = opposeResult.modifiers.message;
        if (!opposeResult.swapped)
          DiceWFRP.renderRollCard(chatOptions, opposeResult.defenderTestResult, defenderMessage)
        else 
          DiceWFRP.renderRollCard(chatOptions, opposeResult.attackerTestResult, defenderMessage)
      }
  }

  static renderOpposedResult(formattedOpposeResult, options = {})
  {
    // If targeting, Create a new result message
    if (options.target) {
      formattedOpposeResult.hideData = true;
      renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.html", formattedOpposeResult).then(html => {
        let chatOptions = {
          user: game.user._id,
          content: html,
          "flags.opposeData": formattedOpposeResult,
          "flags.startMessageId": options.startMessageId,
          whisper: options.whisper,
          blind: options.blind,
        }
        ChatMessage.create(chatOptions)
      })
    }
    else // If manual - update start message and clear opposed data
    {
      formattedOpposeResult.hideData = true;
      renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.html", formattedOpposeResult).then(html => {
        let chatOptions = {
          user: game.user._id,
          content: html,
          blind: options.blind,
          whisper: options.whisper,
          "flags.opposeData": formattedOpposeResult
        }
        try {
          this.startMessage.update(chatOptions).then(resultMsg => {
            ui.chat.updateMessage(resultMsg)
            this.clearOpposed();
          })
        }
        catch
        {
          ChatMessage.create(chatOptions)
          this.clearOpposed();
        }
      })
    }
  }

  static calculateOpposedDamage(opposeData) {
    // Calculate size damage multiplier 
    let damageMultiplier = 1;
    let sizeDiff = WFRP4E.actorSizeNums[opposeData.attackerTestResult.size] - WFRP4E.actorSizeNums[opposeData.defenderTestResult.size]
    damageMultiplier = sizeDiff >= 2 ? sizeDiff : 1

    let opposedSL = Number(opposeData.attackerTestResult.SL) - Number(opposeData.defenderTestResult.SL)
    let damage = opposeData.attackerTestResult.damage;
    if (opposeData.attackerTestResult.weapon)
      damage = opposeData.attackerTestResult.weapon.data.damage.value + opposedSL;

    let addDamaging = false;
    let addImpact = false;
    if (opposeData.attackerTestResult.trait) {
      if (sizeDiff >= 1)
        addDamaging = true;
      if (sizeDiff >= 2)
        addImpact = true;
    }
    if (opposeData.attackerTestResult.weapon) {
      if (sizeDiff >= 1 || opposeData.attackerTestResult.weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Damaging")))
        addDamaging = true;
      if (sizeDiff >= 2 || opposeData.attackerTestResult.weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Impact")))
        addImpact = true;
    }

    if (addDamaging) {
      let unitValue = Number(opposeData.attackerTestResult.roll.toString().split("").pop())
      if (unitValue === 0)
        unitValue = 10;

      if (unitValue > opposedSL)
      {
        damage = damage - opposedSL + unitValue; // replace opposedSL with unit value
      }
    }
    if (addImpact) {
      let unitValue = Number(opposeData.attackerTestResult.roll.toString().split("").pop())
      if (unitValue === 0)
        unitValue = 10;
      damage += unitValue
    }
    return damage * damageMultiplier
  }

  // Opposed starting message - manual opposed
  static createOpposedStartMessage(speaker, rollMode) {
    let content = `<div><b>${speaker.alias}<b> ${game.i18n.localize("ROLL.OpposedStart")}<div>`
    let chatOptions = WFRP_Utility.chatDataSetup(content, rollMode);

    chatOptions["hideData"] = true;
    chatOptions["flags"] = { "opposedStartMessage": true };

    ChatMessage.create(chatOptions).then(msg => this.startMessage = msg)
  }

  // Update starting message with result - manual opposed
  static updateOpposedMessage(damageConfirmation, msgId) {
    let opposeMessage = game.messages.get(msgId);
    let rollMode = opposeMessage.data.rollMode;

    let newCard = {
      user: game.user._id,
      rollMode: rollMode,
      hideData: true,
      content: $(opposeMessage.data.content).append(`<div>${damageConfirmation}</div>`).html()
    }

    if (!game.user.isGM)
      return game.socket.emit("system.wfrp4e", {type: "updateMsg", payload : {id : msgId, updateData : newCard}})

    opposeMessage.update(newCard).then(resultMsg => {
      ui.chat.updateMessage(resultMsg)
    })
  }

  // Clear all opposed data - manual opposed
  static clearOpposed() {
    this.opposedInProgress = false;
    this.attacker = {};
    this.defender = {};
    this.startMessage = null;
  }

  /**
   * Determines opposed status, sets flags accordingly, creates start/result messages.
   *
   * There's 4 paths handleOpposed can take, either 1. Responding to being targeted, 2. Starting an opposed test, Rerolling an un/opposed test, or neither.
   *
   * 1. Responding to a target: If the actor has a value in flags.oppose, that means another actor targeted them: Organize
   *    attacker and defender data, and send it to the OpposedWFRP.evaluateOpposedTest() method. Afterward, remove the oppose
   *    flag
   * 2. Starting an opposed test: If the user using the actor has a target, start an opposed Test: create the message then
   *    insert oppose data into the target's flags.oppose object.
   * 3. Reroll: We look at the type of reroll (opposed or unopposed), if it as ended or not,  then if it has ended, we retrieve the original targets and we evaluate the test
   * 4. Neither: If no data in the actor's oppose flags, and no targets, skip everything and return.
   * 
   *
   * @param {Object} message    The message created by the override (see above) - this message is the Test result message.
   */
  static async handleOpposedTarget(message) {
    if (!message) return;
    // Get actor/tokens and test results
    let actor = WFRP_Utility.getSpeaker(message.data.speaker)
    let testResult = message.data.flags.data.postData

    try {
      /* -------------- IF OPPOSING AFTER BEING TARGETED -------------- */
      if (actor.data.flags.oppose) // If someone targets an actor, they insert data in the target's flags.oppose
      { // So if data exists here, this actor has been targeted, see below for what kind of data is stored here
        let attackMessage = game.messages.get(actor.data.flags.oppose.messageId) // Retrieve attacker's test result message
        // Organize attacker/defender data
        let attacker = {
          speaker: actor.data.flags.oppose.speaker,
          testResult: attackMessage.data.flags.data.postData,
          messageId: attackMessage.data._id,
          img: WFRP_Utility.getSpeaker(actor.data.flags.oppose.speaker).data.img
        };

        let defender = {
          speaker: message.data.speaker,
          testResult: testResult,
          messageId: message.data._id,
          img: actor.data.msg
        };
        //Edit the attacker message to give it a ref to the defender message (used for rerolling)
        //Have to do it locally if player for permission issues
        let listOfDefenders = attackMessage.data.flags.data.defenderMessage ? Array.from(attackMessage.data.flags.data.defenderMessage) : [];
        listOfDefenders.push(message.data._id);

        if (game.user.isGM) {
          attackMessage.update({
            "flags.data.defenderMessage": listOfDefenders
          });
        }
        //Edit the defender message to give it a ref to the attacker message (used for rerolling)
        message.update(
          {
            "flags.data.attackerMessage": attackMessage.data._id
          });
        // evaluateOpposedTest is usually for manual opposed tests, it requires extra options for targeted opposed test
        await OpposedWFRP.completeOpposedProcess(attacker, defender,
          {
            target: true,
            startMessageId: actor.data.flags.oppose.startMessageId,
            whisper: message.data.whisper,
            blind: message.data.blind,
          })
        await actor.update(
          {
            "-=flags.oppose": null
          }) // After opposing, remove oppose

      }

      /* -------------- IF TARGETING SOMEONE -------------- */
      else if (game.user.targets.size && !message.data.flags.data.defenderMessage && !message.data.flags.data.attackerMessage) // if user using the actor has targets and its not a rerolled opposed test
      {
        // Ranged weapon opposed tests automatically lose no matter what if the test itself fails
        if (testResult.weapon && testResult.weapon.rangedWeaponType && testResult.roll > testResult.target) {
          // TODO: Sound
          ChatMessage.create({ speaker: message.data.speaker, content: game.i18n.localize("OPPOSED.FailedRanged") })
          message.data.flags.data.originalTargets = new Set(game.user.targets);

          message.update(
            {
              "flags.data.isOpposedTest": false
            });
          //Update in local temp message to reroll a ranged failed attack with same targets
          //Won't work after a reload but its good enough and bypass foundry depth limit in update
          game.messages.set(message.data._id, message);

          //Note 2020-04-25: this method is bugged and will raise an exception so keep it at the end
          game.user.updateTokenTargets([]);
          return;
        }

        let attacker;
        // If token data was found in the message speaker (see setupCardOptions)
        if (message.data.speaker.token)
          attacker = canvas.tokens.get(message.data.speaker.token).data

        else // If no token data was found in the speaker, use the actor's token data instead
          attacker = actor.data.token

        // For each target, create a message, and insert oppose data in the targets' flags
        let startMessagesList = [];
        game.user.targets.forEach(async target => {
          let content =
            `<div class ="opposed-message">
            <b>${attacker.name}</b> ${game.i18n.localize("ROLL.Targeting")} <b>${target.data.name}</b>
          </div>
          <div class = "opposed-tokens">
          <div class = "attacker"><img src="${attacker.img}" width="50" height="50"/></div>
          <div class = "defender"><img src="${target.data.img}" width="50" height="50"/></div>
          </div>
          <div class="unopposed-button" data-target="true" title="${game.i18n.localize("Unopposed")}"><a><i class="fas fa-arrow-down"></i></a></div>`

          // Create the Opposed starting message
          let startMessage = await ChatMessage.create(
            {
              user: game.user._id,
              content: content,
              speaker: message.data.speaker,
              ["flags.unopposeData"]: // Optional data to resolve unopposed tests - used for damage values
              {
                attackMessageId: message.data._id,
                targetSpeaker:
                {
                  scene: target.scene.data._id,
                  token: target.data._id,
                  scene: target.actor.data._id,
                  alias: target.data.name
                }
              }
            })

          if (!game.user.isGM) {
            game.socket.emit("system.wfrp4e", {
              type: "target",
              payload: {
                target: target.data._id,
                scene: canvas.scene._id,
                opposeFlag: {
                  speaker: message.data.speaker,
                  messageId: message.data._id,
                  startMessageId: startMessage.data._id
                }
              }
            })
          }
          else {
            // Add oppose data flag to the target
            target.actor.update(
              {
                "flags.oppose":
                {
                  speaker: message.data.speaker,
                  messageId: message.data._id,
                  startMessageId: startMessage.data._id
                }
              })
          }
          startMessagesList.push(startMessage.data._id);
          // Remove current targets
        })
        //Give the roll a list of every startMessages linked to this roll
        message.data.flags.data.startMessagesList = startMessagesList;
        game.user.updateTokenTargets([]);
      }
      //It's an opposed reroll of an ended test
      else if (message.data.flags.data.defenderMessage || message.data.flags.data.attackerMessage) {
        //The attacker rerolled
        let attacker, defender;
        if (message.data.flags.data.defenderMessage) {
          for (let msg of message.data.flags.data.defenderMessage) {
            attacker = {
              speaker: message.data.speaker,
              testResult: message.data.flags.data.postData,
              img: WFRP_Utility.getSpeaker(message.data.speaker).data.img,
              messageId : message.data._id
            };
            let defenderMessage = game.messages.get(msg);
            defender = {
              speaker: defenderMessage.data.speaker,
              testResult: defenderMessage.data.flags.data.postData,
              img: WFRP_Utility.getSpeaker(defenderMessage.data.speaker).data.img,
              messageId: msg
            };
            this.completeOpposedProcess(attacker, defender, { blind: message.data.blind, whisper: message.data.whisper });
          }
        }
        else //The defender rerolled
        {
          defender = {
            speaker: message.data.speaker,
            testResult: message.data.flags.data.postData,
            img: WFRP_Utility.getSpeaker(message.data.speaker).data.img,
            messageId: message.data._id
          };
          let attackerMessage = game.messages.get(message.data.flags.data.attackerMessage);
          attacker = {
            speaker: attackerMessage.data.speaker,
            testResult: attackerMessage.data.flags.data.postData,
            img: WFRP_Utility.getSpeaker(attackerMessage.data.speaker).data.img,
            messageId : message.data.flags.data.attackerMessage
          };
          this.completeOpposedProcess(attacker, defender, { blind: message.data.blind, whisper: message.data.whisper });
        }
      }
      //It's an unopposed test reroll
      else if (message.data.flags.data.unopposedStartMessage) {
        // Ranged weapon opposed tests automatically lose no matter what if the test itself fails
        if (testResult.weapon && testResult.weapon.rangedWeaponType && testResult.roll > testResult.target) {
          ChatMessage.create({ speaker: message.data.speaker, content: game.i18n.localize("OPPOSED.FailedRanged") });
          message.update(
            {
              "flags.data.isOpposedTest": false
            });
          return;
        }
        //We retrieve the original startMessage and change it (locally only because of permissions) to start a new unopposed result
        let startMessage = game.messages.get(message.data.flags.data.unopposedStartMessage);
        startMessage.data.flags.unopposeData.attackMessageId = message.data._id;
        startMessage.data.flags.reroll = true;
        this.resolveUnopposed(startMessage);
      }
      //It's a reroll of an ongoing opposed test
      else if (message.data.flags.data.startMessagesList) {
        for (let startMessageId of message.data.flags.data.startMessagesList) {
          let startMessage = game.messages.get(startMessageId);
          let data = startMessage.data.flags.unopposeData;
          //Update the targeted actors to let them know of the new startMessage and attack message
          game.socket.emit("system.wfrp4e", {
            type: "target",
            payload: {
              target: data.targetSpeaker.token,
              scene: canvas.scene._id,
              opposeFlag: {
                speaker: message.data.speaker,
                messageId: message.data._id,
                startMessageId: startMessage.data._id
              }
            }
          })
          startMessage.update({
            "flags.unopposeData.attackMessageId": message.data._id
          });
        }
      }
    }
    catch (e) {
      console.log(e);
      await actor.update({ "-=flags.oppose": null }) // If something went wrong, remove incoming opposed tests
    }
  }

  /**
   * Unopposed test resolution is an option after starting a targeted opposed test. Unopposed data is
   * stored in the the opposed start message. We can compare this with dummy values of 0 for the defender
   * to simulate an unopposed test. This allows us to calculate damage values for ranged weapons and the like.
   * 
   * @param {Object} startMessage message of opposed start message
   */
  static async resolveUnopposed(startMessage) {
    let unopposeData = startMessage.data.flags.unopposeData;

    let attackMessage = game.messages.get(unopposeData.attackMessageId) // Retrieve attacker's test result message
    // Organize attacker data
    let attacker = {
      speaker: attackMessage.data.speaker,
      testResult: attackMessage.data.flags.data.postData,
      messageId: unopposeData.attackMessageId
    }
    // Organize dummy values for defender
    let target = canvas.tokens.get(unopposeData.targetSpeaker.token)
    let defender = {
      speaker: unopposeData.targetSpeaker,
      testResult:
      {
        SL: 0,
        size: target.actor.data.data.details.size.value,
        actor: target.actor.data,
        target: 0,
        roll: 0,
        unopposed : true
      }
    }
    // Remove opposed flag
    if (!startMessage.data.flags.reroll)
      await target.actor.update({ "-=flags.oppose": null })
    // Evaluate
    this.completeOpposedProcess(attacker, defender,
      {
        target: true,
        startMessageId: startMessage.data._id
      });
    attackMessage.update(
      {
        "flags.data.isOpposedTest": false,
        "flags.data.unopposedStartMessage": startMessage.data._id
      });
  }

}