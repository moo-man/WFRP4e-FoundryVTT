/**
 * ChatWFRP is the centralized object that handles all things involving rolling logic. At the base of roll evaluation, there is
 * rollTest() which provides the basics of roll evaluation - determining success, SL, etc. This function is used by more complex
 * test evaluation functions like rollWeaponTest, which calls rollTest, then extends upon it with more logic concerning weapons.
 * Another noteworthy function is renderRollCard, which is used to display the roll results of all tests. Lastly, this object
 * is where chat listeners are defined, which add interactivity to chat, usually in the form of button clickss.
 */

import MarketWFRP4e from "../apps/market-wfrp4e.js";
import TravelDistanceWfrp4e from "../apps/travel-distance-wfrp4e.js";
import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

import OpposedHandler from "./opposed-handler.js";
import TradeManager from "./trade/trade-manager.js";


export default class ChatWFRP {


  // If content includes "@Condition[...]" add a button to apply that effect
  // Optionally provide a set of conditions
  static addEffectButtons(content, conditions = [])
  {
    // Don't add buttons if already added, or from posted items
    if (content.includes("apply-conditions") || content.includes("post-item"))
    {
      return content;
    }

    let regex = /@Condition\[(.+?)\]/gm

    let matches = Array.from(content.matchAll(regex));

    conditions = conditions.concat(matches.map(m => m[1].toLowerCase())).filter(i => game.wfrp4e.config.conditions[i])

    // Dedup
    conditions = conditions.filter((c, i) => conditions.indexOf(c) == i)

    if (conditions.length)
    {
      let html = `<div class="apply-conditions">`
      conditions.forEach(c => 
          html += `<a class="chat-button apply-condition" data-cond="${c}">${game.i18n.format("CHAT.ApplyCondition", {condition: game.wfrp4e.config.conditions[c]})}</a>`
      )

      html += `</div>`
      content += html;
    }
    return content
  }

  /**
   * Activate event listeners using the chat log html.
   * @param html {HTML}  Chat log html
   */
  static async chatListeners(html) {
    // item lookup tag looks for an item based on the location attribute (compendium), then posts that item to chat.

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



    html.on("click", ".symptom-tag", WFRP_Utility.handleSymptomClick.bind(WFRP_Utility))
    html.on("click", ".condition-chat", WFRP_Utility.handleConditionClick.bind(WFRP_Utility))
    html.on("click", ".property-chat", WFRP_Utility.handlePropertyClick.bind(WFRP_Utility))
    html.on('mousedown', '.table-click', WFRP_Utility.handleTableClick.bind(WFRP_Utility))
    html.on('mousedown', '.pay-link', WFRP_Utility.handlePayClick.bind(WFRP_Utility))
    html.on('mousedown', '.credit-link', WFRP_Utility.handleCreditClick.bind(WFRP_Utility))
    html.on('mousedown', '.corruption-link', WFRP_Utility.handleCorruptionClick.bind(WFRP_Utility))
    html.on('mousedown', '.fear-link', WFRP_Utility.handleFearClick.bind(WFRP_Utility))
    html.on('mousedown', '.terror-link', WFRP_Utility.handleTerrorClick.bind(WFRP_Utility))
    html.on('mousedown', '.exp-link', WFRP_Utility.handleExpClick.bind(WFRP_Utility))
    html.on('mousedown', '.travel-click', TravelDistanceWfrp4e.handleTravelClick.bind(TravelDistanceWfrp4e))
    html.on('click', '.trade-cargo-click', TradeManager.manageTrade.bind(TradeManager));
    html.on('click', '.trade-buy-click', TradeManager.buyCargo.bind(TradeManager));

    html.on('change', '.card-edit', this._onCardEdit.bind(this))
    html.on('click', '.opposed-toggle', OpposedHandler.opposedClicked.bind(OpposedHandler))
    html.on("mousedown", '.overcast-button', this._onOvercastButtonClick.bind(this))
    html.on("mousedown", '.overcast-reset', this._onOvercastResetClicked.bind(this))
    html.on("click", '.vortex-movement', this._onMoveVortex.bind(this))
    html.on("click", '.unopposed', this._onUnopposedButtonClicked.bind(this))
    html.on("click", '.oppose', this._onOpposedButtonClicked.bind(this))
    html.on("click", '.market-button', this._onMarketButtonClicked.bind(this))
    html.on("click", ".haggle", this._onHaggleClicked.bind(this))
    html.on("click", ".corrupt-button", this._onCorruptButtonClicked.bind(this))
    html.on("click", ".fear-button", this._onFearButtonClicked.bind(this))
    html.on("click", ".terror-button", this._onTerrorButtonClicked.bind(this))
    html.on("click", ".experience-button", this._onExpButtonClicked.bind(this))
    html.on("click", ".condition-script", this._onConditionScriptClick.bind(this))
    html.on("click", ".apply-target", WarhammerChatListeners.onApplyTargetEffect)
    html.on("click", ".place-area", this._onPlaceAreaEffect.bind(this))
    html.on("click", ".attacker, .defender", this._onOpposedImgClick.bind(this))
    html.on("click", ".apply-condition", this._onApplyCondition.bind(this));
    html.on("click", ".apply-damage", this._onApplyDamageClick.bind(this))
    html.on("click", ".apply-hack", this._onApplyHackClick.bind(this))
    html.on("click", ".crew-test", this._onCrewTestClick.bind(this))

    // Respond to template button clicks
    html.on("click", '.aoe-template', event => {
      
      let actorId = event.currentTarget.dataset.actorId;
      let itemId = event.currentTarget.dataset.itemId;
      let type = event.currentTarget.dataset.type;

      let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");

      AreaTemplate.fromString(event.currentTarget.text, actorId, itemId, messageId, type=="diameter").drawPreview(event);
    });

    // Post an item property (quality/flaw) description when clicked
    html.on("click", '.item-property', event => {
      WFRP_Utility.postProperty(event.target.text);
    });


    // Change card to edit mode
    html.on('click', '.edit-toggle', ev => {
      ev.preventDefault();
      this.toggleEditable(ev.currentTarget)
    });

  }

