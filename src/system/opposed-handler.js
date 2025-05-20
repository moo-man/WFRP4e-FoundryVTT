import WFRP_Utility from "./utility-wfrp4e.js";
import OpposedTest from "./opposed-test.js";
import { OpposedTestMessage } from "../model/message/opposed-result.js";

/**
 * Represents an opposed test. This object is stored in the "targeting" messages and is used as a central manager of a single opposed test.
 * - Stores targeting message id, attacker message id, defender message id, and result message ID
 * - Actors who have been targeted are flagged with the targeting message ID (messageId)
 * - @see TestWFRP - Tests have a list of opposedMessageIds, that being messageId
 **/
export default class OpposedHandler {

  constructor(data = {}, message) 
  {
    this.data = {
      messageId: data.messageId,
      attackerMessageId: data.attackerMessageId,
      defenderMessageId: data.defenderMessageId,
      resultMessageId: data.resultMessageId,
      targetSpeakerData: data.targetSpeakerData,
      options: data.options || {},
      unopposed: data.unopposed
    }

    this._message = message;
  }

  get message() {
    return this._message || game.messages.get(this.data.messageId);
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
    return this.attackerMessage?.system.test;
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
      return this.defenderMessage?.system.test;
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
    await this.renderMessage();
    await this._addOpposeFlagsToDefender(targetToken);
    return this.message?.id
  }

  async setAttacker(message) {
    this.data.attackerMessageId = typeof message == "string" ? message : message.id;
    this.data.options = {
      whisper: message.whisper,
      blind: message.blind
    }
    if (this.message)
      await this.updateMessageData();
  }

  async setDefender(message) {
    this.data.defenderMessageId = typeof message == "string" ? message : message.id
    if (this.message)
      await this.updateMessageData();
  }

  async computeOpposeResult() {
    if (!this.attackerTest || !this.defenderTest)
      throw new Error(game.i18n.localize("ERROR.Opposed"))

    this.opposedTest = new OpposedTest(this.attackerTest, this.defenderTest);

    await this.opposedTest.evaluate();
    this.formatOpposedResult();
    await this.renderOpposedResult()
    await this.renderMessage()
  }

  async renderMessage() {
    let attacker = game.canvas.tokens.get(this.attackerTest.context.chatOptions.speaker.token)?.document ?? this.attacker.prototypeToken;
    let defender

    // Support opposed start messages when defender is not set yet - allows for manual opposed to use this message
    if (this.target)
      defender = this.target
    else if (this.defenderTest)
      defender = WFRP_Utility.getToken(this.defenderTest.context.speaker) || this.defender.prototypeToken;


    let attackerName = (attacker.hidden) ? "???" : attacker.name
    let attackerImg = (attacker.hidden) ? "systems/wfrp4e/tokens/unknown.png" : attacker.texture.src;

    let defenderName = defender ? defender.name : "???";
    let defenderImg = defender ? defender.texture.src : "systems/wfrp4e/tokens/unknown.png"

    let winner = this.resultMessage?.system.opposedTest?.result?.winner;

    let content = await foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/chat/roll/opposed-handler.hbs", {attackerName, attackerImg, defenderName, defenderImg, winner, opposedOptions : this.getOpposedOptions(defender?.actor)});

    // Ranged weapon opposed tests automatically lose no matter what if the test itself fails
    if (this.attackerTest.item && this.attackerTest.item.isRanged && this.attackerTest.failed) {
      await ChatMessage.create({ speaker: this.attackerMessage.speaker, content: game.i18n.localize("OPPOSED.FailedRanged") })
      return;
    }
    let chatData = {
        type : "handler",
        user: game.user.id,
        content: content,
        speaker: { alias: game.i18n.localize("CHAT.OpposedTest") },
        whisper: this.options.whisper,
        blind: this.options.blind,
        author : getActiveDocumentOwner(defender?.actor)?.id,
        system : {
          opposedData : this.data
        }
    }

    if (this.message) {
        await this.message.update(chatData);
        return this.data.messageId;
    }
    else {
        // Create the Opposed starting message
        let msg = await ChatMessage.create(chatData);
        this.data.messageId = msg.id;
        await this.updateMessageData();
        return msg.id;
    }
  }

  getOpposedOptions(actor)
  {
    if (!actor)
    {
      return [];
    }
    let options = [
      { id : "unopposed", tooltip : game.i18n.localize("Unopposed"), icon : "fa-arrow-down" },
      { id : "dodge", tooltip : game.i18n.localize("NAME.Dodge"), icon : "fa-reply" },
    ]

    if (actor)
    {
      // Use first weapon equipped
      let mainWeapon = actor.itemTypes.weapon.find(i => i.system.isMelee && i.system.isEquipped && !i.system.offhand.value);
      let offhandWeapon = actor.itemTypes.weapon.find(i => i.system.isMelee && i.system.isEquipped && i.system.offhand.value);
      let firstTrait = actor.itemTypes.trait.find(i => i.system.isMelee);

      if (mainWeapon)
      {
        options.push({id : mainWeapon.id, tooltip : mainWeapon.name, icon : "fa-sword"});
      }
      if (offhandWeapon)
      {
        options.push({id : offhandWeapon.id, tooltip : offhandWeapon.name, icon : "fa-shield"});
      }
      if (firstTrait)
      {
        options.push({id : firstTrait.id, tooltip : firstTrait.DisplayName, icon : "fa-paw-claws"});
      }
    }

    return options;
  }

  async updateMessageData() {
    let updateData = { "system.opposedData": this.data }
    if (this.message && game.user.isGM) {
      await this.message.update(updateData)
    }
    else if (this.message) {
      await SocketHandlers.executeOnUserAndWait("GM", "updateMessage", { id: this.message.id, updateData });
    }
  }



  async renderOpposedResult() 
  {
    let message = await OpposedTestMessage.create(this.opposedTest, this.options, this)  
    this.data.resultMessageId = message.id;
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

  async colorWinnerAndLoser() 
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
        await SocketHandlers.executeOnUserAndWait("GM", "updateMessage", { id: this.message.id, updateData: {content} });
      else
        await this.message.update({content});
    }
    catch(e) {
      console.error(`Error color coding winner and loser: ${e}`)
    }
  }


  async _addOpposeFlagsToDefender(target) {
    if (!game.user.isGM) {
      const payload = {
        target: target.id,
        scene: canvas.scene.id,
        opposeFlag: { opposeMessageId: this.data.messageId }
      }
      await SocketHandlers.executeOnUserAndWait("GM", "target", payload);
    }
    else {
      // Add oppose data flag to the target
      await target.actor.update({ "flags.oppose": { opposeMessageId: this.data.messageId } });
    }
  }


  async resolveUnopposed() {
    this.data.unopposed = true;
    await this.computeOpposeResult();
    await this.defender.clearOpposed();
  }

  async resolveOpposed(id)
  {
    if (this.defender)
    {
      let test;
      if (id == "unopposed")
      {
        return this.resolveUnopposed();
      }
      else if (id == "dodge")
      {
        test = await this.defender.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true})
      }
      else 
      {
        test = await this.defender.setupItem(id, {skipTargets: true})
      }
      test?.roll();
    }
  }
}