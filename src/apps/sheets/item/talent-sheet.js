import ItemSheetWfrp4e from "../../../../modules/item/item-sheet";

export default class TalentSheet extends ItemSheetWfrp4e
{
  static DEFAULT_OPTIONS = {
    classes: ["talent"],
  }

  static PARTS = {
    header : {scrollable: [""], template : '', classes: ["sheet-header"] },
    tabs: { scrollable: [""], template: '' },
    description: { scrollable: [""], template: '' },
    details: { scrollable: [""], template: '' },
  }
}
