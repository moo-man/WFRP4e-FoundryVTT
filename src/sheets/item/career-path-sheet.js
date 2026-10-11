import BaseWFRP4eItemSheet from "./base";

export default class CareerPathSheet extends BaseWFRP4eItemSheet
{
  static type="careerPath"

  static DEFAULT_OPTIONS = {
    classes: [this.type],
    actions : {
      copySkills : this._onCopySkills,
      addTier: this._onAddTier
    }
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
    context.tiers = Object.values(this.document.system.tiers).sort((a, b) => a.level > b.level ? 1 : -1);
    return context;
  }



  _addEventListeners()
  {
    super._addEventListeners();

  }

  static _onCopySkills(ev, target)
  {
    navigator.clipboard.writeText(this.item.system.skills.join(", "));
    ui.notifications.info("Copied skills to clipboard")
  }

  static _onAddTier(ev, target)
  {
    this.item.update(this.item.system.addTier())
  }

}
