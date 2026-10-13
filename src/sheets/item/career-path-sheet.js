import BaseWFRP4eItemSheet from "./base";

export default class CareerPathSheet extends BaseWFRP4eItemSheet
{
  static type="careerPath"

  static DEFAULT_OPTIONS = {
    classes: [this.type],
    actions : {
      copySkills : this._onCopySkills,
      addTier: this._onAddTier,
      createFromItems: this._onCreateFromItems,
      createCareerItems: this._onCreateCareerItems
    },
    window: {
      controls : [
        {
          icon : 'fa-solid fa-arrows-to-circle',
          label : "Create from Career Items",
          action : "createFromItems"
        },
        {
          icon : 'fa-solid fa-split',
          label : "Create Career Items",
          action : "createCareerItems"
        }
      ]
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

  static async _onCreateFromItems(ev, target)
  {
    let tier = await DragDialog.create({text: "Provide a Career Item (any tier) to create a Career Path from all available tiers.", title: "Career Path Converter", filter: (item) => item.type == "career", onError: "Must provide a Career Item"});
    if (tier)
    {
      try {

        let pathData = await this.document.system.fromTierItem(tier);
        
        this.document.update(pathData, {recursive: false});
        ui.notifications.success(pathData.name + " created!");
      }
      catch(e)
      {
        ui.notifications.error(e);
      }
    }
  }

  static async _onCreateCareerItems(ev, target)
  {
    if (await foundry.applications.api.Dialog.confirm({content: "This will create a Career Item for each tier of the Career within the world. Continue?"}))
    {
      try {
        let itemData = await this.document.system.toTierItems();
        Item.implementation.create(itemData);
        ui.notifications.success(itemData.map(i => i.name).join(", ") + " created!");
      }
      catch(e)
      {
        ui.notifications.error(e);
      }
    }
  }


}
