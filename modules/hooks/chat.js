import GeneratorWfrp4e from "../apps/char-gen.js";
import MarketWfrp4e from "../apps/market-wfrp4e.js";
import NameGenWfrp from "../apps/name-gen.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";
import WFRP4E from "../system/config-wfrp4e.js"
import DiceWFRP from "../system/dice-wfrp4e.js";
import WFRP_Tables from "../system/tables-wfrp4e.js";
import TravelDistanceWfrp4e from "../apps/travel-distance-wfrp4e.js";


export default function() {

  // Activate chat listeners defined in dice-wfrp4e.js
  Hooks.on('renderChatLog', (log, html, data) => {
    DiceWFRP.chatListeners(html)

  });

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
    if (["gmroll", "blindroll"].includes(rollMode)) msg["whisper"] = ChatMessage.getWhisperIDs("GM");
    if (rollMode === "blindroll") msg["blind"] = true;
    msg["type"] = 0;

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
     * @returns {{amount: string, option: WFRP4E.creditOptions}}
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
        optionInCommandLine = WFRP4E.creditOptions.SPLIT;
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
     * @returns {WFRP4E.creditOptions} an option
     */
    function getOption(optionInCommandLine) {
      return (typeof optionInCommandLine == "undefined") ? WFRP4E.creditOptions.SPLIT : optionInCommandLine;
    }

    // Roll on a table
    if (command === "/table") {
      // If no argument, display help menu
      if (commands.length === 1)
        msg.content = WFRP_Tables.formatChatRoll("menu");
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
        msg.content = WFRP_Tables.formatChatRoll(commands[1], { modifier: modifier }, column)
      }
      // Create message and return false to not display user input of `/table`
      if (msg)
        ChatMessage.create(msg);
      return false;
    }
    // Lookup a condition
    else if (command === "/cond") {
      // Only one argument possible [1]: condition to lookup
      let conditionInput = commands[1].toLowerCase();
      // Don't require spelling, match the closest condition to the input
      let closest = WFRP_Utility.matchClosest(WFRP4E.conditions, conditionInput);
      if (!WFRP4E.conditionDescriptions) {
        ui.notifications.error("No content found")
        return false
      }
      let description = WFRP4E.conditionDescriptions[closest];
      let name = WFRP4E.conditions[closest];

      // Create message and return false to not display user input of `/cond`
      msg.content = `<b>${name}</b><br>${description}`;
      ChatMessage.create(msg);
      return false;
    }
    // Character generation
    else if (command === "/char") {
      // Begin character generation, return false to not display user input of `/char`
      GeneratorWfrp4e.speciesStage();
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
      MarketWfrp4e.testForAvailability({ settlement, rarity, modifier });
      return false;
    }
    // Pay commands
    else if (command === "/pay") {
      //The parameter is a string that will be exploded by a regular expression
      let amount = commands[1];
      let player = commands[2];
      //If the user isnt a GM, he pays a price
      if (!game.user.isGM) {
        let actor = WFRP_Utility.getSpeaker(msg.speaker);
        let money = duplicate(actor.data.items.filter(i => i.type === "money"));
        money = MarketWfrp4e.payCommand(amount, money);
        if (money)
          actor.updateEmbeddedEntity("OwnedItem", money);
      } else //If hes a gm, it generate a "Pay" card
        MarketWfrp4e.generatePayCard(amount, player);
      return false;
    }
    // Credit commands
    else if (command === "/credit") {
      let { amount, option } = extractAmountAndOptionFromCommandLine(commands);

      // If hes a gm, it generate a "Credit" card for all the player.
      if (game.user.isGM) {
        MarketWfrp4e.generateCreditCard(amount, option);
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

    // Travel commands
    else if (command === "/travel") {
      TravelDistanceWfrp4e.displayTravelDistance( commands[1], commands[2] );
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

      let link = game.i18n.format("CHAT.CommandLine.Help.Link", { link: "https://github.com/CatoThe1stElder/WFRP-4th-Edition-FoundryVTT/wiki" })

      renderTemplate("systems/wfrp4e/templates/chat/help/chat-help-command.html", {
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
   * This hook is only used to color code the winner/loser of an opposed test
   * When the result card shows up, take the start message and apply classes to it
   */
  Hooks.on("createChatMessage", (msg, options) => {

    // If message has the opposed class signifying an opposed result
    if ($(msg.data.content).find(".opposed-card").length && msg.data.flags.startMessageId && (game.user.isGM)) {
      // Look in the flags for the winner and startMessage
      let winner = msg.data.flags.opposeData.winner;
      let startMessage = game.messages.get(msg.data.flags.startMessageId)
      // The loser is "attacker" or "defender"
      let loser = winner == "attacker" ? "defender" : "attacker"
      // forgive me but i'm too tired to deal with jquery

      // Replace "attacker" with "attacker winner" or "defender" with "defender winner" to apply the color coded borders
      let newContent = startMessage.data.content.replace(winner, `${winner} winner`)
      newContent = newContent.replace(loser, `${loser} loser`)

      // Update card with new content
      let cardData = {
        user: game.user._id,
        content: newContent
      }
      startMessage.update(cardData).then(resultCard => {
        ui.chat.updateMessage(resultCard)
      })
    }
  });


  /**
 * Searches each message and adds drag and drop functionality and hides certain things from players
 */

  Hooks.on("renderChatMessage", async (app, html, msg) => {

    // Hide test data from players (35 vs 50) so they don't know the enemy stats
    if (game.settings.get("wfrp4e", "hideTestData") && !game.user.isGM && html.find(".chat-card").attr("data-hide") === "true") {
      html.find(".hide-option").remove();
    }
    // Hide chat card edit buttons from non-gms
    if (!game.user.isGM) {
      html.find(".chat-button-gm").remove();
      html.find(".unopposed-button").remove();
      //hide tooltip contextuamneu if not their roll
      if (msg.message.speaker.actor && game.actors.get(msg.message.speaker.actor).permission != 3)
        html.find(".chat-button-player").remove();
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

      postedItem.addEventListener('dragstart', ev => {
        if (app.data.flags.postQuantity == -1)
          return ev.dataTransfer.setData("text/plain", app.data.flags.transfer);


        if (game.user.isGM) 
        {
          ev.dataTransfer.setData("text/plain", app.data.flags.transfer);
          let newQuantity = app.data.flags.postQuantity - 1
          let recreateData = app.data.flags.recreationData
          recreateData.postQuantity = newQuantity;
          renderTemplate("systems/wfrp4e/templates/chat/post-item.html", recreateData).then(html => {
            app.update({ "flags.postQuantity": newQuantity, content : html })
            if (newQuantity <= 0)
              app.delete();
          })

        }
        else
        {
          let newQuantity = app.data.flags.postQuantity - 1

          if (app.data.flags.postQuantity)
            ev.dataTransfer.setData("text/plain", app.data.flags.transfer);


          if (newQuantity == 0) {
            game.socket.emit("system.wfrp4e", {
              type: "deleteMsg",
              payload: {
                "id": app.data._id
              }
            })
            return false
          }
          else {
            ev.dataTransfer.setData("text/plain", app.data.flags.transfer);
            let recreateData = app.data.flags.recreationData
            recreateData.postQuantity = newQuantity;
            renderTemplate("systems/wfrp4e/templates/chat/post-item.html", recreateData).then(html => {

              game.socket.emit("system.wfrp4e", {
                type: "updateMsg",
                payload: {
                  "id": app.data._id,
                  "updateData": { "flags.postQuantity": newQuantity, content: html }
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
          type : "wounds",
          payload : app.data.flags.data.postData.woundsHealed
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    }

    // Add drag and drop to character generation results
    let generation = html.find(".char-gen")[0]
    if (generation) {
      generation.setAttribute("draggable", true);
      generation.addEventListener('dragstart', ev => {
        ev.dataTransfer.setData("text/plain", app.data.flags.transfer);
      })
    }

    // Add drag and drop to skills in chat
    html.find(".skill-drag").each(function () {
      let skill = $(this)[0]
      skill.setAttribute("draggable", true)
      skill.addEventListener('dragstart', ev => {
        let dataTransfer = {
          type : "lookup",
          payload : {
            lookupType: "skill",
            name: ev.target.text,
          }
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    })

    // Add drag and drop to talents in chat
    html.find(".talent-drag").each(function () {
      let talent = $(this)[0]
      talent.setAttribute("draggable", true)
      talent.addEventListener('dragstart', ev => {
        let dataTransfer = {
          type : "lookup",
          payload : {
            lookupType: "talent",
            name: ev.target.text,
          }
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    })


    // Add drag and drop to exp markers in character generation
    html.find(".exp-drag").each(function () {
      let exp = $(this)[0]
      exp.setAttribute("draggable", true)
      exp.addEventListener('dragstart', ev => {
        let dataTransfer = {
          type : "experience",
          payload : parseInt($(exp).attr("data-exp"))
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    })

    // Add drag and drop to money from income rolls
    html.find(".money-drag").each(function () {
      let amount = $(this)[0]
      amount.setAttribute("draggable", true)
      amount.addEventListener('dragstart', ev => {
        let dataTransfer = {
          type : "money",
          payload: $(amount).attr("data-amt")
        }
        ev.dataTransfer.setData("text/plain", JSON.stringify(dataTransfer));
      })
    })
  })

}