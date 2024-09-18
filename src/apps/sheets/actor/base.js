import MarketWFRP4e from "../../../../modules/apps/market-wfrp4e";
import ActiveEffectWFRP4e from "../../../../modules/system/effect-wfrp4e";

export default class BaseWFRP4eActorSheet extends WarhammerActorSheetV2
{

  static DEFAULT_OPTIONS = {
    classes: ["wfrp4e"],
    actions : {
      rollTest : this._onRollTest,
      toggleSummary : this._toggleSummary,
      openContextMenu : this._onContextMenu,
      toggleExtendedTests : this._toggleExtendedTests
    },
    defaultTab : "main"
  }

  _prepareTabs(options) {
    let tabs = super._prepareTabs(options);

    if (!this.actor.hasSpells) {
      delete tabs.magic;
    }

    if (!this.actor.hasPrayers) {
      delete tabs.religion;
    }

    return tabs;
  }

  _setupContextMenus()
  {
      return  [ContextMenu.create(this, this.element, ".list-row", this._getListContextOptions()), ContextMenu.create(this, this.element, ".context-menu", this._getListContextOptions(), {eventName : "click"})]
  }

  _getListContextOptions()
  { 
    return [
      {
        name: "Edit",
        icon: '<i class="fas fa-edit"></i>',
        condition: li => !!li.data("uuid") || li.hasClass("context-menu"),
        callback: async li => {
          const document = await fromUuid(li.data("uuid"));
          document.sheet.render(true);
        }
      },
      {
        name: "Remove",
        icon: '<i class="fas fa-times"></i>',
        condition: li => !!li.data("uuid") || li.hasClass("context-menu"),
        callback: li => fromUuid(li.data("uuid")).then(doc => doc.delete())
      },
    ];
  }


  // From Income results - drag money value over to add
  _onDropIncome(data)
  {
    this.document.updateEmbeddedDocuments("Item", MarketWFRP4e.addMoneyTo(this.document, data.amount));
  }

  //#region Effects

  _prepareEffectsContext(context) {
    super._prepareEffectsContext(context);
    
    context.effects.passive = this._consolidateEffects(context.effects.passive)
    context.effects.temporary = this._consolidateEffects(context.effects.temporary)
    context.effects.disabled = this._consolidateEffects(context.effects.disabled)
  }


  _getConditionData(context) {
    try {
      let conditions = foundry.utils.duplicate(game.wfrp4e.config.statusEffects).map(e => new ActiveEffectWFRP4e(e));
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

  _consolidateEffects(effects) {
    let consolidated = []
    for (let effect of effects) {
      let existing = consolidated.find(e => e.name == effect.name)
      if (!existing)
        consolidated.push(effect)
    }
    for (let effect of consolidated) {
      let count = effects.filter(e => e.name == effect.name).length
      effect.count = count
    }
    return consolidated
  }

  //#endregion


  async _handleEnrichment() {
    let enrichment = {}
    enrichment["system.details.biography.value"] = await TextEditor.enrichHTML(this.actor.system.details.biography.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })
    enrichment["system.details.gmnotes.value"] = await TextEditor.enrichHTML(this.actor.system.details.gmnotes.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })

    return expandObject(enrichment)
  }

  static async _onCreateEffect(ev)
    {
        let type = ev.currentTarget.dataset.category;
        let effectData = { name: localize("WH.NewEffect"), img: "icons/svg/aura.svg" };
        if (type == "temporary")
        {
            effectData["duration.rounds"] = 1;
        }
        else if (type == "disabled")
        {
            effectData.disabled = true;
        }

        // If Item effect, use item name for effect name
        if (this.object.documentName == "Item")
        {
            effectData.name = this.object.name;
            effectData.img = this.object.img;
        }
        this.object.createEmbeddedDocuments("ActiveEffect", [effectData]).then(effects => effects[0].sheet.render(true));
    }

    static async _onRollTest(ev)
    {
      let test;
      let document = await this._getDocumentAsync(ev);
      switch (ev.target.dataset.type)
      {
        case "characteristic": 
          test = await this.document.setupCharacteristic(ev.target.dataset.characteristic)
          break;
        case "skill":
          test = await this.document.setupSkill(document.name)
          break;
        case "extendedTest":
          test = await this.document.setupExtendedTest(document);
          break;
      }

      test?.roll();
    }

    static async _onContextMenu(ev)
    {
    }

    static async _toggleExtendedTests(ev)
    {
      let parent = this._getParent(ev.target, ".tab")
      Array.from(parent.querySelectorAll(".extended-tests, .skill-lists, .extended-toggle")).forEach(el => el.classList.toggle("hidden"))
    }

    static async _toggleSummary(ev)
    {
      let item = await this._getDocumentAsync(ev);
      if (item)
      {
        let expandData = await item.system.expandData({secrets: this.actor.isOwner});
        this._toggleDropdown(ev, expandData.description.value);
      }
    }

    async _toggleDropdown(ev, content)
    {
      let dropdownElement = this._getParent(ev.target, ".list-row").querySelector(".dropdown-content");
      if (dropdownElement.classList.contains("collapsed"))
      {
        dropdownElement.innerHTML = content;
        dropdownElement.style.height = `${dropdownElement.scrollHeight}px`;
        dropdownElement.classList.replace("collapsed", "expanded");
      }
      else if (dropdownElement.classList.contains("expanded"))
      {
        dropdownElement.style.height = `0px`;
        dropdownElement.classList.replace("expanded", "collapsed");
      }
    }
}
