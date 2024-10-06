import MarketWFRP4e from "../apps/market-wfrp4e.js";
import NameGenWfrp from "../apps/name-gen.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";

import ChatWFRP from "../system/chat-wfrp4e.js";
import TravelDistanceWfrp4e from "../apps/travel-distance-wfrp4e.js";
import CharGenWfrp4e from "../apps/chargen/char-gen.js";
import OpposedHandler from "../system/opposed-handler.js";


export default function() {

  // Activate chat listeners defined in chat-wfrp4e.js
  Hooks.on('renderChatLog', (log, html, data) => {
    ChatWFRP.chatListeners(html)
  });


  // Add Apply Condition buttons
  Hooks.on("preCreateChatMessage", (msg) => {
    msg.updateSource({"content" : ChatWFRP.addEffectButtons(msg.content)})
  })

  
  Hooks.on("createChatMessage", (msg) => {
    let test = msg.system.test;
    if (test)
    {
      test.postTestGM(msg)
    }
  })




  /**
   * Primary use of this hook is to intercept chat commands.
   * /char  - Begin character generation
   * /table - Roll on a table
   * /cond  - Lookup a condition
   * /name  - Generate a name
   * /avail - Start an item availability test
   * /pay - Player: Remove money from character. GM: Start a payment request
   * /credit - Player: Not allowed. GM: Start a credit request to send money to players
   * /help - display a help message on all the commands above
   */
  Hooks.on("chatMessage", (html, content, msg) => {
    // Setup new message's visibility
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) msg["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (rollMode === "blindroll") msg["blind"] = true;

    let regExp;
    regExp = /(\S+)/g;
    let commands = content.match(regExp);
    let command = commands[0];

    /**
     * Check if the string is an amount of money or not
     * @param {string} mayBeAnOption
     * @returns {boolean} is it and amount ?
     */
    function isAnAmountOfMoney(mayBeAnOption) {
      let gc = game.i18n.localize("MARKET.Abbrev.GC")
      let ss = game.i18n.localize("MARKET.Abbrev.SS")
      let bp = game.i18n.localize("MARKET.Abbrev.BP")

      // language=JSRegexp
      let pattern = `^.*(\\d*${gc}|\\d*${ss}|\\d*${bp})$`
      let regExp = RegExp(pattern);
      return regExp.test(mayBeAnOption.toUpperCase());
    }

    /**
     * Extract the amount and the option from le commands array representing the command typed in the chat
     * @param commands Array of string
     * @returns {{amount: string, option:  game.wfrp4e.config.creditOptions}}
     */
    function extractAmountAndOptionFromCommandLine(commands) {
      let amount = undefined, optionInCommandLine = undefined
      let mayBeAnOption = commands[commands.length - 1];

      if (typeof mayBeAnOption === "undefined") {
        return { amount, optionInCommandLine }
      }

      let isAnAmount = isAnAmountOfMoney(mayBeAnOption);

      if (isAnAmount) {
        amount = commands.slice(1, commands.length).join(""); // all the matches except the first (/credit) goes to amount
        optionInCommandLine =  game.wfrp4e.config.creditOptions.SPLIT;
      } else {
        amount = commands.slice(1, commands.length - 1).join(""); // all the matches except the first (/credit) and the last (option)
        optionInCommandLine = mayBeAnOption;
      }
      let option = getOption(optionInCommandLine)
      return { amount, option };
    }

    /**
     * This method return an option from an initial string value
     * @param {string} optionInCommandLine
     * @returns { game.wfrp4e.config.creditOptions} an option
     */
    function getOption(optionInCommandLine) {
      return (typeof optionInCommandLine == "undefined") ?  game.wfrp4e.config.creditOptions.SPLIT : optionInCommandLine;
    }

    // Roll on a table
    if (command === "/table") {
      // If no argument, display help menu
      if (commands.length === 1)
      {
        game.wfrp4e.tables.formatChatRoll("menu").then(text => {
          if (!text)
            return
          msg.content = text
          msg.speaker = {alias: "Table Menu"}
          ChatMessage.create(msg)
        })
      }
      else {
        // [0]: /table [1]: <table-name> [2]: argument1 [3]: argument2
        let modifier, column; // Possible arguments
        // If argument 1 is a number use it as the modifier
        if (!isNaN(commands[2])) {
          modifier = parseInt(commands[2]);
          column = commands[3]
        } else // if argument 1 is not a number, use it as column
        {
          modifier = parseInt(commands[3]),
            column = commands[2]
        }
        // Call tables class to roll and return html
        game.wfrp4e.tables.formatChatRoll(commands[1], { modifier: modifier, showRoll : true }, column).then(text => {          
          if (!text)
            return
          msg.content = text
          ChatMessage.create(msg);
        })
      }
      return false;
    }
    // Lookup a condition
    else if (command === "/cond") {
      // Only one argument possible [1]: condition to lookup
      let conditionInput = commands[1].toLowerCase();
      // Don't require spelling, match the closest condition to the input
      let closest = WFRP_Utility.matchClosest( game.wfrp4e.config.conditions, conditionInput);
      if (! game.wfrp4e.config.conditionDescriptions) {
        ui.notifications.error("No content found")
        return false
      }
      let description =  game.wfrp4e.config.conditionDescriptions[closest];
      let name =  game.wfrp4e.config.conditions[closest];

      // Create message and return false to not display user input of `/cond`
      msg.content = `<b>${name}</b><br>${description}`;
      ChatMessage.create(msg);
      return false;
    }
    // Lookup an item property
    else if (command === "/prop")
    {
      let propertyInput = commands[1].toLowerCase();
      let allProperties = game.wfrp4e.utility.allProperties();
      let closest = WFRP_Utility.matchClosest( game.wfrp4e.utility.allProperties(), propertyInput);

      let description = game.wfrp4e.config.qualityDescriptions[closest] || game.wfrp4e.config.flawDescriptions[closest];
      let name =  allProperties[closest];

      msg.content = `<b>${name}</b><br>${description}`;
      ChatMessage.create(msg);
      return false;
    }

    // Character generation
    else if (command === "/char") {
      CharGenWfrp4e.start();
      return false;
    }
    // Name generation
    else if (command === "/name") {
      // Possible arguments - [2]: gender, [1]: species
      let gender = (commands[2] || "").toLowerCase()
      let species = (commands[1] || "").toLowerCase();
      // Call generator class to create name, create message, return false to not display user input of `/name`
      let name = NameGenWfrp.generateName({ species, gender })
      ChatMessage.create(WFRP_Utility.chatDataSetup(name))
      return false;
    }
    // Availability test
    else if (command === "/avail") {
      let modifier = 0;
      // Possible arguments - [1]: settlement size, [2]: item rarity [3*]: modifier

      let settlement = (commands[1] || "").toLowerCase();
      let rarity = (commands[2] || "").toLowerCase();
      if (!isNaN(commands[3])) {
        modifier = commands[3];
      }

      // Call generator class to start the test, create message, send to chat, return false to not display user input of `/avail`
      MarketWFRP4e.testForAvailability({ settlement, rarity, modifier });
      return false;
    }
    // Pay commands
    else if (command === "/pay") {
      //The parameter is a string that will be exploded by a regular expression
      let amount = commands[1];
      let playerOrActor = commands.slice(2, commands.length).join(" ");
      //If the user isnt a GM, he pays a price
      if (!game.user.isGM) {
        let actor = WFRP_Utility.getSpeaker(msg.speaker);
        let money = MarketWFRP4e.payCommand(amount, actor);
        if (money)
          actor.updateEmbeddedDocuments("Item", money);
      } else {
        if ( playerOrActor.length > 0) {  // Valid actor/option
          let actor = game.actors.find(a => a.name.toLowerCase().includes(playerOrActor.toLowerCase() ) )
          if ( actor ) {
            let p = game.users.players.find(p => p.character?.id === actor.id && p.active);
            if (actor.hasPlayerOwner && p ) { 
                playerOrActor = p.name // In this case, replace the actor by the player name for chat card, as usual
              } else {
                MarketWFRP4e.directPayCommand(amount,actor); // No player/Not active -> substract money
                return false;
              }
          }
        }
        // Default choice, display chat card
        MarketWFRP4e.generatePayCard(amount, playerOrActor);
      }
      return false;
    }

    // Credit commands
    else if (command === "/credit") {
      let amount = commands[1];
      let playerOrActorOrCommand = commands.slice(2, commands.length).join(" ");

      // If hes a gm, it generate a "Credit" card for all the player.
      if (game.user.isGM) {
        MarketWFRP4e.processCredit(amount, playerOrActorOrCommand);
      } else {
        //If the user isnt a GM, he can't use the command (for now)
        message = `<p>${game.i18n.localize("MARKET.CreditCommandNotAllowed")}</p>`;
        ChatMessage.create(WFRP_Utility.chatDataSetup(message, "roll"));
      }
      return false;
    }

    else if (command === "/corruption") {
      WFRP_Utility.postCorruptionTest(commands[1]);
      return false;
    }


    else if (command === "/fear") {
      WFRP_Utility.postFear(commands[1], commands.slice(2).join(" "));
      return false;
    }

    else if (command === "/terror") {
      WFRP_Utility.postTerror(commands[1], commands.slice(2).join(" "));
      return false;
    }


    else if (command === "/exp") {
      WFRP_Utility.postExp(commands[1], commands.slice(2).join(" "));
      return false;
    }

    // Travel commands
    else if (command === "/travel") {
      TravelDistanceWfrp4e.displayTravelDistance( commands[1], commands[2] );
      return false;
    }

    else if (command === "/trade") {
      game.wfrp4e.trade.attemptBuy();
      return false;
    }

    

    //Help commands
    else if (command === "/help") {
      let rawCommands = game.i18n.localize("CHAT.CommandLine.Help.Commands");

      let commandElements = rawCommands.split(",").map(function (item) {
        return {
          title: game.i18n.localize(`CHAT.CommandLine.Help.${item}.Title`),
          command: game.i18n.localize(`CHAT.CommandLine.Help.${item}.Usage.Command`),
          commandLabel: game.i18n.localize(`CHAT.CommandLine.Help.Label.Command`),
          example: game.i18n.localize(`CHAT.CommandLine.Help.${item}.Usage.Example`),
          exampleLabel: game.i18n.localize(`CHAT.CommandLine.Help.Label.Example`),
          note: game.i18n.localize(`CHAT.CommandLine.Help.${item}.Usage.Note`),
          noteLabel: game.i18n.localize(`CHAT.CommandLine.Help.Label.Note`),
        };
      });

      let link = game.i18n.format("CHAT.CommandLine.Help.Link", { link: "https://github.com/moo-man/WFRP4e-FoundryVTT/wiki" })

      renderTemplate("systems/wfrp4e/templates/chat/help/chat-help-command.hbs", {
        commands: commandElements,
        link: link
      }).then(html => {
        let chatData = WFRP_Utility.chatDataSetup(html, "selfroll");
        ChatMessage.create(chatData);
      });
      return false;
    }
  });


  /**
 * Searches each message and adds drag and drop functionality and hides certain things from players
 */

  Hooks.on("renderChatMessage", async (app, html) => {

    // Hide test data from players (35 vs 50) so they don't know the enemy stats
    if (game.settings.get("wfrp4e", "hideTestData") && !game.user.isGM && html.find(".chat-card").attr("data-hide") === "true") {
      html.find(".hide-option").remove();
    }
    // Hide chat card edit buttons from non-gms
    if (!game.user.isGM) {
      html.find(".chat-button-gm").remove();
      html.find(".haggle-buttons").remove();
      // Hide these if actor is not owned by the player
      if (!app.speaker.actor || (app.speaker.actor && !game.actors.get(app.speaker.actor).isOwner))
      {
        html.find(".chat-button-player").remove();
        html.find(".test-breakdown").remove();
        html.find(".damage-breakdown").remove();
        html.find(".hide-spellcn").remove();
      }
      if (!app.system.opposedHandler?.defender?.isOwner)
      {
        html.find(".opposed-options").remove();
      }
    }
    else {
      html.find(".chat-button-player").remove();
    }


    // Do not display "Blind" chat cards to non-gm
    if (html.hasClass("blind") && !game.user.isGM) {
      html.find(".message-header").remove(); // Remove header so Foundry does not attempt to update its timestamp
      html.html("").css("display", "none");
    }

    // Add drag and drop functonality to posted items
    let postedItem = html.find(".post-item")[0]
    if (postedItem) {
      postedItem.setAttribute("draggable", true);
      postedItem.classList.add("draggable");

      postedItem.addEventListener('dragstart', ev => {
        if (app.flags.postQuantity == "inf" || app.flags.postQuantity == undefined)
          return ev.dataTransfer.setData("text/plain", app.flags.transfer);

        if (game.user.isGM)
        {
          ev.dataTransfer.setData("text/plain", app.flags.transfer);
          let newQuantity = app.flags.postQuantity - 1
          let recreateData = app.flags.recreationData
          recreateData.postQuantity = newQuantity;
          renderTemplate("systems/wfrp4e/templates/chat/post-item.hbs", recreateData).then(html => {
            app.update({ "flags.postQuantity": newQuantity, content : TextEditor.enrichHTML(html) })
            if (newQuantity <= 0)
              app.delete();
          })

        }
        else
        {
          let newQuantity = app.flags.postQuantity - 1

          if (app.flags.postQuantity)
            ev.dataTransfer.setData("text/plain", app.flags.transfer);


          if (newQuantity == 0) {
            game.socket.emit("system.wfrp4e", {
              type: "deleteMessage",
              payload: {
                "id": app.id
              }
            })
            return false
          }
          else {
            ev.dataTransfer.setData("text/plain", app.flags.transfer);
            let recreateData = app.flags.recreationData
            recreateData.postQuantity = newQuantity;
            renderTemplate("systems/wfrp4e/templates/chat/post-item.hbs", recreateData).then(html => {

              game.socket.emit("system.wfrp4e", {
                type: "updateMsg",
                payload: {
                  "id": app.id,
                  "updateData": { "flags.postQuantity": newQuantity, content: TextEditor.enrichHTML(html) }
                }
              })
            })
          }
        }
      })
    }

    // Add drag and drop to character generation results
    let woundsHealed = html.find(".wounds-healed-drag")[0]
    if (woundsHealed) {
      woundsHealed.setAttribute("draggable", true);
      woundsHealed.addEventListener('dragstart', ev => {
        let dataTransfer = {
          type : "custom",
          custom : "wounds",
          wounds : app.system.test.result.woundsHealed
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    }

    // Add drag and drop to character generation results
    let generation = html.find(".char-gen")[0]
    if (generation) {
      generation.setAttribute("draggable", true);
      generation.addEventListener('dragstart', ev => {
        ev.dataTransfer.setData("text/plain", app.flags.transfer);
      })
    }


    // Add drag and drop to money from income rolls
    html.find(".money-drag").each(function () {
      let amount = $(this)[0]
      amount.setAttribute("draggable", true)
      amount.addEventListener('dragstart', ev => {
        let dataTransfer = {
          type : "Income",
          amount: $(amount).attr("data-amt")
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    })

    warhammer.utility.replacePopoutTokens(html);

    // if (app.getFlag("wfrp4e", "roleTests"))
    // {
    //   let tests = app.getFlag("wfrp4e", "roleTests").map(i => game.messages.get(i)?.system.test).filter(i => i);
    //   let SL = tests.reduce((sl, test) => sl + test.result.crewTestSL, 0); 
    //   let slCounter = html.find(".sl-total")[0]
    //   slCounter.innerText = slCounter.innerText.replace("%SL%", SL);
    // }

  })

  Hooks.on("deleteChatMessage", async (message) => {
    let targeted = message.flags.unopposeData // targeted opposed test
    let manual = message.flags.opposedStartMessage // manual opposed test
    if (!targeted && !manual)
      return;

    if (targeted) {
      let target = canvas.tokens.get(message.flags.unopposeData.targetSpeaker.token)
      await target.actor.clearOpposed();
    }
    if (manual && !message.flags.opposeResult && OpposedHandler.attackerMessage) {
      await OpposedHandler.attackerMessage.update(
        {
          "flags.data.isOpposedTest": false
        });
      await OpposedHandler.attacker.clearOpposed();
    }
    ui.notifications.notify(game.i18n.localize("ROLL.CancelOppose"))
  })

}
