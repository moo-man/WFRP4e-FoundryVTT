import ItemProperties     from "../../apps/item-properties";
import GenericActions     from "../../system/actions.js";
import ActiveEffectWFRP4e from "../../system/effect-wfrp4e";

export default class BaseWFRP4eItemSheet extends WarhammerItemSheetV2
{

  static type=""

  static hasConditionEffects = false

  static DEFAULT_OPTIONS = {
    classes: ["wfrp4e"],
    defaultTab : "description",
    position : {
      width: 500,
      height: 700,
    },
    window : {
      controls : [
        {
          icon : 'fa-solid fa-comment',
          label : "Post to Chat",
          action : "postToChat"
        },
      ]
    },
    actions : {
      postToChat : function() {this.item.postItem()},
      configureProperties : this._onConfigureProperties,
      clickCondition : {buttons : [0, 2], handler : this._onClickCondition}
    }
  }
 
  async _prepareContext(options)
  {
    let context = await super._prepareContext(options);
    context.physical = this.item.system.tags.has("physical");
    context.hide = {
      quantity : false,
      encumbrance : false,
      price : false,
      availability : false,
      category : true
    }
    return context;
  }

  async _onFirstRender(context, options)
  {
      await super._onFirstRender(context, options);

      this.setTheme();
  }

  setTheme(theme = game.settings.get("wfrp4e", "theme"))
  {
    if (!theme.item.enabled)
    {
      this.element.classList.add("no-theme");
      this.element.classList.remove("classic-font");
    }
    else 
    {
      this.element.classList.remove("no-theme");

      if (theme.item.font == "classic")
      {
        this.element.classList.add("classic-font");
      }
      else
      {
        this.element.classList.remove("classic-font");
      }
    }
  }

  static TABS = {
    description: {
      id: "description",
      group: "primary",
      label: "Description",
    },
    details: {
      id: "details",
      group: "primary",
      label: "Details",
    },
    effects: {
      id: "effects",
      group: "primary",
      label: "Effects",
    }
  }

  //#region Effects


  _getConditionData() {
    try {
      let conditions = foundry.utils.duplicate(game.wfrp4e.config.statusEffects).filter(i => !["fear", "grappling", "engaged"].includes(i.id)).map(e => new ActiveEffectWFRP4e(e));
      let currentConditions = this.item.effects.filter(e => e.isCondition);
      delete conditions.splice(conditions.length - 1, 1)

      for (let condition of conditions) {
        let owned = currentConditions.find(e => e.conditionId == condition.conditionId)
        if (owned) {
          condition.existing = true
          condition.system.condition.value = owned.conditionValue;
        }
        else if (condition.isNumberedCondition) {
          condition.system.condition.value = 0
        }
      }
      return conditions;
    }
    catch (e)
    {
      ui.notifications.error("Error Adding Condition Data: " + e);
    }
  }

  _prepareEffectsContext(context) 
  {
      super._prepareEffectsContext(context);
      if (this.constructor.hasConditionEffects)
      {
        context.effects.conditions = this._getConditionData()
      }
      return context;
  }

  //#endregion

  _getContextMenuOptions()
  { 
    let getParent = this._getParent.bind(this);
    return [
      {
        name: "Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          document.sheet.render(true);
        }
      },
      {
        name: "Remove",
        icon: '<i class="fas fa-times"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => 
        {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          document.delete();
        }
      },
      {
        name: "Duplicate",
        icon: '<i class="fa-solid fa-copy"></i>',
        condition: li => !!li.dataset.uuid || getParent(li, "[data-uuid]"),
        callback: async li => 
        {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            const document = await fromUuid(uuid);
            this.actor.createEmbeddedDocuments("ActiveEffect", [document.toObject()]);
        }
      },
    ];
  }

  async _handleEnrichment() {
    let enrichment = {}
    enrichment["system.description.value"] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.item.system.description.value, { async: true, secrets: this.item.isOwner, relativeTo: this.item })
    enrichment["system.gmdescription.value"] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.item.system.gmdescription.value, { async: true, secrets: this.item.isOwner, relativeTo: this.item })

    return expandObject(enrichment)
  }


  //#region Action Handlers

  static _onConfigureProperties()
  {
    new ItemProperties(this.document).render(true)
  }

  
  static _onClickCondition(ev) {
    let conditionKey = this._getParent(ev.target, ".condition")?.dataset.key
    let existing = this.item.hasCondition(conditionKey)
    
    if (!existing?.isNumberedCondition && ev.button == 0)
    {
      this.item.removeCondition(conditionKey);
    }
    
    ev.button == 0 ? this.item.addCondition(conditionKey) : this.item.removeCondition(conditionKey) 
  }

    //#endregion
  /** @inheritDoc */
  _attachFrameListeners() {
    super._attachFrameListeners();
    GenericActions.addEventListeners(this.element, this);
  }

}
