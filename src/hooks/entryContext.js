import OpposedHandler from "../system/opposed-handler.js";
import StatBlockParser from "../apps/stat-parser.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";
import CastTest from "../system/rolls/cast-test.js";
import EditTest from "../apps/edit-test.js";
import { OpposedHandlerMessage } from "../model/message/oppose-handler.js";


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
            "system.status.mount": {
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

  Hooks.on("getChatMessageContextOptions", (html, options) => {
    let canApply = li => game.messages.get(li.dataset.messageId).system.opposedTest || li.querySelector(".dice-roll");
    let hasTest  = li => game.messages.get(li.dataset.messageId).system.test;
    let canApplyFortuneReroll = function (li) {
      //Condition to have the fortune contextual options:
      //Be owner of the actor
      //actor have fortune point
      //Own the roll
      //Once per roll (or at least, not on a reroll card)
      //Test must be failed 
      let message = game.messages.get(li.dataset.messageId);
      let test = message.system?.test;
      return test && test.actor.isOwner && test.actor.status.fortune?.value > 0 && test.failed && !test.fortuneUsed.reroll

    };
    let canApplyFortuneAddSL = function (li) {
      //Condition to have the fortune contextual options:
      //Be owner of the actor
      //Have fortune point
      //Own the roll
      //Once per roll (or at least, not on a reroll card)
      let message = game.messages.get(li.dataset.messageId);
      let test = message.system?.test;
      return test && test.actor.isOwner && test.actor.status.fortune?.value > 0 && !test.fortuneUsed.SL 
    };
    let canApplyDarkDeals = function (li) {
      //Condition to have the darkdeak contextual options:
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.dataset.messageId);
      let test = message.system?.test;
      return test && test.actor.isOwner && test.actor.type == "character"
    };

    let canGMReroll = function (li) {
      //Condition to have the darkdeak contextual options:
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.dataset.messageId);
      let test = message.system?.test;
      return test && game.user.isGM
    };

    let canTarget = function (li) {
      //Condition to be able to target someone with the card
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.dataset.messageId);
      let test = message.system?.test;
      return test && test.actor.isOwner
    };

    let canCompleteUnopposed = function (li) {
      //Condition to be able to target someone with the card
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.dataset.messageId);
      let test = message.system?.test;
      return game.user.isGM && test && test.opposedMessages.length >= 2
    };

    let canApplyAllDamage = function (li) {
      //Condition to be able to target someone with the card
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.dataset.messageId);
      let test = message.system?.test;
      return game.user.isGM &&  test && test.opposedMessages.length >= 2 && test.opposedMessages.some(m => m?.system.opposedHandler?.resultMessage)
    };

    let canApplyTotalPower = function (li) {
      //Condition to be able to target someone with the card
      //Be owner of character
      //Own the roll
      let message = game.messages.get(li.dataset.messageId);
      let test = message.system?.test;
      return (message.isOwner || message.isAuthor) && test && test instanceof CastTest && test.result.critical && game.settings.get("wfrp4e", "useWoMOvercast") && !test.result.totalPower
    };

    options.push(
      {
        name: game.i18n.localize("CHATOPT.ApplyDamage"),
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApply,
        callback: li => {

          if (li.querySelector(".dice-roll")) {
            let amount = li.querySelector('.dice-total').textContent
            canvas.tokens.controlled.map(i => i.document.actor).concat(Array.from(game.user.targets).map(i => i.document.actor)).forEach(a => a.applyBasicDamage(amount))
          }
          else {
            let message = game.messages.get(li.dataset.messageId)
            let opposedTest = message.system.opposedTest;

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
              .then(updateMsg => OpposedHandler.updateOpposedMessage(updateMsg, message.id));
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoAP"),
        icon: '<i class="fas fa-user-shield"></i>',
        condition: canApply,
        callback: li => {
          if (li.querySelector(".dice-roll")) {
            let amount = li.querySelector('.dice-total').textContent;
            canvas.tokens.controlled.map(i => i.document.actor).concat(Array.from(game.user.targets).map(i => i.document.actor)).forEach(a => a.applyBasicDamage(amount, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP }))
          }
          else {
            let message = game.messages.get(li.dataset.messageId)
            let opposedTest = message.system.opposedTest;

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP)
              .then(updateMsg => OpposedHandler.updateOpposedMessage(updateMsg, message.id));
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoTB"),
        icon: '<i class="fas fa-fist-raised"></i>',
        condition: canApply,
        callback: li => {
          if (li.querySelector(".dice-roll")) {
            let amount = li.querySelector('.dice-total').textContent;
            canvas.tokens.controlled.map(i => i.document.actor).concat(Array.from(game.user.targets).map(i => i.document.actor)).forEach(a => a.applyBasicDamage(amount, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB }))
          }
          else {
            let message = game.messages.get(li.dataset.messageId)
            let opposedTest = message.system.opposedTest;

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB)
              .then(updateMsg => OpposedHandler.updateOpposedMessage(updateMsg, message.id));
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoTBAP"),
        icon: '<i class="fas fa-skull-crossbones"></i>',
        condition: canApply,
        callback: li => {
          if (li.querySelector(".dice-roll")) {
            let amount = li.querySelector('.dice-total').textContent;
            canvas.tokens.controlled.map(i => i.document.actor).concat(Array.from(game.user.targets).map(i => i.document.actor)).forEach(a => a.applyBasicDamage(amount, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL }))
          }
          else {
            let message = game.messages.get(li.dataset.messageId)
            let opposedTest = message.system.opposedTest;

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            opposedTest.defenderTest.actor.applyDamage(opposedTest, game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL)
              .then(updateMsg => OpposedHandler.updateOpposedMessage(updateMsg, message.id));
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.UseFortuneReroll"),
        icon: '<i class="fas fa-dice"></i>',
        condition: canApplyFortuneReroll,
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;
          test.useFortune("reroll");
        }
      },
      {
        name: game.i18n.localize("CHATOPT.Reroll"),
        icon: '<i class="fas fa-dice"></i>',
        condition: canGMReroll,
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;
          test.reroll();
        }
      },
      {
        name: game.i18n.localize("CHATOPT.UseFortuneSL"),
        icon: '<i class="fas fa-plus-square"></i>',
        condition: canApplyFortuneAddSL,
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;
          test.useFortune("addSL");
        }
      },
      {
        name: game.i18n.localize("CHATOPT.DarkDeal"),
        icon: '<i class="fas fa-pen-nib"></i>',
        condition: canApplyDarkDeals,
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;
          test.useDarkDeal();
        }
      },
      {
        name: game.i18n.localize("CHATOPT.StartOpposed"),
        icon: '<i class="fas fa-sword"></i>',
        condition: li => {return (hasTest(li) && !game.wfrp4e.oppose)},
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;

          let targets = Array.from(game.user.targets).map(t => t.actor.speakerData(t.document))

          if (targets.length)
          {
            if (canvas.scene) 
            { 
              game.canvas.tokens.setTargets([])
            }

            test.context.targets = test.context.targets.concat(targets)
            targets.map(t => WFRP_Utility.getToken(t)).forEach(t => 
            {
              test.createOpposedMessage(t)
            })
          }
          else // no targets
          {
            OpposedHandlerMessage.clickManualOpposed(message);
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.DefendOpposed"),
        icon: '<i class="fas fa-shield"></i>',
        condition: li => {return (hasTest(li) && game.wfrp4e.oppose)},
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          OpposedHandlerMessage.clickManualOpposed(message);
        }
      },
      {
        name: game.i18n.localize("CHATOPT.CompleteUnopposed"),
        icon: '<i class="fas fa-angle-double-down"></i>',
        condition: canCompleteUnopposed,
        callback: li => {

          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;
          test.opposedMessages.forEach(message => {
            if (message)
            {
              let oppose = message.system.opposedHandler;
              oppose.resolveUnopposed();
            }
          })
        }
      },
      {
        name: game.i18n.localize("CHATOPT.EditTest"),
        icon: '<i class="fas fa-edit"></i>',
        condition: hasTest,
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;
          new EditTest(test).render(true);
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyAllDamage"),
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApplyAllDamage,
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;
          for (let message of test.opposedMessages) {
            if (message) {
              let opposedTest = message.system.opposedHandler;
              if (!opposedTest.defenderTest.actor.isOwner) {
                ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))
              } else {
                opposedTest.defender.applyDamage(opposedTest.resultMessage.system.opposedTest, game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
                  .then(updateMsg => OpposedHandler.updateOpposedMessage(updateMsg, opposedTest.resultMessage.id));
              }
            }
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.TotalPower"),
        icon: '<i class="fa-solid fa-bolt"></i>',
        condition: canApplyTotalPower,
        callback: li => {
          let message = game.messages.get(li.dataset.messageId);
          let test = message.system.test;
          test.preData.totalPower = true;
          test.roll();
        }
      }
    )
  })
}