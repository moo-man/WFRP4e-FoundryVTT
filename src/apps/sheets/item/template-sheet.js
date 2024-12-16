import BaseWFRP4eItemSheet from "./base";

export default class TemplateSheet extends BaseWFRP4eItemSheet
{
  static type="template"

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
    context.traits = await this.document.system.traits.awaitDocuments();
    return context;
  }

  async  _onDropItem(data, ev)
  {
    let item = await Item.implementation.fromDropData(data);
    if (item.type == "skill")
    {
      this.document.update(this.document.system.skills.add({name : item.name}));
    }
    else if (item.type == "talent")
    {
        this.document.update(this.document.system.talents.add({name : item.name}));
    }
    else if (item.type == "trait")
    {
      this.document.update(this.document.system.traits.add(item));
    }
  }

  static async _onOpenSheet(event)
  {
    let index = this._getIndex(event);
    let document = await this.document.system.traits.list[index].document;
    document.sheet.render(true, {editable : false});
  }

  static async _onEditDiff(event)
  {
      let index = this._getIndex(event);
      let doc = this.document.system.traits.list[index];
      let diffedDocument = await doc.document;
      let update ={};
      update.diff = await WarhammerDiffEditor.wait(doc.diff, {document : diffedDocument.originalDocument});
      
      if (update.diff.name)
      {
          update.name = update.diff.name;
      }
      else 
      {
          update.name = diffedDocument.originalDocument.name;
      }
      this.document.update(this.document.system.traits.edit(index, update));
  }
}
