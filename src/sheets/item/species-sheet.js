import BaseWFRP4eItemSheet from "./base";

export default class SpeciesSheet extends BaseWFRP4eItemSheet
{
  static type="species"

  static DEFAULT_OPTIONS = {
    classes: [this.type],
    actions : {
      editDiff: this._onEditDiff,
      openSheet : this._onOpenSheet
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
    context.subspeciesOf = await this.document.system.subspeciesOf.document;
    return context;
  }

  async  _onDropItem(data, ev)
  {
    let item = await Item.implementation.fromDropData(data);
    if (item.type == "skill")
    {
      this.document.update(this.document.system.skills.add(item.name));
    }
    else if (item.type == "species")
    {
      this.document.update(this.document.system.subspeciesOf.set(item));
    }
  }

  async  _onDropRollTable(data, ev)
  {
    let table = await RollTable.implementation.fromDropData(data);
    let path = this._getPath(ev);
    let tableReference = foundry.utils.getProperty(this.document, path);
    this.document.update(tableReference.set(table));
  }
}
