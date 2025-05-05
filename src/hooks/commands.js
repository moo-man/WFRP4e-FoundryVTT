import CharGenWfrp4e from "../apps/chargen/char-gen.js";
import MarketWFRP4e from "../apps/market-wfrp4e.js";
import NameGenWfrp from "../apps/name-gen.js";
import TravelDistanceWFRP4e from "../apps/travel-distance-wfrp4e.js";
import { CorruptionMessageModel } from "../model/message/corruption.js";
import { CreditMessageModel } from "../model/message/credit.js";
import { PsychMessageModel } from "../model/message/psych.js";
import { PayMessageModel } from "../model/message/pay.js";
import { XPMessageModel } from "../model/message/xp.js";
import WFRP_Tables from "../system/tables-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";


export default function () {
  /**
   * Init function loads tables, registers settings, and loads templates
   */
  Hooks.once("init", () => {
    game.wfrp4e.commands = new ChatCommands({
      table : {
        description: "Roll on a table",
        args : ["table", "modifier", "column"],
        defaultArg : "table",
        callback: (table, modifier, column) => WFRP_Tables.handleTableCommand(table, {modifier, column})
      },
      pay: {
        description: "If a player, pay some amount from the assigned Actor. If a GM, post a message prompting to a pay some amount",
        args: ["amount", "for", "target"],
        defaultArg: "amount",
        callback: (amount, product, target) => PayMessageModel.handlePayCommand(amount, { target, product })
      },
      credit : {
        description : "Post monetary reward",
        args : ["amount", "mode", "split", "target", "reason"],
        defaultArg : "amount",
        callback : (amount, mode, split, target, reason) => CreditMessageModel.handleCreditCommand(amount, mode, {split, target, reason})
      },
      char: {
        description: "Start Character Creation",
        args: [],
        callback: () => CharGenWfrp4e.start()
      },
      cond : {
        description: "Show Condition Description",
        args : ["condition"],
        defaultArg: "condition",
        callback: (condition) => {
                // Only one argument possible [1]: condition to lookup
                let conditionInput = condition.toLowerCase();
                // Don't require spelling, match the closest condition to the input
                let closest = WFRP_Utility.matchClosest( game.wfrp4e.config.conditions, conditionInput);
                if (! game.wfrp4e.config.conditionDescriptions) {
                  ui.notifications.error("No content found")
                  return false
                }
                let description =  game.wfrp4e.config.conditionDescriptions[closest];
                let name =  game.wfrp4e.config.conditions[closest];

                // Create message and return false to not display user input of `/cond`
                msg.content = `<p><strong>${name}</strong></p>${description}`;
                ChatMessage.create(msg);
        }
      },
      prop : {
        description: "Show a Quality or Flaw",
        args : ["property"],
        defaultArg : "property",
        callback : (property) => {
          let propertyInput = property;
          let allProperties = game.wfrp4e.utility.allProperties();
          let closest = WFRP_Utility.matchClosest( game.wfrp4e.utility.allProperties(), propertyInput);
    
          let description = game.wfrp4e.config.qualityDescriptions[closest] || game.wfrp4e.config.flawDescriptions[closest];
          let name =  allProperties[closest];
    
          msg.content = `<p><strong>${name}</strong></p>${description}`;
          ChatMessage.create(msg);
        }
      },
      name : {
        description : "Generate a name",
        args : ["gender", "species"],
        defaultArg : "gender",
        callback : (gender, species) => {
          // Call generator class to create name, create message, return false to not display user input of `/name`
          let name = NameGenWfrp.generateName({ species, gender })
          ChatMessage.create(WFRP_Utility.chatDataSetup(name, "selfroll"))
        }
      },
      avail : {
        description : "Roll an Availability Test",
        args : ["rarity", "size", "modifier"],
        defaultArg : "rarity",
        callback : (rarity, size, modifier) => {
    
          // Call generator class to start the test, create message, send to chat, return false to not display user input of `/avail`
          MarketWFRP4e.testForAvailability({ settlement : size, rarity, modifier });
        }
      },
      corruption : {
        description : "Prompt Corruption Test",
        args : ["strength", "skill", "source"],
        defaultArg : "strength",
        callback: (strength, skill, source) => {
          CorruptionMessageModel.handleCorruptionCommand(strength, skill, source)
        }
      },
      fear : {
        description : "Prompt Fear Test",
        args : ["rating", "source"],
        defaultArg : "rating",
        callback: (rating, source) => {
          PsychMessageModel.handleFearCommand(rating, source)
        }
      },
      terror : {
        description : "Prompt Terror Test",
        args : ["rating", "source"],
        defaultArg : "rating",
        callback: (rating, source) => {
          PsychMessageModel.handleTerrorCommand(rating, source)
        }
      },
      exp : {
        description : "Prompt XP Reward",
        args : ["amount", "reason"],
        defaultArg : "amount",
        callback: (amount, reason) => {
          XPMessageModel.handleXPCommand(amount, reason)
        }
      },
      travel : {
        description : "Post Travel Distance Tool",
        args : ["from", "to"],
        defaultArg : "from",
        callback: (from, to) => {
          TravelDistanceWFRP4e.displayTravelDistance(from, to)
        }
      },
      trade : {
        description : "Prompt Trade Dialog",
        args : [],
        callback: () => {
          game.wfrp4e.trade.attemptBuy();
        }
      }
    })
  })
}