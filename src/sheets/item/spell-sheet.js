import BaseWFRP4eItemSheet from "./base";

export default class SpellSheet extends BaseWFRP4eItemSheet
{
  static type="spell"

  static DEFAULT_OPTIONS = {
    classes: [this.type],
  }
  
  static PARTS = {
    header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/item/item-header.hbs', classes: ["sheet-header"] },
    tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/item-tabs.hbs' },
    description: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-description.hbs' },
    details: { scrollable: [""], template: `systems/wfrp4e/templates/sheets/item/types/${this.type}.hbs` },
    effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-effects.hbs' },
  }

  async _prepareContext(options)
  {
    let context = await super._prepareContext(options);
      if (game.wfrp4e.config.magicLores[this.item.lore.value]) 
      {
        context.loreValue = game.wfrp4e.config.magicLores[this.item.lore.value]
      }
      else 
      {
        context.loreValue = this.item.lore.value;
      }
    return context;
  }

}