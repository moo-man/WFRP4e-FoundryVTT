import ActorSettings from "../../../../modules/apps/actor-settings";
import MarketWFRP4e from "../../../../modules/apps/market-wfrp4e";
import ActiveEffectWFRP4e from "../../../../modules/system/effect-wfrp4e";
import WFRP_Utility from "../../../../modules/system/utility-wfrp4e";

export default class WFRP4eItemSheet extends WarhammerItemSheetV2
{

  static DEFAULT_OPTIONS = {
    classes: ["wfrp4e"],
    actions : {},
    defaultTab : "decription",
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
      postToChat : () => this.item.postItem(),
    }
  }


 
  async _prepareContext(options)
  {
    let context = await super._prepareContext(options);
    return context;
  }

  //#region Effects


  _getConditionData(context) {
    try {
      let conditions = foundry.utils.duplicate(game.wfrp4e.config.statusEffects).filter(i => !["fear", "grappling", "engaged"].includes(i.id)).map(e => new ActiveEffectWFRP4e(e));
      let currentConditions = this.actor.effects.filter(e => e.isCondition);
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

  //#endregion

  _addEventListeners()
  {
    super._addEventListeners();
  }

  
  _getListContextOptions()
  { 
    return [
      {
        name: "Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => !!li.data("uuid") || !!li.parents("[data-uuid]"),
        callback: async li => {
          let uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
          const document = await fromUuid(uuid);
          document.sheet.render(true);
        }
      },
      {
        name: "Remove",
        icon: '<i class="fas fa-times"></i>',
        condition: li => !!li.data("uuid") || !!li.parents("[data-uuid]"),
        callback: async li => 
        {
          let uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
          const document = await fromUuid(uuid);
          document.delete();
        }
      },
      {
        name: "Duplicate",
        icon: '<i class="fa-solid fa-copy"></i>',
        condition: li => !!li.data("uuid") || !!li.parents("[data-uuid]"),
        callback: async li => 
        {
            let uuid = li.data("uuid") || li.parents("[data-uuid]").data("uuid");
            const document = await fromUuid(uuid);
            this.actor.createEmbeddedDocuments("ActiveEffect", [document.toObject()]);
        }
      },
    ];
  }

  async _handleEnrichment() {
    let enrichment = {}
    enrichment["system.description.value"] = await TextEditor.enrichHTML(this.item.system.description.value, { async: true, secrets: this.item.isOwner, relativeTo: this.item })
    enrichment["system.gmdescription.gmnotes.value"] = await TextEditor.enrichHTML(this.item.system.gmdescription.value, { async: true, secrets: this.item.isOwner, relativeTo: this.item })

    return expandObject(enrichment)
  }


  //#region Action Handlers



    //#endregion
}
