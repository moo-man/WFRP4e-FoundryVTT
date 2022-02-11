import OpposedWFRP from "../system/opposed-wfrp4e.js";
import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import StatBlockParser from "../apps/stat-parser.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";
import ItemWfrp4e from "../item/item-wfrp4e.js";
import OpposedTest from "../system/opposed-test.js";


export default function () {

  /**
   * Add right click option to actors to add all basic skills
   */
  Hooks.on("getActorDirectoryEntryContext", async (html, options) => {
    options.push(
      {
        name: game.i18n.localize("ACTOR.AddBasicSkills"),
        condition: game.user.isGM,
        icon: '<i class="fas fa-plus"></i>',
        callback: target => {
          const actor = game.actors.get(target.attr('data-document-id'));
          actor.addBasicSkills();
        }
      })
    options.push(
      {

        name: game.i18n.localize("ACTOR.ClearMount"),
        icon: '<i class="fas fa-horse"></i>',
        callback: target => {
          const actor = game.actors.get(target.attr('data-document-id'));
          return actor.update({
            "data.status.mount": {
              "id": "",
              "mounted": false,
              "isToken": false,
              "tokenData": {
                "scene": "",
                "token": ""
              }
            }
          })
        }
      })
    options.push(
      {

        name: game.i18n.localize("ACTOR.ImportStatBlock"),
        condition: game.user.isGM,
        icon: '<i class="fa fa-download"></i>',
        callback: target => {
          const actor = game.actors.get(target.attr('data-document-id'));
          new StatBlockParser(actor).render(true)
        }
      })
  })

  /**
 * Add right click option to damage chat cards to allow application of damage
 * Add right click option to use fortune point on own rolls
 */
  Hooks.on("getChatLogEntryContext", (html, options) => {
    let canApply = li => game.messages.get(li.attr("data-message-id")).getOpposedTest();
    let canApplyFortuneReroll = function (li) {
      //Condition to have the fortune contextual options:
      //Be owner of the actor
      //actor have fortune point
      //Own the roll
      //Once per roll (or at least, not on a reroll card)
      //Test must be failed 
      let message = game.messages.get(li.attr("data-message-id"));
      let test = message.getTest();
      return test && test.actor.isOwner && test.actor.status.fortune?.value > 0 && test.result.outcome == "failure" && !test.fortuneUsed.reroll

    };
    let canApplyFortuneAddSL = function (li) {
      //Condition to have the fortune contextual options:
      //Be owner of the actor
      //Have fortune point
      //Own the roll
      //Once per roll (or at least, not on a reroll card)
      let message = game.messages.get(li.attr("data-message-id"));
      let test = message.getTest();
      return test && test.actor.isOwner && test.actor.status.fortune?.value > 0 && !test.fortuneUsed.SL 
    };
    let canApplyDarkDeals = function (li) {
      //Condition to have the darkdeak contextual options:
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.attr("data-message-id"));
      let test = message.getTest();
      return test && test.actor.isOwner && test.actor.type == "character"
    };

    let canTarget = function (li) {
      //Condition to be able to target someone with the card
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.attr("data-message-id"));
      let test = message.getTest();
      return test && test.actor.isOwner
    };

    let canCompleteUnopposed = function (li) {
      //Condition to be able to target someone with the card
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.attr("data-message-id"));
      let test = message.getTest();
      return game.user.isGM && test && test.opposedMessages.length >= 2
    };

    let canApplyAllDamage = function (li) {
      //Condition to be able to target someone with the card
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.attr("data-message-id"));
      let test = message.getTest();
      return game.user.isGM &&  test && test.opposedMessages.length >= 2 && test.opposedMessages.every(m => m.getOppose().resultMessage)
    };

    options.push(
      {
        name: game.i18n.localize("CHATOPT.ApplyDamage"),
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApply,
        callback: li => {

          if (li.find(".dice-roll").length) {
            let amount = li.find('.dice-total').text();
            game.user.targets.forEach(t => t.actor.applyBasicDamage(amount))
          }
          else {
            let message = game.messages.get(li.attr("data-message-id"))
            let opposedTest = message.getOpposedTest();

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            let updateMsg = opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
            OpposedWFRP.updateOpposedMessage(updateMsg, message.id);
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoAP"),
        icon: '<i class="fas fa-user-shield"></i>',
        condition: canApply,
        callback: li => {
          if (li.find(".dice-roll").length) {
            let amount = li.find('.dice-total').text();
            game.user.targets.forEach(t => t.actor.applyBasicDamage(amount, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP }))
          }
          else {
            let message = game.messages.get(li.attr("data-message-id"))
            let opposedTest = message.getOpposedTest();

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            let updateMsg = opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP)
            OpposedWFRP.updateOpposedMessage(updateMsg, message.id);
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoTB"),
        icon: '<i class="fas fa-fist-raised"></i>',
        condition: canApply,
        callback: li => {
          if (li.find(".dice-roll").length) {
            let amount = li.find('.dice-total').text();
            game.user.targets.forEach(t => t.actor.applyBasicDamage(amount, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB }))
          }
          else {
            let message = game.messages.get(li.attr("data-message-id"))
            let opposedTest = message.getOpposedTest();

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            let updateMsg = opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB)
            OpposedWFRP.updateOpposedMessage(updateMsg, message.id);
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoTBAP"),
        icon: '<i class="fas fa-skull-crossbones"></i>',
        condition: canApply,
        callback: li => {
          if (li.find(".dice-roll").length) {
            let amount = li.find('.dice-total').text();
            game.user.targets.forEach(t => t.actor.applyBasicDamage(amount, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL }))
          }
          else {
            let message = game.messages.get(li.attr("data-message-id"))
            let opposedTest = message.getOpposedTest();

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            let updateMsg = opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL)
            OpposedWFRP.updateOpposedMessage(updateMsg, message.id);
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.UseFortuneReroll"),
        icon: '<i class="fas fa-dice"></i>',
        condition: canApplyFortuneReroll,
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"));
          let test = message.getTest();
          test.actor.useFortuneOnRoll(message, "reroll");
        }
      },
      {
        name: game.i18n.localize("CHATOPT.UseFortuneSL"),
        icon: '<i class="fas fa-plus-square"></i>',
        condition: canApplyFortuneAddSL,
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"));
          let test = message.getTest();
          test.actor.useFortuneOnRoll(message, "addSL");
        }
      },
      {
        name: game.i18n.localize("CHATOPT.DarkDeal"),
        icon: '<i class="fas fa-pen-nib"></i>',
        condition: canApplyDarkDeals,
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"));
          let test = message.getTest();
          test.actor.useDarkDeal(message);
        }
      },
      {
        name: game.i18n.localize("CHATOPT.OpposeTarget"),
        icon: '<i class="fas fa-crosshairs"></i>',
        condition: canTarget,
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"));
          let test = message.getTest();
          let targets = Array.from(game.user.targets).map(t => t.actor.speakerData(t.document))

          test.context.targets = test.context.targets.concat(targets)
          targets.map(t => WFRP_Utility.getToken(t)).forEach(t => {
            test.createOpposedMessage(t)
          })
        }
      },
      {
        name: game.i18n.localize("CHATOPT.CompleteUnopposed"),
        icon: '<i class="fas fa-angle-double-down"></i>',
        condition: canCompleteUnopposed,
        callback: li => {

          let message = game.messages.get(li.attr("data-message-id"));
          let test = message.getTest();
          test.opposedMessages.forEach(message => {
            let oppose = message.getOppose();
            oppose.resolveUnopposed();
          })
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyAllDamage"),
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApplyAllDamage,
        callback: li => {

          let message = game.messages.get(li.attr("data-message-id"));
          let test = message.getTest();
          test.opposedMessages.forEach(message => {
            let opposedTest = message.getOppose();

            if (!opposedTest.defenderTest.actor.isOwner)
            return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            let updateMsg = opposedTest.defender.applyDamage(opposedTest.resultMessage.getOpposedTest(), game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
            OpposedWFRP.updateOpposedMessage(updateMsg, message.id);
          })
        }
      }
    )
  })
}