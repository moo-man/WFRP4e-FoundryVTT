/** Creates and manages an Item posted to chat, retrievable by dragging and dropping from chat into an Actor sheet.
 *  If the item is physical, with quantity and price, it also tracks who has dragged and the amount it has been dragged
 *  If a "Post Quantity" is specified, then it can only be retrieved that many times before disallowing further dragging. 
 */
import MarketWFRP4e from "../../apps/market-wfrp4e";
import WFRP_Utility from "../../system/utility-wfrp4e";

  

export class PayMessageModel extends WarhammerMessageModel {
  static defineSchema() 
  {
      let schema = {};

      // Pay string i.e. "5gc1ss12bp"
      schema.payString = new foundry.data.fields.StringField({});

      // What payment is for
      schema.product = new foundry.data.fields.StringField()

      // Targeted Player
      schema.player = new foundry.data.fields.StringField()

      // Track who has retrieved this item from chat
      schema.paidBy = new foundry.data.fields.ArrayField(new foundry.data.fields.StringField())
      return schema;
  }

  static handlePayCommand(amount, {target, product}={})
  {
      //If the user isnt a GM, they pay
      if (!game.user.isGM) 
        {
        let actor = game.user.character;
        let money = MarketWFRP4e.payCommand(amount, actor);
        if (money)
          actor.updateEmbeddedDocuments("Item", money);
      } 
      else // If GM
      {
        if ( target) // If targeted pay
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
        this.createPayMessage(amount, {product, player: target});
      }
      return false;
  }
  

  static createPayMessage(amount, {product, player}={}, mergeChatData={})
  {
    let parsedPayRequest = MarketWFRP4e.parseMoneyTransactionString(amount);

    //If the /pay command has a syntax error, we display an error message to the gm
    if (!parsedPayRequest) {
      let msg = `<h3><b>${game.i18n.localize("MARKET.PayRequest")}</b></h3>`;
      msg += `<p>${game.i18n.localize("MARKET.MoneyTransactionWrongCommand")}</p><p><i>${game.i18n.localize("MARKET.PayCommandExample")}</i></p>`;
      ChatMessage.create(WFRP_Utility.chatDataSetup(msg, "gmroll"));
    } 
    else //generate a card with a summary and a pay button
    {
      let cardData = {
        product,
        QtGC: parsedPayRequest.gc,
        QtSS: parsedPayRequest.ss,
        QtBP: parsedPayRequest.bp
      };
      renderTemplate("systems/wfrp4e/templates/chat/market/market-pay.hbs", cardData).then(html => {
        let chatData = WFRP_Utility.chatDataSetup(html, "roll", false, {forceWhisper: player, flavor : (product && "For: " + product), alias : game.i18n.localize("MARKET.PayRequest")});
        foundry.utils.mergeObject(chatData, mergeChatData)
        chatData.type = "pay";
        chatData.system = {payString : amount, player, product}
        ChatMessage.create(chatData);
      });
    }
  }

  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      pay : this._onPay,
    });
  }


  static async _onPay(ev, target)
  {
      if (!game.user.isGM) 
      {
        MarketWFRP4e.handlePlayerPayment({msg : this.parent, payString : this.payString})
      } 
      else 
      {
        for(let actor of targetsWithFallback())
        {
          MarketWFRP4e.handlePlayerPayment({msg : this.parent, payString: this.payString, target : actor})
        }
      }
  }

}