  static _onApplyDamageClick(ev)
  {
    let message = game.messages.get($(ev.currentTarget).parents(".message").attr("data-message-id"))
    let opposedTest = message.system.opposedTest;

    if (!opposedTest.defenderTest.actor.isOwner)
      return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

    opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
      .then(updateMsg => OpposedHandler.updateOpposedMessage(updateMsg, message.id));
  }

  static async _onApplyHackClick(ev)
  {
    let message = game.messages.get($(ev.currentTarget).parents(".message").attr("data-message-id"))
    let opposedTest = message.system.opposedTest;

    if (!opposedTest.defenderTest.actor.isOwner)
      return ui.notifications.error("ErrorHackPermission", {localize : true})

    let loc = opposedTest.result.hitloc.value
    let armour = opposedTest.defenderTest.actor.itemTags.armour.filter(i => i.system.isEquipped && i.system.protects[loc] && i.system.currentAP[loc] > 0)
    if (armour.length)
    {
      let chosen = await ItemDialog.create(armour, 1, "Choose Armour to damage");
      if (chosen[0])
      {
        chosen[0].system.damageItem(1, [loc])
        ChatMessage.create({content: `<p>1 Damage applied to @UUID[${chosen[0].uuid}]{${chosen[0].name}} (Hack)</p>`, speaker : ChatMessage.getSpeaker({actor : opposedTest.attackerTest.actor})})
      }
    }
    else 
    {
      return ui.notifications.error("ErrorNoArmourToDamage", {localize : true})
    }
  }


