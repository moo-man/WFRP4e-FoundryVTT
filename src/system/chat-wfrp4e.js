/**
 * ChatWFRP is the centralized object that handles all things involving rolling logic. At the base of roll evaluation, there is
 * rollTest() which provides the basics of roll evaluation - determining success, SL, etc. This function is used by more complex
 * test evaluation functions like rollWeaponTest, which calls rollTest, then extends upon it with more logic concerning weapons.
 * Another noteworthy function is renderRollCard, which is used to display the roll results of all tests. Lastly, this object
 * is where chat listeners are defined, which add interactivity to chat, usually in the form of button clickss.
 */

import MarketWFRP4e from "../apps/market-wfrp4e.js";
import TravelDistanceWFRP4e from "../apps/travel-distance-wfrp4e.js";
import WFRP_Audio from "./audio-wfrp4e.js";
import WFRP_Utility from "./utility-wfrp4e.js";

import OpposedHandler from "./opposed-handler.js";
import TradeManager from "./trade/trade-manager.js";


export default class ChatWFRP {

  /**
   * Activate event listeners using the chat log html.
   * @param html {HTML}  Chat log html
   */
  static async chatListeners(html) {


    html.on("click", '.market-button', this._onMarketButtonClicked.bind(this))
    html.on("click", ".corrupt-button", this._onCorruptButtonClicked.bind(this))
    html.on("click", ".fear-button", this._onFearButtonClicked.bind(this))
    html.on("click", ".terror-button", this._onTerrorButtonClicked.bind(this))
    html.on("click", ".experience-button", this._onExpButtonClicked.bind(this))
    html.on("click", ".condition-script", this._onConditionScriptClick.bind(this))
    html.on("click", ".apply-condition", this._onApplyCondition.bind(this));
    html.on("click", ".crew-test", this._onCrewTestClick.bind(this))
    html.on("click", ".dual-wielder", this._onRollDualWielder.bind(this))

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
      game.canvas.tokens.setTargets([])
    }


    if (game.user.isGM) {
      if (!targets.length)
        return ui.notifications.warn(game.i18n.localize("ErrorTarget"))
      targets.forEach(t => {
        t.actor.applyFear(value, name)
        if (canvas.scene) {
          game.canvas.tokens.setTargets([])
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
      game.canvas.tokens.setTargets([])
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

  static _onApplyCondition(event) {
    let actors = canvas.tokens.controlled.concat(Array.from(game.user.targets).filter(i => !canvas.tokens.controlled.includes(i))).map(a => a.actor);
    if (canvas.scene) { 
      game.canvas.tokens.setTargets([])
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