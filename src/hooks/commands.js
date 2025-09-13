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
        description: game.i18n.localize("CommandLine.Tables.Title"),
        notes: game.i18n.localize("CommandLine.Tables.Usage.Note"),
        args : ["table", "modifier", "column"],
        defaultArg : "table",
        examples : game.i18n.localize("CommandLine.Tables.Usage.Example"),
        callback: (table, modifier, column) => WFRP_Tables.handleTableCommand(table, {modifier, column})
      },
      pay: {
        description: game.i18n.localize("CommandLine.Pay.Title"),
        notes: game.i18n.localize("CommandLine.Pay.Usage.Note"),
        args: ["amount", "for", "target"],
        defaultArg: "amount",
        examples : game.i18n.localize("CommandLine.Pay.Usage.Example"),
        callback: (amount, product, target) => PayMessageModel.handlePayCommand(amount, { target, product })
      },
      credit : {
        description : game.i18n.localize("CommandLine.Credit.Title"),
        args : ["amount", "mode", "split", "target", "reason"],
        defaultArg : "amount",
        examples : game.i18n.localize("CommandLine.Credit.Usage.Example"),
        notes : game.i18n.localize("CommandLine.Credit.Usage.Note"),
        callback : (amount, mode, split, target, reason) => CreditMessageModel.handleCreditCommand(amount, mode, {split, target, reason})
      },
      char: {
        description: game.i18n.localize("CommandLine.CharacterGeneration.Title"),
        notes: game.i18n.localize("CommandLine.CharacterGeneration.Usage.Note"),
        args: [],
        callback: () => CharGenWfrp4e.start()
      },
      cond : {
        description: game.i18n.localize("CommandLine.Conditions.Title"),
        notes: game.i18n.localize("CommandLine.Conditions.Usage.Note"),
        examples: game.i18n.localize("CommandLine.Conditions.Usage.Example"),
        args : ["condition"],
        defaultArg: "condition",
        callback: (condition) => {
                // Only one argument possible [1]: condition to lookup
                let conditionInput = condition.toLowerCase();
                // Don't require spelling, match the closest condition to the input
                let closest = WFRP_Utility.matchClosest( game.wfrp4e.config.conditions, conditionInput);
                if (! game.wfrp4e.config.conditionDescriptions) {
                  ui.notifications.error("ERROR.NoContentFound", {localize: true})
                  return false
                }
                let description =  game.wfrp4e.config.conditionDescriptions[closest];
                let name =  game.wfrp4e.config.conditions[closest];

                // Create message and return false to not display user input of `/cond`
                ChatMessage.create({content : `<p><strong>${name}</strong></p>${description}`});
        }
      },
      prop : {
        description: game.i18n.localize("COMMAND.ShowQualityOrFlaw"),
        args : ["property"],
        defaultArg : "property",
        callback : (property) => {
          let propertyInput = property;
          let allProperties = game.wfrp4e.utility.allProperties();
          let closest = WFRP_Utility.matchClosest( game.wfrp4e.utility.allProperties(), propertyInput);
    
          let description = game.wfrp4e.config.qualityDescriptions[closest] || game.wfrp4e.config.flawDescriptions[closest];
          let name =  allProperties[closest];
    
          ChatMessage.create({content : `<p><strong>${name}</strong></p>${description}`});
          
        }
      },
      name : {
        description : game.i18n.localize("CommandLine.NameGeneration.Title"),
        notes : game.i18n.localize("CommandLine.NameGeneration.Usage.Note"),
        examples : game.i18n.localize("CommandLine.NameGeneration.Usage.Example"),
        args : ["gender", "species"],
        defaultArg : "gender",
        callback : (gender, species) => {
          // Call generator class to create name, create message, return false to not display user input of `/name`
          let name = NameGenWfrp.generateName({ species, gender })
          ChatMessage.create(WFRP_Utility.chatDataSetup(name, "selfroll"))
        }
      },
      avail : {
        description : game.i18n.localize("CommandLine.AvailabilityTest.Title"),
        notes : game.i18n.localize("CommandLine.AvailabilityTest.Usage.Note"),
        examples : game.i18n.localize("CommandLine.AvailabilityTest.Usage.Example"),
        args : ["rarity", "size", "modifier"],
        defaultArg : "rarity",
        callback : (rarity, size, modifier) => {
    
          // Call generator class to start the test, create message, send to chat, return false to not display user input of `/avail`
          MarketWFRP4e.testForAvailability({ settlement : size, rarity, modifier });
        }
      },
      corruption : {
        description : game.i18n.localize("CommandLine.Corruption.Title"),
        notes : game.i18n.localize("CommandLine.Corruption.Usage.Note"),
        examples : game.i18n.localize("CommandLine.Corruption.Usage.Example"),
        args : ["strength", "skill", "source"],
        defaultArg : "strength",
        callback: (strength, skill, source) => {
          CorruptionMessageModel.handleCorruptionCommand(strength, skill, source)
        }
      },
      fear : {
        description : game.i18n.localize("CommandLine.Fear.Title"),
        notes : game.i18n.localize("CommandLine.Fear.Usage.Note"),
        examples : game.i18n.localize("CommandLine.Fear.Usage.Example"),
        args : ["rating", "source"],
        defaultArg : "rating",
        callback: (rating, source) => {
          PsychMessageModel.handleFearCommand(rating, source)
        }
      },
      terror : {
        description : game.i18n.localize("CommandLine.Terror.Title"),
        notes : game.i18n.localize("CommandLine.Terror.Usage.Note"),
        examples : game.i18n.localize("CommandLine.Terror.Usage.Example"),
        args : ["rating", "source"],
        defaultArg : "rating",
        callback: (rating, source) => {
          PsychMessageModel.handleTerrorCommand(rating, source)
        }
      },
      exp : {
        description : game.i18n.localize("CommandLine.Exp.Title"),
        notes : game.i18n.localize("CommandLine.Exp.Usage.Note"),
        examples : game.i18n.localize("CommandLine.Exp.Usage.Example"),
        args : ["amount", "reason"],
        defaultArg : "amount",
        callback: (amount, reason) => {
          XPMessageModel.handleXPCommand(amount, reason)
        }
      },
      travel : {
        description : game.i18n.localize("CommandLine.Travel.Title"),
        notes : game.i18n.localize("CommandLine.Travel.Usage.Note"),
        examples : game.i18n.localize("CommandLine.Travel.Usage.Example"),
        args : ["from", "to"],
        defaultArg : "from",
        callback: (from, to) => {
          TravelDistanceWFRP4e.displayTravelDistance(from, to)
        }
      },
      trade : {
        description : game.i18n.localize("COMMAND.PromptTradeDialog"),
        args : [],
        callback: () => {
          game.wfrp4e.trade.attemptBuy();
        }
      }
    })
  })
}