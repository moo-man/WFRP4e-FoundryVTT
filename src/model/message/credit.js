/** Creates and manages an Item posted to chat, retrievable by dragging and dropping from chat into an Actor sheet.
 *  If the item is physical, with quantity and price, it also tracks who has dragged and the amount it has been dragged
 *  If a "Post Quantity" is specified, then it can only be retrieved that many times before disallowing further dragging. 
 */
import MarketWFRP4e from "../../apps/market-wfrp4e";
import WFRP_Utility from "../../system/utility-wfrp4e";

  

export class CreditMessageModel extends WarhammerMessageModel {
  static defineSchema() 
  {
      let schema = {};

      // Pay string i.e. "5gc1ss12bp"
      schema.payString = new foundry.data.fields.StringField({});

      // What payment is for
      schema.reason = new foundry.data.fields.StringField()

      schema.splits = new foundry.data.fields.ArrayField(new foundry.data.fields.StringField({nullable : true}))

      return schema;
  }

  static handleCreditCommand(amount, mode="each", {split, reason, target}={})
  {
      //If the user isnt a GM, they pay
      if (!game.user.isGM) 
      {
          ui.notifications.error("MARKET.CreditCommandNotAllowed", {localize : true});
      } 
      else // If GM
      {
        if (target) // If targeted reward
        {
          let actor = game.actors.find(a => a.name.toLowerCase().includes(target.toLowerCase() ) )
          if ( actor ) 
          {
            let p = getActiveDocumentOwner(actor);
            if (actor.hasPlayerOwner && p ) 
            {
              target = p.name // In this case, replace the actor by the player name for chat card, as usual
            } 
            else 
            {
              MarketWFRP4e.directPayCommand(amount, actor); // No player/Not active -> substract money
              return false;
            }
          }
        }
        // Default choice, display chat card
        this.createCreditMessage(amount, mode, {split : Number(split) ,reason, player: target});
      }
      return false;
  }
  

  static createCreditMessage(amount, mode, {split=1, reason, target}={}, mergeChatData={})
  {
    let parsedMoney = MarketWFRP4e.parseMoneyTransactionString(amount);
    if (split <= 0)
    {
      split = 1;
    }

      //If the /pay command has a syntax error, we display an error message to the gm
    if (!parsedMoney) {
      let msg = `<p>${game.i18n.localize("MARKET.MoneyTransactionWrongCommand")}</p><p><i>${game.i18n.localize("MARKET.PayCommandExample")}</i></p>`;
      ChatMessage.create(WFRP_Utility.chatDataSetup(msg, "gmroll", false, { alias: game.i18n.localize("MARKET.CreditRequest") }));
      return
    } 

    if (mode == "each")
    {
      let nbActivePlayers = Array.from(game.users).filter(u => u.role != 4 && u.active).length;
      split = nbActivePlayers;
    }
    else if (split > 1)
    {
      parsedMoney = MarketWFRP4e.splitAmountBetweenAllPlayers(parsedMoney, split)
    }

    let messageData = {
        payString : MarketWFRP4e.amountToString(parsedMoney),
        splits : new Array(split).fill(""),
        reason
    }

      renderTemplate("systems/wfrp4e/templates/chat/market/market-credit.hbs", {
        gc: parsedMoney.gc,
        ss: parsedMoney.ss,
        bp: parsedMoney.bp,
        splits : messageData.splits
      }).then(html => {
        let chatData = WFRP_Utility.chatDataSetup(html, "roll", false, {forceWhisper: target, flavor : (reason && "For: " + reason), alias : game.i18n.localize("MARKET.CreditRequest")});
        foundry.utils.mergeObject(chatData, mergeChatData)
        chatData.type = "credit";
        chatData.system = messageData
        ChatMessage.create(chatData);
      });
  }

  async updateMessage(actor, index)
  {
    let splits = foundry.utils.deepClone(this.splits);
    // if (splits[index])
    // {
    //   return; // Don't update if index already has ID
    // }
    splits[index] = actor.uuid;

    this.parent.update({"system.splits" : splits});

    let templateData = MarketWFRP4e.parseMoneyTransactionString(this.payString);

    templateData.splits = (await Promise.all(splits.map(fromUuid))).map(i => i?.name);

    let content = await renderTemplate("systems/wfrp4e/templates/chat/market/market-credit.hbs", templateData)

    this.parent.update({content});
  }

  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      receive : this._onReceive,
    });
  }


  static async _onReceive(ev, target)
  {
      let actor;
      let index = Number(target.dataset.index);

      // If this reward has already been claimed, simply return
      // The message will be updated to remove the button, but if the user
      // presses quickly, it shouldn't reward more than once.
      if (this.parent.system.splits[index])
      {
        return;
      }

      if (!game.user.isGM) 
      {
        actor = game.user.character;
      } 
      else 
      {
        let target = targetsWithFallback()[0];
        if (target)
        {
          actor = target
        }
      }
      this.parent.system.splits[index] = actor.uuid;
      let money = MarketWFRP4e.creditCommand(this.payString, actor, {suppressMessage : true});
      actor.updateEmbeddedDocuments("Item", money, {updateCreditMessage : {id : this.parent.id, index}})
  }

}