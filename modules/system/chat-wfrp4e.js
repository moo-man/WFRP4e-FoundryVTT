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

  /** Take roll data and display it in a chat card template.
   * @param {Object} chatOptions - Object concerning display of the card like the template or which actor is testing
   * @param {Object} testData - Test results, values to display, etc.
   * @param {Object} rerenderMessage - Message object to be updated, instead of rendering a new message
   */
  static async renderRollCard(chatOptions, test, rerenderMessage) {

    // Blank if manual chat cards
    if (game.settings.get("wfrp4e", "manualChatCards") && !rerenderMessage)
      test.roll = test.SL = null;

    if (game.modules.get("dice-so-nice") && game.modules.get("dice-so-nice").active && chatOptions.sound?.includes("dice"))
      chatOptions.sound = undefined;

    test.result.other = test.result.other.join("<br>")

    let chatData = {
      title: chatOptions.title,
      test: test,
      hideData: game.user.isGM
    }

    if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;
    else if (chatOptions.rollMode === "selfroll") chatOptions["whisper"] = [game.user];

    // All the data need to recreate the test when chat card is edited
    chatOptions["flags.data"] = {
      testData: test.data,
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



    html.on("click", ".chat-roll", WFRP_Utility.handleRollClick.bind(WFRP_Utility))
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

    html.on("click", ".item-lookup", this._onItemLookupClicked.bind(this))
    html.on('change', '.card-edit', this._onCardEdit.bind(this))
    html.on('click', '.opposed-toggle', OpposedWFRP.opposedClicked.bind(OpposedWFRP))
    html.on("click", '.species-select', this._onCharGenSpeciesSelect.bind(this))
    html.on("click", '.subspecies-select', this._onCharGenSubspeciesSelect.bind(this))
    html.on("click", '.chargen-button, .chargen-button-nostyle', this._onCharGenButtonClick.bind(this))
    html.on("mousedown", '.overcast-button', this._onOvercastButtonClick.bind(this))
    html.on("mousedown", '.overcast-reset', this._onOvercastResetClicked.bind(this))
    html.on("click", '.career-select', this._onCharGenCareerSelected.bind(this))
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

    // Respond to template button clicks
    html.on("click", '.aoe-template', event => {
      AOETemplate.fromString(event.currentTarget.text).drawPreview(event);
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


  static async _onItemLookupClicked(ev) {
    let itemType = $(ev.currentTarget).attr("data-type");
    let location = $(ev.currentTarget).attr("data-location");
    let openMethod = $(ev.currentTarget).attr("data-open") || "post" // post or sheet
    let name = $(ev.currentTarget).attr("data-name"); // Use name attribute if available, otherwis, use text clicked.
    let item;
    if (name)
      item = await WFRP_Utility.findItem(name, itemType, location);
    else if (location)
      item = await WFRP_Utility.findItem(ev.currentTarget.text, itemType, location);

    if (!item)
      WFRP_Utility.findItem(ev.currentTarget.text, itemType).then(item => {
        if (openMethod == "sheet")
          item.sheet.render(true)
        else
          item.postItem()
      });
    else {
      if (openMethod == "sheet")
        item.sheet.render(true)
      else
        item.postItem()
    }
  }

  // Respond to editing chat cards - take all inputs and call the same function used with the data filled out
  static _onCardEdit(ev) {
    let button = $(ev.currentTarget),
      messageId = button.parents('.message').attr("data-message-id"),
      message = game.messages.get(messageId);
    let data = message.data.flags.data
    let newTestData = duplicate(data.testData);

    newTestData.preData[button.attr("data-edit-type")] = parseInt(ev.target.value)
    newTestData.context.edited = true;

    if (button.attr("data-edit-type") == "hitloc") // If changing hitloc, keep old value for roll
      newTestData.preData.roll = $(message.data.content).find(".card-content.test-data").attr("data-roll")
    else // If not changing hitloc, use old value for hitloc
      newTestData.preData.hitloc = $(message.data.content).find(".card-content.test-data").attr("data-loc")

    if (button.attr("data-edit-type") == "SL") // If changing SL, keep both roll and hitloc
    {
      newTestData.preData.roll = $(message.data.content).find(".card-content.test-data").attr("data-roll")
      newTestData.preData.slBonus = 0;
      newTestData.preData.successBonus = 0;
    }

    if (button.attr("data-edit-type") == "target") // If changing target, keep both roll and hitloc
      newTestData.preData.roll = $(message.data.content).find(".card-content.test-data").attr("data-roll")


    let chatOptions = {
      template: data.template,
      rollMode: data.rollMode,
      title: data.title,
      speaker: message.data.speaker,
      user: message.user.id
    }

    if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;

    // Send message as third argument (rerenderMessage) so that the message will be updated instead of rendering a new one
    game.wfrp4e.utility.getSpeaker(message.data.speaker)[`${newTestData.context.postFunction}`]({ testData: newTestData, cardOptions: chatOptions }, { rerenderMessage: message });
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

  // Character generation - select specific species
  static _onCharGenSpeciesSelect(event) {
    if (!game.wfrp4e.generator)
      return ui.notifications.error(game.i18n.localize("CHAT.NoGenerator"))

    event.preventDefault();
    game.wfrp4e.generator.rollSpecies(
      $(event.currentTarget).parents('.message').attr("data-message-id"),
      $(event.currentTarget).attr("data-species")); // Choose selected species
  }

  static _onCharGenSubspeciesSelect(event) {
    if (!game.wfrp4e.generator)
      return ui.notifications.error(game.i18n.localize("CHAT.NoGenerator"))

    game.wfrp4e.generator.chooseSubspecies($(event.currentTarget).attr("data-subspecies"))
  }

  // Respond to character generation button clicks
  static _onCharGenButtonClick(event) {
    if (!game.wfrp4e.generator)
      return ui.notifications.error(game.i18n.localize("CHAT.NoGenerator"))

    // data-button tells us what button was clicked
    switch ($(event.currentTarget).attr("data-button")) {
      case "rollSpecies":
        game.wfrp4e.generator.rollSpecies($(event.currentTarget).parents('.message').attr("data-message-id"))
        break;
      case "rollCareer":
        game.wfrp4e.generator.rollCareer()
        break;
      case "rerollCareer":
        game.wfrp4e.generator.rollCareer(true)
        game.wfrp4e.generator.rollCareer(true)
        break;
      case "chooseCareer":
        game.wfrp4e.generator.chooseCareer()
        break;
      case "rollSpeciesSkillsTalents":
        game.wfrp4e.generator.speciesSkillsTalents()
        break;
      case "rollDetails":
        game.wfrp4e.generator.rollDetails()
        break;

      case "rerollAttributes":
        game.wfrp4e.generator.rollAttributes(true)
        break;
    }
  }

  // Character generation - select specific career
  static _onCharGenCareerSelected(event) {
    event.preventDefault();
    if (!game.wfrp4e.generator)
      return ui.notifications.error(game.i18n.localize("CHAT.NoGenerator"))

    let careerSelected = $(event.currentTarget).attr("data-career")
    let species = $(event.currentTarget).attr("data-species")
    game.wfrp4e.generator.displayCareer(careerSelected, species, 0, false, true)
  }

  // Respond to overcast button clicks
  static _onOvercastButtonClick(event) {
    event.preventDefault();
    let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
    if (!msg.isOwner && !msg.isAuthor)
      return ui.notifications.error("CHAT.EditError")

    let test = msg.getTest()

    let overcastChoice = $(event.currentTarget).attr("data-overcast")
    let overcastData = test._overcast(overcastChoice)


    let cardContent = $(event.currentTarget).parents('.message-content')

    cardContent.find(".overcast-count").text(`${overcastData.available}/${overcastData.total}`)

    if (overcastData.usage[overcastChoice].AoE)
      cardContent.find(`.overcast-value.${overcastChoice}`)[0].innerHTML = ('<i class="fas fa-ruler-combined"></i> ' + overcastData.usage[overcastChoice].current + " " + overcastData.usage[overcastChoice].unit)
    else if (overcastData.usage[overcastChoice].unit)
      cardContent.find(`.overcast-value.${overcastChoice}`)[0].innerHTML = (overcastData.usage[overcastChoice].current + " " + overcastData.usage[overcastChoice].unit)
    else
      cardContent.find(`.overcast-value.${overcastChoice}`)[0].innerHTML = (overcastData.usage[overcastChoice].current)
    
    //@HOUSE
    if (game.settings.get("wfrp4e", "mooOvercasting"))
    {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")
      let chatOptions = msg.data.flags.data
      chatOptions.testData = test.data
      test.result.other = test.result.other.split("<br>")
      return this.renderRollCard(chatOptions, test, msg)
    }
    //@/HOUSE

    msg.update({ content: cardContent.html(), "flags.data.testData": test.data })
  }

  // Button to reset the overcasts
  static _onOvercastResetClicked(event) {
    event.preventDefault();
    let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
    let cardContent = $(event.currentTarget).parents('.message-content')
    if (!msg.isOwner && !msg.isAuthor)
      return ui.notifications.error("CHAT.EditError")

    let test = msg.getTest()
    let overcastData = test._overcastReset()

    for (let overcastType in overcastData.usage) {
      if (overcastData.usage[overcastType].AoE)
        cardContent.find(`.overcast-value.${overcastType}`)[0].innerHTML = ('<i class="fas fa-ruler-combined"></i> ' + overcastData.usage[overcastType].current + " " + overcastData.usage[overcastType].unit)
      else if (overcastData.usage[overcastType].unit)
        cardContent.find(`.overcast-value.${overcastType}`)[0].innerHTML = (overcastData.usage[overcastType].current + " " + overcastData.usage[overcastType].unit)
      else
        cardContent.find(`.overcast-value.${overcastType}`)[0].innerHTML = (overcastData.usage[overcastType].current)
    }

        
    //@HOUSE
    if (game.settings.get("wfrp4e", "mooOvercasting"))
    {
      game.wfrp4e.utility.logHomebrew("mooOvercasting")
      let chatOptions = msg.data.flags.data
      chatOptions.testData = test.data
      test.result.other = test.result.other.split("<br>")
      return this.renderRollCard(chatOptions, test, msg)
    }
    //@/HOUSE

    cardContent.find(".overcast-count").text(`${overcastData.available}/${overcastData.total}`)
    msg.update({ content: cardContent.html(), "flags.data.testData": test.data })
  }

  // Proceed with an opposed test as unopposed
  static _onUnopposedButtonClicked(event) {
    event.preventDefault()
    let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");

    OpposedWFRP.resolveUnopposed(game.messages.get(messageId));
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
          if (msg.data.flags.transfer)
            itemData = JSON.parse(msg.data.flags.transfer).payload
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
    newContent = newContent.replace(`${currentAmount.gc} GC, ${currentAmount.ss} SS, ${currentAmount.bp} BP`, `${newAmount.gc} GC, ${newAmount.ss} SS, ${newAmount.bp} BP`)
    msg.update({ content: newContent })
  }

  static _onCorruptButtonClicked(event) {
    let strength = $(event.currentTarget).attr("data-strength").toLowerCase();
    if (strength != "moderate" && strength != "minor" && strength != "major")
      return ui.notifications.error("Invalid Corruption Type")

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

    if (game.user.isGM) {
      if (!game.user.targets.size)
        return ui.notifications.warn("Select a target to apply the effect.")
      game.user.targets.forEach(t => {
        t.actor.applyFear(value, name)
        game.user.updateTokenTargets([]);
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

    if (game.user.isGM) {
      if (!game.user.targets.size)
        return ui.notifications.warn("Select a target to apply the effect.")
      game.user.targets.forEach(t => {
        t.actor.applyTerror(value, name)
      })
      game.user.updateTokenTargets([]);
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
        return ui.notifications.warn("Target tokens to give experience to.")
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
      game.user.updateTokenTargets([]);
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
      game.socket.emit("system.wfrp4e", { type: "updateMsg", payload: { id: msgId, updateData: conditionResult } })
  }

  static _onApplyEffectClick(event) {

    let effectId = event.target.dataset["effectId"]
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
    

    if (item.range && item.range.value.toLowerCase() == game.i18n.localize("You").toLowerCase() && item.target && item.target.value.toLowerCase() == game.i18n.localize("You").toLowerCase())
      game.wfrp4e.utility.applyEffectToTarget(effect, [{ actor }]) // Apply to caster (self) 
    else
      game.wfrp4e.utility.applyEffectToTarget(effect)
  }

  static _onOpposedImgClick(event) {
    let msg = game.messages.get($(event.currentTarget).parents(".message").attr("data-message-id"))

    let speaker

    if ($(event.currentTarget).hasClass("attacker"))
      speaker = game.wfrp4e.utility.getSpeaker(msg.data.speaker)
    else if ($(event.currentTarget).hasClass("defender"))
      speaker = game.wfrp4e.utility.getSpeaker(msg.data.flags.unopposeData.targetSpeaker)

    speaker.sheet.render(true)

  }

}