import BaseWFRP4eItemSheet from "./base";

export default class DiseaseSheet extends BaseWFRP4eItemSheet
{
  static type="disease"
  static hasConditionEffects = true;

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
    context.units = {"minutes" : game.i18n.localize("Minutes"), "hours" : game.i18n.localize("Hours"), "days": game.i18n.localize("Days")}
    return context;
  }
}