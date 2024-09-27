import WFRP_Utility from "../../../../modules/system/utility-wfrp4e";
import BaseWFRP4eActorSheet from "./base";

export default class StandardWFRP4eActorSheet extends BaseWFRP4eActorSheet
{

  static DEFAULT_OPTIONS = {
    position : {
      height: 750
    },
    actions : {
      useDodge : this._onDodgeClick,
      useUnarmed : this._onUnarmedClick,
      useImprovised : this._onImprovisedClick,
      useStomp : this._onStompClick,
      removeMount : this._removeMount,
      dismount : this._dismount,
      showMount : this._showMount
    },
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
     * Callback actions which occur when a dragged element is over a drop target.
     * @param {DragEvent} event       The originating DragEvent
     * @protected
     */
    _onDragOver(event) {
      console.log(event.target);
    }

    _onDropActor(document, event)
    {
      let mount = fromUuidSync(document.uuid);
      if (event.target.classList.contains("mount-drop"))
      {
        if (game.wfrp4e.config.actorSizeNums[mount.system.details.size.value] < game.wfrp4e.config.actorSizeNums[this.actor.details.size.value])
          return ui.notifications.error(game.i18n.localize("MountError"))
  
        let mountData = {
          id: mount.id,
          mounted: true,
          isToken: false
        }
        if(this.actor.prototypeToken.actorLink && !mount.prototypeToken.actorLink)
          ui.notifications.warn(game.i18n.localize("WarnUnlinkedMount"))
  
        this.actor.update({ "system.status.mount": mountData })
      }
    }

  _prepareSkillsContext(context) {
    context.skills = {
      basic: this.actor.itemTypes.skill.filter(i => i.system.advanced.value == "bsc" && i.system.grouped.value == "noSpec").sort(WFRP_Utility.nameSorter),
      advanced: this.actor.itemTypes.skill.filter(i => i.system.advanced.value == "adv" || i.system.grouped.value == "isSpec").sort(WFRP_Utility.nameSorter)
    }
  }

  // Consolidate talents
  _prepareTalentsContext(context) {
    let talents = context.items.talent;
    context.items.talent = [];
    talents.forEach(t => {
      if (!context.items.talent.find(existing => existing.name == t.name))
      {
        context.items.talent.push(t);
      }
    })
  }

    // Organize Spells
    _prepareMagicContext(context) {
      let spells = context.items.spell;
      context.items.spell = {petty : [], lore : []};
      spells.forEach(s => {
        if (s.system.lore.value == "petty")
        {
          context.items.spell.petty.push(s);
        }
        else 
        {
          context.items.spell.lore.push(s);
        }
      })
    }

    // Organize Prayers
    _prepareReligionContext(context) {
      let prayer = context.items.prayer;
      context.items.prayer = {blessing : [], miracle : []};
      prayer.forEach(p => {
        if (p.system.type.value == "blessing")
        {
          context.items.prayer.blessing.push(p);
        }
        else 
        {
          context.items.prayer.miracle.push(p);
        }
      })
    }


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
      ingredient: {
        label: game.i18n.localize("WFRP4E.TrappingType.Ingredient"),
        items: this.actor.itemTypes["trapping"].filter(i => i.system.trappingType.value == "ingredient"),
        show: false,
        collapsed: collapsed?.ingredient,
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

    const money = {
      items: this.actor.getItemTypes("money"),
      total: 0,     // Total coinage value
      show: true,
      collapsed : false
    }
    const containers = {
      items: this.actor.getItemTypes("container"),
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
      cont.system.carrying = itemsInside.filter(i => i.type != "container").sort((a, b) => a.sort - b.sort);    // cont.system.carrying -> items the container is carrying
      cont.system.packsInside = itemsInside.filter(i => i.type == "container").sort((a, b) => a.sort - b.sort);; // cont.system.packsInside -> containers the container is carrying
      cont.system.carries.current = itemsInside.reduce(function (prev, cur) {   // cont.system.holding -> total encumbrance the container is holding
        return Number(prev) + Number(cur.system.encumbrance.total);
      }, 0);
      cont.system.carries.current = Math.floor(cont.system.carries.current * 10) / 10;
      cont.system.collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")?.[cont.id];
    }

    context.inventory = {
      categories,
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


  static _onUnarmedClick(ev) {
    ev.preventDefault();
    let unarmed = game.wfrp4e.config.systemItems.unarmed
    this.actor.setupWeapon(unarmed).then(setupData => {
      this.actor.weaponTest(setupData)
    })
  }
  static _onDodgeClick(ev) {
      this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true}).then(test => {
        test.roll();
      });
  }
  static _onImprovisedClick(ev) {
    ev.preventDefault();
    let improv = game.wfrp4e.config.systemItems.improv;
    this.actor.setupWeapon(improv).then(setupData => {
      this.actor.weaponTest(setupData)
    })
  }

  static _onStompClick(ev) {
    ev.preventDefault();
    let stomp = game.wfrp4e.config.systemItems.stomp;
    this.actor.setupTrait(stomp).then(setupData => {
      this.actor.traitTest(setupData)
    })
  }

  static _dismount(ev) {
    ev.stopPropagation();
    this.actor.update({ "system.status.mount.mounted": !this.actor.status.mount.mounted })
  }

  static _removeMount(ev) {
    ev.stopPropagation();
    let mountData = { id: "", mounted: false, isToken: false }
    this.actor.update({ "system.status.mount": mountData })
  }

  static _onContextMenushowMount(ev) {
    this.actor.mount.sheet.render(true)
  }

}
