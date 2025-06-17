import GenericActions from "../../system/actions.js";
import WFRP_Utility   from "../../system/utility-wfrp4e";
import ActorSettings  from "../../apps/actor-settings";
import MarketWFRP4e   from "../../apps/market-wfrp4e";

export default class BaseWFRP4eActorSheet extends WarhammerActorSheetV2
{

  static DEFAULT_OPTIONS = {
    classes: ["wfrp4e"],
    window : {
      controls : [
        {
          icon : 'fa-solid fa-gear',
          label : "Actor Settings",
          action : "configureActor"
        }
      ]
    },
    actions : {
      rollTest : this._onRollTest,
      toggleSummary : this._toggleSummary,
      toggleSummaryAlt : {buttons: [2], handler : this._toggleSummary}, // TODO secondary actions
      toggleExtendedTests : this._toggleExtendedTests,
      removeAttacker : this._onRemoveAttacker,
      itemPropertyDropdown : this._onItemPropertyDropdown,
      combatDropdown : this._onCombatDropdown,
      clickCondition : {buttons : [0, 2], handler : this._onClickCondition},
      removeFromContainer : this._onRemoveItemFromContainer,
      convertCurrency : this._onConvertCurrency,
      consolidateCurrency : this._onConsolidateCurrency,
      collapseSection : this._onCollapseSection,
      containerSort : this._onContainerSort,
      createItem : this._onCreateItem,
      configureActor : this._onConfigureActor,
      useAspect : this._onUseAspect,
      toggleQuality : this._onToggleQuality,
      groupActions : this._onToggleGroupActions,
      useGroupAction : this._onUseGroupAction
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

  
  async _onFirstRender(context, options)
  {
      await super._onFirstRender(context, options);

      this.setTheme();
  }

  setTheme(theme = game.settings.get("wfrp4e", "theme"))
  {
    if (!theme.actor.enabled)
    {
      this.element.classList.add("no-theme");
      this.element.classList.remove("classic-font");
    }
    else 
    {
      this.element.classList.remove("no-theme");

      if (theme.actor.font == "classic")
      {
        this.element.classList.add("classic-font");
      }
      else
      {
        this.element.classList.remove("classic-font");
      }
    }
  }


  async _prepareContext(options)
  {
    let context = await super._prepareContext(options);
    context.items = foundry.utils.deepClone(this.actor.itemTags);
    let aspects = {
      talents : {}, 
      effects : {}, 
      combat : {},
      magic: {}
    }
    this.actor.itemTags.aspect?.forEach(item => {
        if (aspects[item.system.placement][item.system.pluralLabel])
        {
          aspects[item.system.placement][item.system.pluralLabel].push(item);
        }
        else 
        {
          aspects[item.system.placement][item.system.pluralLabel] = [item];
        }
    })
    if (context.system.status?.armour)
    {
      this.formatArmourSection(context);
    }
    context.items.aspect = aspects
    context.showExtendedTests = this.showExtendedTests;
    return context;
  }

    //#region Trappings
    prepareInventory() {

      let collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")
      // Inventory object is for the Trappings tab - each sub object is for an individual inventory section
      const categories = {
        weapons: {
          label: game.i18n.localize("WFRP4E.TrappingType.Weapon"), // Label - what is displayed in the inventory section header
          items: this.actor.itemTags["weapon"], // Array of items in the sectio.filter(i => !i.system.location.value)n
          toggle: true,                                 // Is there a toggle in the section? (Equipped, worn, etc.)
          toggleName: game.i18n.localize("Equipped"),   // What is the name of the toggle in the header
          show: false,                                  // Should this section be shown (if an item exists in this list, it is set to true)
          collapsed: collapsed?.weapons,
          dataType: "weapon"                            // What type of FVTT Item is in this section (used by the + button to add an item of this type)
        },
        armor: {
          label: game.i18n.localize("WFRP4E.TrappingType.Armour"),
          items: this.actor.itemTags["armour"],
          toggle: true,
          toggleName: game.i18n.localize("Worn"),
          show: false,
          collapsed: collapsed?.armor,
          dataType: "armour"
        },
        ammunition: {
          label: game.i18n.localize("WFRP4E.TrappingType.Ammunition"),
          items: this.actor.itemTags["ammunition"],
          show: false,
          collapsed: collapsed?.ammunition,
          dataType: "ammunition"
        },
        clothingAccessories: {
          label: game.i18n.localize("WFRP4E.TrappingType.ClothingAccessories"),
          items: this.actor.itemTags["trapping"].filter(i => i.system.trappingType.value == "clothingAccessories"),
          toggle: true,
          toggleName: game.i18n.localize("Worn"),
          show: false,
          collapsed: collapsed?.clothingAccessories,
          dataType: "trapping"
        },
        booksAndDocuments: {
          label: game.i18n.localize("WFRP4E.TrappingType.BooksDocuments"),
          items: this.actor.itemTags["trapping"].filter(i => i.system.trappingType.value == "booksAndDocuments"),
          show: false,
          collapsed: collapsed?.booksAndDocuments,
          dataType: "trapping"
        },
        toolsAndKits: {
          label: game.i18n.localize("WFRP4E.TrappingType.ToolsKits"),
          items: this.actor.itemTags["trapping"].filter(i => i.system.trappingType.value == "toolsAndKits" || i.system.trappingType.value == "tradeTools"),
          show: false,
          collapsed: collapsed?.toolsAndKits,
          dataType: "trapping"
        },
        foodAndDrink: {
          label: game.i18n.localize("WFRP4E.TrappingType.FoodDrink"),
          items: this.actor.itemTags["trapping"].filter(i => i.system.trappingType.value == "foodAndDrink"),
          show: false,
          collapsed: collapsed?.foodAndDrink,
          dataType: "trapping"
        },
        drugsPoisonsHerbsDraughts: {
          label: game.i18n.localize("WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts"),
          items: this.actor.itemTags["trapping"].filter(i => i.system.trappingType.value == "drugsPoisonsHerbsDraughts"),
          show: false,
          collapsed: collapsed?.drugsPoisonsHerbsDraughts,
          dataType: "trapping"
        },
        misc: {
          label: game.i18n.localize("WFRP4E.TrappingType.Misc"),
          items: this.actor.itemTags["trapping"].filter(i => i.system.trappingType.value == "misc" || !i.system.trappingType.value),
          show: true,
          collapsed: collapsed?.misc,
          dataType: "trapping"
        },
        ingredient: {
          label: game.i18n.localize("WFRP4E.TrappingType.Ingredient"),
          items: this.actor.itemTags["trapping"].filter(i => i.system.trappingType.value == "ingredient"),
          show: false,
          collapsed: collapsed?.ingredient,
          dataType: "trapping"
        },
        cargo: {
          label: game.i18n.localize("WFRP4E.TrappingType.Cargo"),
          items: this.actor.itemTags["cargo"],
          show: false,
          collapsed: collapsed?.cargo,
          dataType: "cargo"
        }
      }
  
      const money = {
        items: this.actor.itemTags["money"],
        total: 0,     // Total coinage value
        show: true,
        collapsed : false
      }
      const containers = {
        items: this.actor.itemTags["container"],
        show: false
      }
      const misc = {}
      let inContainers = []; // inContainers is the temporary storage for items within a container
  
      
      if (this.actor.hasSpells || this.actor.type == "vehicle")
        inContainers = this._filterItemCategory(categories.ingredient, inContainers)
      else
      {
        categories.misc.items = categories.misc.items.concat(categories.ingredient.items)
        delete categories.ingredient
      }
  
      // Allow 3rd party modules to expand Inventory by adding new categories
      Hooks.callAll("wfrp4e:constructInventory", this, categories, collapsed);
  
      for (let itemCategory in categories)
        inContainers = this._filterItemCategory(categories[itemCategory], inContainers)
  
      inContainers = this._filterItemCategory(money, inContainers)
      inContainers = this._filterItemCategory(containers, inContainers)
  
      // Add names of containers to item.location object. Used for ammo selection
      inContainers.forEach(i => {
        const container = this.actor.itemTags["container"].find(c => c.id === i.system.location.value);
        i.system.location.name = container?.name || false;
      });
  
      misc.totalShieldDamage = categories["weapons"].items.reduce((prev, current) => prev += current.system.damageToItem.shield, 0)
  
      money.total = money.items.reduce((prev, current) => { return prev + (current.system.coinValue.value * current.system.quantity.value) }, 0)
  
      categories.misc.show = true
  
      // ******************************** Container Setup ***********************************
  
      for (var cont of this.actor.itemTags["container"]) // For each container
      {
        // All items referencing (inside) that container
        var itemsInside = inContainers.filter(i => i.system.location.value == cont.id);
        cont.system.carrying = itemsInside.filter(i => i.type != "container")//.sort((a, b) => a.sort - b.sort);    // cont.system.carrying -> items the container is carrying
        cont.system.packsInside = itemsInside.filter(i => i.type == "container")//.sort((a, b) => a.sort - b.sort); // cont.system.packsInside -> containers the container is carrying
        cont.system.carries.current = itemsInside.reduce(function (prev, cur) {   // cont.system.holding -> total encumbrance the container is holding
          return Number(prev) + Number(cur.system.encumbrance.total);
        }, 0);
        cont.system.carries.current = Math.floor(cont.system.carries.current * 10) / 10;
        cont.system.collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")?.[cont.id];
      }
  
      return {
        categories,
        money,
        containers,
        misc
      }
    }
    
    _filterItemCategory(category, itemsInContainers) {
      itemsInContainers = itemsInContainers.concat(category.items.filter(i => !!i.system.location?.value))
      category.items = category.items.filter(i => !i.system.location?.value)//.sort((a, b) => a.sort - b.sort);
      category.show = category.items.length > 0
      return itemsInContainers
    }

  formatArmourSection(context) {
    let AP = context.system.status.armour

    // Change out hit locations if using custom table
    let table = game.wfrp4e.tables.findTable(context.system.details.hitLocationTable.value)
    for (let loc in AP) {
      if (loc == "shield" || loc == "shieldDamage")
        continue
      if (table)
      {
        try {
          let result  = table.results.find(r => r.getFlag("wfrp4e", "loc") == loc)
          if (result)
          AP[loc].label = game.i18n.localize(result.text)
          else
          AP[loc].show = false;
        }
        catch(e)
        {
          ui.notifications.error("Error formatting armour section using Hit Location Table, using fallback implementation")
          warhammer.utility.log("Hit Location Format Error: " + e, true)
          AP[loc].label = game.i18n.localize(game.wfrp4e.config.locations[loc])
        }
      }
      else if (game.wfrp4e.config.locations[loc]) // fallback implementation
      {
        AP[loc].label = game.i18n.localize(game.wfrp4e.config.locations[loc])
      }
    }
  }
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
        condition: li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid
          if (uuid)
          {
            let parsed = foundry.utils.parseUuid(uuid);
            if (parsed.type == "ActiveEffect")
            {
              return parsed.primaryId == this.document.id; // If an effect's parent is not this document, don't show the delete option
            }
            else if (parsed.type)
            {
              return true;
            }
            return false;
          }
          else return false;
        },
        callback: async li => 
        {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          document.delete();
        }
      },
      {
        name: "Post to Chat",
        icon: '<i class="fas fa-comment"></i>',
        condition: li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          if (uuid)
          {
            let parsed = foundry.utils.parseUuid(uuid);
            return parsed.type == "Item"; // Can only post Items to chat
          }
          else return false;
        },
        callback: async li => 
        {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          const document = await fromUuid(uuid);
          document.postItem();
        }
      },
      {
        name: "Duplicate",
        icon: '<i class="fa-solid fa-copy"></i>',
        condition: li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          if (uuid && !uuid.includes("Compendium"))
          {
            let doc = fromUuidSync(uuid);
            return doc?.documentName == "Item" && doc.system.isPhysical; // Can only duplicate physical items
          }
          else return false;
        },
        callback: async li => 
        {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            const document = await fromUuid(uuid);
            this.actor.createEmbeddedDocuments("Item", [document.toObject()]);
        }
      },
      {
        name: "Split",
        icon: '<i class="fa-solid fa-split"></i>',
        condition: li => {
          let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
          if (uuid && !uuid.includes("Compendium"))
          {
            let doc = fromUuidSync(uuid);
            return doc?.documentName == "Item" && doc.system.isPhysical; // Can only split physical items
          }
          else return false;
        },
        callback: async li => 
        {
            let uuid = li.dataset.uuid || getParent(li, "[data-uuid]").dataset.uuid;
            if (uuid)
            {
              let doc = fromUuidSync(uuid);
              let amt = await ValueDialog.create({title : game.i18n.localize("SHEET.SplitTitle"), text : game.i18n.localize("SHEET.SplitPrompt")})
              doc.system.split(amt);
            }
        }
      }
    ];
  }

  async _onDropItem(data, ev)
  {
      let containerDropElement = this._getParent(ev.target, ".container-drop")
      if (containerDropElement)
      {
        let document = await fromUuid(data.uuid);
        let container = await fromUuid(containerDropElement.dataset.uuid);

        let documentData = document.toObject();

        //
        if (container.id == document.system.location.value)
        {
          return super._onDropItem(data, ev);
        }
        if (container)
        {
          documentData.system.location.value = container.id;
          foundry.utils.setProperty(documentData, "system.equipped.value", false);
          
          // This handles both updating when dragging within the same sheet and creating a new item when dragging from another sheet
          this.document.updateEmbeddedDocuments("Item",  [documentData]);
        }
      }
      else 
      {
        return super._onDropItem(data, ev);
      }
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
    context.effects.system = game.wfrp4e.utility.getSystemEffects(this.actor.type == "vehicle");

  }


  _getConditionData(context) {
    try {
      let conditions = foundry.utils.duplicate(game.wfrp4e.config.statusEffects).map(e => new ActiveEffect.implementation(e));
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

  /** @inheritDoc */
  _attachFrameListeners() {
    super._attachFrameListeners();
    GenericActions.addEventListeners(this.element, this);
  }

  _addEventListeners()
  {
    super._addEventListeners();
    this.element.querySelectorAll('.symptom-tag').forEach(el => el.addEventListener("click", WFRP_Utility.handleSymptomClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.condition-chat').forEach(el => el.addEventListener("click", WFRP_Utility.handleConditionClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.property-chat').forEach(el => el.addEventListener("click", WFRP_Utility.handlePropertyClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.table-click').forEach(el => el.addEventListener("click", WFRP_Utility.handleTableClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.pay-link').forEach(el => el.addEventListener("click", WFRP_Utility.handlePayClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.credit-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleCreditClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.corruption-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleCorruptionClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.fear-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleFearClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.terror-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleTerrorClick.bind(WFRP_Utility)))
    this.element.querySelectorAll('.exp-link').forEach(el => el.addEventListener("click", WFRP_Utility.handleExpClick.bind(WFRP_Utility)))

    this.element.querySelector(".system-effects")?.addEventListener("change", (ev) => {
      let key = ev.target.value;
      this.actor.addSystemEffect(key)
    });

    this.element.querySelectorAll(".rollable").forEach(element => {
      element.addEventListener("mouseenter", ev => {
        let img = ev.target.matches("img") ? ev.target : ev.target.querySelector("img") ;
        if (img)
        {
          this._icon = img.src;
          img.src = "systems/wfrp4e/ui/buttons/d10.webp";
        }
      })
      element.addEventListener("mouseleave", ev => {
        let img = ev.target.matches("img") ? ev.target : ev.target.querySelector("img") ;
        if (img)
        {
          img.src = this._icon;
        }
      })
    });
  }


  async _handleEnrichment() {
    let enrichment = {}
    enrichment["system.details.biography.value"] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.details.biography.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })
    enrichment["system.details.gmnotes.value"] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.details.gmnotes.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })

    enrichment.conditions = {}

    for(let c in game.wfrp4e.config.conditionDescriptions)
    {
      enrichment.conditions[c] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(game.wfrp4e.config.conditionDescriptions[c]);
    }
    return expandObject(enrichment)
  }

    /**
     * Prevent effects from stacking up each form submission
   * @override
   */
    async _processSubmitData(event, form, submitData) {
      let diffData = foundry.utils.diffObject(this.document.toObject(false), submitData)
      await this.document.update(diffData);
    }
  

  //#region Action Handlers

    static async _onCreateItem(ev) 
    {
        let type = this._getParent(ev.target, "[data-type]").dataset.type;
        let category = this._getParent(ev.target, "[data-type]").dataset.category;
        let itemData = {type, name : `New ${game.i18n.localize(CONFIG.Item.typeLabels[type])}`}

        if (type == "trapping")
        {
          itemData["system.trappingType.value"] = category;
        }
        else if (type == "spell" && category == "petty")
        {
          itemData["system.lore.value"] = category;
        }
        else if (type == "prayer")
        {
          itemData["system.type.value"] = category;
        }
        else if (type == "trait")
        {
          itemData["system.category"] = category || "standard"
        }

        this.document.createEmbeddedDocuments("Item", [itemData]).then(item => item[0].sheet.render(true));
    }

    static async _onConfigureActor(ev)
    {
      new ActorSettings(this.actor).render(true);
    }

    static async _onUseAspect(ev)
    {
      let document = await this._getDocumentAsync(ev);
      if (document && document.system.usable)
      {
        document.system.use();
      }
    }
    
    static async _onUseGroupAction(ev, target)
    {
      let index = target.dataset.index;

      let action = game.wfrp4e.config.groupAdvantageActions[index];

      if ((await this.actor.spend("system.status.advantage.value", action.cost)))//action.cost > this.actor.status.advantage.value)
      {
        if (action)
          {
            let html = await TextEditor.enrichHTML(`
            <p><strong>${action.name}</strong>: ${action.description}</p>
            <p>${action.effect}</p>
            `)
    
            ChatMessage.create({
              content : html,
              speaker : {alias : this.actor.token?.name || this.actor.prototypeToken.name},
              flavor : "Group Advantage Action"
            })
    
            if (action.test)
            {
              if (action.test.type == "characteristic")
              {
                this.actor.setupCharacteristic(action.test.value, {appendTitle : ` - ${action.name}`}).then(test => test.roll())
              }
            }
          }
      }
      else 
      {
        return ui.notifications.error("Not enough Advantage!")
      }


    }

    static async _onToggleQuality(ev)
    {
      let document = await this._getDocumentAsync(ev);
      let index = this._getIndex(ev);

      let inactive = Object.values(document.system.properties.inactiveQualities);
  
      // Find clicked quality
      let toggled = inactive[index];
  
      // Find currently active
      let qualities = foundry.utils.deepClone(document.system.qualities.value);
  
      // Disable all qualities of clicked group
      qualities.filter(i => i.group == toggled.group).forEach(i => i.active = false)
  
      // Enabled clicked quality
      qualities.find(i => i.name == toggled.key).active = true;
  
      document.update({"system.qualities.value" : qualities})
    }

    static async _onToggleGroupActions(ev, target)
    {
      let actions = this.element.querySelector(".group-actions");
      if (actions.children.length > 0)
      {
        target.querySelector("i").classList.replace("fa-chevron-up", "fa-chevron-down")
        actions.replaceChildren();
        this._toggleDropdownAt(actions);
      }
      else 
      {
        target.querySelector("i").classList.replace("fa-chevron-down", "fa-chevron-up")
        let html = ``
        if (game.wfrp4e.config.groupAdvantageActions.length > 0) 
        {
          game.wfrp4e.config.groupAdvantageActions.forEach((action, i) => {
            html += `<div class="action">
              <button data-action="useGroupAction" data-index="${i}">${action.name}</button>
              <p>${action.description}</p>
              <p class="cost"><strong>Cost</strong>: ${action.cost}</p>
              <p class="effect">${action.effect}</p>
              </div><hr>`
          })
        }
        else 
        {
          html = "No Actions Available"
        }

        this._toggleDropdownAt(actions, await TextEditor.enrichHTML(html));
      }
    }

    static async _onRollTest(ev)
    {
      let test;
      let document = await this._getDocumentAsync(ev);
      let options = {fields : {}};
      let target = this._getParent(ev.target, "[data-action='rollTest']")
      if (target)
      {
        options.fields.modifier = Number(target.dataset.modifier) || 0;
      }
      switch (target.dataset.type)
      {
        case "characteristic": 
          test = await this.document.setupCharacteristic(ev.target.dataset.characteristic, options)
          break;
        case "skill":
          test = await this.document.setupSkill(document.name, options)
          break;
        case "extendedTest":
          test = await this.document.setupExtendedTest(document, options);
          break;
        case "trait":
          test = await this.document.setupTrait(document, options);
          break;
        case "weapon":
          test = await this.document.setupWeapon(document, options);
          break;
        case "spell":
          test = await this.castOrChannelPrompt(document, options);
          break;
        case "prayer":
          test = await this.actor.setupPrayer(document, options);
          break;
      }

      test?.roll();
    }

    castOrChannelPrompt(spell, options = {}) {
      // Do not show the dialog for Petty spells, just cast it.
      if (spell.system.lore.value == "petty" || spell.system.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty"))
      {
        return this.actor.setupCast(spell, options)
      }
      else {
          return foundry.applications.api.DialogV2.wait({
            window : {title: game.i18n.localize("DIALOG.CastOrChannel")},
            content: `<div class="cast-channel-dialog selection"> 
                      <p>${game.i18n.localize("DIALOG.CastChannel")}</p> 
                      </div>`,
            buttons: [
              {
                action : "cast",
                default: true,
                label: game.i18n.localize("Cast"),
                callback: btn => {
                  return this.actor.setupCast(spell, options);
                }
              },
              {
                action : "channel",
                label: game.i18n.localize("Channel"),
                callback: async btn => {
                  return this.actor.setupChannell(spell, options);
                  // TODO: move this elsewhere
                  // await test.roll();
                  // if (test.context.channelUntilSuccess) {
                  //   await warhammer.utility.sleep(200);
                  //   do {
                  //     if (test.item.cn.SL >= test.item.cn.value) {
                  //       break;
                  //     }
                  //     if (test.result.minormis || test.result.majormis || test.result.catastrophicmis) {
                  //       break;
                  //     }
                  //     test.context.messageId = null; // Clear message so new message is made
                  //     await test.roll();
                  //     await warhammer.utility.sleep(200);
                  //   } while (true);
                  // }
                }
              }
            ],
          });
      }
    }

    static async _toggleExtendedTests(ev)
    {
      this.showExtendedTests = !this.showExtendedTests;
      this.render(true);
    }

    static _onRemoveAttacker(ev) {
      this.actor.update({ "flags.-=oppose": null })
    }

    static _onClickCondition(ev) {
      let conditionKey = this._getParent(ev.target, ".condition")?.dataset.key
      let existing = this.actor.hasCondition(conditionKey)
      
      if (!existing?.isNumberedCondition && ev.button == 0)
      {
        this.actor.removeCondition(conditionKey);
      }
      
      ev.button == 0 ? this.actor.addCondition(conditionKey) : this.actor.removeCondition(conditionKey) 
    }

    static async _onRemoveItemFromContainer(ev)
    {
      let item = await this._getDocumentAsync(ev);
      return item.update({ "system.location.value": "" })
    }


    static async _toggleSummary(ev)
    {
      let document = await this._getDocumentAsync(ev);
      if (document)
      {
        let expandData = await document.system.expandData({secrets: this.actor.isOwner});
        this._toggleDropdown(ev, expandData.description.value + `<div class="tags">${expandData.properties?.length ? "<div class='tag'>" + expandData.properties.join("</div><div class='tag'>") : ""}</div>`);
      }
    }
    static async _onItemPropertyDropdown(ev) {
      let item = await this._getDocumentAsync(ev);
      let type = ev.target.dataset.type;
      let properties = Object.values(item.system.properties[type])
      if (type == "qualities")
      {
        properties = properties.concat(Object.values(item.system.properties.unusedQualities), Object.values(item.system.properties.inactiveQualities));
      }
      let propData = properties.find(p => p.display == ev.target.text);
      let key = propData.key;
      let value = propData.value;
      let propertyDescriptions = foundry.utils.mergeObject(foundry.utils.deepClone(game.wfrp4e.config.qualityDescriptions), game.wfrp4e.config.flawDescriptions);
      if (key)
      {
        let description = propertyDescriptions[key]?.replace("(Rating)", value) || `Description for ${ev.target.text} was not found`;
        
        this._toggleDropdown(ev, description)
      }
    }

    static async _onCombatDropdown(ev) {
      let property = ev.target.dataset.property;
      let item = await this._getDocumentAsync(ev);
      let description = "";

      switch(property)
      {
        case "group":
          description = game.wfrp4e.config.weaponGroupDescriptions[item.system.weaponGroup.value];
          break;
        case "reach":
          description = game.wfrp4e.config.reachDescription[item.system.reach.value];
          break;
        case "special":
          description = item.system.properties.special;
          break;
        case "specialAmmmo":
          description = item.system.properties.specialAmmo;
          break;
        case "range":
            if (!game.settings.get("wfrp4e", "homebrew").mooRangeBands)
            {

              description =
              `<a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Point Blank"]]}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Short Range")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Short Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Short Range")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Short Range"]]}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Normal")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Normal")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Normal")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Normal"]]}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Long Range")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Long Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Long Range")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Long Range"]]}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Extreme")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Extreme")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Extreme")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Extreme"]]}</a><br>
                `
                
            }
            //@HOUSE
            else {
              game.wfrp4e.utility.logHomebrew("mooRangeBands")
              description =
              `<a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Short Range")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Short Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Short Range")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Short Range")}`].modifier}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Normal")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Normal")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Normal")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Normal")}`].modifier}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Long Range")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Long Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Long Range")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Long Range")}`].modifier}</a><br>
                <a data-action="rollTest" data-type="weapon" data-modifier="${item.system.range.bands[`${game.i18n.localize("Extreme")}`].modifier}">${item.system.range.bands[`${game.i18n.localize("Extreme")}`].range[0]} ${game.i18n.localize("yds")} - ${item.system.range.bands[`${game.i18n.localize("Extreme")}`].range[1]} ${game.i18n.localize("yds")}: ${item.system.range.bands[`${game.i18n.localize("Extreme")}`].modifier}</a><br>
                `
            }
          break;
      }
        
      this._toggleDropdown(ev, description)
    }

    static _onConvertCurrency(ev) 
    {

      ev.preventDefault();
      let type = this._getParent(ev.target, "a").dataset.type;
      let money = this.actor.itemTypes.money;
      let itemData = MarketWFRP4e.convertMoney(money, type);
      return this.actor.updateEmbeddedDocuments("Item", itemData)
    }

    static _onConsolidateCurrency(ev) 
    {
      ev.preventDefault();
      let money = this.actor.itemTypes.money;
      let newMoney = MarketWFRP4e.consolidateMoney(money.map(i => i.toObject()));
      return this.actor.updateEmbeddedDocuments("Item", newMoney)
    }

    static _onCollapseSection(ev)
    {
      let section = this._getParent(ev.target, "a").dataset.section;
      let collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")?.[section]
  
      this.actor.setFlag("wfrp4e", `sheetCollapsed.${section}`, !collapsed);
    }
    
    static async _onContainerSort(ev)
    {
      let direction = this._getParent(ev.target, "a").dataset.direction

      let container = await this._getDocumentAsync(ev);

      // All Containers on the same level as the sorted container
      let containers = this.actor.itemTags.container.sort((a, b) => a.sort - b.sort).filter(i => i.system.location.value == container.system.location.value);

      // Index of the sorted container
      let index = containers.findIndex(i => i.id == container.id);

      if ((index == 0 && direction == "up") || (index == containers.length - 1 && direction == "down"))
        {
          return;
        }

        // Index of the target container
        let targetIndex = direction == "up" ? index - 1 : index + 1;
        let target = containers[targetIndex];

        // Remove sorted container
        containers = containers.filter(i => i.id != container.id);

      let sorted = foundry.utils.SortingHelpers.performIntegerSort(container, {target, siblings: containers});
      this.actor.updateEmbeddedDocuments("Item", sorted.map(s => 
      {
          return foundry.utils.mergeObject({
              _id : s.target.id,
          }, s.update);
      }));
  
    }

    //#endregion
}
