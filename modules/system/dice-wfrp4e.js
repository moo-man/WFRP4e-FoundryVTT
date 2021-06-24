/**
 * DiceWFRP is the centralized object that handles all things involving rolling logic. At the base of roll evaluation, there is
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


export default class DiceWFRP {

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
      rollData : test.data,
      preData: test.preData, // TODO Remove pre and post data
      postData: test.postData,
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
      else
      {
        if (openMethod == "sheet")
          item.sheet.render(true)
        else
          item.postItem()
      }
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
    
    html.on('mousedown', '.fear-link', ev => {
      WFRP_Utility.handleFearClick(ev)
    })

    html.on('mousedown', '.terror-link', ev => {
      WFRP_Utility.handleTerrorClick(ev)
    })

    html.on('mousedown', '.exp-link', ev => {
      WFRP_Utility.handleExpClick(ev)
    })



    // Respond to editing chat cards - take all inputs and call the same function used with the data filled out
    html.on('change', '.card-edit', ev => {
      let button = $(ev.currentTarget),
        messageId = button.parents('.message').attr("data-message-id"),
        message = game.messages.get(messageId);
      let data = message.data.flags.data
      let newTestData = data.preData;
      newTestData[button.attr("data-edit-type")] = parseInt(ev.target.value)
      newTestData.extra.edited = true;

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

      if (["gmroll", "blindroll"].includes(chatOptions.rollMode)) chatOptions["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
      if (chatOptions.rollMode === "blindroll") chatOptions["blind"] = true;

      // Send message as third argument (rerenderMessage) so that the message will be updated instead of rendering a new one
      game.wfrp4e.utility.getSpeaker(message.data.speaker)[`${data.postData.postFunction}`]({testData : newTestData, cardOptions: chatOptions}, {rerenderMessage: message});
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
      if (!game.wfrp4e.generator)
        return ui.notifications.error(game.i18n.localize("CHAT.NoGenerator"))

      event.preventDefault();
      game.wfrp4e.generator.rollSpecies(
        $(event.currentTarget).parents('.message').attr("data-message-id"),
        $(event.currentTarget).attr("data-species")); // Choose selected species
    });

    html.on("click", '.subspecies-select', event => {
      if (!game.wfrp4e.generator)
        return ui.notifications.error(game.i18n.localize("CHAT.NoGenerator"))

      game.wfrp4e.generator.chooseSubspecies($(event.currentTarget).attr("data-subspecies"))

    });

    // Respond to character generation button clicks
    html.on("click", '.chargen-button, .chargen-button-nostyle', event => {
      event.preventDefault();

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
    });

    // Respond to overcast button clicks
    html.on("mousedown", '.overcast-button', event => {
      event.preventDefault();
      let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
      if (!msg.isOwner && !msg.isAuthor)
        return ui.notifications.error("CHAT.EditErrorYou do not have permission to edit this ChatMessage")


      let actor = game.wfrp4e.utility.getSpeaker(msg.data.speaker)

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
        case "other":
          if (spell.data.overcast.valuePerOvercast.type == "value")
            overcastData[overcastChoice].current += spell.data.overcast.valuePerOvercast.value
          else if (spell.data.overcast.valuePerOvercast.type == "SL")
            overcastData[overcastChoice].current += (parseInt(msg.data.flags.data.postData.SL) + (parseInt(actor.calculateSpellAttributes(spell.data.overcast.valuePerOvercast.additional)) || 0))
          else if (spell.data.overcast.valuePerOvercast.type == "characteristic")
            overcastData[overcastChoice].current += (overcastData[overcastChoice].increment || 0) // Increment is specialized storage for characteristic data so we don't have to look it up
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
      else if (overcastData[overcastChoice].unit)
        cardContent.find(`.overcast-value.${overcastChoice}`)[0].innerHTML = (overcastData[overcastChoice].current + " " + overcastData[overcastChoice].unit)
      else
        cardContent.find(`.overcast-value.${overcastChoice}`)[0].innerHTML = (overcastData[overcastChoice].current)

      msg.update({ content: cardContent.html() })
      msg.update({ "flags.data.postData.spell": spell })
    });

    // Button to reset the overcasts
    html.on("mousedown", '.overcast-reset', event => {
      event.preventDefault();
      let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
      let cardContent = $(event.currentTarget).parents('.message-content')
      if (!msg.isOwner && !msg.isAuthor)
        return ui.notifications.error("You do not have permission to edit this ChatMessage")

      let spell = duplicate(msg.data.flags.data.postData.spell);
      let overcastData = spell.overcasts
      for (let overcastType in overcastData) {
        if (overcastData[overcastType].count) {
          overcastData[overcastType].count = 0
          overcastData[overcastType].current = overcastData[overcastType].initial
          if (overcastData[overcastType].AoE)
            cardContent.find(`.overcast-value.${overcastType}`)[0].innerHTML = ('<i class="fas fa-ruler-combined"></i> ' + overcastData[overcastType].current + " " + overcastData[overcastType].unit)
        else if (overcastData[overcastType].unit)
            cardContent.find(`.overcast-value.${overcastType}`)[0].innerHTML = (overcastData[overcastType].current + " " + overcastData[overcastType].unit)
          else
            cardContent.find(`.overcast-value.${overcastType}`)[0].innerHTML = (overcastData[overcastType].current)
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
      if (!game.wfrp4e.generator)
        return ui.notifications.error(game.i18n.localize("CHAT.NoGenerator"))

      let careerSelected = $(event.currentTarget).attr("data-career")
      let species = $(event.currentTarget).attr("data-species")
      game.wfrp4e.generator.displayCareer(careerSelected, species, 0, false, true)
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
      let html = game.wfrp4e.tables.tableMenu(true);
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
            if ( actor ) { 
              let money = MarketWfrp4e.payCommand($(event.currentTarget).attr("data-pay"), actor);
              if (money) {
                WFRP_Audio.PlayContextAudio({ item: { "type": "money" }, action: "lose" })
                actor.updateEmbeddedDocuments("Item", [money]);
                if (itemData)
                {
                  actor.createEmbeddedDocuments("Item", [itemData])
                  ui.notifications.notify(game.i18n.format("MARKET.ItemAdded", {item : itemData.name, actor : actor.name}))
                }
              }
            } else {
              ui.notifications.notify(game.i18n.localize("MARKET.NotifyNoActor"));
            }
          }  else {
            ui.notifications.notify(game.i18n.localize("MARKET.NotifyUserMustBePlayer"));
          }
          break;
        case "creditItem":
          if (!game.user.isGM) {
            let actor = game.user.character;
            if ( actor ) {
              let dataExchange = $(event.currentTarget).attr("data-amount");
              let money = MarketWfrp4e.creditCommand(dataExchange, actor);
              if (money) {
                WFRP_Audio.PlayContextAudio({ item: { type: "money" }, action: "gain" })
                actor.updateEmbeddedDocuments("Item", [money]);
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
    });

    html.on("click", ".haggle", event => {
      let html = $(event.currentTarget).parents(".message")
      let msg = game.messages.get(html.attr("data-message-id"))
      let multiplier = $(event.currentTarget).attr("data-type") == "up" ? 1 : -1 
      let payString = html.find("[data-button=payItem]").attr("data-pay")
      let amount = MarketWfrp4e.parseMoneyTransactionString(payString)
      let bpAmount = amount.gc * 240 + amount.ss * 12 + amount.bp
      bpAmount += Math.round((bpAmount * .1)) * multiplier
      let newAmount = MarketWfrp4e.makeSomeChange(bpAmount, 0)
      let newPayString = MarketWfrp4e.amountToString(newAmount)
      html.find("[data-button=payItem]")[0].setAttribute("data-pay", newPayString)
      let newContent = html.find(".message-content").html()
      newContent = newContent.replace(`${amount.gc} GC, ${amount.ss} SS, ${amount.bp} BP`, `${newAmount.gc} GC, ${newAmount.ss} SS, ${newAmount.bp} BP`)
      msg.update({content : newContent})
    })  

    html.on("click", ".corrupt-button", event => {
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
    })

    html.on("click", ".fear-button", event => {

      let value = parseInt($(event.currentTarget).attr("data-value"));
      let name = $(event.currentTarget).attr("data-name");

      if (game.user.isGM)
      {
        if (!game.user.targets.size)
          return ui.notifications.warn("Select a target to apply the effect.")
        game.user.targets.forEach(t => {
          t.actor.applyFear(value, name)
          game.user.updateTokenTargets([]);
        })
      }
      else 
      {
        if (!game.user.character)
          return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
        game.user.character.applyFear(value, name)
      }
    })


    html.on("click", ".terror-button", event => {
      let value = parseInt($(event.currentTarget).attr("data-value"));
      let name = parseInt($(event.currentTarget).attr("data-name"));

      if (game.user.isGM)
      {
        if (!game.user.targets.size)
          return ui.notifications.warn("Select a target to apply the effect.")
        game.user.targets.forEach(t => {
          t.actor.applyTerror(value, name)
        })
        game.user.updateTokenTargets([]);
      }
      else 
      {
        if (!game.user.character)
          return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
        game.user.character.applyTerror(value, name)
      }
    })

    html.on("click", ".experience-button", event => {
      let amount = parseInt($(event.currentTarget).attr("data-amount"));
      let reason = $(event.currentTarget).attr("data-reason");
      let msg = game.messages.get($(event.currentTarget).parents('.message').attr("data-message-id"));
      let alreadyAwarded = duplicate(msg.getFlag("wfrp4e", "experienceAwarded") || [])


      if (game.user.isGM)
      {
        if (!game.user.targets.size)
          return ui.notifications.warn("Target tokens to give experience to.")
        game.user.targets.forEach(t => {
          if (!alreadyAwarded.includes(t.actor.id))
          {
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
      else 
      {
        if (!game.user.character)
          return ui.notifications.warn(game.i18n.localize("ErrorCharAssigned"))
        if (alreadyAwarded.includes(game.user.character.id))
          return ui.notifications.notify(`${game.user.character.name} already received this reward.`)

        alreadyAwarded.push(game.user.character.id)
        game.socket.emit("system.wfrp4e", {type : "updateMsg", payload: {id : msg.id, updateData :{ "flags.wfrp4e.experienceAwarded" : alreadyAwarded}}})
        game.user.character.awardExp(amount, reason)
      }
    })




    html.on("click", ".condition-script", async event => {
      let condkey = event.target.dataset["condId"]
      let combatantId = event.target.dataset["combatantId"]
      let combatant = game.combat.getEmbeddedEntity("Combatant", combatantId)
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
        game.socket.emit("system.wfrp4e", {type : "updateMsg", payload : {id : msgId, updateData : conditionResult}})
      
    })

    html.on("click", ".apply-effect", event => {


      let effectId = event.target.dataset["effectId"]
      let messageId = $(event.currentTarget).parents('.message').attr("data-message-id");
      let message = game.messages.get(messageId);
      let data = message.data.flags.data.postData;
      let item = data.weapon || data.spell || data.prayer || data.trait

      let actor = game.wfrp4e.utility.getSpeaker(message.data.speaker)

      if (!actor.isOwner)
        return ui.notifications.error("CHAT.ApplyError")

      let effect = actor.populateEffect(effectId, item, data)

      if (getProperty(effect, "flags.wfrp4e.effectTrigger") == "invoke")
      {
        game.wfrp4e.utility.invokeEffect(actor, effectId, item.id)
        return
      }

      if (item.data.range.value.toLowerCase() == game.i18n.localize("You").toLowerCase() && item.data.target.value.toLowerCase() == game.i18n.localize("You").toLowerCase())
        game.wfrp4e.utility.applyEffectToTarget(effect, [{actor}]) // Apply to caster (self) 
      else 
        game.wfrp4e.utility.applyEffectToTarget(effect)

    })




    html.on("click", ".attacker, .defender", event => {

      let msg = game.messages.get($(event.currentTarget).parents(".message").attr("data-message-id"))

      let speaker
      console.log(msg.data.flags)

      if ($(event.currentTarget).hasClass("attacker"))
        speaker = game.wfrp4e.utility.getSpeaker(msg.data.speaker)
      else if ($(event.currentTarget).hasClass("defender"))
        speaker = game.wfrp4e.utility.getSpeaker(msg.data.flags.unopposeData.targetSpeaker)

      speaker.sheet.render(true)

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

}