import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

import ChatWFRP from "./chat-wfrp4e.js";
import OpposedTest from "./opposed-test.js";

/**
 * Represents an opposed test. This object is stored in the "targeting" messages and is used as a central manager of a single opposed test.
 * - Stores targeting message id, attacker message id, defender message id, and result message ID
 * - Actors who have been targeted are flagged with the targeting message ID (messageId)
 * - @see TestWFRP - Tests have a list of opposedMessageIds, that being messageId
 **/
export default class OpposedWFRP {

  constructor(data = {}) {
    this.data = {
      messageId: data.messageId,
      attackerMessageId: data.attackerMessageId,
      defenderMessageId: data.defenderMessageId,
      resultMessageId: data.resultMessageId,
      targetSpeakerData: data.targetSpeakerData,
      options: data.options || {},
      unopposed: data.unopposed
    }
  }

  get message() {
    return game.messages.get(this.data.messageId);
  }

  get resultMessage() {
    return game.messages.get(this.data.resultMessageId);
  }

  get target() {
    return WFRP_Utility.getToken(this.data.targetSpeakerData);
  }

  get attackerMessage() {
    return game.messages.get(this.data.attackerMessageId);
  }

  get defenderMessage() {
    return game.messages.get(this.data.defenderMessageId);
  }

  get attackerTest() {
    return this.attackerMessage?.getTest();
  }

  get defenderTest() {
    if (this.unopposed) {
      return new game.wfrp4e.rolls.CharacteristicTest({
        item: "ws",
        SL: 0,
        target: 0,
        roll: 0,
        unopposed: true,
      }, this.target.actor)
    }
    else
      return this.defenderMessage?.getTest();
  }

  get attacker() {
    return this.attackerTest?.actor
  }

  get defender() {
    return this.defenderTest ? this.defenderTest.actor : WFRP_Utility.getSpeaker(this.data.targetSpeakerData) // If opposed test isn't complete, use targetSPeakerData
  }

  get options() {
    return this.data.options;
  }

  get unopposed() {
    return this.data.unopposed;
  }

  async startOppose(targetToken) {
    this.data.targetSpeakerData = targetToken.actor.speakerData(targetToken)
    await this.renderOpposedStart();
    this._addOpposeFlagsToDefender(targetToken);
    return this.message.id
  }

  setAttacker(message) {
    this.data.attackerMessageId = typeof message == "string" ? message : message.id;
    this.data.options = {
      whisper: message.whisper,
      blind: message.blind
    }
    if (this.message)
      return this.updateMessageFlags();
  }

  setDefender(message) {
    this.data.defenderMessageId = typeof message == "string" ? message : message.id
    if (this.message)
      return this.updateMessageFlags();
  }

  async computeOpposeResult() {
    if (!this.attackerTest || !this.defenderTest)
      throw new Error(game.i18n.localize("ERROR.Opposed"))

    this.opposedTest = new OpposedTest(this.attackerTest, this.defenderTest);

    await this.opposedTest.evaluate();
    this.formatOpposedResult();
    this.renderOpposedResult()
    this.colorWinnerAndLoser()
  }

  renderOpposedStart() {
    return new Promise(async resolve => {
      let attacker = game.canvas.tokens.get(this.attackerTest.context.cardOptions.speaker.token)?.document ?? this.attacker.prototypeToken;
      let defender

      // Support opposed start messages when defender is not set yet - allows for manual opposed to use this message
      if (this.target)
        defender = this.target
      else if (this.defenderTest)
        defender = WFRP_Utility.getToken(this.defenderTest.context.speaker) || this.defender.prototypeToken;

      let defenderImg = defender ? `<a class = "defender"><img src="${defender.texture.src}" width="50" height="50"/></a>` : `<a class = "defender"><img width="50" height="50"/></a>`

      let content =
        `<div class ="opposed-message">
            ${game.i18n.format("ROLL.Targeting", {attacker: ((attacker.hidden) ? "???" : attacker.name), defender: defender ? defender.name : "???"})}
          </div>
          <div class = "opposed-tokens">
          <a class = "attacker"><img src="${((attacker.hidden) ? "systems/wfrp4e/tokens/unknown.png" : attacker.texture.src)}" width="50" height="50"/></a>
          ${defenderImg}
          </div>
          <div class="unopposed-button" data-target="true" title="${game.i18n.localize("Unopposed")}"><a><i class="fas fa-arrow-down"></i></a></div>`



      // Ranged weapon opposed tests automatically lose no matter what if the test itself fails
      if (this.attackerTest.item && this.attackerTest.item.attackType == "ranged" && this.attackerTest.result.outcome == "failure") {
        ChatMessage.create({ speaker: this.attackerMessage.speaker, content: game.i18n.localize("OPPOSED.FailedRanged") })
        //await test.updateMessageFlags({ "context.opposed": false });
        return;
      }
      let chatData = {
        user: game.user.id,
        content: content,
        speaker: { alias: game.i18n.localize("CHAT.OpposedTest") },
        whisper: this.options.whisper,
        blind: this.options.blind,
        "flags.wfrp4e.opposeData": this.data
      }

      if (this.message) {
        await this.message.update(chatData);
        resolve(this.data.messageId);
      }
      else {
        // Create the Opposed starting message
        return ChatMessage.create(chatData).then(async msg => {
          // Must wait until message and ID is created before proceeding with opposed process
          this.data.messageId = msg.id;
          await this.updateMessageFlags();
          resolve(msg.id);
        })
      }
    })
  }

