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

    context.loreIcons = {
      [game.i18n.localize("WFRP4E.MagicLores.petty")] : "modules/wfrp4e-core/icons/spells/petty.png",
      [game.i18n.localize("WFRP4E.MagicLores.beasts")] : "modules/wfrp4e-core/icons/spells/beasts.png",
      [game.i18n.localize("WFRP4E.MagicLores.death")] : "modules/wfrp4e-core/icons/spells/death.png",
      [game.i18n.localize("WFRP4E.MagicLores.fire")] : "modules/wfrp4e-core/icons/spells/fire.png",
      [game.i18n.localize("WFRP4E.MagicLores.heavens")] : "modules/wfrp4e-core/icons/spells/heavens.png",
      [game.i18n.localize("WFRP4E.MagicLores.metal")] : "modules/wfrp4e-core/icons/spells/metal.png",
      [game.i18n.localize("WFRP4E.MagicLores.life")] : "modules/wfrp4e-core/icons/spells/life.png",
      [game.i18n.localize("WFRP4E.MagicLores.light")] : "modules/wfrp4e-core/icons/spells/light.png",
      [game.i18n.localize("WFRP4E.MagicLores.shadow")] : "modules/wfrp4e-core/icons/spells/shadow.png",
      [game.i18n.localize("WFRP4E.MagicLores.hedgecraft")] : "modules/wfrp4e-core/icons/spells/hedgecraft.png",
      [game.i18n.localize("WFRP4E.MagicLores.witchcraft")] : "modules/wfrp4e-core/icons/spells/witchcraft.png",
      [game.i18n.localize("WFRP4E.MagicLores.daemonology")] : "modules/wfrp4e-core/icons/spells/daemonology.png",
      [game.i18n.localize("WFRP4E.MagicLores.necromancy")] : "modules/wfrp4e-core/icons/spells/necromancy.png",
      [game.i18n.localize("WFRP4E.MagicLores.undivided")] : "modules/wfrp4e-core/icons/spells/undivided.png",
      [game.i18n.localize("WFRP4E.MagicLores.nurgle")] : "modules/wfrp4e-core/icons/spells/nurgle.png",
      [game.i18n.localize("WFRP4E.MagicLores.slaanesh")] : "modules/wfrp4e-core/icons/spells/slaanesh.png",
      [game.i18n.localize("WFRP4E.MagicLores.tzeentch")] : "modules/wfrp4e-core/icons/spells/tzeentch.png"
    }

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
