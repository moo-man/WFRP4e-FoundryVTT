/**
 * ChatWFRP is the centralized object that handles all things involving rolling logic. At the base of roll evaluation, there is
 * rollTest() which provides the basics of roll evaluation - determining success, SL, etc. This function is used by more complex
 * test evaluation functions like rollWeaponTest, which calls rollTest, then extends upon it with more logic concerning weapons.
 * Another noteworthy function is renderRollCard, which is used to display the roll results of all tests. Lastly, this object
 * is where chat listeners are defined, which add interactivity to chat, usually in the form of button clickss.
 */

import MarketWfrp4e from "../apps/market-wfrp4e.js";
import TravelDistanceWfrp4e from "../apps/travel-distance-wfrp4e.js";
import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

import OpposedWFRP from "./opposed-wfrp4e.js";
import AOETemplate from "./aoe.js"


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
    html.on('mousedown', '.table-click', WFRP_Utility.handleTableClick.bind(WFRP_Utility))
    html.on('mousedown', '.pay-link', WFRP_Utility.handlePayClick.bind(WFRP_Utility))
    html.on('mousedown', '.credit-link', WFRP_Utility.handleCreditClick.bind(WFRP_Utility))
    html.on('mousedown', '.corruption-link', WFRP_Utility.handleCorruptionClick.bind(WFRP_Utility))
    html.on('mousedown', '.fear-link', WFRP_Utility.handleFearClick.bind(WFRP_Utility))
    html.on('mousedown', '.terror-link', WFRP_Utility.handleTerrorClick.bind(WFRP_Utility))
    html.on('mousedown', '.exp-link', WFRP_Utility.handleExpClick.bind(WFRP_Utility))
    html.on('mousedown', '.travel-click', TravelDistanceWfrp4e.handleTravelClick.bind(TravelDistanceWfrp4e))

    html.on('change', '.card-edit', this._onCardEdit.bind(this))
    html.on('click', '.opposed-toggle', OpposedWFRP.opposedClicked.bind(OpposedWFRP))
    html.on("mousedown", '.overcast-button', this._onOvercastButtonClick.bind(this))
    html.on("mousedown", '.overcast-reset', this._onOvercastResetClicked.bind(this))
    html.on("click", '.vortex-movement', this._onMoveVortex.bind(this))
    html.on("click", '.unopposed-button', this._onUnopposedButtonClicked.bind(this))
    html.on("click", '.market-button', this._onMarketButtonClicked.bind(this))
    html.on("click", ".haggle", this._onHaggleClicked.bind(this))
    html.on("click", ".corrupt-button", this._onCorruptButtonClicked.bind(this))
    html.on("click", ".fear-button", this._onFearButtonClicked.bind(this))
    html.on("click", ".terror-button", this._onTerrorButtonClicked.bind(this))
    html.on("click", ".experience-button", this._onExpButtonClicked.bind(this))
    html.on("click", ".condition-script", this._onConditionScriptClick.bind(this))
    html.on("click", ".apply-effect", this._onApplyEffectClick.bind(this))
    html.on("click", ".attacker, .defender", this._onOpposedImgClick.bind(this))
    html.on("click", ".apply-condition", this._onApplyCondition.bind(this));

    // Respond to template button clicks
    html.on("click", '.aoe-template', event => {
      
      let actorId = event.currentTarget.dataset.actorId;
      let itemId = event.currentTarget.dataset.itemId;
      let type = event.currentTarget.dataset.type;

      let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");

      AOETemplate.fromString(event.currentTarget.text, actorId, itemId, messageId, type=="diameter").drawPreview(event);
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


  // Respond to editing chat cards - take all inputs and call the same function used with the data filled out
  static _onCardEdit(ev) {
    let button = $(ev.currentTarget),
      messageId = button.parents('.message').attr("data-message-id"),
      message = game.messages.get(messageId);

    let test = message.getTest()
    test.context.edited = true;

    test.context.previousResult = duplicate(test.result);

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

    let test = msg.getTest()
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

    let test = msg.getTest()
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
    let test = msg.getTest()
    test.moveVortex();

  }

  // Proceed with an opposed test as unopposed
  static _onUnopposedButtonClicked(event) {
    event.preventDefault()
    let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");

    let oppose = game.messages.get(messageId).getOppose();
    oppose.resolveUnopposed();
  }

  // Click on botton related to the market/pay system
  static _onMarketButtonClicked(event) {
    event.preventDefault();
    let msg = game.messages.get($(event.currentTarget).parents(".message").attr("data-message-id"))
    // data-button tells us what button was clicked
    switch ($(event.currentTarget).attr("data-button")) {
      case "rollAvailability":
        MarketWfrp4e.generateSettlementChoice($(event.currentTarget).attr("data-rarity"));
        break;
      case "payItem":
        if (!game.user.isGM) {
          let actor = game.user.character;
          let itemData
          if (msg.flags.transfer)
            itemData = JSON.parse(msg.flags.transfer).payload
          if (actor) {
            let money = MarketWfrp4e.payCommand($(event.currentTarget).attr("data-pay"), actor);
            if (money) {
              WFRP_Audio.PlayContextAudio({ item: { "type": "money" }, action: "lose" })
              actor.updateEmbeddedDocuments("Item", money);
              if (itemData) {
                actor.createEmbeddedDocuments("Item", [itemData])
                ui.notifications.notify(game.i18n.format("MARKET.ItemAdded", { item: itemData.name, actor: actor.name }))
              }
            }
          } else {
            ui.notifications.notify(game.i18n.localize("MARKET.NotifyNoActor"));
          }
        } else {
          ui.notifications.notify(game.i18n.localize("MARKET.NotifyUserMustBePlayer"));
        }
        break;
      case "creditItem":
        if (!game.user.isGM) {
          let actor = game.user.character;
          if (actor) {
            let dataExchange = $(event.currentTarget).attr("data-amount");
            let money = MarketWfrp4e.creditCommand(dataExchange, actor);
            if (money) {
              WFRP_Audio.PlayContextAudio({ item: { type: "money" }, action: "gain" })
              actor.updateEmbeddedDocuments("Item", money);
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
              game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: msg.id, updateData: messageUpdate } })
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
          settlement: $(event.currentTarget).attr("data-settlement").toLowerCase(),
          rarity: $(event.currentTarget).attr("data-rarity").toLowerCase(),
          modifier: 0
        };
        MarketWfrp4e.testForAvailability(options);
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

    let originalAmount = MarketWfrp4e.parseMoneyTransactionString(originalPayString)
    let currentAmount = MarketWfrp4e.parseMoneyTransactionString(payString)

    let originalBPAmount = originalAmount.gc * 240 + originalAmount.ss * 12 + originalAmount.bp
    let bpAmount = currentAmount.gc * 240 + currentAmount.ss * 12 + currentAmount.bp
    bpAmount += Math.round((originalBPAmount * .1)) * multiplier

    let newAmount = MarketWfrp4e.makeSomeChange(bpAmount, 0)
    let newPayString = MarketWfrp4e.amountToString(newAmount)
    html.find("[data-button=payItem]")[0].setAttribute("data-pay", newPayString)
    let newContent = html.find(".message-content").html()
    newContent = newContent.replace(`${currentAmount.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${currentAmount.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${currentAmount.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`, `${newAmount.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}, ${newAmount.ss} ${game.i18n.localize("MARKET.Abbrev.SS")}, ${newAmount.bp} ${game.i18n.localize("MARKET.Abbrev.BP")}`)
    msg.update({ content: newContent })
  }

  static _onCorruptButtonClicked(event) {
    let strength = $(event.currentTarget).attr("data-strength").toLowerCase();
    if (strength != "moderate" && strength != "minor" && strength != "major")
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
    let alreadyAwarded = duplicate(msg.getFlag("wfrp4e", "experienceAwarded") || [])


    if (game.user.isGM) {
      if (!game.user.targets.size)
        return ui.notifications.warn(game.i18n.localize("ErrorExp"))
      game.user.targets.forEach(t => {
        if (!alreadyAwarded.includes(t.actor.id)) {
          t.actor.awardExp(amount, reason)
          alreadyAwarded.push(t.actor.id)
        }
        else
          ui.notifications.notify(`${t.actor.name} already received this reward.`)
      })
      msg.unsetFlag("wfrp4e", "experienceAwarded").then(m => {
        msg.setFlag("wfrp4e", "experienceAwarded", alreadyAwarded)
      })
      if (canvas.scene){ 
        game.user.updateTokenTargets([]);
        game.user.broadcastActivity({ targets: [] });
      }
    }
    else {
      if (!game.user.character)
        return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
      if (alreadyAwarded.includes(game.user.character.id))
        return ui.notifications.notify(`${game.user.character.name} already received this reward.`)

      alreadyAwarded.push(game.user.character.id)
      game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: msg.id, updateData: { "flags.wfrp4e.experienceAwarded": alreadyAwarded } } })
      game.user.character.awardExp(amount, reason)
    }
  }

  static async _onConditionScriptClick(event) {
    let condkey = event.target.dataset["condId"]
    let combatantId = event.target.dataset["combatantId"]
    let combatant = game.combat.combatants.get(combatantId)
    let msgId = $(event.currentTarget).parents(".message").attr("data-message-id")
    let message = game.messages.get(msgId)
    let conditionResult;

    if (combatant.actor.isOwner)
      conditionResult = await game.wfrp4e.config.conditionScripts[condkey](combatant.actor)
    else
      return ui.notifications.error(game.i18n.localize("CONDITION.ApplyError"))

    if (game.user.isGM)
      message.update(conditionResult)
    else
      WFRP_Utility.awaitSocket(game.user, "updateMsg", { id: msgId, updateData: conditionResult }, "executing condition script");
  }

  static _onApplyEffectClick(event) {

    let effectId = event.target.dataset.effectId || (event.target.dataset.lore ? "lore" : "")
    let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");
    let message = game.messages.get(messageId);
    let test = message.getTest()
    let item = test.item
    let actor = test.actor

    if (!actor.isOwner)
      return ui.notifications.error("CHAT.ApplyError")

    let effect = actor.populateEffect(effectId, item, test)

          
    if (effect.flags.wfrp4e.effectTrigger == "invoke") {
      game.wfrp4e.utility.invokeEffect(actor, effectId, item.id)
      return
    }
    

    if ( // If spell's Target and Range is "You", Apply to caster, not targets
      !effect.flags.wfrp4e?.notSelf && 
      item.range && 
      item.range.value.toLowerCase() == game.i18n.localize("You").toLowerCase() && 
      item.target && 
      item.target.value.toLowerCase() == game.i18n.localize("You").toLowerCase())
      game.wfrp4e.utility.applyEffectToTarget(effect, [{ actor }]) 
    else
      game.wfrp4e.utility.applyEffectToTarget(effect, null)
  }

  static _onOpposedImgClick(event) {
    let msg = game.messages.get($(event.currentTarget).parents(".message").attr("data-message-id"))
    let oppose = msg.getOppose();
    let speaker

    if ($(event.currentTarget).hasClass("attacker"))
      speaker = oppose.attacker
    else if ($(event.currentTarget).hasClass("defender"))
      speaker = oppose.defender

    speaker.sheet.render(true)

  }

  static _onApplyCondition(event) {
    let actors = canvas.tokens.controlled.concat(Array.from(game.user.targets).filter(i => !canvas.tokens.controlled.includes(i))).map(a => a.actor);

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