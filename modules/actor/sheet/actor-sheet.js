import MarketWFRP4e from "../../apps/market-wfrp4e.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
import WFRP_Audio from "../../system/audio-wfrp4e.js"
import NameGenWfrp from "../../apps/name-gen.js";
import ActiveEffectWFRP4e from "../../system/effect-wfrp4e.js";
import { GenericAspectModel } from "../../model/item/generic.js";
import Advancement from "../../system/advancement.js";
import {EquippableItemModel} from "../../model/item/components/equippable.js";

/**
 * Provides the data and general interaction with Actor Sheets - Abstract class.
 *
 * ActorSheetWFRP4e provides the general interaction and data organization shared among all 
 * actor sheets, as this is an abstract class, inherited by either Character, NPC, or Creature
 * specific actor sheet classes. When rendering an actor sheet, getData() is called, which is
 * a large and key that prepares the actor data for display, processing the raw data
 * and items and compiling them into data to display on the sheet. Additionally, this class
 * contains all the main events that respond to sheet interaction in activateListeners().
 *
 * @see   ActorWFRP4e - Data and main computation model (this.actor)
 * @see   ActorSheetWFRP4eCharacter - Character sheet class
 * @see   ActorSheetWFRP4eNPC - NPC sheet class
 * @see   ActorSheetWFRP4eCreature - Creature sheet class
 *
 * @property {ActorWFRP4e} actor
 */
