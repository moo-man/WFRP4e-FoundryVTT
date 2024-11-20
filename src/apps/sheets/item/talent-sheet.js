import ItemSheetWfrp4e from "../../../../modules/item/item-sheet";

export default class TalentSheet extends ItemSheetWfrp4e
{
  static DEFAULT_OPTIONS = {
    classes: ["talent"],
  }

  static PARTS = {
    header : {scrollable: [""], template : 'systems/wfrp4e/templates/sheets/item/item-header.hbs', classes: ["sheet-header"] },
    tabs: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/item-tabs.hbs' },
    description: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-description.hbs' },
    details: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-details.hbs' },
    effects: { scrollable: [""], template: 'systems/wfrp4e/templates/sheets/item/tabs/item-effects.hbs' },
  }
}