  updateMessageFlags() {
    let updateData = { "flags.wfrp4e.opposeData": this.data }
    if (this.message && game.user.isGM)
      return this.message.update(updateData)

    else if (this.message)
    {
      this.message.flags.wfrp4e.opposeData = this.data // hopefully temporary solution. Other processes likely need flag data to be present immediately, and the inner socket function cannot be awaited, so set data locally
      game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: this.message.id, updateData } })

    }
  }



  async renderOpposedResult() {
    let opposeData = this.opposedTest.data
    let opposeResult = this.opposedTest.result
    let options = this.options;
    opposeResult.hideData = true;
    let html = await renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-result.hbs", opposeResult)
    let chatOptions = {
      user: game.user.id,
      content: html,
      "flags.wfrp4e.opposeTestData": opposeData,
      "flags.wfrp4e.opposeId": this.message.id,
      whisper: options.whisper,
      blind: options.blind,
    }
    return ChatMessage.create(chatOptions).then(msg => {
      this.data.resultMessageId = msg.id;
      this.updateMessageFlags();
    })

  }

  formatOpposedResult() {

    let opposeResult = this.opposedTest.opposeResult
    let attackerAlias = this.attackerTest.message.speaker.alias

    // Account for unopposed tests not having a defender message
    let defenderAlias = this.defenderMessage ? this.defenderMessage.speaker.alias : this.defenderTest.actor.prototypeToken.name

    if (opposeResult.winner == "attacker") {
      opposeResult.result = game.i18n.format("OPPOSED.AttackerWins", {
        attacker: attackerAlias,
        defender: defenderAlias,
        SL: opposeResult.differenceSL
      })
      opposeResult.img = this.attackerMessage.flags.img;
    }
    else if (opposeResult.winner == "defender") {
      opposeResult.result = game.i18n.format("OPPOSED.DefenderWins", {
        defender: defenderAlias,
        attacker: attackerAlias,
        SL: opposeResult.differenceSL
      })
      opposeResult.img = this.defenderMessage ? this.defenderMessage.flags.img : this.defenderTest.actor.prototypeToken.texture.src
    }

    return opposeResult;
  }

  colorWinnerAndLoser() 
  {
    try {
      let winner = this.opposedTest.opposeResult.winner

      // The loser is "attacker" or "defender"
      let loser = winner == "attacker" ? "defender" : "attacker"

      // Replace "attacker" with "attacker winner" or "defender" with "defender winner" to apply the color coded borders
      let content = this.message.content
      content = content.replace(winner, `${winner} winner`)
      content = content.replace(loser, `${loser} loser`)

      if (!game.user.isGM)
        return game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: this.message.id, updateData: {content} } })
      else
        return this.message.update({content})
    }
    catch(e)
    {
      console.error(`Error color coding winner and loser: ${e}`)
    }
  }


  _addOpposeFlagsToDefender(target) {
    if (!game.user.isGM) {
      game.socket.emit("system.wfrp4e", {
        type: "target",
        payload: {
          target: target.id,
          scene: canvas.scene.id,
          opposeFlag: { opposeMessageId: this.data.messageId }
        }
      })
    }
    else {
      // Add oppose data flag to the target
      target.actor.update(
        {
          "flags.oppose": { opposeMessageId: this.data.messageId }
        })
    }
  }

  /**
 * The opposed button was clicked, evaluate whether it is an attacker or defender, then proceed
 * to evaluate if necessary.
 * 
 * @param {Object} event Click event for opposed button click
 */
  static async opposedClicked(event) {
    let button = $(event.currentTarget),
      messageId = button.parents('.message').attr("data-message-id"),
      message = game.messages.get(messageId);

    // Opposition already exists - click was defender
    if (game.wfrp4e.oppose) {
      game.wfrp4e.oppose.setDefender(message);
      await game.wfrp4e.oppose.renderOpposedStart() // Rerender opposed start with new message
      game.wfrp4e.oppose.computeOpposeResult();
      delete game.wfrp4e.oppose;
    }
    // No opposition - click was attacker
    else {
      game.wfrp4e.oppose = new OpposedWFRP()
      game.wfrp4e.oppose.setAttacker(message);
      game.wfrp4e.oppose.renderOpposedStart()
    }
  }


  resolveUnopposed() {
    this.data.unopposed = true;
    this.computeOpposeResult();
    this.defender.clearOpposed();
  }

  _updateOpposedMessage(damageConfirmation) {
    return OpposedWFRP.updateOpposedMessage(damageConfirmation, this.data.resultMessageId)
  }

  // Update starting message with result
  static updateOpposedMessage(damageConfirmation, messageId) {
    let resultMessage = game.messages.get(messageId)
    let rollMode = resultMessage.rollMode;

    let newCard = {
      user: game.user.id,
      rollMode: rollMode,
      hideData: true,
      content: $(resultMessage.content).append(`<div>${damageConfirmation}</div>`).html()
    }

    if (!game.user.isGM)
      return game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: messageId, updateData: newCard } })
    else
      return resultMessage.update(newCard)
  }
}