export default class ActorSheetWFRP4e extends WarhammerActorSheet {

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.tabs = [{ navSelector: ".tabs", contentSelector: ".content", initial: "main" }]
    options.width = 576;
    options.scrollY = [".save-scroll"];
    return options;
  }

  /**
   * Overrides the default ActorSheet.render to add lity.
   * 
   * This adds scroll position saving support, as well as tooltips for the
   * custom buttons.
   * 
   * @param {bool} force      used upstream.
   * @param {Object} options  used upstream.
   */
  async _render(force = false, options = {}) {
    await super._render(force, options);

    // Add Tooltips
    this.element.find(".close").attr({"data-tooltip" : game.i18n.localize("SHEET.Close"), "data-tooltip-direction" : "UP"});
    this.element.find(".configure-sheet").attr({"data-tooltip" : game.i18n.localize("SHEET.Configure"), "data-tooltip-direction" : "UP"});
    this.element.find(".configure-token").attr({"data-tooltip" : game.i18n.localize("SHEET.Token"), "data-tooltip-direction" : "UP"});
    this.element.find(".import").attr({"data-tooltip" : game.i18n.localize("SHEET.Import"), "data-tooltip-direction" : "UP"});

    warhammer.utility.replacePopoutTokens(this.element); // Opposed attackers show as tokens, replace popout versions with normal

    this._refocus(this._element)

  }

  _refocus(html) {
    try {
      let element
      if (this.saveFocus)
        element = html.find(`input[${this.saveFocus}]`)[0];

      if (element) {
        element.focus()
        element.select()
      }
    }
    catch (e) {
      warhammer.utility.log("Could not refocus tabbed element on character sheet")
    }
  }

  /**
   * Provides the data to the template when rendering the actor sheet
   * 
   * This is called when rendering the sheet, where it calls the base actor class
   * to organize, process, and prepare all actor data for display. See ActorWFRP4e.prepare()
   * 
   * @returns {Object} sheetData    Data given to the template when rendering
   */
  async getData() {
    const sheetData = await super.getData();
    sheetData.system = sheetData.actor.system // project system data so that handlebars has the same name and value paths

    sheetData.items = this.constructItemLists(sheetData)
    this.formatArmourSection(sheetData)

    this._addEncumbranceData(sheetData)

    this.filterActiveEffects(sheetData);
    this.addConditionData(sheetData);

    sheetData.attacker = this.actor.attacker;
    sheetData.vehicle = this.actor.system.vehicle;
    sheetData.portStayEvents = game.wfrp4e.tables.findTable("port-stay-events");
    sheetData.shipboardEvents = game.wfrp4e.tables.findTable("shipboard-events");

    if (this.actor.type != "vehicle") {
      sheetData.effects.system = game.wfrp4e.utility.getSystemEffects();
    }
    else 
    {
      sheetData.effects.system = game.wfrp4e.utility.getSystemEffects(true);
    }

    sheetData.enrichment = await this._handleEnrichment()

    return sheetData;
  }

  async _handleEnrichment()
  {
      let enrichment = {}
      enrichment["system.details.biography.value"] = await TextEditor.enrichHTML(this.actor.system.details.biography.value, {async: true, secrets: this.actor.isOwner, relativeTo: this.actor})
      enrichment["system.details.gmnotes.value"] = await TextEditor.enrichHTML(this.actor.system.details.gmnotes.value, {async: true, secrets: this.actor.isOwner, relativeTo: this.actor})

      return foundry.utils.expandObject(enrichment)
  }


  constructItemLists(sheetData) {

    let items = {}

    items.skills = {
      basic: sheetData.actor.itemTags["skill"].filter(i => i.advanced.value == "bsc" && i.grouped.value == "noSpec"),
      advanced: sheetData.actor.itemTags["skill"].filter(i => i.advanced.value == "adv" || i.grouped.value == "isSpec")
    }

    items.careers = sheetData.actor.itemTags["career"].reverse()
    items.criticals = sheetData.actor.itemTags["critical"]
    items.nonTrivialCriticals = items.criticals.filter(c => Number.isNumeric(c.system.wounds.value))
    items.diseases = sheetData.actor.itemTags["disease"]
    items.injuries = sheetData.actor.itemTags["injury"]
    items.mutations = sheetData.actor.itemTags["mutation"]
    items.psychologies = sheetData.actor.itemTags["psychology"]
    items.traits = sheetData.actor.itemTags["trait"]
    items.extendedTests = sheetData.actor.itemTags["extendedTest"]
    items.vehicleMods = sheetData.actor.itemTags["vehicleMod"]
    items.vehicleTests = sheetData.actor.itemTags["vehicleTest"]
    items.vehicleRoles = sheetData.actor.itemTags["vehicleRole"]

    items.grimoire = {
      petty: sheetData.actor.itemTags["spell"].filter(i => i.lore.value == "petty" || i.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty")),
      lore: sheetData.actor.itemTags["spell"].filter(i => (i.lore.value != "petty" && i.lore.value != game.i18n.localize("WFRP4E.MagicLores.petty")) || !i.lore.value)
    }

    items.prayers = {
      blessings: sheetData.actor.itemTags["prayer"].filter(i => i.prayerType.value == "blessing"),
      miracles: sheetData.actor.itemTags["prayer"].filter(i => i.prayerType.value == "miracle" || !i.prayerType.value)
    }

    items.equipped = {
      weapons: sheetData.actor.itemTags["weapon"].filter(i => i.isEquipped),
      armour: sheetData.actor.itemTags["armour"].filter(i => i.isEquipped)
    }

    items.aspects = {
      talents : {}, 
      effects : {}, 
      combat : {},
      magic: {}
    }
    sheetData.actor.items.contents.filter(i => i.system.isAspect).forEach(item => {
        if (items.aspects[item.system.placement][item.system.pluralLabel])
        {
          items.aspects[item.system.placement][item.system.pluralLabel].push(item);
        }
        else 
        {
          items.aspects[item.system.placement][item.system.pluralLabel] = [item];
        }
    })

    items.inventory = this.constructInventory(sheetData)

    items.talents = this._consolidateTalents()

    this._sortItemLists(items)

    items.skills.basic = items.skills.basic.sort(WFRP_Utility.nameSorter)
    items.skills.advanced = items.skills.advanced.sort(WFRP_Utility.nameSorter)

    return items
  }

  constructInventory(sheetData) {

    let collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")
    // Inventory object is for the Trappings tab - each sub object is for an individual inventory section
    const categories = {
      weapons: {
        label: game.i18n.localize("WFRP4E.TrappingType.Weapon"), // Label - what is displayed in the inventory section header
        items: sheetData.actor.itemTags["weapon"], // Array of items in the sectio.filter(i => !i.location.value)n
        toggle: true,                                 // Is there a toggle in the section? (Equipped, worn, etc.)
        toggleName: game.i18n.localize("Equipped"),   // What is the name of the toggle in the header
        show: false,                                  // Should this section be shown (if an item exists in this list, it is set to true)
        collapsed : collapsed?.weapons,
        dataType: "weapon"                            // What type of FVTT Item is in this section (used by the + button to add an item of this type)
      },
      armor: {
        label: game.i18n.localize("WFRP4E.TrappingType.Armour"),
        items: sheetData.actor.itemTags["armour"],
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        collapsed : collapsed?.armor,
        dataType: "armour"
      },
      ammunition: {
        label: game.i18n.localize("WFRP4E.TrappingType.Ammunition"),
        items: sheetData.actor.itemTags["ammunition"],
        show: false,
        collapsed : collapsed?.ammunition,
        dataType: "ammunition"
      },
      clothingAccessories: {
        label: game.i18n.localize("WFRP4E.TrappingType.ClothingAccessories"),
        items: sheetData.actor.itemTags["trapping"].filter(i => i.trappingType.value == "clothingAccessories"),
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        collapsed : collapsed?.clothingAccessories,
        dataType: "trapping"
      },
      booksAndDocuments: {
        label: game.i18n.localize("WFRP4E.TrappingType.BooksDocuments"),
        items: sheetData.actor.itemTags["trapping"].filter(i => i.trappingType.value == "booksAndDocuments"),
        show: false,
        collapsed : collapsed?.booksAndDocuments,
        dataType: "trapping"
      },
      toolsAndKits: {
        label: game.i18n.localize("WFRP4E.TrappingType.ToolsKits"),
        items: sheetData.actor.itemTags["trapping"].filter(i => i.trappingType.value == "toolsAndKits" || i.trappingType.value == "tradeTools"),
        show: false,
        collapsed : collapsed?.toolsAndKits,
        dataType: "trapping"
      },
      foodAndDrink: {
        label: game.i18n.localize("WFRP4E.TrappingType.FoodDrink"),
        items: sheetData.actor.itemTags["trapping"].filter(i => i.trappingType.value == "foodAndDrink"),
        show: false,
        collapsed : collapsed?.foodAndDrink,
        dataType: "trapping"
      },
      drugsPoisonsHerbsDraughts: {
        label: game.i18n.localize("WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts"),
        items: sheetData.actor.itemTags["trapping"].filter(i => i.trappingType.value == "drugsPoisonsHerbsDraughts"),
        show: false,
        collapsed : collapsed?.drugsPoisonsHerbsDraughts,
        dataType: "trapping"
      },
      misc: {
        label: game.i18n.localize("WFRP4E.TrappingType.Misc"),
        items: sheetData.actor.itemTags["trapping"].filter(i => i.trappingType.value == "misc" || !i.trappingType.value),
        show: true,
        collapsed : collapsed?.misc,
        dataType: "trapping"
      },
      cargo: {
        label: game.i18n.localize("WFRP4E.TrappingType.Cargo"),
        items: sheetData.actor.itemTags["cargo"],
        show: false,
        collapsed : collapsed?.cargo,
        dataType: "cargo"
      }
    }

    // Money and ingredients are not in inventory object because they need more customization - note in actor-inventory.html that they do not exist in the main inventory loop
    const ingredients = {
      label: game.i18n.localize("WFRP4E.TrappingType.Ingredient"),
      items: sheetData.actor.itemTags["trapping"].filter(i => i.trappingType.value == "ingredient"),
      show: false,
      collapsed : collapsed?.ingredients,
      dataType: "trapping"
    }
    const money = {
      items: sheetData.actor.itemTags["money"],
      total: 0,     // Total coinage value
      show: true,
      collapsed : false
    }
    const containers = {
      items: sheetData.actor.itemTags["container"],
      show: false
    }
    const misc = {}
    let inContainers = []; // inContainers is the temporary storage for items within a container


    if (sheetData.actor.hasSpells || sheetData.actor.type == "vehicle")
      inContainers = this._filterItemCategory(ingredients, inContainers)
    else
      categories.misc.items = categories.misc.items.concat(ingredients.items)

    // Allow 3rd party modules to expand Inventory by adding new categories
    Hooks.callAll("wfrp4e:constructInventory", this, categories, collapsed);

    for (let itemCategory in categories)
      inContainers = this._filterItemCategory(categories[itemCategory], inContainers)

    inContainers = this._filterItemCategory(money, inContainers)
    inContainers = this._filterItemCategory(containers, inContainers)

    // Add names of containers to item.location object. Used for ammo selection
    inContainers.forEach(i => {
      const container = this.actor.itemTags["container"].find(c => c.id === i.location.value);
      i.location.name = container?.name || false;
    });

    misc.totalShieldDamage = categories["weapons"].items.reduce((prev, current) => prev += current.damageToItem.shield, 0)

    money.total = money.items.reduce((prev, current) => { return prev + (current.coinValue.value * current.quantity.value) }, 0)

    categories.misc.show = true

    // ******************************** Container Setup ***********************************

    for (var cont of this.actor.itemTags["container"]) // For each container
    {
      // All items referencing (inside) that container
      var itemsInside = inContainers.filter(i => i.location.value == cont.id);
      cont.system.carrying = itemsInside.filter(i => i.type != "container");    // cont.system.carrying -> items the container is carrying
      cont.system.packsInside = itemsInside.filter(i => i.type == "container"); // cont.system.packsInside -> containers the container is carrying
      cont.system.carries.current = itemsInside.reduce(function (prev, cur) {   // cont.system.holding -> total encumbrance the container is holding
        return Number(prev) + Number(cur.encumbrance.total);
      }, 0);
      cont.system.carries.current = Math.floor(cont.system.carries.current * 10) / 10;
      cont.collapsed=this.actor.getFlag("wfrp4e", "sheetCollapsed")?.[cont.id];
    }

    return {
      categories,
      ingredients,
      money,
      containers,
      misc
    }
  }

  _filterItemCategory(category, itemsInContainers) {
    itemsInContainers = itemsInContainers.concat(category.items.filter(i => !!i.location?.value))
    category.items = category.items.filter(i => !i.location?.value)
    category.show = category.items.length > 0
    return itemsInContainers
  }

  addConditionData(sheetData) {
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
      sheetData.effects.conditions = conditions
    }
    catch (e)
    {
      ui.notifications.error("Error Adding Condition Data: " + e)
    }
  }

  filterActiveEffects(sheetData) {
    sheetData.effects = {}
    sheetData.effects.conditions = []
    sheetData.effects.temporary = []
    sheetData.effects.passive = []
    sheetData.effects.disabled = []

    for (let e of Array.from(this.actor.allApplicableEffects(true)))
    {
      if (!e.show)
        continue
      if (e.isCondition) sheetData.effects.conditions.push(e)
      else if (e.disabled) sheetData.effects.disabled.push(e)
      else if (e.isTemporary) sheetData.effects.temporary.push(e)
      else sheetData.effects.passive.push(e);
    }

    sheetData.effects.passive = this._consolidateEffects(sheetData.effects.passive)
    sheetData.effects.temporary = this._consolidateEffects(sheetData.effects.temporary)
    sheetData.effects.disabled = this._consolidateEffects(sheetData.effects.disabled)
  }

  // Recursively go through the object and sort any arrays found
  _sortItemLists(items) {
    for (let prop in items) {
      if (Array.isArray(items[prop]))
        items[prop] = items[prop].sort((a, b) => (a.sort || 0) - (b.sort || 0))
      else if (typeof items == "object")
        this._sortItemLists(items[prop])
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

  _consolidateTalents() {
    let talents = this.actor.itemTags["talent"]
    let consolidated = []
    for (let talent of talents) {
      let existing = consolidated.find(t => t.name == talent.name)
      if (!existing)
        consolidated.push(talent)
    }
    return consolidated
  }


  formatArmourSection(sheetData) {
    let AP = sheetData.system.status.armour

    // Change out hit locations if using custom table
    let table = game.wfrp4e.tables.findTable(sheetData.system.details.hitLocationTable.value)
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

  _addEncumbranceData(sheetData) {
    if (this.type != "vehicle")
      sheetData.system.status.encumbrance.pct = Math.min((sheetData.system.status.encumbrance.current / sheetData.system.status.encumbrance.max * 100), 100)
  }

  addMountData(data) {
    try {
      if (!this.actor.mount)
        return

      data.mount = this.actor.mount.data
      if (data.mount.system.status.wounds.value == 0)
        this.actor.status.mount.mounted = false;
      if (data.actor.status.mount.isToken)
        data.mount.sceneName = game.scenes.get(data.actor.system.status.mount.tokenData.scene).name
    }
    catch (e) {
      console.error(this.actor.name + ": Failed to get mount data: " + e.message)
    }
  }

  /**
   * Takes the user-entered hp value and interprets it as relative or absolute
   * and modifies the hp accordingly. 
   * 
   * Takes an either relative (+12 or -5) or an absolute value (12 or 5), interprets
   * it, and processes it with the actor's hp value.
   * 
   * @param {String} value   user entered value 
   */
  modifyWounds(value) {
    let sign = value.split('')[0] // Sign is the first character entered
    if (sign === "+" || sign === "-") // Relative
      return this.actor.modifyWounds(parseInt(value))
    else                            // Absolute
      return this.actor.setWounds(parseInt(value));
  }

  /**
 * Display a dialog for the user to choose casting or channelling.
 *
 * When clicking on a spell, the user will get an option to Cast or Channel that spell
 * Each option leads to their respective "setup" .
 *
 * @param {Object} spell     The spell item clicked on, petty spells will automatically be Casted, without the option to channel.
 *
 */
  spellDialog(spell, options = {}) {
    // Do not show the dialog for Petty spells, just cast it.
    if (spell.lore.value == "petty" || spell.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty"))
      this.actor.setupCast(spell, options).then(setupData => {
        this.actor.castTest(setupData)
      });
    else {
        new Dialog({
          title: game.i18n.localize("DIALOG.CastOrChannel"),
          content: `<div class="cast-channel-dialog selection"> 
                    <p>${game.i18n.localize("DIALOG.CastChannel")}</p> 
                    </div>`,
          buttons: {
            cast: {
              label: game.i18n.localize("Cast"),
              callback: btn => {
                this.actor.setupCast(spell, options).then(setupData => {
                  this.actor.castTest(setupData)
                });
              }
            },
            channel: {
              label: game.i18n.localize("Channel"),
              callback: async btn => {
                let test = await this.actor.setupChannell(spell, options);
                await test.roll();
                if (test.context.channelUntilSuccess) {
                  await warhammer.utility.sleep(200);
                  do {
                    if (test.item.cn.SL >= test.item.cn.value) {
                      break;
                    }
                    if (test.result.minormis || test.result.majormis || test.result.catastrophicmis) {
                      break;
                    }
                    test.context.messageId = null; // Clear message so new message is made
                    await test.roll();
                    await warhammer.utility.sleep(200);
                  } while (true);
                }
              }
            }
          },
          default: 'cast'
        }).render(true);
    }
  }


  _getSubmitData(updateData = {}) {
    this.actor.overrides = {}
    let data = super._getSubmitData(updateData);
    data = foundry.utils.diffObject(foundry.utils.flattenObject(this.actor.toObject(false)), data)
    return data
  }



  /* --------------------------------------------------------------------------------------------------------- */
  /* ------------------------------------ ev Listeners and Handlers --------------------------------------- */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * This gargatuan list is all the interactions shared between all types of sheets. Every button click and text
   * fields that require special interaction are handled here. See each ev handler for more details. 
   *
  /* --------------------------------------------------------------------------------------------------------- */

  /**
   * Activate ev listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Item summaries - displays a customized dropdown description
    html.on('click', '.item-dropdown', this._onItemSummary.bind(this));

    html.on('contextmenu', '.aspect-dropdown', this._onItemSummary.bind(this));


    // Item Properties - depending on the item property selected, display a dropdown definition, this can probably be consolidated...TODO
    html.on('click', '.melee-property-quality, .melee-property-flaw, .ranged-property-quality, .ranged-property-flaw, .armour-quality, .armour-flaw', this._expandProperty.bind(this));

    // Other dropdowns - for other clickables (range, weapon group, reach) - display dropdown helpers
    html.on('click', '.weapon-range, .weapon-group, .weapon-reach', this._expandInfo.bind(this));

    // Autoselect entire text 
    $("input[type=text]").focusin((ev) => {
      $(this).select();
      //this.focusElement = ev.target
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.on('click', '#configure-actor', ev => {
      new game.wfrp4e.apps.ActorSettings(this.actor).render(true);
    })


    // Use customized input interpreter when manually changing wounds 
    html.on('change', ".wounds-value", ev => {
      this.modifyWounds(ev.target.value)
    })

    html.on('click', '.item-edit', this._onItemEdit.bind(this));
    html.on('click', '.ch-value', this._onCharClick.bind(this));
    html.on('click', '.rest-icon', this._onRestClick.bind(this));
    html.on('change', '.ch-edit', this._onEditChar.bind(this));
    html.on('click', '.name-gen', this._onNameClicked.bind(this));
    html.on('mousedown', '.ap-value', this._onAPClick.bind(this));
    html.on('click', '.stomp-icon', this._onStompClick.bind(this));
    html.on('click', '.dodge-icon', this._onDodgeClick.bind(this));
    html.on('click', '.repeater', this._onRepeaterClick.bind(this));
    html.on('click', '.item-toggle', this._onItemToggle.bind(this));
    html.on('click', '.item-remove', this._onItemRemove.bind(this));
    html.on('click', '.fist-icon', this._onUnarmedClick.bind(this));
    html.on('click', '.item-create', this._onItemCreate.bind(this));
    html.on('click', '.aggregate', this._onAggregateClick.bind(this));
    html.on('click', '.worn-container', this._onWornClick.bind(this));
    html.on('click', '.effect-toggle', this._onEffectToggle.bind(this));
    html.on('click', '.effect-title', this._onEffectEdit.bind(this));
    html.on('mousedown', '.spell-roll', this._onSpellRoll.bind(this));
    html.on('mousedown', '.trait-roll', this._onTraitRoll.bind(this));
    html.on('click', '.skill-switch', this._onSkillSwitch.bind(this));
    html.on('click', '.item-post', this._onItemPostClicked.bind(this));
    html.on('change', '.ammo-selector', this._onSelectAmmo.bind(this));
    html.on('click', '.randomize', this._onRandomizeClicked.bind(this));
    html.on('change', '.input.species', this._onSpeciesEdit.bind(this));
    html.on('mousedown', '.prayer-roll', this._onPrayerRoll.bind(this));
    html.on('click', '.effect-create', this._onEffectCreate.bind(this));
    html.on('click', '.item-checkbox', this._onCheckboxClick.bind(this));
    html.on('mousedown', '.sl-counter', this._onSpellSLClick.bind(this));
    html.on('change', '.spell-selector', this._onSelectSpell.bind(this));
    html.on('click', '.dollar-icon', this._onMoneyIconClicked.bind(this));
    html.on('mousedown', '.disease-roll', this._onDiseaseRoll.bind(this));
    html.on('mousedown', '.shield-total', this._onShieldClick.bind(this));
    html.on('click', '.test-select', this._onExtendedTestSelect.bind(this));
    html.on('mousedown', '.loaded-checkbox', this._onLoadedClick.bind(this));
    html.on('click', '.advance-diseases', this._onAdvanceDisease.bind(this));
    html.on('click', '.memorized-toggle', this._onMemorizedClick.bind(this));
    html.on('click', '.improvised-icon', this._onImprovisedClick.bind(this));
    html.on('mousedown', '.extended-SL', this._onExtendedSLClick.bind(this));
    html.on('click', '.condition-click', this._onConditionClicked.bind(this));
    html.on('mousedown', '.quantity-click', this._onQuantityClick.bind(this));
    html.on('click', '.weapon-item-name', this._onWeaponNameClick.bind(this));
    html.on('mousedown', '.armour-total', this._onArmourTotalClick.bind(this));
    html.on('mousedown', '.weapon-damage', this._onWeaponDamageClick.bind(this));
    html.on('change', '.skill-advances', this._onChangeSkillAdvances.bind(this));
    html.on('mousedown', '.condition-toggle', this._onConditionToggle.bind(this));
    html.on('click', '.toggle-enc', this._onToggleContainerEncumbrance.bind(this));
    html.on('change', '.ingredient-selector', this._onSelectIngredient.bind(this));
    html.on('mousedown', '.injury-duration', this._onInjuryDurationClick.bind(this));
    html.on('change', '.system-effect-select', this._onSystemEffectChanged.bind(this));
    html.on('mousedown', '.condition-value', this._onConditionValueClicked.bind(this));
    html.on('mousedown', '.metacurrency-value', this._onMetaCurrrencyClick.bind(this));
    html.on('mousedown', '.skill-total, .skill-select', this._onSkillClick.bind(this));
    html.on('mousedown', '.tab.inventory .item .item-name', this._onItemSplit.bind(this));
    html.on('focusin', '.skill-advances, .ch-edit', this._saveFocus.bind(this));
    html.on('click', '.attacker-remove', this._onAttackerRemove.bind(this))
    html.on('click', '.currency-convert-right', this._onConvertCurrencyClick.bind(this))
    html.on('click', '.sort-items', this._onSortClick.bind(this))
    html.on('click', '.group-actions', this._toggleGroupAdvantageActions.bind(this))
    html.on('click', '.weapon-property .inactive', this._toggleWeaponProperty.bind(this))
    html.on('click', '.section-collapse', this._toggleSectionCollapse.bind(this))
    html.on('click', '.diagnosed', this._onDiagnoseToggle.bind(this));
    html.on('click', '.open-vehicle', this._onVehicleClick.bind(this));
    html.on('click', '.remove-vehicle', this._onVehicleRemove.bind(this));
    html.on('click', '.aspect-use', this._onAspectClick.bind(this))

    // Item Dragging
    let handler = this._onDragStart.bind(this);
    html.find('.item').each((i, li) => {
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
    });


    html.on("dragenter", ".mount-drop", ev => {
      ev.target.classList.add("dragover")
    })
    html.on("dragleave", ".mount-drop", ev => {
      ev.target.classList.remove("dragover")
    })
    html.on("drop", ".mount-drop", async ev => {
      ev.target.classList.remove("dragover")
      let dragData = JSON.parse(ev.originalEvent.dataTransfer.getData("text/plain"))

      let mount = await Actor.implementation.fromDropData(dragData)
      if (game.wfrp4e.config.actorSizeNums[mount.details.size.value] < game.wfrp4e.config.actorSizeNums[this.actor.details.size.value])
        return ui.notifications.error(game.i18n.localize("MountError"))

      let mountData = {
        id: mount.id,
        mounted: true,
        isToken: false
      }
      if(this.actor.prototypeToken.actorLink && !mount.prototypeToken.actorLink)
        ui.notifications.warn(game.i18n.localize("WarnUnlinkedMount"))

      this.actor.update({ "system.status.mount": mountData })
    })

    html.on('click', '.mount-toggle', this._onMountToggle.bind(this))
    html.on('click', '.mount-remove', this._onMountRemove.bind(this))


    html.on('click', '.mount-section', ev => {
      this.actor.mount.sheet.render(true)
    })

    // ---- Listen for custom entity links -----
    html.on("click", ".chat-roll", WFRP_Utility.handleRollClick.bind(WFRP_Utility))
    html.on("click", ".symptom-tag", WFRP_Utility.handleSymptomClick.bind(WFRP_Utility))
    html.on("click", ".condition-chat", WFRP_Utility.handleConditionClick.bind(WFRP_Utility))
    html.on("click", ".property-chat", WFRP_Utility.handlePropertyClick.bind(WFRP_Utility))
    html.on('mousedown', '.table-click', WFRP_Utility.handleTableClick.bind(WFRP_Utility))
    html.on('mousedown', '.pay-link', WFRP_Utility.handlePayClick.bind(WFRP_Utility))
    html.on('mousedown', '.credit-link', WFRP_Utility.handleCreditClick.bind(WFRP_Utility))
    html.on('mousedown', '.corruption-link', WFRP_Utility.handleCorruptionClick.bind(WFRP_Utility))
    html.on('mousedown', '.fear-link', WFRP_Utility.handleFearClick.bind(WFRP_Utility))
    html.on('mousedown', '.terror-link', WFRP_Utility.handleTerrorClick.bind(WFRP_Utility))
    html.on('mousedown', '.exp-link', WFRP_Utility.handleExpClick.bind(WFRP_Utility))

    html.on("click", ".use-grp-adv", this._onUseGrpAdvAction.bind(this))

  }

  //#region ROLLING
  //@@@@@@@@@ ROLLING @@@@@@@@@@@/

  _onCharClick(ev) {
    ev.preventDefault();
    let characteristic = ev.currentTarget.attributes["data-char"].value;
    this.actor.setupCharacteristic(characteristic).then(test => {
      test.roll();
    })
  }

  _onSkillClick(ev) {
    let itemId = this._getId(ev);
    let skill = this.actor.items.get(itemId);

    if (ev.button == 0) {
      skill = this.actor.items.get(itemId);
      this.actor.setupSkill(skill).then(test => {
        test.roll();
      })
    }
    else if (ev.button == 2) {
      skill.sheet.render(true)
    }
  }

  _onExtendedTestSelect(ev) {
    let itemId = this._getId(ev)
    let item = this.actor.items.get(itemId)
    this.actor.setupExtendedTest(item)
  }

  _onWeaponNameClick(ev) {
    ev.preventDefault();
    let itemId = this._getId(ev);
    let weapon = this.actor.items.get(itemId)
    if (weapon) this.actor.setupWeapon(weapon).then(setupData => {
      if (!setupData.abort)
        this.actor.weaponTest(setupData)
    })
  }
  async _onUnarmedClick(ev) {
    ev.preventDefault();
    let unarmed = game.wfrp4e.config.systemItems.unarmed
    this.actor.setupWeapon(unarmed).then(setupData => {
      this.actor.weaponTest(setupData)
    })
  }
  async _onDodgeClick(ev) {
      this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true}).then(test => {
        test.roll();
      });
  }
  async _onImprovisedClick(ev) {
    ev.preventDefault();
    let improv = game.wfrp4e.config.systemItems.improv;
    this.actor.setupWeapon(improv).then(setupData => {
      this.actor.weaponTest(setupData)
    })
  }

  async _onStompClick(ev) {
    ev.preventDefault();
    let stomp = game.wfrp4e.config.systemItems.stomp;
    this.actor.setupTrait(stomp).then(setupData => {
      this.actor.traitTest(setupData)
    })
  }
  async _onRestClick(ev) {
    let skill = this.actor.itemTags["skill"].find(s => s.name == game.i18n.localize("NAME.Endurance"));
    let options = {rest: true, tb: this.actor.characteristics.t.bonus, skipTargets: true}
    if (skill)
      this.actor.setupSkill(skill, options).then(setupData => {
        this.actor.basicTest(setupData)
      });
    else
      this.actor.setupCharacteristic("t", options).then(setupData => {
        this.actor.basicTest(setupData)
      })
  }

  _onTraitRoll(ev) {
    ev.preventDefault();
    if (ev.button == 2)
      return this._onItemSummary(ev);

    let itemId = this._getId(ev);
    let trait = this.actor.items.get(itemId)
    this.actor.setupTrait(trait).then(setupData => {
      this.actor.traitTest(setupData)
    })
  }
  _onSpellRoll(ev) {
    ev.preventDefault();
    if (ev.button == 2)
      return this._onItemSummary(ev);

    let itemId = this._getId(ev);
    let spell = this.actor.items.get(itemId)
    this.spellDialog(spell)
  }

  _onPrayerRoll(ev) {
    ev.preventDefault();
    if (ev.button == 2)
      return this._onItemSummary(ev);

    let itemId = this._getId(ev);
    let prayer = this.actor.items.get(itemId)
    this.actor.setupPrayer(prayer).then(setupData => {
      this.actor.prayerTest(setupData)
    })
  }

  //#endregion

  //#region SHEET INTERACTIONS
  //@@@@@@@@@ INTERACTIONS @@@@@@@@@@@/

  _saveFocus(ev) {
    if (ev.target.attributes["data-id"])
      this.saveFocus = `data-id="${ev.target.attributes["data-id"].value}`

    if (ev.target.attributes["data-char"])
      this.saveFocus = `data-char="${ev.target.attributes["data-char"].value}`
  }

  async _onEditChar(ev) {
    ev.preventDefault();
    let characteristics = foundry.utils.duplicate(this.actor._source.system.characteristics);
    let ch = ev.currentTarget.attributes["data-char"].value;
    let newValue = Number(ev.target.value);

    if (this.actor.type == "character")
    {
      let resolved = await Advancement.advancementDialog(ch, newValue, "characteristic", this.actor)

      // If not resolved, reset characteristic ui value
      if (!resolved)
      {
        ev.target.value = characteristics[ch].advances
        return 
      }
      else characteristics[ch].advances = newValue
    }
    else { // If not character
      if (!(newValue == characteristics[ch].initial + characteristics[ch].advances)) {
        characteristics[ch].initial = newValue;
        characteristics[ch].advances = 0
      }
    }
    return this.actor.update({ "system.characteristics": characteristics }, {skipExperienceChecks : true})
  }

  async _onChangeSkillAdvances(ev) {
    ev.preventDefault()
    let itemId = ev.target.attributes["data-id"].value;
    let itemToEdit = this.actor.items.get(itemId);
    if (this.actor.type == "character")
    {
      let resolved = await Advancement.advancementDialog(
        itemToEdit,
        Number(ev.target.value), 
        "skill", 
        this.actor)

        // reset advances value if dialog was not resolved
        if (!resolved)  
        {
          ev.target.value = itemToEdit.advances.value
          return
        }
    }
    itemToEdit.update({ "system.advances.value": Number(ev.target.value) }, {skipExperienceChecks : true})
  }

  _onSelectAmmo(ev) {
    let itemId = ev.target.attributes["data-id"].value;
    const item = this.actor.items.get(itemId);
    WFRP_Audio.PlayContextAudio({ item, action: "load" })
    return item.update({ "system.currentAmmo.value": ev.target.value });
  }

  _onSelectSpell(ev) {
    let itemId = ev.target.attributes["data-id"].value;
    const ing = this.actor.items.get(itemId);
    return ing.update({ "system.spellIngredient.value": ev.target.value });
  }

  _onSelectIngredient(ev) {
    let itemId = ev.target.attributes["data-id"].value;
    const spell = this.actor.items.get(itemId);
    return spell.update({ "system.currentIng.value": ev.target.value });
  }

  _onSkillSwitch(ev) {
    this.actor.setFlag("wfrp4e", "showExtendedTests", !foundry.utils.getProperty(this.actor, "flags.wfrp4e.showExtendedTests"))
    this.render(true)
  }

  _onExtendedSLClick(ev) {
    let itemId = this._getId(ev)
    let item = this.actor.items.get(itemId)
    let SL
    if (ev.button == 0) SL = item.SL.current + 1;
    else if (ev.button == 2) SL = item.SL.current - 1;

    if (SL < 0 && !item.negativePossible.value)
      SL = 0
    return item.update({ "system.SL.current": SL })
  }

  _onAPClick(ev) {
    let itemId = this._getId(ev);
    let APlocation = $(ev.currentTarget).parents(".armour-box").attr("data-location");
    let item = this.actor.items.get(itemId)
    let itemData = item.toObject()

    let maxDamageAtLocation = item.AP[APlocation] + Number(item.properties.qualities.durable?.value || 0)
    let minDamageAtLocation = 0;

    switch (ev.button) {
      case 2:
        itemData.system.APdamage[APlocation] = Math.min(maxDamageAtLocation, itemData.system.APdamage[APlocation] + 1);
        break;
      case 0:
        itemData.system.APdamage[APlocation] = Math.max(minDamageAtLocation, itemData.system.APdamage[APlocation] - 1);
        break
    }
    this.actor.updateEmbeddedDocuments("Item", [itemData])
  }

  _onWeaponDamageClick(ev) {
    let itemId = this._getId(ev);
    let item = this.actor.items.get(itemId);
    let itemData = item.toObject()

    let regex = /\d{1,3}/gm
    let maxDamage = Number(regex.exec(item.damage.value)[0] || 0) + Number(item.properties.qualities.durable?.value || 0) || 999
    let minDamage = 0;

    if (ev.button == 2) {
      itemData.system.damageToItem.value = Math.min(maxDamage, itemData.system.damageToItem.value + 1);
      WFRP_Audio.PlayContextAudio({ item: item, action: "damage", outcome: "weapon" })
    }
    else if (ev.button == 0)
      itemData.system.damageToItem.value = Math.max(minDamage, itemData.system.damageToItem.value - 1);

    //TODO This (and other validations) really should be elsewhere 
    if (maxDamage == itemData.system.damageToItem.value)
    {
        itemData.system.equipped = false
    }


    this.actor.updateEmbeddedDocuments("Item", [itemData])
  }

  _onArmourTotalClick(ev) {
    let location = $(ev.currentTarget).closest(".column").find(".armour-box").attr("data-location")
    if (!location) location = $(ev.currentTarget).closest(".column").attr("data-location");
    if (!location) return;

    let armourTraits = this.actor.itemTags["trait"].filter(i => i.name.toLowerCase() == game.i18n.localize("NAME.Armour").toLowerCase()).map(i => i.toObject());
    let armourItems = this.actor.itemTags["armour"].filter(i => i.isEquipped).sort((a, b) => a.sort - b.sort)
    let armourToDamage;
    let usedTrait = false;
    // Damage traits first
    for (let armourTrait of armourTraits) {
      // If APDamage flag doesn't exist
      if (armourTrait && !foundry.utils.getProperty(armourTrait, "flags.wfrp4e.APdamage")) foundry.utils.setProperty(armourTrait, "flags.wfrp4e.APdamage", { head: 0, body: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0 })
      if (armourTrait) {
        if (ev.button == 0) {
          if (armourTrait.flags.wfrp4e.APdamage[location] != 0) {
            armourTrait.flags.wfrp4e.APdamage[location]--;
            usedTrait = true
          }
        }
        if (ev.button == 2) {
          // If AP Damage at location is maxed, go to the next iteration
          if (armourTrait.flags.wfrp4e.APdamage[location] == Number(armourTrait.system.specification.value)) { continue }
          // Else, damage that location
          if (armourTrait.flags.wfrp4e.APdamage[location] != Number(armourTrait.system.specification.value)) {
            armourTrait.flags.wfrp4e.APdamage[location]++;
            usedTrait = true
          }
        }
        if (usedTrait)
          return this.actor.updateEmbeddedDocuments("Item", [armourTrait])

      }
    }
    if (armourItems && !usedTrait) {
      if (ev.button == 0) armourItems.reverse();
      for (let a of armourItems) {
        if (ev.button == 2) {
          if (a.currentAP[location] > 0) {
            armourToDamage = a;
            break
          }
        }
        else if (ev.button == 0) {
          if (a.AP[location] > 0 && a.APdamage[location] > 0) {
            armourToDamage = a;
            break
          }
        }
      }
    }
    if (!armourToDamage)
      return
    let durable = armourToDamage.properties.qualities.durable;
    armourToDamage = armourToDamage.toObject()

      // Damage on right click 
      if (ev.button == 2) {                            // Damage shouldn't go past AP max (accounting for durable)
        armourToDamage.system.APdamage[location] = Math.min(armourToDamage.system.AP[location] + (Number(durable?.value) || 0), armourToDamage.system.APdamage[location] + 1)
        ui.notifications.notify(game.i18n.localize("SHEET.ArmourDamaged"))
      }
      // Repair on left
      if (ev.button == 0) {                         // Damage shouldn't go below 0
        armourToDamage.system.APdamage[location] = Math.max(0, armourToDamage.system.APdamage[location] - 1)
        ui.notifications.notify(game.i18n.localize("SHEET.ArmourRepaired"))
      }
      return this.actor.updateEmbeddedDocuments("Item", [armourToDamage])
    }


  _onShieldClick(ev) {
    let shields = this.actor.itemTags["weapon"].filter(i => i.isEquipped && i.properties.qualities.shield)
    for (let s of shields) {
      let shieldQualityValue = s.properties.qualities.shield.value
      if (ev.button == 2) {
        if (s.damageToItem.shield < Number(shieldQualityValue)) {
          WFRP_Audio.PlayContextAudio({ item: s, action: "damage", outcome: "shield" })
          return s.update({ "system.damageToItem.shield": s.damageToItem.shield + 1 });
        }
      }
      if (ev.button == 0) {
        if (s.damageToItem.shield != 0) {
          return s.update({ "system.damageToItem.shield": s.damageToItem.shield - 1 });
        }
      }
    }
  }

  async _onMemorizedClick(ev) {
    let itemId = this._getId(ev);
    const spell = this.actor.items.get(itemId)


    // unmemorized
    if (spell.memorized.value)
    {
      WFRP_Audio.PlayContextAudio({ item: spell, action: "unmemorize" })
      return spell.update({ "system.memorized.value": !spell.memorized.value })
    }


    let memorize = true;
    if (this.actor.type == "character") {
      memorize = await Advancement.memorizeCostDialog(spell, this.actor)
    }

    if (!memorize) 
      return
    
    if (!spell.memorized.value)
      WFRP_Audio.PlayContextAudio({ item: spell, action: "memorize" })
    else
      WFRP_Audio.PlayContextAudio({ item: spell, action: "unmemorize" })
    
    return spell.update({ "system.memorized.value": !spell.memorized.value })


  }

  _onSpellSLClick(ev) {
    let itemId = this._getId(ev);
    const spell = this.actor.items.get(itemId)
    let SL = spell.cn.SL
    switch (ev.button) {
      case 0: SL++;
        if (SL > (spell.memorized.value ? spell.cn.value : spell.cn.value * 2))
          SL = (spell.memorized.value ? spell.cn.value : spell.cn.value * 2);
        break;
      case 2:
        SL--;
        if (SL < 0)
          SL = 0
        break
    }
    return spell.update({ "system.cn.SL": SL })
  }

  async _onDiseaseRoll(ev) {
    const disease = this._getDocument(ev);

    if (ev.button === 0) 
    {
      disease.system.decrement();
    } 
    else 
    {
      disease.system.increment();
    }
  }

  async _onInjuryDurationClick(ev) {
    let itemId = this._getId(ev);
    let injury = this.actor.items.get(itemId).toObject()
    if (!isNaN(injury.system.duration.value)) {
      if (ev.button == 0)
        return this.actor.decrementInjury(injury)
      else injury.system.duration.value++
      return this.actor.updateEmbeddedDocuments("Item", [injury])
    }
    else {
      try {
        let roll = await new Roll(injury.system.duration.value, this.actor).roll();
        roll.toMessage({speaker : {alias : this.actor.name}, flavor : injury.name})
        injury.system.duration.value = roll.total;
        injury.system.duration.active = true;
        return this.actor.updateEmbeddedDocuments("Item", [injury])
      }
      catch
      {
        return ui.notifications.error(game.i18n.localize("ERROR.ParseInjury"))
      }
    }
  }

  async _onMetaCurrrencyClick(ev) {
    let type = $(ev.currentTarget).attr("data-point-type");
    let newValue = ev.button == 0 ? this.actor.status[type].value + 1 : this.actor.status[type].value - 1
    return this.actor.update({ [`system.status.${type}.value`]: newValue })
  }

  async _onItemEdit(ev) {
    let itemId = this._getId(ev);
    let uuid = this._getUUID(ev);
    const item = uuid ? await fromUuid(uuid) : this.actor.items.get(itemId)
    return item.sheet.render(true)
  }

  _onEffectDelete(ev) {
    let uuid = this._getUUID(ev);
    let effect = fromUuidSync(uuid);
    effect.delete();  
  }

  async _onEffectEdit(ev) {
    let uuid = this._getUUID(ev);
    let effect = fromUuidSync(uuid)
    return effect.sheet.render(true);
  }

  async _onEffectToggle(ev)
  {
    let uuid = this._getUUID(ev);
    let effect = fromUuidSync(uuid)
    await effect.update({disabled : !effect.disabled});

    // If disabling an effect that is not a descedent of this actor (like a vehicle effect applying to this actor), rerender the sheet
    if (effect.actor.uuid != this.actor.uuid)
    {
      this.render(true);
    }
  }

  _onAdvanceDisease(ev) {
    return this.actor.decrementDiseases()
  }

  async _onDeleteEmbeddedDoc(ev) {
    let doc = await this._getDocumentAsync(ev);
    if (doc.name == "Boo") {
      AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}squeek.wav` }, false)
      return
    }
    renderTemplate('systems/wfrp4e/templates/dialog/delete-item-dialog.hbs').then(html => {
      new Dialog({
        title: game.i18n.localize("Delete Confirmation"), 
        content: `<div class="delete-item-dialog selection"> 
                  <label>${game.i18n.localize("DIALOG.DeleteItem")}</label>
                  </div>`,
        buttons: {
          yes: {
            icon: '<i class="fa fa-check"></i>', label: game.i18n.localize("Yes"), callback: async dlg => {
              doc.delete();
              li.slideUp(200, () => this.render(false))
            }
          }, cancel: { icon: '<i class="fas fa-times"></i>', label: game.i18n.localize("Cancel") },
        }, default: 'yes'
      }).render(true)
    })
  }

  _onItemRemove(ev) {
    let itemId = this._getId(ev);
    const item = this.actor.items.get(itemId)
    return item.update({ "system.location.value": "" })
  }

  _onToggleContainerEncumbrance(ev) {
    let itemId = this._getId(ev);
    const item = this.actor.items.get(itemId)
    return item.update({ "system.countEnc.value": !item.countEnc.value })
  }

  async _onItemToggle(ev) {
    let equippedState;
    let itemId = this._getId(ev);
    let item = this.actor.items.get(itemId);

    if (!item) return;
    if (!(item.system instanceof EquippableItemModel)) return;

    if (!item.system.isEquipped && !item.system.canEquip) {
      AudioHelper.play({src: `${game.settings.get("wfrp4e", "soundPath")}/no.wav`}, false);
      return ui.notifications.error(game.i18n.localize("ErrorLimitedWeapons"));
    }

    equippedState = await item.system.toggleEquip();

    WFRP_Audio.PlayContextAudio({ item: this.actor.items.get(itemId), action: "equip", outcome: equippedState })
  }

  _onCheckboxClick(ev) {
    let itemId = this._getId(ev);
    let target = $(ev.currentTarget).attr("data-target")
    this.toggleItemCheckbox(itemId, target)
  }

  _onLoadedClick(ev) {
    let itemId = this._getId(ev);
    let item = this.actor.items.get(itemId)
    let itemObject = item.toObject()
    if (item.repeater) {
      if (ev.button == 0 && itemObject.system.loaded.amt >= itemObject.system.loaded.max) return
      if (ev.button == 2 && itemObject.system.loaded.amt <= 0)
        return
      if (ev.button == 0) itemObject.system.loaded.amt++
      if (ev.button == 2) itemObject.system.loaded.amt--;
      itemObject.system.loaded.value = !!itemObject.system.loaded.amt
    }
    else {
      itemObject.system.loaded.value = !itemObject.system.loaded.value
      if (itemObject.system.loaded.value)
        itemObject.system.loaded.amt = itemObject.system.loaded.max || 1
      else itemObject.system.loaded.amt = 0
    }
    this.actor.updateEmbeddedDocuments("Item", [itemObject]).then(i => this.actor.checkReloadExtendedTest(item))
  }

  _onRepeaterClick(ev) {
    let itemId = this._getId(ev);
    let item = this.actor.items.get(itemId).toObject()
    item.system.loaded.value = !item.system.loaded.value
    if (item.system.loaded.value) item.system.loaded.amt = item.system.loaded.max || 1
    this.actor.updateEmbeddedDocuments("Item", [item])
  }

  _onWornClick(ev) {
    let itemId = this._getId(ev);
    let item = this.actor.items.get(itemId);

    return item?.system.toggleEquip();
  }

  _onQuantityClick(ev) {
    let itemId = this._getId(ev);
    let item = this.actor.items.get(itemId)
    let quantity = item.quantity.value
    switch (ev.button) {
      case 0: if (ev.ctrlKey) quantity += 10;
      else quantity++;
        break;
      case 2: if (ev.ctrlKey) quantity -= 10;
      else quantity--;
        if (quantity < 0) quantity = 0;
        break
    }
    item.update({ "system.quantity.value": quantity })
  }

  async _onAggregateClick(ev) {
    let itemType = $(ev.currentTarget).attr("data-type")
    if (itemType == "ingredient") itemType = "trapping"
    let items = this.actor.itemTags[itemType].map(i => i.toObject())
    for (let i of items) {
      let duplicates = items.filter(x => x.name == i.name)
      if (duplicates.length > 1) {
        let newQty = duplicates.reduce((prev, current) => prev + parseInt(current.system.quantity.value), 0)
        i.system.quantity.value = newQty
      }
    }
    let noDuplicates = []
    for (let i of items) {
      if (!noDuplicates.find(x => x.name == i.name)) {
        noDuplicates.push(i);
        await this.actor.updateEmbeddedDocuments("Item", [{ "_id": i._id, "system.quantity.value": i.system.quantity.value }])
      }
      else await this.actor.deleteEmbeddedDocuments("Item", [i._id])
    }
  }
  _onItemSplit(ev) {
    if (ev.button == 2) {
      new Dialog({
        title: game.i18n.localize("SHEET.SplitTitle"), content: `<p>${game.i18n.localize("SHEET.SplitPrompt")}</p><div class="form-group"><input name="split-amt"type="text"/></div>`, buttons: {
          split: {
            label: game.i18n.localize("Split"), callback: (dlg) => {
              let amt = Number(dlg.find('[name="split-amt"]').val());
              if (Number.isNumeric(amt))
                return this.splitItem(this._getId(ev), amt)
            }
          }
        }, default: "split"
      }).render(true)
    }
  }
  async _onConditionValueClicked(ev) {
    let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
    if (ev.button == 0)
      await this.actor.addCondition(condKey)
    else if (ev.button == 2)
      await this.actor.removeCondition(condKey)
  }
  async _onConditionToggle(ev) {
    let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
    if (!game.wfrp4e.config.statusEffects.find(e => e.id == condKey).system.condition.numbered) {
      if (this.actor.hasCondition(condKey))
        await this.actor.removeCondition(condKey)
      else 
        await this.actor.addCondition(condKey)
      return
    }
    if (ev.button == 0)
      await this.actor.addCondition(condKey)
    else if (ev.button == 2)
      await this.actor.removeCondition(condKey)
  }
  async _onSpeciesEdit(ev) {
    let input = ev.target.value;
    let split = input.split("(")
    let species = split[0].trim()
    let subspecies
    if (split.length > 1)
      subspecies = split[1].replace(")", "").trim()
    let speciesKey = warhammer.utility.findKey(species, game.wfrp4e.config.species) || species
    let subspeciesKey = ""
    if (subspecies) {
      for (let sub in game.wfrp4e.config.subspecies[speciesKey]) {
        if (game.wfrp4e.config.subspecies[speciesKey][sub].name == subspecies) subspeciesKey = sub
      }
      if (!subspeciesKey)
        subspeciesKey = subspecies
    }
    await this.actor.update({ "system.details.species.value": speciesKey, "system.details.species.subspecies": subspeciesKey });
    if (this.actor.type == "character")
      return
    try {
      let initialValues = await WFRP_Utility.speciesCharacteristics(speciesKey, true, subspeciesKey);
      let characteristics = this.actor.toObject().system.characteristics;
      for (let c in characteristics) {
        characteristics[c].initial = initialValues[c].value
      }

      new Dialog({
        content: game.i18n.localize("SpecChar"), title: game.i18n.localize("Species Characteristics"), buttons: {
          yes: {
            label: game.i18n.localize("Yes"), callback: async () => {
              await this.actor.update({ 'system.characteristics': characteristics })

              await this.actor.update({ "system.details.move.value": WFRP_Utility.speciesMovement(species) || 4 })
            }
          }, no: { label: game.i18n.localize("No"), callback: () => { } }
        }
      }).render(true)
    } catch{ }
  }

  async _onRandomizeClicked(ev) {
    ev.preventDefault();
    let advancement = new Advancement(this.actor);

    try {
      switch (ev.target.text) {
        case game.i18n.localize("RANDOMIZER.C"): 
          advancement.advanceSpeciesCharacteristics()
          return
        case game.i18n.localize("RANDOMIZER.S"):
          advancement.advanceSpeciesSkills()
          return
        case game.i18n.localize("RANDOMIZER.T"):
          advancement.advanceSpeciesTalents()
          return
      }
    }
    catch (error) {
      warhammer.utility.log("Could not randomize: " + error, true)
    }
  }

  // Add condition description dropdown
  async _onConditionClicked(ev) {
    ev.preventDefault();
    let li = $(ev.currentTarget).parents(".sheet-condition"),
      elementToAddTo = $(ev.currentTarget).parents(".condition-list"),
      condkey = li.attr("data-cond-id"), expandData = await TextEditor.enrichHTML(`<h2>${game.wfrp4e.config.conditions[condkey]}</h2>` + game.wfrp4e.config.conditionDescriptions[condkey], {async: true})
      let existing = this.actor.hasCondition(condkey);

    if (elementToAddTo.hasClass("expanded")) {
      let summary = elementToAddTo.parents(".effects").children(".item-summary");
      summary.slideUp(200, () => summary.remove())
    }
    else {
      let div = $(`<div class="item-summary">${expandData}</div>`);
      if (existing?.manualScripts?.length) {
        let button = $(`<br><br>
          ${existing.manualScripts.map((s, i) => `<a class="trigger-script" data-uuid="${existing.uuid}" data-index="${s.index}">${s.Label}</a>`)}
        `)
        div.append(button)
      }
      elementToAddTo.after(div.hide());
      div.slideDown(200);
    }
    elementToAddTo.toggleClass("expanded")
  }
  _onItemPostClicked(ev) {
    let itemId = this._getId(ev);
    const item = this.actor.items.get(itemId)
    item.postItem()
  }

  _onNameClicked(ev) {
    let name = NameGenWfrp.generateName({ species: this.actor.details.species.value, gender: this.actor.details.gender.value })
    this.actor.update({ "name": name });
  }

  _onMountToggle(ev) {
    ev.stopPropagation();
    this.actor.update({ "system.status.mount.mounted": !this.actor.status.mount.mounted })
  }

  _onMountRemove(ev) {
    ev.stopPropagation();
    let mountData = { id: "", mounted: false, isToken: false }
    this.actor.update({ "system.status.mount": mountData })
  }

  _onAttackerRemove(ev) {
    this.actor.update({ "flags.-=oppose": null })
  }

  _onMountClicked(ev) {
    this.actor.mount.sheet.render(true)
  }
  _onSystemEffectChanged(ev) {
    let ef = ev.target.value;
    this.actor.addSystemEffect(ef)
  }

  _onMoneyIconClicked(ev) {
    ev.preventDefault();
    let money = this.actor.itemTags["money"];
    let newMoney = MarketWFRP4e.consolidateMoney(money.map(i => i.toObject()));
    return this.actor.updateEmbeddedDocuments("Item", newMoney)
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @private
   * @param {Object} ev    ev triggered by clicking on the + button for any item list
   *  
   */
  _onItemCreate(ev) {
    ev.preventDefault();
    let header = ev.currentTarget,
      data = foundry.utils.duplicate(header.dataset);

    if (data.type == "effect")
      return this.actor.createEmbeddedDocuments("ActiveEffect", [{ name: game.i18n.localize("New Effect") }])

    if (data.type == "vehicle-role" && this.actor.type == "vehicle") {
      let roles = foundry.utils.duplicate(this.actor.roles)
      let newRole = { name: game.i18n.localize("NewRole"), actor: "", test: "", testLabel: "" }
      roles.push(newRole)
      return this.actor.update({ "system.roles": roles })
    }

    // Conditional for creating skills from the skills tab - sets to the correct skill type depending on column
    if (ev.currentTarget.attributes["data-type"].value == "skill") {
      data = foundry.utils.mergeObject(data,
        {
          "system.advanced.value": ev.currentTarget.attributes["data-skill-type"].value
        });
    }

    if (data.type == "trapping")
      data = foundry.utils.mergeObject(data,
        {
          "system.trappingType.value": ev.currentTarget.attributes["item-section"].value
        })

    if (data.type == "ingredient") {
      data = foundry.utils.mergeObject(data,
        {
          "system.trappingType.value": "ingredient"
        })
      data.type = "trapping"
    }

    // Conditional for creating spells/prayers from their tabs, create the item with the correct type
    else if (data.type == "spell" || data.type == "prayer") {
      let itemSpecification = ev.currentTarget.attributes[`data-${data.type}-type`].value;

      if (data.type == "spell") {
        data = foundry.utils.mergeObject(data,
          {
            "system.lore.value": itemSpecification
          });
      }
      else if (data.type == "prayer") {
        data = foundry.utils.mergeObject(data,
          {
            "system.type.value": itemSpecification
          });
      }
    }
    data["img"] = "systems/wfrp4e/icons/blank.png";
    data["name"] = `${game.i18n.localize("New")} ${data.type.capitalize()}`;
    this.actor.createEmbeddedDocuments("Item", [data]);
  }

  _onDiagnoseToggle(ev)
  {
    let itemId = this._getId(ev);
    let item = this.actor.items.get(itemId);
    if (item)
    {
      item.update({"system.diagnosed" : !item.system.diagnosed})
    }
  }

  _onVehicleClick(ev)
  {
    this.actor.system.vehicle?.sheet.render(true);
  }

  async _onVehicleRemove(ev)
  {
    await this.actor.system.vehicle.update(this.actor.system.vehicle?.system.passengers.remove(this.actor.id));
    this.render(true);
  }

  async _onAspectClick(ev)
  {
    let itemId = this._getId(ev);
    let aspect = this.actor.items.get(itemId);
    if (aspect && aspect.system.usable)
    {
      aspect.system.use();
    }
  }

  //#endregion


  //#region DRAG/DROP
  /**
   * Sets up the data transfer within a drag and drop ev. This is triggered
   * when the user starts dragging an inventory item, and dataTransfer is set to the 
   * relevant data needed by the _onDrop  See that for how drop events
   * are handled.
   * 
   * @private
   * 
   * @param {Object} ev    ev triggered by item dragging
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ( event.target.classList.contains("content-link") ) return;

    // Create drag data
    let dragData;

    if (li.dataset.uuid)
    {
      let doc = fromUuidSync(li.dataset.uuid)
      dragData = doc.toDragData();
    }

    // Owned Items (assumed)
    else if ( li.dataset.id ) {
      const item = this.actor.items.get(li.dataset.id);
      dragData = item.toDragData();
    }

    // Owned Items (explicit)
    else if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    // Active Effect
    else if ( li.dataset.effectId ) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if ( !dragData ) return;

    dragData.root = event.currentTarget.getAttribute("root")

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /**
   * Handles all different types of drop events and processes the transfer data
   * for each type.
   * 
   * 
   * If you want to see how these (except inventory tab) drag events are generated, see the renderChatMessage hook
   * Besides containers, drag vents should be generated with a "type" and a "payload" at top level
   * 
   * type tells us what to do with the payload. 
   * Current types are: 
   * - generation (character generation drag and drop, which also includes generationType, telling us what stage was dragged)
   * - postedItem (item that was posted to chat)
   * - lookup (entity lookup, payload.lookupType tells us whether it's a skill or talent. Adds to the sheet)
   * - experience (payload is amount to add)
   * - wounds (payload is amount to add)
   *  
   * 
   * @private 
   * @param {Object} ev     ev triggered by item dropping
   */
  async _onDrop(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));

    // Inventory Tab - Containers - Detected when you drop something onto a container, otherwise, move on to other drop types
    if ($(ev.target).parents(".item").attr("inventory-type") == "container")
      this._onDropIntoContainer(ev)

    // Dropping an item from chat
    else if (dragData.type == "Item" && dragData.data)
      this.actor.createEmbeddedDocuments("Item", [dragData.data]);

    else if (dragData.type == "generation")
      this._onDropCharGen(dragData)

    else if (dragData.type == "lookup")
      this._onDropLookupItem(dragData)

    else if (dragData.type == "experience")
      this._onDropExperience(dragData)

    else if (dragData.type == "Income")
      this._onDropMoney(dragData)

    else if (dragData.type == "custom" && dragData.custom == "wounds")
      this.modifyWounds(`+${dragData.wounds}`)

    else if (dragData.type == "condition")
      this.actor.addCondition(`${dragData.payload}`)

    else // If none of the above, just process whatever was dropped upstream
      super._onDrop(ev)
  }

  async _onDropIntoContainer(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));
    let dropID = $(ev.target).parents(".item").attr("data-id");

    let item = (await Item.implementation.fromDropData(dragData))
    let update = {system : {location : {value : dropID}}};
    
    if (item.system.isEquippable)
    {
      update.system.equipped = {value : false};
    }

    return item.update(update);
  }

  // Dropping a character creation result
  _onDropCharGen(dragData) {
    let data = foundry.utils.duplicate(this.actor._source);
    if (dragData.generationType == "attributes") // Characteristsics, movement, metacurrency, etc.
    {
      data.system.details.species.value = dragData.payload.species;
      data.system.details.species.subspecies = dragData.payload.subspecies;
      data.system.details.move.value = dragData.payload.movement;

      if (this.actor.type == "character") // Other actors don't care about these values
      {
        data.status.fate.value = dragData.payload.fate;
        data.status.fortune.value = dragData.payload.fate;
        data.status.resilience.value = dragData.payload.resilience;
        data.status.resolve.value = dragData.payload.resilience;
        data.system.details.experience.total += dragData.payload.exp;
        data.system.details.experience.log = this.actor.system.addToExpLog(dragData.payload.exp, "Character Creation", undefined, data.system.details.experience.total)
      }
      for (let c in game.wfrp4e.config.characteristics) {
        data.characteristics[c].initial = dragData.payload.characteristics[c].value
      }
      return this.actor.update({ "data": data })
    }
    else if (dragData.generationType === "details") // hair, name, eyes
    {
      data.system.details.eyecolour.value = dragData.payload.eyes
      data.system.details.haircolour.value = dragData.payload.hair
      data.system.details.age.value = dragData.payload.age;
      data.system.details.height.value = dragData.payload.height;
      let name = dragData.payload.name
      return this.actor.update({ "name": name, "data": data, "token.name": name.split(" ")[0] })
    }
  }

  // This is included in character creation, but not limited to.
  // lookupType is either skill or talent. Instead of looking up the
  // data on the drag ev (could cause a delay), look it up on drop
  async _onDropLookupItem(dragData) {
    let item;
    if (dragData.payload.lookupType === "skill") {
      // Advanced find  returns the skill the user expects it to return, even with skills not included in the compendium (Lore (whatever))
      item = await WFRP_Utility.findSkill(dragData.payload.name)
    }
    else if (dragData.payload.lookupType === "talent") {
      // Advanced find  returns the talent the user expects it to return, even with talents not included in the compendium (Etiquette (whatever))
      item = await WFRP_Utility.findTalent(dragData.payload.name)
    }
    else {
      item = await WFRP_Utility.findItem(dragData.payload.name, dragData.payload.lookupType)
    }
    if (item)
      this.actor.createEmbeddedDocuments("Item", [item.toObject()]);
  }

  // From character creation - exp drag values
  _onDropExperience(dragData) {
    let system = foundry.utils.duplicate(this.actor._source.system);
    system.details.experience.total += dragData.payload;
    system.details.experience.log = this.actor.system.addToExpLog(dragData.payload, "Character Creation", undefined, system.details.experience.total);
    this.actor.update({ "system": system })
  }

  // From Income results - drag money value over to add
  _onDropMoney(data) 
  {
      this.document.updateEmbeddedDocuments("Item", MarketWFRP4e.addMoneyTo(this.document, data.amount));
  }

  _onConvertCurrencyClick(ev) {
    let type = ev.currentTarget.dataset.type
    let money = this.actor.itemTags["money"].map(m => m.toObject());

    if (type == "gc")
    {
      let currentGC = money.find(i => i.name == game.i18n.localize("NAME.GC"))
      let currentSS = money.find(i => i.name == game.i18n.localize("NAME.SS"))

      if (currentGC && currentSS && currentGC.system.quantity.value )
      {
        currentGC.system.quantity.value -= 1;
        currentSS.system.quantity.value += 20
        return this.actor.updateEmbeddedDocuments("Item", [currentGC, currentSS])
      }
      else
        return ui.notifications.error(game.i18n.localize("ErrorMoneyConvert"))
    }
    
    if (type == "ss")
    {
      let currentSS = money.find(i => i.name == game.i18n.localize("NAME.SS"))
      let currentBP = money.find(i => i.name == game.i18n.localize("NAME.BP"))

      if (currentBP && currentSS  && currentSS.system.quantity.value)
      {
        currentSS.system.quantity.value -= 1;
        currentBP.system.quantity.value += 12
        return this.actor.updateEmbeddedDocuments("Item", [currentBP, currentSS])
      }
      else
        return ui.notifications.error(game.i18n.localize("ErrorMoneyConvert"))
    }

  }

  //#endregion

  //#region DROPDOWNS
  /**
   * All item types have a drop down description, this handles what is 
   * displayed for each item type and adds additional lities
   * and listeners.
   * 
   * @private
   * 
   * @param {Object} ev    ev generated by the click 
   */
  async _onItemSummary(ev) {
    ev.preventDefault();
    let li = $(ev.currentTarget).parents(".item"),
      item = this.actor.items.get(li.attr("data-id"));
    // Call the item's expandData() which gives us what to display
    let expandData = await item.system.expandData(
      {
        secrets: this.actor.isOwner
      });

    // Toggle expansion for an item
    if (li.hasClass("expanded")) // If expansion already shown - remove
    {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    }
    else {
      // Add a div with the item summary belowe the item
      let div = "";
      div = $(`<div class="item-summary">${expandData.description.value}</div>`);

      let props = $(`<div class="item-properties"></div>`);
      expandData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));


      div.append(props);

      // Allow 3rd party modules that add new Item SubTypes to add html elements freely,
      // without restricting them to description, tags and manual scripts
      if (expandData.other.length) {
        let other = $(`<div>${expandData.other}</div>`)
        div.append(other)
      }

      if (expandData.manualScripts.length) {
        let scriptButtons = expandData.manualScripts.map((s, i) => `<a class="trigger-script" data-index=${s.index} data-uuid=${s.effect?.uuid}>${s.Label}</a>`)
        let scripts = $(`<div>${scriptButtons}</div>`)
        div.append(scripts)
      }

      if (expandData.independentEffects.length)
      {
        let effectButtons = ``;
        for(let effect of expandData.independentEffects)
        {
          if (effect.isTargetApplied)
          {
            effectButtons += `<a class="apply-target" data-uuid=${effect.uuid}><i class="fa-solid fa-crosshairs"></i> ${effect.name}</a>`
          }
          else if (effect.isAreaApplied)
          {
            effectButtons += `<a class="place-area" data-uuid=${effect.uuid}><i class="fa-solid fa-ruler-combined"></i> ${effect.name}</a>`
          }
        }
        div.append(`<div>${effectButtons}</div>`)
      }


      li.append(div.hide());
      div.slideDown(200);

      this._dropdownListeners(div);
    }
    li.toggleClass("expanded");
  }


  async _toggleGroupAdvantageActions(ev) {
    let actions = $(ev.currentTarget).parents("form").find(".group-advantage-actions");

    if (actions.children().length == 0)
    {
      ev.currentTarget.children[0].classList.replace("fa-chevron-down", "fa-chevron-up")
      let html = ``

      if (game.wfrp4e.config.groupAdvantageActions.length > 0)      
      {
        game.wfrp4e.config.groupAdvantageActions.forEach((action, i) => {
          html += `<div class="action">
          <a class="use-grp-adv" data-index="${i}">${action.name}</a>
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
      html = await TextEditor.enrichHTML(html, {async: true})
      let el = $(html).hide()
      actions.append(el)
      el.slideDown(200)
    }
    else 
    {
      actions.children().slideUp(200, () => actions.children().remove());
      
      ev.currentTarget.children[0].classList.replace("fa-chevron-up", "fa-chevron-down");
    }
  }



  async _onUseGrpAdvAction(ev) {
      let index = ev.currentTarget.dataset.index;

      let action = game.wfrp4e.config.groupAdvantageActions[index];

      if (action.cost > this.actor.status.advantage.value)
      {
        return ui.notifications.error("Not enough Advantage!")
      }

      if (action)
      {
        let html = await TextEditor.enrichHTML(`
        <p><strong>${action.name}</strong>: ${action.description}</p>
        <p>${action.effect}</p>
        `)

        this.actor.modifyAdvantage(-1 * action.cost);
        
        ChatMessage.create({
          content : html,
          speaker : {alias : this.actor.token?.name || this.actor.prototypeToken.name},
          flavor : "Group Advantage Action"
        })

        if (action.test)
        {
          if (action.test.type == "characteristic")
          {
            this.actor.setupCharacteristic(action.test.value).then(test => test.roll())
          }
        }
      }
  }


  _toggleSectionCollapse(ev)
  {
    let section = ev.currentTarget.dataset.section;
    let collapsed = this.actor.getFlag("wfrp4e", "sheetCollapsed")?.[section]

    this.actor.setFlag("wfrp4e", `sheetCollapsed.${section}`, !collapsed);
  }

  _toggleWeaponProperty(ev)
  {
    ev.stopPropagation();
    let item = this.actor.items.get(this._getId(ev));
    let index = ev.currentTarget.dataset.index;
    let inactive = Object.values(item.properties.inactiveQualities);

    // Find clicked quality
    let toggled = inactive[index];

    // Find currently active
    let qualities = foundry.utils.duplicate(item.system.qualities.value);

    // Disable all qualities of clicked group
    qualities.filter(i => i.group == toggled.group).forEach(i => i.active = false)

    // Enabled clicked quality
    qualities.find(i => i.name == toggled.key).active = true;

    item.update({"system.qualities.value" : qualities})
  }



  _dropdownListeners(html) {
    // Clickable tags
    // Post an Item Quality/Flaw
    html.on("click", ".item-property", ev => {
      WFRP_Utility.postProperty(ev.target.text)
    })

    // Roll a career income skill
    html.on("click", ".career-income", ev => {
      let skill = this.actor.itemTags["skill"].find(i => i.name === ev.target.text.trim())
      let career = this.actor.items.get($(ev.target).attr("data-career-id"));
      if (!skill) {
        ui.notifications.error(game.i18n.localize("SHEET.SkillMissingWarning"))
        return;
      }
      if (!career.current.value) {
        ui.notifications.error(game.i18n.localize("SHEET.NonCurrentCareer"))
        return;
      }
      let options = {
        title: `${skill.name} - ${game.i18n.localize("Income")}`, 
        income: this.actor.details.status, 
        career: career.toObject()
      };
      this.actor.setupSkill(skill, options).then(setupData => {
        this.actor.basicTest(setupData)
      });
    })

    // Respond to template button clicks
    html.on("mousedown", '.aoe-template', ev => {

      let actorId = ev.target.dataset["actorId"]
      let itemId = ev.target.dataset["itemId"]

      AbilityTemplate.fromString(ev.target.text, actorId, itemId, false).drawPreview(ev);
      this.minimize();
    });
  }

  /**
   * Summary for specific property selected - like a Quality description in the combat tab.
   * Works also for "Special" and "Special Ammo" properties - user entered values in the item
   * sheets.
   * 
   * 
   * @private
   * @param {Object} ev    ev triggered by clicking on a wweapon/armor property
   */
  async _expandProperty(ev) {
    ev.preventDefault();

    let li = $(ev.currentTarget).parents(".item"),
      property = ev.target.text, // Proprety clicked on
      properties = foundry.utils.mergeObject(WFRP_Utility.qualityList(), WFRP_Utility.flawList()), // Property names
      propertyDescr = Object.assign(duplicate(game.wfrp4e.config.qualityDescriptions), game.wfrp4e.config.flawDescriptions); // Property descriptions
    
    let item = this.actor.items.get(li.attr("data-id")).toObject()

    // Add custom properties descriptions
    if (item)
    {
      let customProperties = item.system.qualities.value.concat(item.system.flaws.value).filter(i => i.custom);
      customProperties.forEach(p => {
        properties[p.key] = p.name;
        propertyDescr[p.key] = p.description
      })
    }
    

    property = property.replace(/,/g, '').trim(); // Remove commas/whitespace

    let propertyKey = "";
    if (property == game.i18n.localize("Special Ammo")) // Special Ammo comes from user-entry in an Ammo's Special box
    {
      this.actor.items.get(li.attr("data-id")).toObject()
      let ammo = this.actor.items.get(item.system.currentAmmo.value).toObject()
      // Add the special value to the object so that it can be looked up
      propertyDescr = Object.assign(propertyDescr,
        {
          [game.i18n.localize("Special Ammo")]: ammo.system.special.value
        });
      propertyKey = game.i18n.localize("Special Ammo");
    }
    else if (property == "Special") // Special comes from user-entry in a Weapon's Special box
    {
      this.actor.items.get(li.attr("data-id"))
      // Add the special value to the object so that it can be looked up
      propertyDescr = Object.assign(propertyDescr,
        {
          "Special": item.system.special.value
        });
      propertyKey = "Special";
    }
    else // Otherwise, just lookup the key for the property and use that to lookup the description
    {
      propertyKey = warhammer.utility.findKey(WFRP_Utility.parsePropertyName(property), properties)
    }

    let propertyDescription = "<b>" + property + "</b>" + ": " + propertyDescr[propertyKey];
    if (propertyDescription.includes("(Rating)"))
      propertyDescription = propertyDescription.replaceAll("(Rating)", property.split(" ")[1])

    propertyDescription = await TextEditor.enrichHTML(propertyDescription, {async: true})

    // Toggle expansion 
    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    }
    else {
      let div = $(`<div class="item-summary">${propertyDescription}</div>`);
      li.append(div.hide());
      div.slideDown(200);
    }
    li.toggleClass("expanded");
  }


  _onSortClick(ev)
  {
    let type = ev.currentTarget.dataset.type;

    type = type.includes(",") ? type.split(",") : [type]

    let items = type.reduce((prev, current) => prev.concat(this.actor.itemTags[current].map(i => i.toObject())), []);
    items = items.sort((a,b) => a.name < b.name ? -1 : 1);
    for(let i = 1; i < items.length; i++)
      items[i].sort = items[i-1].sort + 10000

    return this.actor.updateEmbeddedDocuments("Item", items);
  }

  /**
   * Summary for specific property selected - like a Quality description in the combat tab.
   * Works also for "Special" and "Special Ammo" properties - user entered values in the item
   * sheets.
   * 
   * 
   * @private
   * @param {Object} ev    ev triggered by clicking on range, reach, etc.
   */
  _expandInfo(ev) {
    ev.preventDefault();
    let li = $(ev.currentTarget).parents(".item");
    let classes = $(ev.currentTarget);
    let expansionText = "";

    let item = this.actor.items.get(li.attr("data-id"))
    // Breakdown weapon range bands for easy reference (clickable, see below)
    if (classes.hasClass("weapon-range")) {
      if (!game.settings.get("wfrp4e", "mooRangeBands"))
      expansionText =
        `<a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}">${item.range.bands[`${game.i18n.localize("Point Blank")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Point Blank")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Point Blank"]]}</a><br>
          <a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Short Range")}`].modifier}">${item.range.bands[`${game.i18n.localize("Short Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Short Range")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Short Range"]]}</a><br>
          <a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Normal")}`].modifier}">${item.range.bands[`${game.i18n.localize("Normal")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Normal")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Normal"]]}</a><br>
          <a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Long Range")}`].modifier}">${item.range.bands[`${game.i18n.localize("Long Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Long Range")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Long Range"]]}</a><br>
          <a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Extreme")}`].modifier}">${item.range.bands[`${game.i18n.localize("Extreme")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Extreme")}`].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Extreme"]]}</a><br>
          `

      //@HOUSE
      else {
        game.wfrp4e.utility.logHomebrew("mooRangeBands")
        expansionText =
        `<a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}">${item.range.bands[`${game.i18n.localize("Point Blank")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Point Blank")}`].range[1]} ${game.i18n.localize("yds")}: ${item.range.bands[`${game.i18n.localize("Point Blank")}`].modifier}</a><br>
          <a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Short Range")}`].modifier}">${item.range.bands[`${game.i18n.localize("Short Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Short Range")}`].range[1]} ${game.i18n.localize("yds")}: ${item.range.bands[`${game.i18n.localize("Short Range")}`].modifier}</a><br>
          <a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Normal")}`].modifier}">${item.range.bands[`${game.i18n.localize("Normal")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Normal")}`].range[1]} ${game.i18n.localize("yds")}: ${item.range.bands[`${game.i18n.localize("Normal")}`].modifier}</a><br>
          <a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Long Range")}`].modifier}">${item.range.bands[`${game.i18n.localize("Long Range")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Long Range")}`].range[1]} ${game.i18n.localize("yds")}: ${item.range.bands[`${game.i18n.localize("Long Range")}`].modifier}</a><br>
          <a class="range-click" data-range="${item.range.bands[`${game.i18n.localize("Extreme")}`].modifier}">${item.range.bands[`${game.i18n.localize("Extreme")}`].range[0]} ${game.i18n.localize("yds")} - ${item.range.bands[`${game.i18n.localize("Extreme")}`].range[1]} ${game.i18n.localize("yds")}: ${item.range.bands[`${game.i18n.localize("Extreme")}`].modifier}</a><br>
          `
      }
      //@/HOUSE

    }
    // Expand the weapon's group description
    else if (classes.hasClass("weapon-group")) {
      let weaponGroup = ev.target.text;
      let weaponGroupKey = "";
      weaponGroupKey = warhammer.utility.findKey(weaponGroup, game.wfrp4e.config.weaponGroups);
      expansionText = game.wfrp4e.config.weaponGroupDescriptions[weaponGroupKey];
    }
    // Expand the weapon's reach description
    else if (classes.hasClass("weapon-reach")) {
      let reach = ev.target.text;
      let reachKey;
      reachKey = warhammer.utility.findKey(reach, game.wfrp4e.config.weaponReaches);
      expansionText = game.wfrp4e.config.reachDescription[reachKey];
    }

    // Toggle expansion 
    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    }
    else {
      let div = $(`<div class="item-summary">${expansionText}</div>`);
      li.append(div.hide());
      div.slideDown(200);

      // When a rangeband is clicked, start a test at that difficulty
      div.on("click", ".range-click", ev => {
        let modifier = parseInt($(ev.currentTarget).attr("data-range"))

        let weapon = item
        if (weapon) {
          let options = {modify: { modifier } };
          this.actor.setupWeapon(weapon, options).then(setupData => {
            this.actor.weaponTest(setupData)
          });
        }
      })

    }
    li.toggleClass("expanded");
  }

  //#endregion

  /**
   * Duplicates an owned item given its id.
   * 
   * @param {Number} itemId   Item id of the item being duplicated
   */
  duplicateItem(itemId) {
    let item = this.actor.items.get(itemId).toObject()
    this.actor.createEmbeddedDocuments("Item", [item]);
  }

  async splitItem(itemId, amount) {
    let item = this.actor.items.get(itemId).toObject()
    let newItem = foundry.utils.duplicate(item)

    let oldQuantity = item.system.quantity.value;

    if (item.type == "cargo")
    {
      oldQuantity = item.system.encumbrance.value;
    }

    if (amount >= oldQuantity)
      return ui.notifications.notify(game.i18n.localize("Invalid Quantity"))

    if (item.type == "cargo")
    {
      newItem.system.encumbrance.value = amount;
      item.system.encumbrance.value -= amount;
    }
    else 
    {
      newItem.system.quantity.value = amount;
      item.system.quantity.value -= amount;
    }
    await this.actor.createEmbeddedDocuments("Item", [newItem]);
    this.actor.updateEmbeddedDocuments("Item", [item]);
  }


  toggleItemCheckbox(itemId, target) {
    let item = this.actor.items.get(itemId)
    return item.update({ [`${target}`]: !getProperty(item, target) })
  }
}