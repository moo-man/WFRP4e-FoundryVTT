import MarketWFRP4e from "../../../../modules/apps/market-wfrp4e";
import ActiveEffectWFRP4e from "../../../../modules/system/effect-wfrp4e";
import WFRP_Utility from "../../../../modules/system/utility-wfrp4e";
const { ActorSheetV2 } = foundry.applications.sheets
const { HandlebarsApplicationMixin } = foundry.applications.api

export default class BaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2)
{
  #dragDrop;

  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    classes: ["wfrp4e", "actor"],
    actions: {

    },
    position : {
      height: 750
    },
    window: {
      resizable: true
    },
    dragDrop: [{ dragSelector: '[data-uuid]:not([data-nodrag])', dropSelector: null }],
  }

  static TABS = {
    main: {
      id: "main",
      group: "primary",
      label: "Main",
    },
    skills: {
      id: "skills",
      group: "primary",
      label: "Skills",
    },
    talents: {
      id: "talents",
      group: "primary",
      label: "Talents",
    },
    combat: {
      id: "combat",
      group: "primary",
      label: "Combat",
    },
    effects: {
      id: "effects",
      group: "primary",
      label: "Effects",
    },
    religion: {
      id: "religion",
      group: "primary",
      label: "Religion",
    },
    magic: {
      id: "magic",
      group: "primary",
      label: "Magic",
    },
    trappings: {
      id: "trappings",
      group: "primary",
      label: "Trappings",
    },
    notes: {
      id: "notes",
      group: "primary",
      label: "Notes",
    }
  }

  /**
* Create drag-and-drop workflow handlers for this Application
* @returns {DragDrop[]}     An array of DragDrop handlers
* @private
*/
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new DragDrop(d);
    });
  }

    /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
    _canDragStart(selector) {
      // game.user fetches the current user
      return this.isEditable;
    }
  
  
    /**
     * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
     * @param {string} selector       The candidate HTML selector for the drop target
     * @returns {boolean}             Can the current user drop on this selector?
     * @protected
     */
    _canDragDrop(selector) {
      // game.user fetches the current user
      return this.isEditable;
    }
  
  
    /**
     * Callback actions which occur at the beginning of a drag start workflow.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDragStart(event) {
      const el = event.currentTarget;
      if ('link' in event.target.dataset) return;
  
      // Extract the data you need
      let dragData = null;

      if (el.dataset.uuid)
      {
        let document = await fromUuid(el.dataset.uuid);
        dragData = document.toDragData();
      }

  
      if (!dragData) return;
  
      // Set data transfer
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }
  
  
    /**
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragOver(event) {}
  
  
    /**
     * Callback actions which occur when a dragged element is dropped on a target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    async _onDrop(event) 
    {
      const data = TextEditor.getDragEventData(event);

      if (data.type && typeof this["_onDrop" + data.type] == "function")
      {
        this["_onDrop" + data.type](data)
      }
    }

    async _onDropItem(data)
    {
      let document = await fromUuid(data.uuid);
      return await this.document.createEmbeddedDocuments(data.type, [document]);
    }

    async _onDropActiveEffect(data)
    {
      let document = await fromUuid(data.uuid);
      return await this.document.createEmbeddedDocuments(data.type, [document]);
    }

      // From Income results - drag money value over to add
  _onDropIncome(data) 
  {
    this.document.updateEmbeddedDocuments("Item", MarketWFRP4e.addMoneyTo(this.document, data.amount));
  }

  /**
 * Returns an array of DragDrop instances
 * @type {DragDrop[]}
 */
  get dragDrop() {
    return this.#dragDrop;
  }

  _onRender(_context, _options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
    
    // TODO: Maybe this isn't needed in V13?
    this.element.querySelectorAll("prose-mirror").forEach((editor) => {
      editor.addEventListener("change", (ev) => {
        this.actor.update({ [`system.${ev.target.name}`]: ev.target.value })
      })
    })
  }


  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;
    context.items = this.actor.itemTypes;
    context.tabs = this._prepareTabs(options);
    context.fields = this.actor.system.schema.fields;
    context.source = this.document.toObject();
    context.enriched = await this._handleEnrichment()

    return context;
  }

  async _preparePartContext(partId, context) {
    context.partId = `${this.id}-${partId}`;
    context.tab = context.tabs[partId];

    switch (partId) {
      case "skills":
        await this._prepareSkillsContext(context);
        break;
      case "effects":
        await this._prepareEffectsContext(context);
        break;
      case "trappings":
        await this._prepareTrappingsContext(context);
        break;
    }

    return context;
  }

  _prepareTabs(options) {
    let tabs = foundry.utils.deepClone(this.constructor.TABS);

    if (!this.actor.hasSpells) {
      delete tabs.magic;
    }

    if (!this.actor.hasPrayers) {
      delete tabs.religion;
    }

    for (let t in tabs) {
      tabs[t].active = this.tabGroups[tabs[t].group] === tabs[t].id,
        tabs[t].cssClass = tabs[t].active ? "active" : "";
    }

    if (!Object.values(tabs).some(t => t.active)) {
      tabs.main.active = true;
      tabs.main.cssClass = "active";
    }

    return tabs;
  }

  _prepareSkillsContext(context) {
    context.skills = {
      basic: this.actor.itemTypes["skill"].filter(i => i.system.advanced.value == "bsc" && i.system.grouped.value == "noSpec").sort(WFRP_Utility.nameSorter),
      advanced: this.actor.itemTypes["skill"].filter(i => i.system.advanced.value == "adv" || i.system.grouped.value == "isSpec").sort(WFRP_Utility.nameSorter)
    }
  }


  //#region Effects

  _prepareEffectsContext(context) {
    context.effects = {}
    context.effects.conditions = this._getConditionData();
    context.effects.temporary = []
    context.effects.passive = []
    context.effects.disabled = []

    for (let e of Array.from(this.actor.allApplicableEffects(true))) {
      if (!e.show)
        continue
      if (e.isCondition) context.effects.conditions.push(e)
      else if (e.disabled) context.effects.disabled.push(e)
      else if (e.isTemporary) context.effects.temporary.push(e)
      else context.effects.passive.push(e);
    }

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


  //#region Trappings
  _prepareTrappingsContext(context) {

    let collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")
    // Inventory object is for the Trappings tab - each sub object is for an individual inventory section
    const categories = {
      weapons: {
        label: game.i18n.localize("WFRP4E.TrappingType.Weapon"), // Label - what is displayed in the inventory section header
        items: this.actor.itemTypes["weapon"], // Array of items in the sectio.filter(i => !i.system.location.value)n
        toggle: true,                                 // Is there a toggle in the section? (Equipped, worn, etc.)
        toggleName: game.i18n.localize("Equipped"),   // What is the name of the toggle in the header
        show: false,                                  // Should this section be shown (if an item exists in this list, it is set to true)
        collapsed: collapsed?.weapons,
        dataType: "weapon"                            // What type of FVTT Item is in this section (used by the + button to add an item of this type)
      },
      armor: {
        label: game.i18n.localize("WFRP4E.TrappingType.Armour"),
        items: this.actor.itemTypes["armour"],
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        collapsed: collapsed?.armor,
        dataType: "armour"
      },
      ammunition: {
        label: game.i18n.localize("WFRP4E.TrappingType.Ammunition"),
        items: this.actor.itemTypes["ammunition"],
        show: false,
        collapsed: collapsed?.ammunition,
        dataType: "ammunition"
      },
      clothingAccessories: {
        label: game.i18n.localize("WFRP4E.TrappingType.ClothingAccessories"),
        items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "clothingAccessories"),
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        collapsed: collapsed?.clothingAccessories,
        dataType: "trapping"
      },
      booksAndDocuments: {
        label: game.i18n.localize("WFRP4E.TrappingType.BooksDocuments"),
        items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "booksAndDocuments"),
        show: false,
        collapsed: collapsed?.booksAndDocuments,
        dataType: "trapping"
      },
      toolsAndKits: {
        label: game.i18n.localize("WFRP4E.TrappingType.ToolsKits"),
        items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "toolsAndKits" || i.system.trappingType.value == "tradeTools"),
        show: false,
        collapsed: collapsed?.toolsAndKits,
        dataType: "trapping"
      },
      foodAndDrink: {
        label: game.i18n.localize("WFRP4E.TrappingType.FoodDrink"),
        items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "foodAndDrink"),
        show: false,
        collapsed: collapsed?.foodAndDrink,
        dataType: "trapping"
      },
      drugsPoisonsHerbsDraughts: {
        label: game.i18n.localize("WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts"),
        items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "drugsPoisonsHerbsDraughts"),
        show: false,
        collapsed: collapsed?.drugsPoisonsHerbsDraughts,
        dataType: "trapping"
      },
      misc: {
        label: game.i18n.localize("WFRP4E.TrappingType.Misc"),
        items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "misc" || !i.system.trappingType.value),
        show: true,
        collapsed: collapsed?.misc,
        dataType: "trapping"
      },
      ingredients: {
        label: game.i18n.localize("WFRP4E.TrappingType.Ingredient"),
        items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "ingredient"),
        show: false,
        collapsed: collapsed?.ingredients,
        dataType: "trapping"
      },
      cargo: {
        label: game.i18n.localize("WFRP4E.TrappingType.Cargo"),
        items: this.actor.itemTypes["cargo"],
        show: false,
        collapsed: collapsed?.cargo,
        dataType: "cargo"
      }
    }

    // Money and ingredients are not in inventory object because they need more customization - note in actor-inventory.html that they do not exist in the main inventory loop
    const money = {
      items: this.actor.itemTypes["money"],
      total: 0,     // Total coinage value
      show: true,
      collapsed: false
    }
    const containers = {
      items: this.actor.itemTypes["container"],
      show: false
    }
    const misc = {}
    let inContainers = []; // inContainers is the temporary storage for items within a container


    if (this.actor.hasSpells || this.actor.type == "vehicle") {
      inContainers = this._filterItemCategory(ingredients, inContainers)
    }
    else {
      // categories.misc.items = categories.misc.items.concat(ingredients.items)
    }

    // Allow 3rd party modules to expand Inventory by adding new categories
    Hooks.callAll("wfrp4e:constructInventory", this, categories, collapsed);

    for (let itemCategory in categories)
      inContainers = this._filterItemCategory(categories[itemCategory], inContainers)

    inContainers = this._filterItemCategory(money, inContainers)
    inContainers = this._filterItemCategory(containers, inContainers)

    // Add names of containers to item.location object. Used for ammo selection
    inContainers.forEach(i => {
      const container = this.actor.itemTypes["container"].find(c => c.id === i.system.location.value);
      i.system.location.name = container?.name || false;
    });

    misc.totalShieldDamage = categories["weapons"].items.reduce((prev, current) => prev += current.system.damageToItem.shield, 0)

    money.total = money.items.reduce((prev, current) => { return prev + (current.system.coinValue.value * current.system.quantity.value) }, 0)

    categories.misc.show = true

    // ******************************** Container Setup ***********************************

    for (var cont of this.actor.itemTypes["container"]) // For each container
    {
      // All items referencing (inside) that container
      var itemsInside = inContainers.filter(i => i.system.location.value == cont.id);
      cont.system.carrying = itemsInside.filter(i => i.type != "container");    // cont.system.carrying -> items the container is carrying
      cont.system.packsInside = itemsInside.filter(i => i.type == "container"); // cont.system.packsInside -> containers the container is carrying
      cont.system.carries.current = itemsInside.reduce(function (prev, cur) {   // cont.system.holding -> total encumbrance the container is holding
        return Number(prev) + Number(cur.system.encumbrance.total);
      }, 0);
      cont.system.carries.current = Math.floor(cont.system.carries.current * 10) / 10;
      cont.collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")?.[cont.id];
    }

    context.inventory = {
      categories,
      // ingredients,
      money,
      containers,
      misc
    }
  }

  _filterItemCategory(category, itemsInContainers) {
    itemsInContainers = itemsInContainers.concat(category.items.filter(i => !!i.system.location?.value))
    category.items = category.items.filter(i => !i.system.location?.value)
    category.show = category.items.length > 0
    return itemsInContainers
  }
  //#endregion


  async _handleEnrichment() {
    let enrichment = {}
    enrichment["system.details.biography.value"] = await TextEditor.enrichHTML(this.actor.system.details.biography.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })
    enrichment["system.details.gmnotes.value"] = await TextEditor.enrichHTML(this.actor.system.details.gmnotes.value, { async: true, secrets: this.actor.isOwner, relativeTo: this.actor })

    return expandObject(enrichment)
  }

    // Shared listeners between different document sheets 
    _getId(ev) 
    {
        return this._getDataAttribute(ev, "id");
    }
    
    _getIndex(ev) 
    {
        return Number(this._getDataAttribute(ev, "index"));
    }

    _getKey(ev) 
    {
        return this._getDataAttribute(ev, "key");
    }

    _getType(ev) 
    {
        return this._getDataAttribute(ev, "type");
    }

    _getPath(ev) 
    {
        return this._getDataAttribute(ev, "path");
    }

    _getCollection(ev) 
    {
        return this._getDataAttribute(ev, "collection") || "items";
    }

    _getUUID(ev)
    {
        return this._getDataAttribute(ev, "uuid");
    }


    /**
     * Search for an HTML data property, specified as data-<property>
     * First search target of the event, then search in parent properties
     * @param {Event} ev Event triggered
     * @param {string} property data-<property> being searched for
     * @returns {object} property found
     */
    _getDataAttribute(ev, property)
    {
        let value = ev.target.dataset[property];

        if (!value) 
        {
            const parent = $(ev.target).parents(`[data-${property}]`);
            if (parent) 
            {
                value = parent[0]?.dataset[property];
            }
        }
        return value;
    }

    _getDocument(event)
    {
        let id = this._getId(event);
        let collection = this._getCollection(event);
        let uuid = this._getUUID(event);

        return (uuid ? fromUuidSync(uuid) : this.object[collection].get(id));
    }

    _getDocumentAsync(event)
    {
        let id = this._getId(event);
        let collection = this._getCollection(event);
        let uuid = this._getUUID(event);

        return (uuid ? fromUuid(uuid) : this.object[collection].get(id));
    }

}
