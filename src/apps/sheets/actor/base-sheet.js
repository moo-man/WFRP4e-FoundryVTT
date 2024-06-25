import EffectWfrp4e from "../../../../modules/system/effect-wfrp4e";
import WFRP_Utility from "../../../../modules/system/utility-wfrp4e";
const { ActorSheetV2 } = foundry.applications.sheets
const { HandlebarsApplicationMixin } = foundry.applications.api

export default class BaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) 
{
    static DEFAULT_OPTIONS = {
        classes: ["wfrp4e", "actor"],
        actions: {
            
        },
        window : {
          resizable : true
        }
      }

      static TABS = {
        main : {
          id : "main",
          group : "primary",
          label : "Main",
        },
        skills : {
          id : "skills",
          group : "primary",
          label : "Skills",
        },
        talents : {
          id : "talents",
          group : "primary",
          label : "Talents",
        },
        combat : {
          id : "combat",
          group : "primary",
          label : "Combat",
        },
        effects : {
          id : "effects",
          group : "primary",
          label : "Effects",
        },
        religion : {
          id : "religion",
          group : "primary",
          label : "Religion",
        },
        magic : {
          id : "magic",
          group : "primary",
          label : "Magic",
        },
        trappings : {
          id : "trappings",
          group : "primary",
          label : "Trappings",
        },
        notes : {
          id : "notes",
          group : "primary",
          label : "Notes",
        }
      }

      async _prepareContext(options)
      {
        let context = await super._prepareContext(options);
        context.actor = this.actor;
        context.system = this.actor.system;
        context.items = this.actor.itemTypes;
        context.tabs = this._prepareTabs(options);
        return context;
      }

      async _preparePartContext(partId, context) {
        context.partId = `${this.id}-${partId}`;
        context.tab = context.tabs[partId];

        switch(partId)
        {
          case "skills" :
            this._prepareSkillsContext(context);
            break;
          case "effects" : 
            this._prepareEffectsContext(context);
            break;
          case "trappings" : 
            this._prepareTrappingsContext(context);
            break;
        }

        return context;
      }

      _prepareTabs(options)
      {
        let tabs = foundry.utils.deepClone(this.constructor.TABS);

        if (!this.actor.hasSpells)
        {
          delete tabs.magic;
        }

        if (!this.actor.hasPrayers)
        {
          delete tabs.religion;
        }

        for(let t in tabs)
        {
          tabs[t].active = this.tabGroups[tabs[t].group] === tabs[t].id,
          tabs[t].cssClass = tabs[t].active ? "active" : "";
        }

        if (!Object.values(tabs).some(t => t.active))
        {
          tabs.main.active = true;
          tabs.main.cssClass = "active";
        }

        return tabs;
      }

      _prepareSkillsContext(context)
      {
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
    
        for (let e of Array.from(this.actor.allApplicableEffects(true)))
        {
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
          let conditions = foundry.utils.deepClone(game.wfrp4e.config.statusEffects).map(e => new EffectWfrp4e(e));
          let currentConditions = this.actor.conditions
          delete conditions.splice(conditions.length - 1, 1)
          
          for (let condition of conditions) {
            let owned = currentConditions.find(e => e.conditionId == condition.conditionId)
            if (owned) {
              condition.existing = true
              condition.flags.wfrp4e.value = owned.conditionValue;
            }
            else if (condition.isNumberedCondition) {
              condition.flags.wfrp4e.value = 0
            }
          }
          return conditions
        }
        catch (e)
        {
          ui.notifications.error("Error Adding Condition Data: " + e)
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
            collapsed : collapsed?.weapons,
            dataType: "weapon"                            // What type of FVTT Item is in this section (used by the + button to add an item of this type)
          },
          armor: {
            label: game.i18n.localize("WFRP4E.TrappingType.Armour"),
            items: this.actor.itemTypes["armour"],
            toggle: true,
            toggleName: game.i18n.localize("Worn"),
            show: false,
            collapsed : collapsed?.armor,
            dataType: "armour"
          },
          ammunition: {
            label: game.i18n.localize("WFRP4E.TrappingType.Ammunition"),
            items: this.actor.itemTypes["ammunition"],
            show: false,
            collapsed : collapsed?.ammunition,
            dataType: "ammunition"
          },
          clothingAccessories: {
            label: game.i18n.localize("WFRP4E.TrappingType.ClothingAccessories"),
            items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "clothingAccessories"),
            toggle: true,
            toggleName: game.i18n.localize("Worn"),
            show: false,
            collapsed : collapsed?.clothingAccessories,
            dataType: "trapping"
          },
          booksAndDocuments: {
            label: game.i18n.localize("WFRP4E.TrappingType.BooksDocuments"),
            items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "booksAndDocuments"),
            show: false,
            collapsed : collapsed?.booksAndDocuments,
            dataType: "trapping"
          },
          toolsAndKits: {
            label: game.i18n.localize("WFRP4E.TrappingType.ToolsKits"),
            items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "toolsAndKits" || i.system.trappingType.value == "tradeTools"),
            show: false,
            collapsed : collapsed?.toolsAndKits,
            dataType: "trapping"
          },
          foodAndDrink: {
            label: game.i18n.localize("WFRP4E.TrappingType.FoodDrink"),
            items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "foodAndDrink"),
            show: false,
            collapsed : collapsed?.foodAndDrink,
            dataType: "trapping"
          },
          drugsPoisonsHerbsDraughts: {
            label: game.i18n.localize("WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts"),
            items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "drugsPoisonsHerbsDraughts"),
            show: false,
            collapsed : collapsed?.drugsPoisonsHerbsDraughts,
            dataType: "trapping"
          },
          misc: {
            label: game.i18n.localize("WFRP4E.TrappingType.Misc"),
            items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "misc" || !i.system.trappingType.value),
            show: true,
            collapsed : collapsed?.misc,
            dataType: "trapping"
          },
          ingredients : {
            label: game.i18n.localize("WFRP4E.TrappingType.Ingredient"),
            items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "ingredient"),
            show: false,
            collapsed : collapsed?.ingredients,
            dataType: "trapping"
          },
          cargo: {
            label: game.i18n.localize("WFRP4E.TrappingType.Cargo"),
            items: this.actor.itemTypes["cargo"],
            show: false,
            collapsed : collapsed?.cargo,
            dataType: "cargo"
          }
        }
    
        // Money and ingredients are not in inventory object because they need more customization - note in actor-inventory.html that they do not exist in the main inventory loop
        const money = {
          items: this.actor.itemTypes["money"],
          total: 0,     // Total coinage value
          show: true,
          collapsed : false
        }
        const containers = {
          items: this.actor.itemTypes["container"],
          show: false
        }
        const misc = {}
        let inContainers = []; // inContainers is the temporary storage for items within a container
    
    
        if (this.actor.hasSpells || this.actor.type == "vehicle")
        {
          inContainers = this._filterItemCategory(ingredients, inContainers)
        }
        else
        {
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
          cont.collapsed=this.actor.getFlag("wfrp4e", "sheetCollapsed")?.[cont.id];
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



}
