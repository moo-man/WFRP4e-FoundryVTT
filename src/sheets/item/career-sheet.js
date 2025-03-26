import BaseWFRP4eItemSheet from "./base";

export default class CareerSheet extends BaseWFRP4eItemSheet
{
  static type="career"

  static DEFAULT_OPTIONS = {
    classes: [this.type]
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
    context.physical = this.item.system.tags.has("physical");
    return context;
  }


  _focus = null;

  _addEventListeners()
  {
    super._addEventListeners();
    this.element.querySelectorAll(".skill,.talent,.trapping").forEach(e => {
      e.style.width = e.value.length + 2 + "ch"
    })

    this.element.querySelectorAll(".empty").forEach(e => {
      e.addEventListener("keydown", e => {
      if (e.key === "Tab")
      {
        let parent = this._getParent(e.target, ".form-group");
        this.focus = parent.dataset.group;
      }
      else 
      {
        this.focus = null;
      }
    })})

    if (this.focus)
    {
      this.element.querySelector(`.${this.focus} .empty`)?.focus();
    }
  }

}
