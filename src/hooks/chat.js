import MarketWFRP4e from "../apps/market-wfrp4e.js";
import NameGenWfrp from "../apps/name-gen.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";

import ChatWFRP from "../system/chat-wfrp4e.js";
import TravelDistanceWFRP4e from "../apps/travel-distance-wfrp4e.js";
import CharGenWfrp4e from "../apps/chargen/char-gen.js";
import OpposedHandler from "../system/opposed-handler.js";


export default function() {




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
  

    //Help commands
    if (command === "/help") {
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
