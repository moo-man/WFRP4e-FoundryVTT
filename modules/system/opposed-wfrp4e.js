import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

import ChatWFRP from "./chat-wfrp4e.js";
import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import OpposedTest from "./opposed-test.js";

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

    // If opposed already in progress, the click was for the defender
    if (this.startMessage) {
      // If the startMessage still exists, proceed with the opposed test. Otherwise, start a new opposed test
      if (game.messages.get(this.startMessage.id))
      {
        this.setupDefense(message);
        this.completeOpposedProcess(this.attackerMessage, this.defenderMessage)
      }
      else {
        this.clearOpposed();
        this.opposedClicked(event);
      }
    }
    else // If no opposed roll in progress, click was for the attacker
    {
      this.setupAttack(message)
    }
  }

  /**
   * Create a new test result when rerolling or adding sl in an opposed test
   * @param {Object} attackerRollMessage 
   * @param {Object} defenderRollMessage 
   */
  static opposedRerolled(attackerRollMessage, defenderRollMessage) {
    let attacker = {
      testResult: attackerRollMessage.data.flags.data.testData.result,
      speaker: attackerRollMessage.data.speaker,
      messageId: attackerRollMessage.id,
    };
    let defender = {
      testResult: defenderRollMessage.data.flags.data.testData.result,
      speaker: defenderRollMessage.data.speaker,
      messageId: defenderRollMessage.id,
    };
    this.evaluateOpposedTest(attacker, defender);
  }

  static async completeOpposedProcess(attackerMessage, defenderMessage, options) {
    try {
      if (!defenderMessage && options.unopposedTarget)
        this.setupUnopposed(attackerMessage, options.unopposedTarget, options)
        
      else if (!this.opposedTest)
        this.setupOpposed(attackerMessage, defenderMessage, options);

      await this.opposedTest.evaluate()
      this.formatOpposedResult(this.opposedTest.result);
      this.rerenderMessagesWithModifiers(this.opposedTest);
      this.renderOpposedResult(this.startMessage, options)
      return this.opposedTest.result
    }
    catch (e) {
      console.error("Could not complete opposed test: " + e)
      this.clearOpposed();
    }
    finally {
      this.clearOpposed();
    }
  }


  static setupAttack(message, options={}) {
    this.opposedInProgress = true;
    this.attackerMessage = message
    this.opposedTest = new OpposedTest(message.data.flags.data.testData)
    if (options.existingTest)
      return
    message.update(
      {
        "flags.data.isOpposedTest": true
      });
    if (!options.target)
      this.createOpposedStartMessage(message.data.speaker, message.data.flags.data.rollMode);
  }

  static setupDefense(message, options={}) {
    // Store defender in object member
    this.defenderMessage = message

    if (!this.opposedTest)
      this.setupAttack(message)
    else
      this.opposedTest.createDefenderTest(message.data.flags.data.testData)

    //Edit the attacker message to give it a ref to the defender message (used for rerolling)
    if (game.user.isGM || this.attackerMessage.isOwner)
      this.attackerMessage.update({ "flags.data.defenderMessage": [message.id] })
    else 
      game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: this.attackerMessage.id, updateData: { "flags.data.defenderMessage": [message.id] } } })


      //Edit the defender message to give it a ref to the attacker message (used for rerolling)
    if (game.user.isGM || this.defenderMessage.isOwner)
    {
      this.defenderMessage.update({ "flags.data.attackerMessage": this.attackerMessage.id });
    }
    else 
      game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: this.defenderMessage.id, updateData: { "flags.data.attackerMessage": [this.attackerMessage.id] } } })
      
  }

  static setupOpposed(attackerMessage, defenderMessage, options) {
    this.setupAttack(attackerMessage, options)
    this.setupDefense(defenderMessage, options)
  }

  static setupUnopposed(attackerMessage, defender, options)
  {
    this.setupAttack(attackerMessage, options)
    this.opposedTest.createUnopposedDefender(defender)
  }


  static formatOpposedResult(opposeResult) {

    let attackerAlias = this.attackerMessage.data.speaker.alias

    // Account for unopposed tests not having a defender message
    let defenderAlias  = this.defenderMessage ? this.defenderMessage.data.speaker.alias : this.opposedTest.defenderTest.actor.data.token.name

    if (opposeResult.winner == "attacker") {
      opposeResult.result = game.i18n.format("OPPOSED.AttackerWins", {
        attacker: attackerAlias,
        defender: defenderAlias,
        SL: opposeResult.differenceSL
      })
      opposeResult.img = this.attackerMessage.data.flags.img;
    }
    else if (opposeResult.winner == "defender") {
      opposeResult.result = game.i18n.format("OPPOSED.DefenderWins", {
        defender: defenderAlias,
        attacker: attackerAlias,
        SL: opposeResult.differenceSL
      })
      opposeResult.img = this.defenderMessage ? this.defenderMessage.data.flags.img : this.opposedTest.defenderTest.actor.data.token.img
    }

    return opposeResult;
  }

  static rerenderMessagesWithModifiers() {
    let opposeResult = this.opposedTest.result
    if (opposeResult.modifiers.didModifyAttacker) {
      let attackerMessage = this.attackerMessage
      opposeResult.modifiers.message.push(`${game.i18n.format(game.i18n.localize('CHAT.TestModifiers.FinalModifiers'), { target: opposeResult.modifiers.attacker.target, sl: opposeResult.modifiers.attacker.SL, name: this.opposedTest.attackerTest.actor.data.token.name })}`)
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

      attackerMessage.data.flags.data.testData.preData.testModifier = attackerMessage.data.flags.data.testData.preData.testModifier + opposeResult.modifiers.attacker.target;
      attackerMessage.data.flags.data.testData.preData.slBonus = attackerMessage.data.flags.data.testData.preData.slBonus + opposeResult.modifiers.attackerSL;
      attackerMessage.data.flags.data.testData.preData.roll = attackerMessage.data.flags.data.testData.result.roll
      attackerMessage.data.flags.data.hasBeenCalculated = true;
      attackerMessage.data.flags.data.calculatedMessage = opposeResult.modifiers.message;
      if (!opposeResult.swapped)
        ChatWFRP.renderRollCard(chatOptions, this.opposedTest.attackerTest, attackerMessage)
      else
        ChatWFRP.renderRollCard(chatOptions, this.opposedTest.defenderTest, attackerMessage)

    }
    if (opposeResult.modifiers.didModifyDefender) {
      opposeResult.modifiers.message.push(`${game.i18n.format(game.i18n.localize('CHAT.TestModifiers.FinalModifiers'), { target: opposeResult.modifiers.defender.target, sl: opposeResult.modifiers.defender.SL, name: this.opposedTest.defenderTest.actor.data.token.name })}`)
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

      defenderMessage.data.flags.data.testData.preData.testModifier = defenderMessage.data.flags.data.testData.preData.testModifier + opposeResult.modifiers.defender.target;
      defenderMessage.data.flags.data.testData.preData.slBonus = defenderMessage.data.flags.data.testData.preData.slBonus + opposeResult.modifiers.defenderSL;
      defenderMessage.data.flags.data.testData.preData.roll = defenderMessage.data.flags.data.testData.result.roll
      defenderMessage.data.flags.data.hasBeenCalculated = true;
      defenderMessage.data.flags.data.calculatedMessage = opposeResult.modifiers.message;
      if (!opposeResult.swapped)
        ChatWFRP.renderRollCard(chatOptions, this.opposedTest.defenderTest, defenderMessage)
      else
        ChatWFRP.renderRollCard(chatOptions, this.opposedTest.attackerTest, defenderMessage)
    }
  }

  static async renderOpposedResult(startMessage, options = {}) {
    let opposeData = this.opposedTest.data
    let opposeResult = this.opposedTest.result
    // If targeting, Create a new result message
    if (options.target) {
      opposeResult.hideData = true;
      renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.html", opposeResult).then(html => {
        let chatOptions = {
          user: game.user.id,
          content: html,
          "flags.opposeData": opposeData,
          "flags.startMessageId": options.startMessageId,
          whisper: options.whisper,
          blind: options.blind,
        }
        ChatMessage.create(chatOptions)
      })
    }
    else // If manual - update start message and clear opposed data
    {
      opposeResult.hideData = true;
      let html = await renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.html", opposeResult)
      let chatOptions = {
        user: game.user.id,
        content: html,
        blind: options.blind,
        whisper: options.whisper,
        "flags.opposeData": opposeData
      }
      try {
        startMessage.update(chatOptions).then(resultMsg => {
          ui.chat.updateMessage(resultMsg)
          this.clearOpposed();
        })
      }
      catch
      {
        ChatMessage.create(chatOptions)
        this.clearOpposed();
      }
    }
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
      user: game.user.id,
      rollMode: rollMode,
      hideData: true,
      content: $(opposeMessage.data.content).append(`<div>${damageConfirmation}</div>`).html()
    }

    if (!game.user.isGM)
      return game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: msgId, updateData: newCard } })

    opposeMessage.update(newCard).then(resultMsg => {
      ui.chat.updateMessage(resultMsg)
    })
  }

  // Clear all opposed data - manual opposed
  static clearOpposed() {
    this.opposedInProgress = false;
    this.opposedTest = undefined;
    this.attackerMessage = undefined;
    this.defenderMessage = undefined;
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
    let test = message.getTest();
    let actor = WFRP_Utility.getSpeaker(test.context.speaker)
    let testResult = test.result

    try {
      /* -------------- IF OPPOSING AFTER BEING TARGETED -------------- */
      if (actor.data.flags.oppose) // If someone targets an actor, they insert data in the target's flags.oppose
      { // So if data exists here, this actor has been targeted, see below for what kind of data is stored here
        let attackMessage = game.messages.get(actor.data.flags.oppose.messageId) // Retrieve attacker's test result message

        //Edit the attacker message to give it a ref to the defender message (used for rerolling)
        //Have to do it locally if player for permission issues
        let listOfDefenders = attackMessage.data.flags.data.defenderMessage ? Array.from(attackMessage.data.flags.data.defenderMessage) : [];
        listOfDefenders.push(message.id);

        if (game.user.isGM) {
          attackMessage.update({
            "flags.data.defenderMessage": listOfDefenders
          });
        }
        //Edit the defender message to give it a ref to the attacker message (used for rerolling)
        message.update(
          {
            "flags.data.attackerMessage": attackMessage.id
          });

        // evaluateOpposedTest is usually for manual opposed tests, it requires extra options for targeted opposed test
        await OpposedWFRP.completeOpposedProcess(attackMessage, message, {
          target: true,
          startMessageId: actor.data.flags.oppose.startMessageId,
          whisper: message.data.whisper,
          blind: message.data.blind,
        })
        await actor.update({"flags.-=oppose": null}) // After opposing, remove oppose
      }

      /* -------------- IF TARGETING SOMEONE -------------- */
      else if (game.user.targets.size && !message.data.flags.data.defenderMessage && !message.data.flags.data.attackerMessage) // if user using the actor has targets and its not a rerolled opposed test
      {
        // Ranged weapon opposed tests automatically lose no matter what if the test itself fails
        if (test.item && test.item.attackType == "ranged" && testResult.outcome == "failure") {
          // TODO: Sound
          ChatMessage.create({ speaker: message.data.speaker, content: game.i18n.localize("OPPOSED.FailedRanged") })
          message.data.flags.data.originalTargets = new Set(game.user.targets);

          message.update(
            {
              "flags.data.isOpposedTest": false
            });
          //Update in local temp message to reroll a ranged failed attack with same targets
          //Won't work after a reload but its good enough and bypass foundry depth limit in update
          game.messages.set(message.id, message);

          //Note 2020-04-25: this method is bugged and will raise an exception so keep it at the end
          game.user.updateTokenTargets([]);
          return;
        }

        let attacker;
        // If token data was found in the message speaker (see setupCardOptions)
        if (message.data.speaker.token)
          attacker = canvas.tokens.get(message.data.speaker.token).data.toObject()

        else // If no token data was found in the speaker, use the actor's token data instead
          attacker = duplicate(actor.data.token)

        if (getProperty(attacker, "flags.wfrp4e.mask")) {
          attacker.name = "???"
          attacker.img = "systems/wfrp4e/tokens/unknown.png"
        }

        // For each target, create a message, and insert oppose data in the targets' flags
        let startMessagesList = [];
        game.user.targets.forEach(async target => {
          let content =
            `<div class ="opposed-message">
            <b>${attacker.name}</b> ${game.i18n.localize("ROLL.Targeting")} <b>${target.data.name}</b>
          </div>
          <div class = "opposed-tokens">
          <a class = "attacker"><img src="${attacker.img}" width="50" height="50"/></a>
          <a class = "defender"><img src="${target.data.img}" width="50" height="50"/></a>
          </div>
          <div class="unopposed-button" data-target="true" title="${game.i18n.localize("Unopposed")}"><a><i class="fas fa-arrow-down"></i></a></div>`

          // Create the Opposed starting message
          let startMessage = await ChatMessage.create(
            {
              user: game.user.id,
              content: content,
              speaker: message.data.speaker,
              ["flags.unopposeData"]: // Optional data to resolve unopposed tests - used for damage values
              {
                attackMessageId: message.id,
                targetSpeaker:
                {
                  scene: target.scene.id,
                  token: target.id,
                  alias: target.data.name
                }
              }
            })

          if (!game.user.isGM) {
            game.socket.emit("system.wfrp4e", {
              type: "target",
              payload: {
                target: target.id,
                scene: canvas.scene.id,
                opposeFlag: {
                  speaker: message.data.speaker,
                  messageId: message.id,
                  startMessageId: startMessage.id
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
                  messageId: message.id,
                  startMessageId: startMessage.id
                }
              })
          }
          startMessagesList.push(startMessage.id);
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
              testResult: message.data.flags.data.testData.result,
              img: WFRP_Utility.getSpeaker(message.data.speaker).data.img,
              messageId: message.id
            };
            let defenderMessage = game.messages.get(msg);
            defender = {
              speaker: defenderMessage.data.speaker,
              testResult: defenderMessage.data.flags.data.testData.result,
              img: WFRP_Utility.getSpeaker(defenderMessage.data.speaker).data.img,
              messageId: msg
            };
            this.completeOpposedProcess(message, defenderMessage, { blind: message.data.blind, whisper: message.data.whisper, existingTest : true });
          }
        }
        else //The defender rerolled
        {
          defender = {
            speaker: message.data.speaker,
            testResult: message.data.flags.data.testData.result,
            img: WFRP_Utility.getSpeaker(message.data.speaker).data.img,
            messageId: message.id
          };
          let attackerMessage = game.messages.get(message.data.flags.data.attackerMessage);
          attacker = {
            speaker: attackerMessage.data.speaker,
            testResult: attackerMessage.data.flags.data.testData.result,
            img: WFRP_Utility.getSpeaker(attackerMessage.data.speaker).data.img,
            messageId: message.data.flags.data.attackerMessage
          };
          this.completeOpposedProcess(attackerMessage, message, { blind: message.data.blind, whisper: message.data.whisper, existingTest : true });
        }
      }
      //It's an unopposed test reroll
      else if (message.data.flags.data.unopposedStartMessage) {
        let test = message.getTest()
        // Ranged weapon opposed tests automatically lose no matter what if the test itself fails
        if (test.weapon && test.weapon.attackTye == "ranged" && test.result.roll > test.result.target) {
          ChatMessage.create({ speaker: message.data.speaker, content: game.i18n.localize("OPPOSED.FailedRanged") });
          message.update(
            {
              "flags.data.isOpposedTest": false
            });
          return;
        }
        //We retrieve the original startMessage and change it (locally only because of permissions) to start a new unopposed result
        let startMessage = game.messages.get(message.data.flags.data.unopposedStartMessage);
        startMessage.data.flags.unopposeData.attackMessageId = message.id;
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
              scene: canvas.scene.id,
              opposeFlag: {
                speaker: message.data.speaker,
                messageId: message.id,
                startMessageId: startMessage.id
              }
            }
          })
          startMessage.update({
            "flags.unopposeData.attackMessageId": message.id
          });
        }
      }
    }
    catch (e) {
      console.log(e);
      await actor.update({"flags.-=oppose": null}) // If something went wrong, remove incoming opposed tests
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

    
    // Organize dummy values for defender
    let target = game.wfrp4e.utility.getSpeaker(unopposeData.targetSpeaker)

    // Remove opposed flag
    if (!startMessage.data.flags.reroll)
      await target.update({ "flags.-=oppose": null })
    // Evaluate
    this.completeOpposedProcess(attackMessage, undefined,
      {
        target: true,
        startMessageId: startMessage.id,
        unopposedTarget: target
      });
    attackMessage.update(
      {
        "flags.data.isOpposedTest": false,
        "flags.data.unopposedStartMessage": startMessage.id
      });
  }

}