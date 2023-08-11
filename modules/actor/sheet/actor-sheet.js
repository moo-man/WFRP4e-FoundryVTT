import MarketWfrp4e from "../../apps/market-wfrp4e.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
import WFRP_Audio from "../../system/audio-wfrp4e.js"
import NameGenWfrp from "../../apps/name-gen.js";
import CharacteristicTest from "../../system/rolls/characteristic-test.js"
import EffectWfrp4e from "../../system/effect-wfrp4e.js";

/**
 * Provides the data and general interaction with Actor Sheets - Abstract class.
 *
 * ActorSheetWfrp4e provides the general interaction and data organization shared among all 
 * actor sheets, as this is an abstract class, inherited by either Character, NPC, or Creature
 * specific actor sheet classes. When rendering an actor sheet, getData() is called, which is
 * a large and key that prepares the actor data for display, processing the raw data
 * and items and compiling them into data to display on the sheet. Additionally, this class
 * contains all the main events that respond to sheet interaction in activateListeners().
 *
 * @see   ActorWfrp4e - Data and main computation model (this.actor)
 * @see   ActorSheetWfrp4eCharacter - Character sheet class
 * @see   ActorSheetWfrp4eNPC - NPC sheet class
 * @see   ActorSheetWfrp4eCreature - Creature sheet class
 */
export default class ActorSheetWfrp4e extends ActorSheet {

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.tabs = [{ navSelector: ".tabs", contentSelector: ".content", initial: "main" }]
    options.width = 576;
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
    this._saveScrollPos(); // Save scroll positions
    await super._render(force, options);
    this._setScrollPos();  // Set scroll positions

    // Add Tooltips
    this.element  .find(".close").attr({"data-tooltip" : game.i18n.localize("SHEET.Close"), "data-tooltip-direction" : "UP"});
    this.element  .find(".configure-sheet").attr({"data-tooltip" : game.i18n.localize("SHEET.Configure"), "data-tooltip-direction" : "UP"});
    this.element  .find(".configure-token").attr({"data-tooltip" : game.i18n.localize("SHEET.Token"), "data-tooltip-direction" : "UP"});
    this.element  .find(".import").attr({"data-tooltip" : game.i18n.localize("SHEET.Import"), "data-tooltip-direction" : "UP"});

    WFRP_Utility.replacePopoutTokens(this.element); // Opposed attackers show as tokens, replace popout versions with normal
    WFRP_Utility.addLinkSources(this.element);

