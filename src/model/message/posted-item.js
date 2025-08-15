/** Creates and manages an Item posted to chat, retrievable by dragging and dropping from chat into an Actor sheet.
 *  If the item is physical, with quantity and price, it also tracks who has dragged and the amount it has been dragged
 *  If a "Post Quantity" is specified, then it can only be retrieved that many times before disallowing further dragging.
 */
import WFRP_Utility from "../../system/utility-wfrp4e.js";

export class PostedItemMessageModel extends WarhammerMessageModel {
  static defineSchema() 
  {
      let schema = {};

      // Data used to display and create the Item on Actors
      schema.itemData = new foundry.data.fields.ObjectField();

      // How many times this item can be dragged from chat
      schema.postQuantity = new foundry.data.fields.NumberField({nullable : true});

      // Keep track of the original item data, currently only used for knowing what 10% of the base price is for haggling
      schema.originalItemData = new foundry.data.fields.ObjectField();

      // Track who has retrieved this item from chat
      schema.retrievedBy = new foundry.data.fields.ArrayField(new foundry.data.fields.StringField())
      return schema;
  }
  
  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      haggle : this._onHaggle,
      rollAvailability : this._onRollAvailability,
      pay : this._onPay,
      postItemProperty: this._postItemProperty
    });
  }

  /**
   * Make the message draggable and listen for drags
   * 
   * @param {HTMLElement} html HTML of the message
   */
  async onRender(html) {

    let post = html.querySelector(".post-item");
    post.draggable = true;

    post.addEventListener('dragstart', this._onDragItem.bind(this));
  }

  /**
   * When a Physical Item is retrieved from chat, decrease Post Quantity
   * and record who it was retrieved by 
   * 
   * @param {String} name Name of Actor who retrieved the Item
   */
  async decrementQuantity(name)  
  {
    if (this.postQuantity > 0)
    {
      let retrievedBy = this.retrievedBy.concat(name);
      let content = await this.constructor._renderHTMLFromItemData(this.itemData, this.postQuantity - 1, retrievedBy);
      this.parent.update({content, system : {postQuantity : this.postQuantity - 1, retrievedBy}});
    }
  }

  /**
   * Set the dataTransfer to the Item data, also record the message ID to know where they dragged it from
   * 
   * @param {DragEvent} ev The event triggering this listener
   * @returns 
   */
  async _onDragItem(ev)
  {
    let transfer = ev.dataTransfer.setData("text/plain", JSON.stringify({type : "Item", data : this.itemData, options: {fromMessage : this.parent.id}}));
    return transfer;
  }

  /**
   * Pays for the Item and adds it to the inventory
   * 
   * @param {Event} ev Click event 
   * @param {HTMLElement} target Button/element clicked
   */
  static async _onPay(ev, target)
  {
    
    let paid = await game.wfrp4e.market.handlePlayerPayment({payString : game.wfrp4e.market.amountToString(this.itemData.system.price), itemData : this.itemData});
    for(let actor of paid)
    {
      await actor.createEmbeddedDocuments("Item", [this.itemData], {fromMessage: this.parent.id})
      ui.notifications.notify(game.i18n.format("MARKET.ItemAdded", { item: this.itemData.name, actor : actor.name })) 
    }
  }

  /**
   * Calls the Market class to roll availability 
   * 
   * @param {Event} ev Click event 
   * @param {HTMLElement} target Button/element clicked
   */
  static async _onRollAvailability(ev, target)
  {
    await game.wfrp4e.market.generateSettlementChoice(this.itemData.system.availability.value, this.itemData.name);
  }

  /**
   * Increases or decreases the price of the item by 10%
   * Uses the original item price to find the haggle difference
   * Convert to BP, add/subrtact 10%, consolidate, rerender
   * 
   * @param {Event} ev Click event 
   * @param {HTMLElement} target Button/element clicked
   */
  static async _onHaggle(ev, target)
  {
    let multiplier = target.dataset.type == "up" ? 1 : -1;
    let currentPrice = foundry.utils.deepClone(this.itemData.system.price);
    let originalPrice = foundry.utils.deepClone(this.originalItemData.system.price);

    let originalBP = originalPrice.gc * 240 + originalPrice.ss * 12 + originalPrice.bp
    let currentBP = currentPrice.gc * 240 + currentPrice.ss * 12 + currentPrice.bp
    let haggledBP = currentBP + (Math.round((originalBP * .1)) * multiplier);

    let haggledPrice = game.wfrp4e.market.makeSomeChange(haggledBP, 0);

    let itemData = foundry.utils.deepClone(this.itemData);
    itemData.system.price = haggledPrice;

    let content = await this.constructor._renderHTMLFromItemData(itemData, this.postQuantity, this.retrievedBy);
    this.parent.update({content, "system.itemData" : itemData});
  }

  /**
   * Creates a PostedItem Message 
   * 
   * @param {ItemWFRP4e} item Item posted to chat
   * @param {number} quantity How many times the posted item can be dragged from chat
   * @param {*} mergeData 
   */
  static async create(item, quantity, mergeData = {}) 
  {
    if (quantity == undefined && (item.system.isPhysical))
    {
      quantity = await ValueDialog.create({title : game.i18n.localize("DIALOG.PostQuantity"), text : game.i18n.localize("DIALOG.PostQuantityContent")}) || undefined
    }
    
    let itemData = foundry.utils.mergeObject(item.toObject(), mergeData);
    let content = await this._renderHTMLFromItemData(item, quantity);
    ChatMessage.create(ChatMessage.applyRollMode({
      type : "item",
      content,
      system : {itemData, originalItemData : itemData, postQuantity : quantity}
    }, game.settings.get("core", "rollMode")))

  }


  /**
   * Takes item data and contextual data to create HTML content for the Posted Item message
   * 
   * @param {Object} itemData Raw Item Data used for rendering
   * @param {Number} postQuantity Display the Post quantity, if available
   * @param {Array<string>} retrievedBy Show who's retrieved the item
   * @returns 
   */
  static async _renderHTMLFromItemData(itemData, postQuantity, retrievedBy=[])
  {
    let messageData = {
      item : itemData,
      img : itemData.img,
      properties : new Item.implementation(itemData).system.chatData(),
      postQuantity,
      retrievedBy : retrievedBy.join(", ")
    };

    if (messageData.img.includes("/blank.png"))
    {
      messageData.img = null;
    }


    return await foundry.applications.handlebars.renderTemplate('systems/wfrp4e/templates/chat/post-item.hbs', messageData);

  }

  static _postItemProperty(ev)
  {
    WFRP_Utility.postProperty(ev.target.text)
  }

}