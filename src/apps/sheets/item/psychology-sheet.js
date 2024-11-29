import BaseWFRP4eItemSheet from "./base";

export default class PsychologySheet extends BaseWFRP4eItemSheet
{
  static type="injury"

  static DEFAULT_OPTIONS = {
    classes: [this.type],
  }

  static TABS = {
    description: {
      id: "description",
      group: "primary",
      label: "Description",
    },
    effects: {
      id: "effects",
      group: "primary",
      label: "Effects",
    }
  }
  
  static PARTS = {
    header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/item/item-header.hbs', classes: ["sheet-header"] },
    tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/item-tabs.hbs' },
    description: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-description.hbs' },
    effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-effects.hbs' },
  }
}
