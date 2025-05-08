import OpposedHandler from "../system/opposed-handler.js";


export default function() {


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