  // Respond to editing chat cards - take all inputs and call the same function used with the data filled out
  static _onCardEdit(ev) {
    let button = $(ev.currentTarget),
      messageId = button.parents('.message').attr("data-message-id"),
      message = game.messages.get(messageId);

    let test = message.system.test
    test.context.edited = true;

    test.context.previousResult = foundry.utils.duplicate(test.result);

    test.preData[button.attr("data-edit-type")] = parseInt(ev.target.value)

    if (button.attr("data-edit-type") == "hitloc") // If changing hitloc, keep old value for roll
      test.preData.roll = $(message.content).find(".card-content.test-data").attr("data-roll")
    else // If not changing hitloc, use old value for hitloc
      test.preData.hitloc = $(message.content).find(".card-content.test-data").attr("data-loc")

    if (button.attr("data-edit-type") == "SL") // If changing SL, keep both roll and hitloc
    {
      test.preData.roll = $(message.content).find(".card-content.test-data").attr("data-roll")
      test.preData.slBonus = 0;
      test.preData.successBonus = 0;
    }

    if (button.attr("data-edit-type") == "target") // If changing target, keep both roll and hitloc
      test.preData.roll = $(message.content).find(".card-content.test-data").attr("data-roll")


    // Send message as third argument (rerenderMessage) so that the message will be updated instead of rendering a new one

    test.roll();
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

  // Respond to overcast button clicks
  static _onOvercastButtonClick(event) {
    event.preventDefault();
    let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
    if (!msg.isOwner && !msg.isAuthor)
      return ui.notifications.error("CHAT.EditError")

    let test = msg.system.test
    let overcastChoice = event.currentTarget.dataset.overcast;
    // Set overcast and rerender card
    test._overcast(overcastChoice)
    
    //@HOUSE
    if (game.settings.get("wfrp4e", "mooOvercasting"))
    {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")
    }
    //@/HOUSE

    
  }

  // Button to reset the overcasts
  static _onOvercastResetClicked(event) {
    event.preventDefault();
    let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
    if (!msg.isOwner && !msg.isAuthor)
      return ui.notifications.error("CHAT.EditError")

    let test = msg.system.test
    // Reset overcast and rerender card
    test._overcastReset()
        
    //@HOUSE
    if (game.settings.get("wfrp4e", "mooOvercasting"))
    {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")
    }
    //@/HOUSE
  }

  
  static _onMoveVortex(event)
  {
    let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
    if (!msg.isOwner && !msg.isAuthor)
      return ui.notifications.error("CHAT.EditError")
    let test = msg.system.test
    test.moveVortex();

  }

  static async _onCrewTestClick(event)
  {
    let messageId = ($(event.currentTarget).parents('.message').attr("data-message-id"));
    let message = game.messages.get(messageId);

    let crewTestUuid = message.getFlag("wfrp4e", "crewTestData")?.uuid;
    let crewTest = await fromUuid(crewTestUuid);
    let roleUuid = event.currentTarget.dataset.uuid;
    let vital = event.currentTarget.dataset.vital == "true";
    let role = await fromUuid(roleUuid);
    if (role)
    {
      let chosenActor = await role.actor.system.passengers.choose(role.name);
      if (chosenActor)
      {
        role.system.roll(chosenActor, {appendTitle : ` - ${vital ? game.i18n.localize("CHAT.CrewTestVital") : game.i18n.localize("CHAT.CrewTest")}`, skipTargets : true, crewTest, crewTestMessage : messageId, roleVital : vital})
      }
    }
  }

  // Proceed with an opposed test as unopposed
  static _onUnopposedButtonClicked(event) {
    event.preventDefault()
    let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");
    let oppose = game.messages.get(messageId).system.opposedHandler;
    oppose.resolveUnopposed();
  }

  static _onOpposedButtonClicked(event)
  {
    let id = event.currentTarget.dataset.itemId;
    let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");
    let oppose = game.messages.get(messageId).system.opposedHandler;
    oppose.resolveOpposed(id);
  }

  // Click on botton related to the market/pay system
  static async _onMarketButtonClicked(event) {
    event.preventDefault();
    let msg = game.messages.get($(event.currentTarget).parents(".message").attr("data-message-id"))
    // data-button tells us what button was clicked
    switch ($(event.currentTarget).attr("data-button")) {
      case "rollAvailability":
        MarketWFRP4e.generateSettlementChoice($(event.currentTarget).attr("data-rarity"), $(event.currentTarget).attr("data-name"));
        break;
      case "payItem":
        if (!game.user.isGM) {
          let payString = $(event.currentTarget).attr("data-pay");
          MarketWFRP4e.handlePlayerPayment({msg, payString})
        } else {
          ui.notifications.notify(game.i18n.localize("MARKET.NotifyUserMustBePlayer"));
        }
        break;
      case "creditItem":
        if (!game.user.isGM) {
          let actor = game.user.character;
          if (actor) {
            let dataExchange = $(event.currentTarget).attr("data-amount");
            let money = MarketWFRP4e.creditCommand(dataExchange, actor);
            if (money) {
              WFRP_Audio.PlayContextAudio({ item: { type: "money" }, action: "gain" })
              await actor.updateEmbeddedDocuments("Item", money);
              let instances = msg.getFlag("wfrp4e", "instances") - 1;
              let messageUpdate = {};

              // Only allow credit to be taken as many times as it has been split
              // This allows a player to take multiple times if they wish, but not more than the original total amount
              // This solution might fail if two or more players click the button at the same time and create a race condition
              if (instances <= 0)
              {
                messageUpdate = { "content": `<p><strong>${game.i18n.localize("CHAT.NoMoreLeft")}</strong></p>` };
              }
              else 
              {
                messageUpdate = { "flags.wfrp4e.instances": instances };
              }
              game.socket.emit("system.wfrp4e", { type: "updateMessage", payload: { id: msg.id, updateData: messageUpdate } })
            }
          } else {
            ui.notifications.notify(game.i18n.localize("MARKET.NotifyNoActor"));
          }
        } else {
          ui.notifications.notify(game.i18n.localize("MARKET.NotifyUserMustBePlayer"));
        }
        break;
      case "rollAvailabilityTest":
        let options = {
          name: $(event.currentTarget).attr("data-name"),
          settlement: $(event.currentTarget).attr("data-settlement").toLowerCase(),
          rarity: $(event.currentTarget).attr("data-rarity").toLowerCase(),
          modifier: 0
        };
        MarketWFRP4e.testForAvailability(options);
        break;
    }
  }


  static _onHaggleClicked(event) {
    let html = $(event.currentTarget).parents(".message")
    let msg = game.messages.get(html.attr("data-message-id"))
    let multiplier = $(event.currentTarget).attr("data-type") == "up" ? 1 : -1
    let payString = html.find("[data-button=payItem]").attr("data-pay")
    let originalPayString = payString
    if (!msg.getFlag("wfrp4e", "originalPrice"))
      msg.setFlag("wfrp4e", "originalPrice", payString)
    else
      originalPayString = msg.getFlag("wfrp4e", "originalPrice")

    let originalAmount = MarketWFRP4e.parseMoneyTransactionString(originalPayString)
    let currentAmount = MarketWFRP4e.parseMoneyTransactionString(payString)

    let originalBPAmount = originalAmount.gc * 240 + originalAmount.ss * 12 + originalAmount.bp
    let bpAmount = currentAmount.gc * 240 + currentAmount.ss * 12 + currentAmount.bp
    bpAmount += Math.round((originalBPAmount * .1)) * multiplier

    let newAmount = MarketWFRP4e.makeSomeChange(bpAmount, 0)
    let newPayString = MarketWFRP4e.amountToString(newAmount)
    html.find("[data-button=payItem]")[0].setAttribute("data-pay", newPayString)
    let newContent = html.find(".message-content").html()
    newContent = newContent.replace(`${currentAmount.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${currentAmount.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${currentAmount.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`, `${newAmount.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${newAmount.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${newAmount.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`)
    msg.update({ content: newContent })
  }

  static _onCorruptButtonClicked(event) {
    let strength = $(event.currentTarget).attr("data-strength").toLowerCase();
    if (strength != game.i18n.localize("CORRUPTION.Moderate").toLowerCase() && strength != game.i18n.localize("CORRUPTION.Minor").toLowerCase() && strength != game.i18n.localize("CORRUPTION.Major").toLowerCase())
      return ui.notifications.error(game.i18n.localize("ErrorCorruption"))

    let actors = canvas.tokens.controlled.map(t => t.actor)
    if (actors.length == 0)
      actors = [game.user.character]
    if (actors.length == 0)
      return ui.notifications.error(game.i18n.localize("ErrorCharAssigned"))


    actors.forEach(a => {
      a.corruptionDialog(strength);
    })
  }

  static _onFearButtonClicked(event) {
    let value = parseInt($(event.currentTarget).attr("data-value"));
    let name = $(event.currentTarget).attr("data-name");

    let targets = canvas.tokens.controlled.concat(Array.from(game.user.targets).filter(i => !canvas.tokens.controlled.includes(i)))
    if (canvas.scene) { 
      game.user.updateTokenTargets([]);
      game.user.broadcastActivity({targets: []});
    }


    if (game.user.isGM) {
      if (!targets.length)
        return ui.notifications.warn(game.i18n.localize("ErrorTarget"))
      targets.forEach(t => {
        t.actor.applyFear(value, name)
        if (canvas.scene) {
          game.user.updateTokenTargets([]);
          game.user.broadcastActivity({ targets: [] });
        }
      })
    }
    else {
      if (!game.user.character)
        return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
      game.user.character.applyFear(value, name)
    }
  }

  static _onTerrorButtonClicked(event) {
    let value = parseInt($(event.currentTarget).attr("data-value"));
    let name = parseInt($(event.currentTarget).attr("data-name"));
    
    let targets = canvas.tokens.controlled.concat(Array.from(game.user.targets).filter(i => !canvas.tokens.controlled.includes(i)))
    if (canvas.scene) {
      game.user.updateTokenTargets([]);      
      game.user.broadcastActivity({ targets: [] });
    }

    if (game.user.isGM) {
      if (!targets.length)
        return ui.notifications.warn(game.i18n.localize("ErrorTarget"))
      targets.forEach(t => {
        t.actor.applyTerror(value, name)
      })
    }
    else {
      if (!game.user.character)
        return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
      game.user.character.applyTerror(value, name)
    }
  }

  static _onExpButtonClicked(event) {
    let amount = parseInt($(event.currentTarget).attr("data-amount"));
    let reason = $(event.currentTarget).attr("data-reason");
    let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
    let alreadyAwarded = msg.getFlag("wfrp4e", "experienceAwarded") || [];


    if (game.user.isGM) 
    {
      if (!game.user.targets.size)
      {
        return ui.notifications.warn(game.i18n.localize("ErrorExp"))
      }
      game.user.targets.forEach(t => 
      {
        if (!alreadyAwarded.includes(t.actor.id)) 
        {
          t.actor.system.awardExp(amount, reason, msg.id)
        }
        else
        {
          ui.notifications.notify(`${t.actor.name} already received this reward.`)
        }
      })
      if (canvas.scene)
      { 
        game.user.updateTokenTargets([]);
        game.user.broadcastActivity({ targets: [] });
      }
    }
    else {
      if (!game.user.character)
        return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
      if (alreadyAwarded.includes(game.user.character.id))
        return ui.notifications.notify(`${game.user.character.name} already received this reward.`)

      foundry.utils.setProperty(msg, "flags.wfrp4e.experienceAwarded", alreadyAwarded.concat(game.user.character.id)); // Add locally to handle fast clicking or no GM 
      game.user.character.system.awardExp(amount, reason, msg.id)
    }
  }

  static async _onConditionScriptClick(event) {
    let condkey = event.target.dataset["condId"]
    let combatantId = event.target.dataset["combatantId"]
    let combatant = game.combat.combatants.get(combatantId)
    let msgId = $(event.currentTarget).parents(".message").attr("data-message-id")
    let message = game.messages.get(msgId)
    let conditionResult;

    let effect = combatant.actor.hasCondition(condkey);

    if (combatant.actor.isOwner && effect)
      conditionResult = await effect.scripts[0].execute({suppressMessage : true})
    else
      return ui.notifications.error(game.i18n.localize("CONDITION.ApplyError"))

    if (game.user.isGM)
      message.update(conditionResult)
    else
      await SocketHandlers.executeOnUserAndWait("GM", "updateMessage", { id: msgId, updateData: conditionResult });
  }

  static async _onPlaceAreaEffect(event) {
    let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");
    let effectUuid = event.currentTarget.dataset.uuid;

    let test = game.messages.get(messageId).system.test;
    let radius;
    if (test?.result.overcast?.usage.target)
    {
      radius = test.result.overcast.usage.target.current;

      if (test.spell)
      {
        radius /= 2; // Spells define their diameter, not radius
      }
    }

    let effect = await fromUuid(effectUuid)
    let effectData = effect.convertToApplied(test);
    if (!(await effect.runPreApplyScript({effectData})))
    {
        return;
    }
    let template = await AreaTemplate.fromEffect(effectUuid, messageId, radius, foundry.utils.diffObject(effectData, effect.convertToApplied(test)));
    await template.drawPreview(event);
  }

  static _onOpposedImgClick(event) {
    let msg = game.messages.get($(event.currentTarget).parents(".message").attr("data-message-id"))
    let oppose = msg.system.opposedHandler;
    let speaker

    if ($(event.currentTarget).hasClass("attacker"))
      speaker = oppose.attacker
    else if ($(event.currentTarget).hasClass("defender"))
      speaker = oppose.defender

    speaker.sheet.render(true)

  }

  static _onApplyCondition(event) {
    let actors = canvas.tokens.controlled.concat(Array.from(game.user.targets).filter(i => !canvas.tokens.controlled.includes(i))).map(a => a.actor);
    if (canvas.scene) { 
      game.user.updateTokenTargets([]);
      game.user.broadcastActivity({targets: []});
    }
    
    if (actors.length == 0)
    {
      actors.push(game.user.character);
      ui.notifications.notify(`${game.i18n.format("EFFECT.Applied", {name: game.wfrp4e.config.conditions[event.currentTarget.dataset.cond]})} ${game.user.character.name}`)
    }

    actors.forEach(a => {
      a.addCondition(event.currentTarget.dataset.cond)
    })
  }

}