    this._refocus(this._element)

  }

  /**
   * Saves all the scroll positions in the sheet for setScrollPos() to use
   * 
   * All elements in the sheet that use ".save-scroll" class has their position saved to
   * this.scrollPos array, which is used when rendering (rendering a sheet resets all 
   * scroll positions by default).
   */
  _saveScrollPos() {
    if (this.form === null)
      return;

    const html = $(this.form).parent();
    this.scrollPos = [];
    let lists = $(html.find(".save-scroll"));
    for (let list of lists) {
      this.scrollPos.push($(list).scrollTop());
    }
  }

  /**
   * Sets all scroll positions to what was saved by saveScrollPos()
   * 
   * All elements in the sheet that use ".save-scroll" class has their position set to what was
   * saved by saveScrollPos before rendering. 
   */
  _setScrollPos() {
    if (this.scrollPos) {
      const html = $(this.form).parent();
      let lists = $(html.find(".save-scroll"));
      for (let i = 0; i < lists.length; i++) {
        $(lists[i]).scrollTop(this.scrollPos[i]);
      }
    }
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
      WFRP_Utility.log("Could not refocus tabbed element on character sheet")
    }
  }

  /**
   * Provides the data to the template when rendering the actor sheet
   * 
   * This is called when rendering the sheet, where it calls the base actor class
   * to organize, process, and prepare all actor data for display. See ActorWfrp4e.prepare()
   * 
   * @returns {Object} sheetData    Data given to the template when rendering
   */
  async getData() {
    const sheetData = await super.getData();
    sheetData.system = sheetData.data.system // project system data so that handlebars has the same name and value paths

    sheetData.items = this.constructItemLists(sheetData)
    this.formatArmourSection(sheetData)

    this._addEncumbranceData(sheetData)

    this.filterActiveEffects(sheetData);
    this.addConditionData(sheetData);

    sheetData.attacker = this.actor.attacker;

    if (this.actor.type != "vehicle") {
      sheetData.effects.system = game.wfrp4e.utility.getSystemEffects();
    }

    sheetData.enrichment = await this._handleEnrichment()

    return sheetData;
  }

  async _handleEnrichment()
  {
      let enrichment = {}
      enrichment["system.details.biography.value"] = await TextEditor.enrichHTML(this.actor.system.details.biography.value, {async: true, secrets: this.actor.isOwner, relativeTo: this.actor})
      enrichment["system.details.gmnotes.value"] = await TextEditor.enrichHTML(this.actor.system.details.gmnotes.value, {async: true, secrets: this.actor.isOwner, relativeTo: this.actor})

      return expandObject(enrichment)
  }


  constructItemLists(sheetData) {

    let items = {}

    items.skills = {
      basic: sheetData.actor.getItemTypes("skill").filter(i => i.advanced.value == "bsc" && i.grouped.value == "noSpec"),
      advanced: sheetData.actor.getItemTypes("skill").filter(i => i.advanced.value == "adv" || i.grouped.value == "isSpec")
    }

    items.careers = sheetData.actor.getItemTypes("career").reverse()
    items.criticals = sheetData.actor.getItemTypes("critical")
    items.nonTrivialCriticals = items.criticals.filter(c => Number.isNumeric(c.system.wounds.value))
    items.diseases = sheetData.actor.getItemTypes("disease")
    items.injuries = sheetData.actor.getItemTypes("injury")
    items.mutations = sheetData.actor.getItemTypes("mutation")
    items.psychologies = sheetData.actor.getItemTypes("psychology")
    items.traits = sheetData.actor.getItemTypes("trait")
    items.extendedTests = sheetData.actor.getItemTypes("extendedTest")
    items.vehicleMods = sheetData.actor.getItemTypes("vehicleMod")

    items.grimoire = {
      petty: sheetData.actor.getItemTypes("spell").filter(i => i.lore.value == "petty" || i.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty")),
      lore: sheetData.actor.getItemTypes("spell").filter(i => (i.lore.value != "petty" && i.lore.value != game.i18n.localize("WFRP4E.MagicLores.petty")) || !i.lore.value)
    }

    items.prayers = {
      blessings: sheetData.actor.getItemTypes("prayer").filter(i => i.prayerType.value == "blessing"),
      miracles: sheetData.actor.getItemTypes("prayer").filter(i => i.prayerType.value == "miracle" || !i.prayerType.value)
    }

    items.equipped = {
      weapons: sheetData.actor.getItemTypes("weapon").filter(i => i.isEquipped),
      armour: sheetData.actor.getItemTypes("armour").filter(i => i.isEquipped)
    }

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
        items: sheetData.actor.getItemTypes("weapon"), // Array of items in the sectio.filter(i => !i.location.value)n
        toggle: true,                                 // Is there a toggle in the section? (Equipped, worn, etc.)
        toggleName: game.i18n.localize("Equipped"),   // What is the name of the toggle in the header
        show: false,                                  // Should this section be shown (if an item exists in this list, it is set to true)
        collapsed : collapsed?.weapons,
        dataType: "weapon"                            // What type of FVTT Item is in this section (used by the + button to add an item of this type)
      },
      armor: {
        label: game.i18n.localize("WFRP4E.TrappingType.Armour"),
        items: sheetData.actor.getItemTypes("armour"),
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        collapsed : collapsed?.armor,
        dataType: "armour"
      },
      ammunition: {
        label: game.i18n.localize("WFRP4E.TrappingType.Ammunition"),
        items: sheetData.actor.getItemTypes("ammunition"),
        show: false,
        collapsed : collapsed?.ammunition,
        dataType: "ammunition"
      },
      clothingAccessories: {
        label: game.i18n.localize("WFRP4E.TrappingType.ClothingAccessories"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "clothingAccessories"),
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        collapsed : collapsed?.clothingAccessories,
        dataType: "trapping"
      },
      booksAndDocuments: {
        label: game.i18n.localize("WFRP4E.TrappingType.BooksDocuments"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "booksAndDocuments"),
        show: false,
        collapsed : collapsed?.booksAndDocuments,
        dataType: "trapping"
      },
      toolsAndKits: {
        label: game.i18n.localize("WFRP4E.TrappingType.ToolsKits"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "toolsAndKits" || i.trappingType.value == "tradeTools"),
        show: false,
        collapsed : collapsed?.toolsAndKits,
        dataType: "trapping"
      },
      foodAndDrink: {
        label: game.i18n.localize("WFRP4E.TrappingType.FoodDrink"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "foodAndDrink"),
        show: false,
        collapsed : collapsed?.foodAndDrink,
        dataType: "trapping"
      },
      drugsPoisonsHerbsDraughts: {
        label: game.i18n.localize("WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "drugsPoisonsHerbsDraughts"),
        show: false,
        collapsed : collapsed?.drugsPoisonsHerbsDraughts,
        dataType: "trapping"
      },
      misc: {
        label: game.i18n.localize("WFRP4E.TrappingType.Misc"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "misc" || !i.trappingType.value),
        show: true,
        collapsed : collapsed?.misc,
        dataType: "trapping"
      },
      cargo: {
        label: game.i18n.localize("WFRP4E.TrappingType.Cargo"),
        items: sheetData.actor.getItemTypes("cargo"),
        show: false,
        collapsed : collapsed?.cargo,
        dataType: "cargo"
      }
    }

    // Money and ingredients are not in inventory object because they need more customization - note in actor-inventory.html that they do not exist in the main inventory loop
    const ingredients = {
      label: game.i18n.localize("WFRP4E.TrappingType.Ingredient"),
      items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "ingredient"),
      show: false,
      collapsed : collapsed?.ingredients,
      dataType: "trapping"
    }
    const money = {
      items: sheetData.actor.getItemTypes("money"),
      total: 0,     // Total coinage value
      show: true,
      collapsed : false
    }
    const containers = {
      items: sheetData.actor.getItemTypes("container"),
      show: false
    }
    const misc = {}
    let inContainers = []; // inContainers is the temporary storage for items within a container


    if (sheetData.actor.hasSpells || sheetData.actor.type == "vehicle")
      inContainers = this._filterItemCategory(ingredients, inContainers)
    else
      categories.misc.items = categories.misc.items.concat(ingredients.items)

    for (let itemCategory in categories)
      inContainers = this._filterItemCategory(categories[itemCategory], inContainers)

    inContainers = this._filterItemCategory(money, inContainers)
    inContainers = this._filterItemCategory(containers, inContainers)

    misc.totalShieldDamage = categories["weapons"].items.reduce((prev, current) => prev += current.damageToItem.shield, 0)

    money.total = money.items.reduce((prev, current) => { return prev + (current.coinValue.value * current.quantity.value) }, 0)

    categories.misc.show = true

    // ******************************** Container Setup ***********************************

    for (var cont of this.actor.getItemTypes("container")) // For each container
    {
      // All items referencing (inside) that container
      var itemsInside = inContainers.filter(i => i.location.value == cont.id);
      cont.carrying = itemsInside.filter(i => i.type != "container");    // cont.carrying -> items the container is carrying
      cont.packsInside = itemsInside.filter(i => i.type == "container"); // cont.packsInside -> containers the container is carrying
      cont.carries.current = itemsInside.reduce(function (prev, cur) {   // cont.holding -> total encumbrance the container is holding
        return Number(prev) + Number(cur.encumbrance.value);
      }, 0);
      cont.carries.current = Math.floor(cont.carries.current * 10) / 10;
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
      let conditions = duplicate(game.wfrp4e.config.statusEffects).map(e => new EffectWfrp4e(e));
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
    sheetData.effects.targeted = []

    for (let e of this.actor.actorEffects) {
      if (!e.show)
        continue
      if (e.isCondition) sheetData.effects.conditions.push(e)
      else if (e.disabled) sheetData.effects.disabled.push(e)
      else if (e.isTemporary) sheetData.effects.temporary.push(e)
      else if (e.isTargeted) sheetData.effects.targeted.push(e)
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
    let talents = this.actor.getItemTypes("talent")
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
          WFRP_Utility.log("Hit Location Format Error: " + e, true)
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
      renderTemplate("systems/wfrp4e/templates/dialog/cast-channel-dialog.hbs").then(dlg => {
        new Dialog({
          title: game.i18n.localize("DIALOG.CastOrChannel"),
          content: dlg,
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
                  await WFRP_Utility.sleep(200);
                  do {
                    if (test.item.cn.SL >= test.item.cn.value) {
                      break;
                    }
                    if (test.result.minormis || test.result.majormis || test.result.catastrophicmis) {
                      break;
                    }
                    test.context.messageId = null; // Clear message so new message is made
                    await test.roll();
                    await WFRP_Utility.sleep(200);
                  } while (true);
                }
              }
            }
          },
          default: 'cast'
        }).render(true);
      })
    }
  }


  _getSubmitData(updateData = {}) {
    this.actor.overrides = {}
    let data = super._getSubmitData(updateData);
    data = diffObject(flattenObject(this.actor.toObject(false)), data)
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
    html.find('.item-dropdown').click(this._onItemSummary.bind(this));

    // Item Properties - depending on the item property selected, display a dropdown definition, this can probably be consolidated...TODO
    html.find('.melee-property-quality, .melee-property-flaw, .ranged-property-quality, .ranged-property-flaw, .armour-quality, .armour-flaw').click(this._expandProperty.bind(this));

    // Other dropdowns - for other clickables (range, weapon group, reach) - display dropdown helpers
    html.find('.weapon-range, .weapon-group, .weapon-reach').click(this._expandInfo.bind(this));

    // Autoselect entire text 
    $("input[type=text]").focusin((ev) => {
      $(this).select();
      //this.focusElement = ev.target
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find("#configure-actor").click(ev => {
      new game.wfrp4e.apps.ActorSettings(this.actor).render(true);
    })


    // Use customized input interpreter when manually changing wounds 
    html.find(".wounds-value").change(ev => {
      this.modifyWounds(ev.target.value)
    })

    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.ch-value').click(this._onCharClick.bind(this));
    html.find('.rest-icon').click(this._onRestClick.bind(this));
    html.find(".ch-edit").change(this._onEditChar.bind(this));
    html.find(".name-gen").click(this._onNameClicked.bind(this));
    html.find('.ap-value').mousedown(this._onAPClick.bind(this));
    html.find('.stomp-icon').click(this._onStompClick.bind(this));
    html.find('.dodge-icon').click(this._onDodgeClick.bind(this));
    html.find('.repeater').click(this._onRepeaterClick.bind(this));
    html.find('.item-toggle').click(this._onItemToggle.bind(this));
    html.find('.item-remove').click(this._onItemRemove.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    html.find('.fist-icon').click(this._onUnarmedClick.bind(this));
    html.find('.item-create').click(this._onItemCreate.bind(this));
    html.find(".aggregate").click(this._onAggregateClick.bind(this));
    html.find('.worn-container').click(this._onWornClick.bind(this));
    html.find('.effect-toggle').click(this._onEffectEdit.bind(this));
    html.find('.effect-title').click(this._onEffectClick.bind(this));
    html.find('.spell-roll').mousedown(this._onSpellRoll.bind(this));
    html.find('.trait-roll').mousedown(this._onTraitRoll.bind(this));
    html.find(".skill-switch").click(this._onSkillSwitch.bind(this));
    html.find(".item-post").click(this._onItemPostClicked.bind(this));
    html.find('.ammo-selector').change(this._onSelectAmmo.bind(this));
    html.find('.randomize').click(this._onRandomizeClicked.bind(this));
    html.find('.input.species').change(this._onSpeciesEdit.bind(this));
    html.find('.effect-target').click(this._onEffectTarget.bind(this));
    html.find('.effect-delete').click(this._onEffectDelete.bind(this));
    html.find('.prayer-roll').mousedown(this._onPrayerRoll.bind(this));
    html.find('.effect-create').click(this._onEffectCreate.bind(this));
    html.find('.item-checkbox').click(this._onCheckboxClick.bind(this));
    html.find('.sl-counter').mousedown(this._onSpellSLClick.bind(this));
    html.find('.spell-selector').change(this._onSelectSpell.bind(this));
    html.find('.dollar-icon').click(this._onMoneyIconClicked.bind(this));
    html.find('.disease-roll').mousedown(this._onDiseaseRoll.bind(this));
    html.find(".shield-total").mousedown(this._onShieldClick.bind(this));
    html.find(".test-select").click(this._onExtendedTestSelect.bind(this));
    html.find('.loaded-checkbox').mousedown(this._onLoadedClick.bind(this));
    html.find('.advance-diseases').click(this._onAdvanceDisease.bind(this));
    html.find('.memorized-toggle').click(this._onMemorizedClick.bind(this));
    html.find('.improvised-icon').click(this._onImprovisedClick.bind(this));
    html.find(".extended-SL").mousedown(this._onExtendedSLClick.bind(this));
    html.find(".condition-click").click(this._onConditionClicked.bind(this));
    html.find('.quantity-click').mousedown(this._onQuantityClick.bind(this));
    html.find('.weapon-item-name').click(this._onWeaponNameClick.bind(this));
    html.find(".armour-total").mousedown(this._onArmourTotalClick.bind(this));
    html.find('.auto-calc-toggle').mousedown(this._onAutoCalcToggle.bind(this));
    html.find('.weapon-damage').mousedown(this._onWeaponDamageClick.bind(this));
    html.find('.skill-advances').change(this._onChangeSkillAdvances.bind(this));
    html.find(".condition-toggle").mousedown(this._onConditionToggle.bind(this));
    html.find('.toggle-enc').click(this._onToggleContainerEncumbrance.bind(this));
    html.find('.ingredient-selector').change(this._onSelectIngredient.bind(this));
    html.find('.injury-duration').mousedown(this._onInjuryDurationClick.bind(this));
    html.find(".system-effect-select").change(this._onSystemEffectChanged.bind(this));
    html.find(".condition-value").mousedown(this._onConditionValueClicked.bind(this));
    html.find('.metacurrency-value').mousedown(this._onMetaCurrrencyClick.bind(this));
    html.find('.skill-total, .skill-select').mousedown(this._onSkillClick.bind(this));
    html.find(".tab.inventory .item .item-name").mousedown(this._onItemSplit.bind(this));
    html.find('.skill-advances, .ch-edit').focusin(this._saveFocus.bind(this));
    html.find(".attacker-remove").click(this._onAttackerRemove.bind(this))
    html.find(".currency-convert-right").click(this._onConvertCurrencyClick.bind(this))
    html.find(".sort-items").click(this._onSortClick.bind(this))
    html.find(".invoke").click(this._onInvokeClick.bind(this))
    html.find(".group-actions").click(this._toggleGroupAdvantageActions.bind(this))
    html.find(".weapon-property .inactive").click(this._toggleWeaponProperty.bind(this))
    html.find(".section-collapse").click(this._toggleSectionCollapse.bind(this))

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

    html.find('.mount-toggle').click(this._onMountToggle.bind(this))
    html.find('.mount-remove').click(this._onMountRemove.bind(this))


    html.find('.mount-section').click(ev => {
      this.actor.mount.sheet.render(true)
    })

    // ---- Listen for custom entity links -----
    html.on("click", ".chat-roll", WFRP_Utility.handleRollClick.bind(WFRP_Utility))
    html.on("click", ".symptom-tag", WFRP_Utility.handleSymptomClick.bind(WFRP_Utility))
    html.on("click", ".condition-chat", WFRP_Utility.handleConditionClick.bind(WFRP_Utility))
    html.on('mousedown', '.table-click', WFRP_Utility.handleTableClick.bind(WFRP_Utility))
    html.on('mousedown', '.pay-link', WFRP_Utility.handlePayClick.bind(WFRP_Utility))
    html.on('mousedown', '.credit-link', WFRP_Utility.handleCreditClick.bind(WFRP_Utility))
    html.on('mousedown', '.corruption-link', WFRP_Utility.handleCorruptionClick.bind(WFRP_Utility))
    html.on('mousedown', '.fear-link', WFRP_Utility.handleFearClick.bind(WFRP_Utility))
    html.on('mousedown', '.terror-link', WFRP_Utility.handleTerrorClick.bind(WFRP_Utility))
    html.on('mousedown', '.exp-link', WFRP_Utility.handleExpClick.bind(WFRP_Utility))

    html.on("click", ".use-grp-adv", this._onUseGrpAdvAction.bind(this))

  }

  _getItemId(ev) {
    return $(ev.currentTarget).parents(".item").attr("data-item-id")
  }

  //#region ROLLING
  //@@@@@@@@@ ROLLING @@@@@@@@@@@/

  _onCharClick(ev) {
    ev.preventDefault();
    let characteristic = ev.currentTarget.attributes["data-char"].value;
    this.actor.setupCharacteristic(characteristic).then(setupData => {
      this.actor.basicTest(setupData)
    })
  }

  _onSkillClick(ev) {
    let itemId = this._getItemId(ev);
    let skill = this.actor.items.get(itemId);

    if (ev.button == 0) {
      skill = this.actor.items.get(itemId);
      this.actor.setupSkill(skill).then(setupData => {
        this.actor.basicTest(setupData)
      })
    }
    else if (ev.button == 2) {
      skill.sheet.render(true)
    }
  }

  _onExtendedTestSelect(ev) {
    let itemId = this._getItemId(ev)
    let item = this.actor.items.get(itemId)
    this.actor.setupExtendedTest(item)
  }

  _onWeaponNameClick(ev) {
    ev.preventDefault();
    let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
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
      this.actor.setupSkill(game.i18n.localize("NAME.Dodge")).then(setupData => {
        this.actor.basicTest(setupData)
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
    let skill = this.actor.getItemTypes("skill").find(s => s.name == game.i18n.localize("NAME.Endurance"));
    let options = {rest: true, tb: this.actor.characteristics.t.bonus}
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

    let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let trait = this.actor.items.get(itemId)
    this.actor.setupTrait(trait).then(setupData => {
      this.actor.traitTest(setupData)
    })
  }
  _onSpellRoll(ev) {
    ev.preventDefault();
    if (ev.button == 2)
      return this._onItemSummary(ev);

    let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let spell = this.actor.items.get(itemId)
    this.spellDialog(spell)
  }

  _onPrayerRoll(ev) {
    ev.preventDefault();
    if (ev.button == 2)
      return this._onItemSummary(ev);

    let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let prayer = this.actor.items.get(itemId)
    this.actor.setupPrayer(prayer).then(setupData => {
      this.actor.prayerTest(setupData)
    })
  }

  //#endregion

  //#region SHEET INTERACTIONS
  //@@@@@@@@@ INTERACTIONS @@@@@@@@@@@/

  _saveFocus(ev) {
    if (ev.target.attributes["data-item-id"])
      this.saveFocus = `data-item-id="${ev.target.attributes["data-item-id"].value}`

    if (ev.target.attributes["data-char"])
      this.saveFocus = `data-char="${ev.target.attributes["data-char"].value}`
  }

  async _onEditChar(ev) {
    ev.preventDefault();
    let characteristics = duplicate(this.actor._source.system.characteristics);
    let ch = ev.currentTarget.attributes["data-char"].value;
    let newValue = Number(ev.target.value);

    if (this.actor.type == "character")
    {
      let resolved = await WFRP_Utility.advancementDialog(ch, newValue, "characteristic", this.actor)

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
    return this.actor.update({ "system.characteristics": characteristics })
  }

  async _onChangeSkillAdvances(ev) {
    ev.preventDefault()
    let itemId = ev.target.attributes["data-item-id"].value;
    let itemToEdit = this.actor.items.get(itemId);
    if (this.actor.type == "character")
    {
      let resolved = await WFRP_Utility.advancementDialog(
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
    itemToEdit.update({ "system.advances.value": Number(ev.target.value) })
  }

  _onSelectAmmo(ev) {
    let itemId = ev.target.attributes["data-item-id"].value;
    const item = this.actor.items.get(itemId);
    WFRP_Audio.PlayContextAudio({ item, action: "load" })
    return item.update({ "system.currentAmmo.value": ev.target.value });
  }

  _onSelectSpell(ev) {
    let itemId = ev.target.attributes["data-item-id"].value;
    const ing = this.actor.items.get(itemId);
    return ing.update({ "system.spellIngredient.value": ev.target.value });
  }

  _onSelectIngredient(ev) {
    let itemId = ev.target.attributes["data-item-id"].value;
    const spell = this.actor.items.get(itemId);
    return spell.update({ "system.currentIng.value": ev.target.value });
  }

  _onSkillSwitch(ev) {
    this.actor.setFlag("wfrp4e", "showExtendedTests", !getProperty(this.actor, "flags.wfrp4e.showExtendedTests"))
    this.render(true)
  }

  _onExtendedSLClick(ev) {
    let itemId = this._getItemId(ev)
    let item = this.actor.items.get(itemId)
    let SL
    if (ev.button == 0) SL = item.SL.current + 1;
    else if (ev.button == 2) SL = item.SL.current - 1;

    if (SL < 0 && !item.negativePossible.value)
      SL = 0
    return item.update({ "system.SL.current": SL })
  }

  _onAPClick(ev) {
    let itemId = this._getItemId(ev);
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
    let itemId = this._getItemId(ev);
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

    let armourTraits = this.actor.getItemTypes("trait").filter(i => i.name.toLowerCase() == game.i18n.localize("NAME.Armour").toLowerCase()).map(i => i.toObject());
    let armourItems = this.actor.getItemTypes("armour").filter(i => i.isEquipped).sort((a, b) => a.sort - b.sort)
    let armourToDamage;
    let usedTrait = false;
    // Damage traits first
    for (let armourTrait of armourTraits) {
      // If APDamage flag doesn't exist
      if (armourTrait && !getProperty(armourTrait, "flags.wfrp4e.APdamage")) setProperty(armourTrait, "flags.wfrp4e.APdamage", { head: 0, body: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0 })
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
    let shields = this.actor.getItemTypes("weapon").filter(i => i.isEquipped && i.properties.qualities.shield)
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
    let itemId = this._getItemId(ev);
    const spell = this.actor.items.get(itemId)


    // unmemorized
    if (spell.memorized.value)
    {
      WFRP_Audio.PlayContextAudio({ item: spell, action: "unmemorize" })
      return spell.update({ "system.memorized.value": !spell.memorized.value })
    }


    let memorize = true;
    if (this.actor.type == "character") {
      memorize = await WFRP_Utility.memorizeCostDialog(spell, this.actor)
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
    let itemId = this._getItemId(ev);
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

  async _onAutoCalcToggle(ev) {
    let toggle = ev.target.attributes["toggle-type"].value;
    if (ev.button == 2) {
      let newFlags = duplicate(this.actor.flags);
      if (toggle == "walk") newFlags.autoCalcWalk = !newFlags.autoCalcWalk;

      else if (toggle == "run")
        newFlags.autoCalcRun = !newFlags.autoCalcRun;
      else if (toggle == "wounds")
        newFlags.autoCalcWounds = !newFlags.autoCalcWounds;
      else if (toggle == "critW")
        newFlags.autoCalcCritW = !newFlags.autoCalcCritW;
      else if (toggle == "corruption")
        newFlags.autoCalcCorruption = !newFlags.autoCalcCorruption;
      else if (toggle == "encumbrance")
        newFlags.autoCalcEnc = !newFlags.autoCalcEnc;

      return this.actor.update({ 'flags': newFlags })
    }
  }

  async _onDiseaseRoll(ev) {
    let itemId = this._getItemId(ev);
    const disease = this.actor.items.get(itemId).toObject()
    let type = ev.target.dataset["type"];
    if (type == "incubation")
      disease.system.duration.active = false;
    if (!isNaN(disease.system[type].value)) {
      let number = Number(disease.system[type].value)
      if (ev.button == 0)
        return this.actor.decrementDisease(disease)
      else
        number++
      disease.system[type].value = number;
      return this.actor.updateEmbeddedDocuments("Item", [disease])
    }
    else if (ev.button == 0) {
      try {
        let rollValue = (await new Roll(disease.system[type].value).roll()).total
        disease.system[type].value = rollValue
        if (type == "duration")
          disease.system.duration.active = true
      }
      catch
      {
        return ui.notifications.error(game.i18n.localize("ERROR.ParseDisease"))
      }
      return this.actor.updateEmbeddedDocuments("Item", [disease])
    }
  }

  async _onInjuryDurationClick(ev) {
    let itemId = this._getItemId(ev);
    let injury = this.actor.items.get(itemId).toObject()
    if (!isNaN(injury.system.duration.value)) {
      if (ev.button == 0)
        return this.actor.decrementInjury(injury)
      else injury.system.duration.value++
      return this.actor.updateEmbeddedDocuments("Item", [injury])
    }
    else {
      try {
        let rollValue = (await new Roll(injury.system.duration.value).roll()).total
        injury.system.duration.value = rollValue;
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

  _onItemEdit(ev) {
    let itemId = this._getItemId(ev);
    const item = this.actor.items.get(itemId)
    return item.sheet.render(true)
  }

  _onEffectClick(ev) {
    let id = this._getItemId(ev);
    let effect = this.actor.actorEffects.get(id)
    return effect.sheet.render(true)
  }

  _onEffectDelete(ev) {
    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    return this.actor.deleteEmbeddedDocuments("ActiveEffect", [id])
  }

  _onEffectEdit(ev) {
    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let effect = this.actor.actorEffects.get(id)
    return effect.update({ disabled: !effect.disabled })
  }


  _onEffectTarget(ev) {
    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    
    let effect = this.actor.populateEffect(id);
    if (effect.trigger == "apply")
      game.wfrp4e.utility.applyEffectToTarget(effect)
    else {
      game.wfrp4e.utility.runSingleEffect(effect, this.actor, effect.item, {actor : this.actor, effect, item : effect.item});
    }
  }

  _onAdvanceDisease(ev) {
    return this.actor.decrementDiseases()
  }

  _onItemDelete(ev) {
    let li = $(ev.currentTarget).parents(".item"), itemId = li.attr("data-item-id");
    if (this.actor.items.get(itemId).name == "Boo") {
      AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}squeek.wav` }, false)
      return
    }
    renderTemplate('systems/wfrp4e/templates/dialog/delete-item-dialog.hbs').then(html => {
      new Dialog({
        title: game.i18n.localize("Delete Confirmation"), content: html, buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>', label: game.i18n.localize("Yes"), callback: async dlg => {
              await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
              await this.actor.deleteEffectsFromItem(itemId);
              li.slideUp(200, () => this.render(false))
            }
          }, cancel: { icon: '<i class="fas fa-times"></i>', label: game.i18n.localize("Cancel") },
        }, default: 'Yes'
      }).render(true)
    })
  }

  _onItemRemove(ev) {
    let li = $(ev.currentTarget).parents(".item"), itemId = li.attr("data-item-id");
    const item = this.actor.items.get(itemId)
    return item.update({ "system.location.value": "" })
  }

  _onToggleContainerEncumbrance(ev) {
    let itemId = this._getItemId(ev);
    const item = this.actor.items.get(itemId)
    return item.update({ "system.countEnc.value": !item.countEnc.value })
  }

  _onItemToggle(ev) {
    let itemId = this._getItemId(ev);
    let item = this.actor.items.get(itemId).toObject()
    let equippedState;
    if (item.type == "armour") {
      item.system.worn.value = !item.system.worn.value;
      equippedState = item.system.worn.value
    } else if (item.type == "weapon") {
      item.system.equipped = !item.system.equipped;
      equippedState = item.system.equipped
      let newEqpPoints = item.system.twohanded.value ? 2 : 1
      if (game.settings.get("wfrp4e", "limitEquippedWeapons") && this.actor.type != "vehicle")
        if (this.actor.equipPointsUsed + newEqpPoints > this.actor.equipPointsAvailable && equippedState) {
          AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}/no.wav` }, false)
          return ui.notifications.error(game.i18n.localize("ErrorLimitedWeapons"))
        }
      setProperty(item, "system.offhand.value", false)
    }
    else if (item.type == "trapping" && item.system.trappingType.value == "clothingAccessories") {
      item.system.worn = !item.system.worn;
      equippedState = item.system.worn
    }
    WFRP_Audio.PlayContextAudio({ item: this.actor.items.get(itemId), action: "equip", outcome: equippedState })
    this.actor.updateEmbeddedDocuments("Item", [item])
  }

  _onCheckboxClick(ev) {
    let itemId = this._getItemId(ev);
    let target = $(ev.currentTarget).attr("data-target")
    this.toggleItemCheckbox(itemId, target)
  }

  _onLoadedClick(ev) {
    let itemId = this._getItemId(ev);
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
    let itemId = this._getItemId(ev);
    let item = this.actor.items.get(itemId).toObject()
    item.system.loaded.value = !item.system.loaded.value
    if (item.system.loaded.value) item.system.loaded.amt = item.system.loaded.max || 1
    this.actor.updateEmbeddedDocuments("Item", [item])
  }

  _onWornClick(ev) {
    let itemId = this._getItemId(ev);
    let item = this.actor.items.get(itemId)
    return item.update({ "system.worn.value": !item.worn.value })
  }

  _onQuantityClick(ev) {
    let itemId = this._getItemId(ev);
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
    let items = this.actor.getItemTypes(itemType).map(i => i.toObject())
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
                return this.splitItem(this._getItemId(ev), amt)
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
    if (game.wfrp4e.config.statusEffects.find(e => e.id == condKey).flags.wfrp4e.value == null) {
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
    let speciesKey = WFRP_Utility.findKey(species, game.wfrp4e.config.species) || species
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
    let species = this.actor.details.species.value;
    let subspecies = this.actor.details.species.subspecies;
    try {
      switch (ev.target.text) {
        case game.i18n.localize("RANDOMIZER.C"): let creatureMethod = false;
          let characteristics = this.actor.toObject().system.characteristics;
          if (this.actor.type == "creature" || !species) creatureMethod = true;
          if (!creatureMethod) {
            let averageCharacteristics = await WFRP_Utility.speciesCharacteristics(species, true, subspecies);
            for (let char in characteristics) {
              if (characteristics[char].initial != averageCharacteristics[char].value) creatureMethod = true
            }
          }
          if (!creatureMethod) {
            let rolledCharacteristics = await WFRP_Utility.speciesCharacteristics(species, false, subspecies);
            for (let char in rolledCharacteristics) {
              characteristics[char].initial = rolledCharacteristics[char].value
            }
            await this.actor.update({ "system.characteristics": characteristics })
          }
          else if (creatureMethod) {
            let roll = new Roll("2d10");
            await roll.roll();
            let characteristics = this.actor.toObject().system.characteristics;
            for (let char in characteristics) {
              if (characteristics[char].initial == 0)
                continue
              characteristics[char].initial -= 10;
              characteristics[char].initial += (await roll.reroll()).total;
              if (characteristics[char].initial < 0)
                characteristics[char].initial = 0
            }
            await this.actor.update({ "system.characteristics": characteristics })
          }
          return

        case game.i18n.localize("RANDOMIZER.S"):
          this.actor._advanceSpeciesSkills()
          return
        case game.i18n.localize("RANDOMIZER.T"):
          this.actor._advanceSpeciesTalents()
          return
      }
    }
    catch (error) {
      WFRP_Utility.log("Could not randomize: " + error, true)
    }
  }

  // Add condition description dropdown
  async _onConditionClicked(ev) {
    ev.preventDefault();
    let li = $(ev.currentTarget).parents(".sheet-condition"),
      elementToAddTo = $(ev.currentTarget).parents(".condition-list"),
      condkey = li.attr("data-cond-id"), expandData = await TextEditor.enrichHTML(`<h2>${game.wfrp4e.config.conditions[condkey]}</h2>` + game.wfrp4e.config.conditionDescriptions[condkey], {async: true})

    if (elementToAddTo.hasClass("expanded")) {
      let summary = elementToAddTo.parents(".effects").children(".item-summary");
      summary.slideUp(200, () => summary.remove())
    }
    else {
      let div = $(`<div class="item-summary">${expandData}</div>`);
      if (game.wfrp4e.config.conditionScripts[condkey] && this.actor.hasCondition(condkey)) {
        let button = $(`<br><br><a class="condition-script">${game.i18n.format("CONDITION.Apply", { condition: game.wfrp4e.config.conditions[condkey] })}</a>`)
        div.append(button)
      }
      elementToAddTo.after(div.hide());
      div.slideDown(200);
      div.on("click", ".condition-script", async ev => {
        ui.sidebar.activateTab("chat")
        ChatMessage.create(await game.wfrp4e.config.conditionScripts[condkey](this.actor))
      })
    }
    elementToAddTo.toggleClass("expanded")
  }
  _onItemPostClicked(ev) {
    let itemId = this._getItemId(ev);
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
    let money = this.actor.getItemTypes("money");
    let newMoney = MarketWfrp4e.consolidateMoney(money.map(i => i.toObject()));
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
      data = duplicate(header.dataset);

    if (data.type == "effect")
      return this.actor.createEmbeddedDocuments("ActiveEffect", [{ name: game.i18n.localize("New Effect") }])

    if (data.type == "vehicle-role" && this.actor.type == "vehicle") {
      let roles = duplicate(this.actor.roles)
      let newRole = { name: game.i18n.localize("NewRole"), actor: "", test: "", testLabel: "" }
      roles.push(newRole)
      return this.actor.update({ "system.roles": roles })
    }

    // Conditional for creating skills from the skills tab - sets to the correct skill type depending on column
    if (ev.currentTarget.attributes["data-type"].value == "skill") {
      data = mergeObject(data,
        {
          "system.advanced.value": ev.currentTarget.attributes["data-skill-type"].value
        });
    }

    if (data.type == "trapping")
      data = mergeObject(data,
        {
          "system.trappingType.value": ev.currentTarget.attributes["item-section"].value
        })

    if (data.type == "ingredient") {
      data = mergeObject(data,
        {
          "system.trappingType.value": "ingredient"
        })
      data.type = "trapping"
    }

    // Conditional for creating spells/prayers from their tabs, create the item with the correct type
    else if (data.type == "spell" || data.type == "prayer") {
      let itemSpecification = ev.currentTarget.attributes[`data-${data.type}-type`].value;

      if (data.type == "spell") {
        data = mergeObject(data,
          {
            "system.lore.value": itemSpecification
          });
      }
      else if (data.type == "prayer") {
        data = mergeObject(data,
          {
            "system.type.value": itemSpecification
          });
      }
    }
    data["img"] = "systems/wfrp4e/icons/blank.png";
    data["name"] = `${game.i18n.localize("New")} ${data.type.capitalize()}`;
    this.actor.createEmbeddedDocuments("Item", [data]);
  }

  _onEffectCreate(ev) {
    let type = ev.currentTarget.attributes["data-effect"].value
    let effectData = { name: game.i18n.localize("New Effect") }
    if (type == "temporary") {
      effectData["duration.rounds"] = 1;
    }
    if (type == "applied") {
      effectData["flags.wfrp4e.effectApplication"] = "apply"
    }
    this.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
  }


  _onInvokeClick(ev) {
    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    game.wfrp4e.utility.invokeEffect(this.actor, id)
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

    // Owned Items
    if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    // Active Effect
    if ( li.dataset.effectId ) {
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
    else if (dragData.type == "postedItem")
      this.actor.createEmbeddedDocuments("Item", [dragData.payload]);

    else if (dragData.type == "generation")
      this._onDropCharGen(dragData)

    else if (dragData.type == "lookup")
      this._onDropLookupItem(dragData)

    else if (dragData.type == "experience")
      this._onDropExperience(dragData)

    else if (dragData.type == "money")
      this._onDropMoney(dragData)

    else if (dragData.type == "wounds")
      this.modifyWounds(`+${dragData.payload}`)

    else if (dragData.type == "condition")
      this.actor.addCondition(`${dragData.payload}`)

    else // If none of the above, just process whatever was dropped upstream
      super._onDrop(ev)
  }

  async _onDropIntoContainer(ev) {
    let dragData = JSON.parse(ev.dataTransfer.getData("text/plain"));
    let dropID = $(ev.target).parents(".item").attr("data-item-id");

    let item = (await Item.implementation.fromDropData(dragData))?.toObject()

    item.system.location.value = dropID; // Change location value of item to the id of the container it is in

    //  this will unequip/remove items like armor and weapons when moved into a container
    if (item.type == "armour")
      item.system.worn.value = false;
    if (item.type == "weapon")
      item.system.equipped = false;
    if (item.type == "trapping" && item.system.trappingType.value == "clothingAccessories")
      item.system.worn = false;


    return this.actor.updateEmbeddedDocuments("Item", [item]);
  }

  // Dropping a character creation result
  _onDropCharGen(dragData) {
    let data = duplicate(this.actor._source.system);
    if (dragData.generationType == "attributes") // Characteristsics, movement, metacurrency, etc.
    {
      data.details.species.value = dragData.payload.species;
      data.details.species.subspecies = dragData.payload.subspecies;
      data.details.move.value = dragData.payload.movement;

      if (this.actor.type == "character") // Other actors don't care about these values
      {
        data.status.fate.value = dragData.payload.fate;
        data.status.fortune.value = dragData.payload.fate;
        data.status.resilience.value = dragData.payload.resilience;
        data.status.resolve.value = dragData.payload.resilience;
        data.details.experience.total += dragData.payload.exp;
        data.details.experience.log = this.actor._addToExpLog(dragData.payload.exp, "Character Creation", undefined, data.details.experience.total)
      }
      for (let c in game.wfrp4e.config.characteristics) {
        data.characteristics[c].initial = dragData.payload.characteristics[c].value
      }
      return this.actor.update({ "data": data })
    }
    else if (dragData.generationType === "details") // hair, name, eyes
    {
      data.details.eyecolour.value = dragData.payload.eyes
      data.details.haircolour.value = dragData.payload.hair
      data.details.age.value = dragData.payload.age;
      data.details.height.value = dragData.payload.height;
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
    let system = duplicate(this.actor._source.system);
    system.details.experience.total += dragData.payload;
    system.details.experience.log = this.actor._addToExpLog(dragData.payload, "Character Creation", undefined, system.details.experience.total);
    this.actor.update({ "system": system })
  }

  // From Income results - drag money value over to add
  _onDropMoney(dragData) {
    // Money string is in the format of <amt><type>, so 12b, 5g, 1.5g
    let moneyString = dragData.payload;
    let type = moneyString.slice(-1);
    let amt;
    // Failure means divide by two, so mark whether we should add half a gold or half a silver, just round pennies
    let halfS = false, halfG = false
    if (type === "b")
      amt = Math.round(moneyString.slice(0, -1));
    else if (type === "s") {
      if (moneyString.slice(0, -1).includes("."))
        halfS = true;
      amt = Math.floor(moneyString.slice(0, -1))
    }
    else if (type === "g") {
      if (moneyString.slice(0, -1).includes("."))
        halfG = true;
      amt = Math.floor(moneyString.slice(0, -1))
    }
    let money = this.actor.getItemTypes("money").map(m => m.toObject());

    let moneyItem;
    switch (type) {
      case 'b':
        moneyItem = money.find(i => i.name === game.i18n.localize("NAME.BP"));
        break;
      case 's':
        moneyItem = money.find(i => i.name === game.i18n.localize("NAME.SS"));
        break;
      case 'g':
        moneyItem = money.find(i => i.name === game.i18n.localize("NAME.GC"));
        break;
    }

    // If 0, means they failed the roll by -6 or more, delete all money
    if (!amt && !halfG && !halfS)
      money.forEach(m => m.system.quantity.value = 0);
    else // Otherwise, add amount to designated type
      moneyItem.system.quantity.value += amt;

    // add halves
    if (halfS)
      money.find(i => i.name === game.i18n.localize("NAME.BP")).system.quantity.value += 6;
    if (halfG)
      money.find(i => i.name === game.i18n.localize("NAME.SS")).system.quantity.value += 10;

    this.actor.updateEmbeddedDocuments("Item", money);
  }

  _onConvertCurrencyClick(ev) {
    let type = ev.currentTarget.dataset.type
    let money = this.actor.getItemTypes("money").map(m => m.toObject());

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
      item = this.actor.items.get(li.attr("data-item-id"));
    // Call the item's expandData() which gives us what to display
    let expandData = await item.getExpandData(
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


      if (expandData.targetEffects.length) {
        let effectButtons = expandData.targetEffects.map(e => `<a class="apply-effect" data-item-id=${item.id} data-effect-id=${e.id}>${game.i18n.format("SHEET.ApplyEffect", { effect: e.name })}</a>`)
        let effects = $(`<div>${effectButtons}</div>`)
        div.append(effects)
      }
      if (expandData.invokeEffects.length) {
        let effectButtons = expandData.invokeEffects.map(e => `<a class="invoke-effect" data-item-id=${item.id} data-effect-id=${e.id}>${game.i18n.format("SHEET.InvokeEffect", { effect: e.name })}</a>`)
        let effects = $(`<div>${effectButtons}</div>`)
        div.append(effects)
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
    let li = $(ev.currentTarget).parents(".item"),
    item = this.actor.items.get(li.attr("data-item-id"));
    let index = ev.currentTarget.dataset.index;
    let inactive = Object.values(item.properties.inactiveQualities);

    // Find clicked quality
    let toggled = inactive[index];

    // Find currently active
    let qualities = duplicate(item.system.qualities.value);

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
      let skill = this.actor.getItemTypes("skill").find(i => i.name === ev.target.text.trim())
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

    html.on("click", ".apply-effect", async ev => {

      let effectId = ev.target.dataset["effectId"]
      let itemId = ev.target.dataset["itemId"]

      let effect = this.actor.populateEffect(effectId, itemId)
      let item = this.actor.items.get(itemId)

      if (effect.flags.wfrp4e?.reduceQuantity && game.user.targets.size > 0) // Check targets as we don't want to decrease when we know it won't get applied
      {
        if (item.quantity.value > 0)
          await item.update({"system.quantity.value" : item.quantity.value - 1})
        else 
          throw ui.notifications.error(game.i18n.localize("EFFECT.QuantityError"))
      }

      if ((item.range && item.range.value.toLowerCase() == game.i18n.localize("You").toLowerCase()) && (item.target && item.target.value.toLowerCase() == game.i18n.localize("You").toLowerCase()))
        game.wfrp4e.utility.applyEffectToTarget(effect, [{ actor: this.actor }]) // Apply to caster (self) 
      else
        game.wfrp4e.utility.applyEffectToTarget(effect)
    })

    html.on("click", ".invoke-effect", async ev => {

      let effectId = ev.target.dataset["effectId"]
      let itemId = ev.target.dataset["itemId"]

      game.wfrp4e.utility.invokeEffect(this.actor, effectId, itemId)
    })
    // Respond to template button clicks
    html.on("mousedown", '.aoe-template', ev => {

      let actorId = ev.target.dataset["actorId"]
      let itemId = ev.target.dataset["itemId"]

      AOETemplate.fromString(ev.target.text, actorId, itemId, false).drawPreview(ev);
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
      properties = mergeObject(WFRP_Utility.qualityList(), WFRP_Utility.flawList()), // Property names
      propertyDescr = Object.assign(duplicate(game.wfrp4e.config.qualityDescriptions), game.wfrp4e.config.flawDescriptions); // Property descriptions
    
    let item = this.actor.items.get(li.attr("data-item-id")).toObject()

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
      this.actor.items.get(li.attr("data-item-id")).toObject()
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
      this.actor.items.get(li.attr("data-item-id"))
      // Add the special value to the object so that it can be looked up
      propertyDescr = Object.assign(propertyDescr,
        {
          "Special": item.system.special.value
        });
      propertyKey = "Special";
    }
    else // Otherwise, just lookup the key for the property and use that to lookup the description
    {
      propertyKey = WFRP_Utility.findKey(WFRP_Utility.parsePropertyName(property), properties)
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

    let items = type.reduce((prev, current) => prev.concat(this.actor.getItemTypes(current).map(i => i.toObject())), []);
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

    let item = this.actor.items.get(li.attr("data-item-id"))
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
      weaponGroupKey = WFRP_Utility.findKey(weaponGroup, game.wfrp4e.config.weaponGroups);
      expansionText = game.wfrp4e.config.weaponGroupDescriptions[weaponGroupKey];
    }
    // Expand the weapon's reach description
    else if (classes.hasClass("weapon-reach")) {
      let reach = ev.target.text;
      let reachKey;
      reachKey = WFRP_Utility.findKey(reach, game.wfrp4e.config.weaponReaches);
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
    let newItem = duplicate(item)
    if (amount >= item.system.quantity.value)
      return ui.notifications.notify(game.i18n.localize("Invalid Quantity"))

    newItem.system.quantity.value = amount;
    item.system.quantity.value -= amount;
    await this.actor.createEmbeddedDocuments("Item", [newItem]);
    this.actor.updateEmbeddedDocuments("Item", [item]);
  }


  toggleItemCheckbox(itemId, target) {
    let item = this.actor.items.get(itemId)
    return item.update({ [`${target}`]: !getProperty(item, target) })
  }
}