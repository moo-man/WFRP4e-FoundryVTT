import OpposedWFRP from "../system/opposed-wfrp4e.js";
import ActorWfrp4e from "../actor/actor-wfrp4e.js";
import StatBlockParser from "../apps/stat-parser.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";
import ItemWfrp4e from "../item/item-wfrp4e.js";
import OpposedTest from "../system/opposed-test.js";


export default function() {

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
            return actor.update({"data.status.mount" :  {
              "id" : "",
              "mounted" : false,
              "isToken" : false,
              "tokenData" : {
                "scene" : "",
                "token" : ""
              }
            }})
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


  
  Hooks.on("getRollTableDirectoryEntryContext", async (html, options) => {
    options.push(
      {
        name: game.i18n.localize("TABLE.ConvertTable"),
        condition: game.user.isGM,
        icon: '<i class="fas fa-list"></i>',
        callback: target => {
          game.wfrp4e.utility.convertTable(target.attr('data-document-id'))
        }
      })
  })






  /**
 * Add Status right click option for combat tracker combatants
 */
  Hooks.on("getCombatTrackerEntryContext", (html, options) => {
    
    let masked = (li) => {
      let id = li.attr("data-combatant-id")
      let combatant = game.combat.getCombatant(id)
      return !!getProperty(combatant, "flags.wfrp4e.mask")
    }

    let unmasked = (li) => {
      let id = li.attr("data-combatant-id")
      let combatant = game.combat.getCombatant(id)
      return !getProperty(combatant, "flags.wfrp4e.mask")
    }

    options.push(
      {
        name: "Status",
        condition: true,
        icon: '<i class="far fa-question-circle"></i>',
        callback: target => {
          let combatant = game.combat.combatants.find(i => i._id == target.attr("data-combatant-id"))
          combatant.actor.displayStatus(undefined, combatant.name);
          ui.sidebar.activateTab("chat")
        }
      },
      {
        name: "Unmask",
        condition: masked,
        icon: '<i class="fas fa-mask"></i>',
        callback: target => {
          let combatant = game.combat.combatants.find(i => i._id == target.attr("data-combatant-id"))
          game.combat.updateEmbeddedDocuments("Combatant", [{_id : combatant._id, img : combatant.token.img, name : combatant.token.name, "flags.wfrp4e.mask" : false}])
        }
      },
      {
        name: "Mask",
        condition: unmasked,
        icon: '<i class="fas fa-mask"></i>',
        callback: target => {
          let combatant = game.combat.combatants.find(i => i._id == target.attr("data-combatant-id"))
          game.combat.updateEmbeddedDocuments("Combatant", [{_id : combatant._id, img : "systems/wfrp4e/tokens/unknown.png", name : "???", "flags.wfrp4e.mask" : true}])
        }
      })
  })





  /**
 * Add right click option to damage chat cards to allow application of damage
 * Add right click option to use fortune point on own rolls
 */
  Hooks.on("getChatLogEntryContext", (html, options) => {
    let canApply = li => li.find(".opposed-card").length || li.find(".dice-roll").length;
    let canEditItem = li => li.find(".post-item").length;
    let canApplyFortuneReroll = function (li) {
      //Condition to have the fortune contextual options:
      //Be owner of the actor
      //actor have fortune point
      //Own the roll
      //Once per roll (or at least, not on a reroll card)
      //Test must be failed 
      let result = false;
      let message = game.messages.get(li.attr("data-message-id"));

      if (message.data.speaker.actor) {
        let actor = game.actors.get(message.data.speaker.actor);
        if (actor.isOwner && actor.type == "character" && actor.status.fortune.value > 0) {
          let testcard = li.find(".test-data");
          if (testcard.length && !message.data.flags.data.fortuneUsedReroll) {
            //If the test was failed
            if (message.data.flags.data.testData.result.outcome == "failure")
              result = true;
          }
        }
      }
      return result;
    };
    let canApplyFortuneAddSL = function (li) {
      //Condition to have the fortune contextual options:
      //Be owner of the actor
      //Have fortune point
      //Own the roll
      //Once per roll (or at least, not on a reroll card)
      let result = false;
      let message = game.messages.get(li.attr("data-message-id"));
      if (message.data.speaker.actor) {
        let actor = game.actors.get(message.data.speaker.actor);
        if (actor.isOwner && actor.type == "character" && actor.status.fortune.value > 0) {
          let testcard = li.find(".test-data");

          if (testcard.length && !message.data.flags.data.fortuneUsedAddSL)
            result = true;
        }
      }
      return result;
    };
    let canApplyDarkDeals = function (li) {
      //Condition to have the darkdeak contextual options:
      //Be owner of character
      //Own the roll
      let result = false;
      let message = game.messages.get(li.attr("data-message-id"));
      if (message.data.speaker.actor) {
        let actor = game.actors.get(message.data.speaker.actor);
        if (actor.isOwner && actor.type == "character") {
          let testcard = li.find(".test-data");

          if (testcard.length)
            result = true;
        }
      }
      return result;
    };

    let canTarget = function (li) {
      //Condition to be able to target someone with the card
      //Be owner of character
      //Own the roll
      let result = false;
      let message = game.messages.get(li.attr("data-message-id"));
      if (message.data.speaker.actor) {
        let actor = game.actors.get(message.data.speaker.actor);
        if (actor.isOwner) {
          let testcard = li.find(".test-data");

          if (testcard.length && game.user.targets.size)
            result = true;
        }
      }
      return result;
    };
    options.push(
      {
        name: game.i18n.localize("CHATOPT.ApplyDamage"),
        icon: '<i class="fas fa-user-minus"></i>',
        condition: canApply,
        callback: li => {

          if (li.find(".dice-roll").length)
          {
            let amount = li.find('.dice-total').text();
            game.user.targets.forEach(t => t.actor.applyBasicDamage(amount))
          }
          else 
          {
            let opposeData = game.messages.get(li.attr("data-message-id")).data.flags.opposeData

            let opposedTest = new OpposedTest(opposeData.attackerTestData, opposeData.defenderTestData, opposeData.opposeResult)

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            let updateMsg = opposedTest.defenderTest.actor.applyDamage(opposedTest,  game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
            OpposedWFRP.updateOpposedMessage(updateMsg, li.attr("data-message-id"));
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoAP"),
        icon: '<i class="fas fa-user-shield"></i>',
        condition: canApply,
        callback: li => {
          if (li.find(".dice-roll").length)
          {
            let amount = li.find('.dice-total').text();
            game.user.targets.forEach(t => t.actor.applyBasicDamage(amount, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP}))
          }
          else 
          {
            let opposeData = game.messages.get(li.attr("data-message-id")).data.flags.opposeData

            let opposedTest = new OpposedTest(opposeData.attackerTestData, opposeData.defenderTestData, opposeData.opposeResult)

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))

            let updateMsg = opposedTest.defenderTest.actor.applyDamage(opposedTest,  game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP)
            OpposedWFRP.updateOpposedMessage(updateMsg, li.attr("data-message-id"));
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoTB"),
        icon: '<i class="fas fa-fist-raised"></i>',
        condition: canApply,
        callback: li => {
          if (li.find(".dice-roll").length)
          {
            let amount = li.find('.dice-total').text();
            game.user.targets.forEach(t => t.actor.applyBasicDamage(amount, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB}))
          }
          else 
          {
            let opposeData = game.messages.get(li.attr("data-message-id")).data.flags.opposeData

            let opposedTest = new OpposedTest(opposeData.attackerTestData, opposeData.defenderTestData, opposeData.opposeResult)

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))
              
            let updateMsg = opposedTest.defenderTest.actor.applyDamage(opposedTest,  game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB)
            OpposedWFRP.updateOpposedMessage(updateMsg, li.attr("data-message-id"));
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.ApplyDamageNoTBAP"),
        icon: '<i class="fas fa-skull-crossbones"></i>',
        condition: canApply,
        callback: li => {
          if (li.find(".dice-roll").length)
          {
            let amount = li.find('.dice-total').text();
            game.user.targets.forEach(t => t.actor.applyBasicDamage(amount, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL}))
          }
          else 
          {
            let opposeData = game.messages.get(li.attr("data-message-id")).data.flags.opposeData

            let opposedTest = new OpposedTest(opposeData.attackerTestData, opposeData.defenderTestData, opposeData.opposeResult)

            if (!opposedTest.defenderTest.actor.isOwner)
              return ui.notifications.error(game.i18n.localize("ErrorDamagePermission"))
              
            let updateMsg = opposedTest.defenderTest.actor.applyDamage(opposedTest,  game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL)
            OpposedWFRP.updateOpposedMessage(updateMsg, li.attr("data-message-id"));
          }
        }
      },
      {
        name: game.i18n.localize("CHATOPT.UseFortuneReroll"),
        icon: '<i class="fas fa-dice"></i>',
        condition: canApplyFortuneReroll,
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"));
          game.actors.get(message.data.speaker.actor).useFortuneOnRoll(message, "reroll");
        }
      },
      {
        name: game.i18n.localize("CHATOPT.UseFortuneSL"),
        icon: '<i class="fas fa-plus-square"></i>',
        condition: canApplyFortuneAddSL,
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"));
          game.actors.get(message.data.speaker.actor).useFortuneOnRoll(message, "addSL");
        }
      },
      {
        name: game.i18n.localize("CHATOPT.DarkDeal"),
        icon: '<i class="fas fa-pen-nib"></i>',
        condition: canApplyDarkDeals,
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"));
          game.actors.get(message.data.speaker.actor).useDarkDeal(message);
        }
      },
      {
        name: game.i18n.localize("CHATOPT.OpposeTarget"),
        icon: '<i class="fas fa-crosshairs"></i>',
        condition: canTarget,
        callback: li => {
          let message = game.messages.get(li.attr("data-message-id"));
          OpposedWFRP.handleOpposedTarget(message)
        }
      }
      // ,
      // {
      //   name: game.i18n.localize("CHAT.EditItem"),
      //   icon: '<i class="fas fa-edit"></i>',
      //   condition: canEditItem,
      //   callback: li => {
      //     let message = game.messages.get(li.attr("data-message-id"));
      //     let data = JSON.parse(message.data.flags.transfer);
      //     setProperty(data.payload, "flags.wfrp4e.postedItem", message.id)
      //     Item.create(data.payload, {temporary : true}).then(item => item.sheet.render(true))
      //   }
      // }
      )
  })
}