import MarketWfrp4e from "../../apps/market-wfrp4e.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
import ActiveEffectWfrp4e from "../../system/effect-wfrp4e.js"
import WFRP_Audio from "../../system/audio-wfrp4e.js"
import NameGenWfrp from "../../apps/name-gen.js";

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
   * Iterates through the Owned Items, processes them and organizes them into containers.
   * 
   * This behemoth of a function goes through all Owned Items, separating them into individual arrays
   * that the html templates use. Before adding them into the array, they are typically processed with
   * the actor data, which can either be a large function itself (see prepareWeaponCombat) or not, such
   * as career items which have minimal processing. These items, as well as some auxiliary data (e.g.
   * encumbrance, AP) are bundled into an return object
   * 
   */


  prepare() {

    try {
      if (this.data.type != "vehicle" && this.isMounted)
        this.prepareData(); // reprepare just in case any mount changes occurred
    }
    catch (e) {
      console.error("Error repreparing data: " + e)
    }

    let preparedData = duplicate(this.data)

    // Change out hit locations if using custom table
    for (let loc in preparedData.AP) {
      if (loc == "shield")
        continue
      let row = game.wfrp4e.tables[preparedData.data.details.hitLocationTable.value].rows.find(r => r.result == loc)
      if (row)
        preparedData.AP[loc].label = game.i18n.localize(row.description)
      else
        preparedData.AP[loc].show = false;
    }


    return preparedData;
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
    $(this._element).find(".close").attr("title", game.i18n.localize("SHEET.Close"));
    $(this._element).find(".configure-sheet").attr("title", game.i18n.localize("SHEET.Configure"));
    $(this._element).find(".configure-token").attr("title", game.i18n.localize("SHEET.Token"));
    $(this._element).find(".import").attr("title", game.i18n.localize("SHEET.Import"));

    // From the '.skill-advances' change() listener. So that we reset focus after the render
    if (this.saveSkillFocusDataItemId) {
      $('.tab.skills').find('input[data-item-id="' + this.saveSkillFocusDataItemId + '"')[0].focus();
      this.saveSkillFocusDataItemId = null;
    }
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


  /**
   * Provides the data to the template when rendering the actor sheet
   * 
   * This is called when rendering the sheet, where it calls the base actor class
   * to organize, process, and prepare all actor data for display. See ActorWfrp4e.prepare()
   * 
   * @returns {Object} sheetData    Data given to the template when rendering
   */
  getData() {
    const sheetData = super.getData();
    sheetData.data = sheetData.data.data // project system data so that handlebars has the same name and value paths

    sheetData.inventory = this.constructInventory(sheetData)

    this.filterActiveEffects(sheetData);
    this.addConditionData(sheetData);

    if (this.actor.type != "vehicle") {
      //this.addMountData(sheetData);
      sheetData.effects.system = game.wfrp4e.utility.getSystemEffects();
    }
    return sheetData;
  }


  constructInventory(sheetData) {

    // Inventory object is for the Trappings tab - each sub object is for an individual inventory section
    const categories = {
      weapons: {
        label: game.i18n.localize("WFRP4E.TrappingType.Weapon"), // Label - what is displayed in the inventory section header
        items: sheetData.actor.getItemTypes("weapon"), // Array of items in the sectio.filter(i => !i.location.value)n
        toggle: true,                                 // Is there a toggle in the section? (Equipped, worn, etc.)
        toggleName: game.i18n.localize("Equipped"),   // What is the name of the toggle in the header
        show: false,                                  // Should this section be shown (if an item exists in this list, it is set to true)
        dataType: "weapon"                            // What type of FVTT Item is in this section (used by the + button to add an item of this type)
      },
      armor: {
        label: game.i18n.localize("WFRP4E.TrappingType.Armour"),
        items: sheetData.actor.getItemTypes("armour"),
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        dataType: "armour"
      },
      ammunition: {
        label: game.i18n.localize("WFRP4E.TrappingType.Ammunition"),
        items: sheetData.actor.getItemTypes("ammunition"),
        show: false,
        dataType: "ammunition"
      },
      clothingAccessories: {
        label: game.i18n.localize("WFRP4E.TrappingType.ClothingAccessories"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "clathingAccessories"),
        toggle: true,
        toggleName: game.i18n.localize("Worn"),
        show: false,
        dataType: "trapping"
      },
      booksAndDocuments: {
        label: game.i18n.localize("WFRP4E.TrappingType.BooksDocuments"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "booksAndDocuments"),
        show: false,
        dataType: "trapping"
      },
      toolsAndKits: {
        label: game.i18n.localize("WFRP4E.TrappingType.ToolsKits"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "toolsAndKits" || i.trappingType.value == "tradeTools"),
        show: false,
        dataType: "trapping"
      },
      foodAndDrink: {
        label: game.i18n.localize("WFRP4E.TrappingType.FoodDrink"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "foodAndDrink"),
        show: false,
        dataType: "trapping"
      },
      drugsPoisonsHerbsDraughts: {
        label: game.i18n.localize("WFRP4E.TrappingType.DrugsPoisonsHerbsDraughts"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "drugsPoisonsHerbsDraughts"),
        show: false,
        dataType: "trapping"
      },
      misc: {
        label: game.i18n.localize("WFRP4E.TrappingType.Misc"),
        items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "misc"),
        show: true,
        dataType: "trapping"
      },
      cargo: {
        label: game.i18n.localize("WFRP4E.TrappingType.Cargo"),
        items: sheetData.actor.getItemTypes("cargo"),
        show: false,
        dataType: "cargo"
      }
    };

    // Money and ingredients are not in inventory object because they need more customization - note in actor-inventory.html that they do not exist in the main inventory loop
    const ingredients = {
      label: game.i18n.localize("WFRP4E.TrappingType.Ingredient"),
      items: sheetData.actor.getItemTypes("trapping").filter(i => i.trappingType.value == "ingredient"),
      show: false,
      dataType: "trapping"
    };
    const money = {
      items: sheetData.actor.getItemTypes("money"),
      total: 0,     // Total coinage value
      show: true
    };
    const containers = {
      items: sheetData.actor.getItemTypes("container"),
      show: false
    };

    const grimoire = {
      petty : sheetData.actor.getItemTypes("spell").filter(i => i.lore.value == "petty"),
      lore : sheetData.actor.getItemTypes("spell").filter(i => !i.lore.value == "petty")
    }

    const prayers = {
      blessings : sheetData.actor.getItemTypes("spell").filter(i => i.lore.value == "blessing"),
      miracles : sheetData.actor.getItemTypes("spell").filter(i => !i.lore.value == "blessing")
    }

    const misc = {}
    const inContainers = []; // inContainers is the temporary storage for items within a container


    if (sheetData.actor.hasSpells || sheetData.actor.type == "vehicle")
      this._filterItemCategory(ingredients, inContainers)
    else 
      categories.misc.items = categories.misc.items.concat(ingredients.items)

    for (let itemCategory in categories)
    {
      this._filterItemCategory(categories[itemCategory], inContainers)
    }


    this._filterItemCategory(money, inContainers)
    this._filterItemCategory(containers, inContainers)

    misc.totalShieldDamage = categories["weapons"].items.reduce((prev, current) => prev += current.damageToItem.shield, 0)

    // ******************************** Container Setup ***********************************

    for (var cont of containers.items) // For each container
    {
      // All items referencing (inside) that container
      var itemsInside = inContainers.filter(i => i.location.value == cont._id);
      cont.carrying = itemsInside.filter(i => i.type != "container");    // cont.carrying -> items the container is carrying
      cont.packsInside = itemsInside.filter(i => i.type == "container"); // cont.packsInside -> containers the container is carrying
      cont.carries.current = itemsInside.reduce(function (prev, cur) {   // cont.holding -> total encumbrance the container is holding
        return Number(prev) + Number(cur.encumbrance);
      }, 0);
      cont.carries.current = Math.floor(cont.carries.current)
    }

    return {
      inventory : {
        categories,
        ingredients,
        money,
        containers,
        grimoire,
        prayers,
        misc
      }
    }
  }

  _filterItemCategory(category, itemsInContainers)
  {
    itemsInContainers = itemsInContainers.concat(category.items.filter(i => !!i.location.value))
    category.items = category.items.filter(i => !i.location.value)
    category.show = category.items.length > 0
  }

  addConditionData(sheetData) {
    let conditions = duplicate(game.wfrp4e.config.statusEffects).map(e => new ActiveEffectWfrp4e(e));
    delete conditions.splice(sheetData.effects.conditions.length - 1, 1)
    for (let condition of conditions) {
      let owned = sheetData.effects.conditions.find(e => e.flags.core.statusId == condition.id)
      if (!owned) 
        condition = owned
    }
  }

  filterActiveEffects(sheetData) {
    sheetData.effects = {}
    sheetData.effects.conditions = []
    sheetData.effects.temporary = []
    sheetData.effects.passive = []
    sheetData.effects.disabled = []
    sheetData.effects.targeted = []

    for (let e of this.actor.effects) {
      // TODO: Hide hidden effects in sheet
      if (e.isCondition) sheetData.effects.conditions.push(e.data)
      else if (e.isDisabled) sheetData.effects.disabled.push(e)
      else if (e.isTemporary) sheetData.effects.temporary.push(e)
      else if (e.isTargeted) sheetData.effects.targeted.push(e)
      else data.actor.passive.push(e);
    }

    sheetData.effects.passive = this._consolidateEffects(sheetData.effects.passive)
    sheetData.effects.temporary = this._consolidateEffects(sheetData.effects.temporary)
    sheetData.effects.disabled = this._consolidateEffects(sheetData.effects.disabled)

  }

  _consolidateEffects(effects) {
    let consolidated = []
    for (let effect of effects) {
      let existing = consolidated.find(e => e.label == effect.label)
      if (!existing)
        consolidated.push(effect)
    }
    for (let effect of consolidated) {
      let count = effects.filter(e => e.label == effect.label).length
      effect.data.count = count
    }
    return consolidated
  }

  addMountData(data) {
    try {
      if (!this.actor.mount)
        return

      data.mount = this.actor.mount.data
      if (data.mount.data.status.wounds.value == 0)
        this.actor.status.mount.mounted = false;
      if (data.actor.data.status.mount.isToken)
        data.mount.sceneName = game.scenes.get(data.actor.data.status.mount.tokenData.scene).data.name
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
  _modifyWounds(value) {
    let sign = value.split('')[0] // Sign is the first character entered
    if (sign === "+" || sign === "-") // Relative
      return this.actor._modifyWounds(parseInt(value))
    else                            // Absolute
      return this.actor._setWounds(parseInt(value));
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
    if (spell.data.lore.value == "petty")
      this.actor.setupCast(spell).then(setupData => {
        this.actor.castTest(setupData)
      });
    else {
      renderTemplate("systems/wfrp4e/templates/dialog/cast-channel-dialog.html").then(dlg => {
        new Dialog({
          title: game.i18n.localize("DIALOG.CastOrChannel"),
          content: dlg,
          buttons: {
            cast: {
              label: game.i18n.localize("Cast"),
              callback: btn => {
                this.actor.setupCast(spell).then(setupData => {
                  this.actor.castTest(setupData)
                });
              }
            },
            channel: {
              label: game.i18n.localize("Channel"),
              callback: btn => {
                this.actor.setupChannell(spell).then(setupData => {
                  this.actor.channelTest(setupData)
                });
              }
            },
          },
          default: 'cast'
        }).render(true);
      })
    }
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
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find("#configure-actor").click(ev => {
      new game.wfrp4e.apps.ActorSettings(this.actor).render(true);
    })


    // Use customized input interpreter when manually changing wounds 
    html.find(".wounds-value").change(ev => {
      this._modifyWounds(ev.target.value)
    })



    html.find(".ch-edit").keydown(this._onEditChar.bind(this))

    html.find('.ch-edit').focusout(this._onEditChar2.bind(this));

    html.find('.skill-advances').change(this._onChangeSkillAdvances.bind(this));

    html.find('.ammo-selector').change(this._onSelectAmmo.bind(this));

    // Spells & Ingredients - ingredients can map to one spell, so any spell may have 0 to N available ingredients, but ingredients can only have 0 to 1 spell
    // ingredient.spellIngredient - what spell this ingredient maps to
    // spell.currentIng - what ingredient a spell is using currently (selected)

    // Spell selector for ingredients - change the spellIngredient value of the item to the selected spell
    html.find('.spell-selector').change(this._onSelectSpell.bind(this));

    // Ingredient Selector for spells - change the currently used ingredient to the selected value
    html.find('.ingredient-selector').change(this._onSelectIngredient.bind(this));

    // Characteristic Tests
    html.find('.item-create').click(this._onItemCreate.bind(this));
    html.find('.effect-create').click(this._onEffectCreate.bind(this));
    html.find('.ch-value').click(this._onCharClick.bind(this));
    html.find('.skill-total, .skill-select').mousedown(this._onSkillClick.bind(this));
    html.find(".skill-switch").click(this._onSkillSwitch.bind(this));
    html.find(".test-select").click(this._onExtendedTestSelect.bind(this));
    html.find(".extended-SL").mousedown(this._onExtendedSLClick.bind(this));
    html.find('.weapon-item-name').click(this._onWeaponNameClick.bind(this));
    html.find('.fist-icon').click(this._onUnarmedClick.bind(this));
    html.find('.dodge-icon').click(this._onDodgeClick.bind(this));
    html.find('.improvised-icon').click(this._onImprovisedClick.bind(this));
    html.find('.stomp-icon').click(this._onStompClick.bind(this));
    html.find('.rest-icon').click(this._onRestClick.bind(this));
    html.find('.trait-roll').mousedown(this._onTraitRoll.bind(this));
    html.find('.spell-roll').mousedown(this._onSpellRoll.bind(this));
    html.find('.prayer-roll').mousedown(this._onPrayerRoll.bind(this));
    html.find('.ap-value').mousedown(this._onAPClick.bind(this));
    html.find('.weapon-damage').mousedown(this._onWeaponDamageClick.bind(this));
    html.find(".armour-total").mousedown(this._onArmourTotalClick.bind(this));
    html.find(".shield-total").mousedown(this._onShieldClick.bind(this));
    html.find('.memorized-toggle').click(this._onMemorizedClick.bind(this));
    html.find('.sl-counter').mousedown(this._onSpellSLClick.bind(this));
    html.find('.auto-calc-toggle').mousedown(this._onAutoCalcToggle.bind(this));
    html.find('.disease-roll').mousedown(this._onDiseaseRoll.bind(this));
    html.find('.injury-duration').mousedown(this._onInjuryDurationClick.bind(this));
    html.find('.metacurrency-value').mousedown(this._onMetaCurrrencyClick.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.effect-title').click(this._onEffectClick.bind(this));
    html.find('.effect-delete').click(this._onEffectDelete.bind(this));
    html.find('.effect-toggle').click(this._onEffectEdit.bind(this));
    html.find('.effect-target').click(this._onEffectTarget.bind(this));
    html.find('.advance-diseases').click(this._onAdvanceDisease.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    html.find('.item-remove').click(this._onItemRemove.bind(this));
    html.find('.toggle-enc').click(this._onToggleContainerEncumbrance.bind(this));
    html.find('.item-toggle').click(this._onItemToggle.bind(this));
    html.find('.item-checkbox').click(this._onCheckboxClick.bind(this));
    html.find('.loaded-checkbox').mousedown(this._onLoadedClick.bind(this));
    html.find('.repeater').click(this._onRepeaterClick.bind(this));
    html.find('.worn-container').click(this._onWornClick.bind(this));
    html.find('.quantity-click').mousedown(this._onQuantityClick.bind(this));
    html.find(".aggregate").click(this._onAggregateClick.bind(this));
    html.find(".tab.inventory .item .item-name").mousedown(this._onItemSplit.bind(this));
    html.find(".condition-value").mousedown(this._onConditionValueClicked.bind(this));
    html.find(".condition-toggle").mousedown(this._onConditionToggle.bind(this));
    html.find('.input.species').change(this._onSpeciesEdit.bind(this));
    html.find('.randomize').click(this._onRandomizeClicked.bind(this));
    html.find(".condition-click").click(this._onConditionClicked.bind(this));
    html.find(".item-post").click(this._onItemPostClicked.bind(this));
    html.find(".name-gen").click(this._onNameClicked.bind(this));
    html.find(".system-effect-select").change(this._onSystemEffectChanged.bind(this));
    html.find('.dollar-icon').click(this._onMoneyIconClicked.bind(this));

    // Item Dragging
    let handler = this._onDragItemStart.bind(this);
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
    html.on("drop", ".mount-drop", ev => {
      ev.target.classList.remove("dragover")
      let dragData = JSON.parse(ev.originalEvent.dataTransfer.getData("text/plain"))
      let mount = game.actors.get(dragData.id);
      if (game.wfrp4e.config.actorSizeNums[mount.data.data.details.size.value] <= game.wfrp4e.config.actorSizeNums[this.actor.details.size.value])
        return ui.notifications.error("You can only mount creatures of a larger size.")

      let mountData = {
        id: dragData.id,
        mounted: true,
        isToken: false
      }
      this.actor.update({ "data.status.mount": mountData })
    })

    // ---- Listen for custom entity links -----
    html.on("click", ".chat-roll", WFRP_Utility.handleRollClick)
    html.on("click", ".symptom-tag", WFRP_Utility.handleSymptomClick)
    html.on("click", ".condition-chat", WFRP_Utility.handleConditionClick)
    html.on('mousedown', '.table-click', WFRP_Utility.handleTableClick)
    html.on('mousedown', '.pay-link', WFRP_Utility.handlePayClick)
    html.on('mousedown', '.credit-link', WFRP_Utility.handleCreditClick)
    html.on('mousedown', '.corruption-link', WFRP_Utility.handleCorruptionClick)
    html.on('mousedown', '.fear-link', WFRP_Utility.handleFearClick)
    html.on('mousedown', '.terror-link', WFRP_Utility.handleTerrorClick)
    html.on('mousedown', '.exp-link', WFRP_Utility.handleExpClick)

  }

  /* --------------------------------------------------------------------------------------------------------- */
  /* -------------------------------------------- Private  ------------------------------------------ */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * These  are helpers for sheet html interaction or lity. Mostly handling drag/drop and 
   * dropdown events.
   *
  /* --------------------------------------------------------------------------------------------------------- */


  _getItemId(ev) {
    return $(ev.currentTarget).parents(".item").attr("data-item-id")
  }

  _onEditChar(ev) {
    if (ev.keyCode == 9) {
      let characteristics = this.actor._data.data.characteristics
      let ch = ev.currentTarget.attributes["data-char"].value;
      let newValue = Number(ev.target.value);
      if (!this.updateObj)
        this.updateObj = duplicate(this.actor._data.data.characteristics);
      if (!(newValue == characteristics[ch].initial + characteristics[ch].advances)) {
        this.updateObj[ch].initial = newValue;
        this.updateObj[ch].advances = 0
      }
      this.charUpdateFlag = false
    }
    else { this.charUpdateFlag = true }
  }
  async _onEditChar2(ev) {
    ev.preventDefault();
    if (!this.charUpdateFlag && ev.currentTarget.attributes["data-char"].value != "fel")
      return
    if (!this.updateObj) this.updateObj = duplicate(this.actor._data.data.characteristics)
    let characteristics = this.actor._data.data.characteristics;

    let ch = ev.currentTarget.attributes["data-char"].value;
    let newValue = Number(ev.target.value);
    if (!(newValue == characteristics[ch].initial + characteristics[ch].advances)) {
      this.updateObj[ch].initial = newValue;
      this.updateObj[ch].advances = 0
    }
    await this.actor.update({ "data.characteristics": this.updateObj })
    this.updateObj = undefined
  };

  async _onChangeSkillAdvances(ev) {
    ev.preventDefault()
    let itemId = ev.target.attributes["data-item-id"].value;
    let itemToEdit = duplicate(this.actor.items.get(itemId));
    itemToEdit.data.advances.value = Number(ev.target.value);
    await this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
    this.saveSkillFocusDataItemId = $(document.activeElement).attr('data-item-id')
  };

  async _onSelectAmmo(ev) {
    let itemId = ev.target.attributes["data-item-id"].value;
    const itemToEdit = duplicate(this.actor.items.get(itemId));
    itemToEdit.data.currentAmmo.value = ev.target.value;
    this.actor.updateEmbeddedDocuments("Item", [itemToEdit]);
    WFRP_Audio.PlayContextAudio({ item: itemToEdit, action: "load" })
  };

  async _onSelectSpell(ev) {
    let itemId = ev.target.attributes["data-item-id"].value;
    const ing = duplicate(this.actor.items.get(itemId));
    ing.data.spellIngredient.value = ev.target.value;
    this.actor.updateEmbeddedDocuments("Item", [ing])
  };

  async _onSelectIngredient(ev) {
    let itemId = ev.target.attributes["data-item-id"].value;
    const spell = duplicate(this.actor.items.get(itemId))
    spell.data.currentIng.value = ev.target.value;
    this.actor.updateEmbeddedDocuments("Item", [spell])
  };

  _onCharClick(ev) {
    ev.preventDefault();
    let characteristic = ev.currentTarget.attributes["data-char"].value;
    this.actor.setupCharacteristic(characteristic).then(setupData => {
      this.actor.basicTest(setupData)
    })
  };

  _onSkillClick(ev) {
    let itemId = this._getItemId(ev);
    if (ev.button == 0) {
      let skill = this.actor.data.items.find(i => i._id == itemId);
      this.actor.setupSkill(skill).then(setupData => {
        this.actor.basicTest(setupData)
      })
    }
    else if (ev.button == 2) {
      let skill = this.actor.items.get(itemId);
      skill.sheet.render(true)
    }
  }

  _onSkillSwitch(ev) {
    this.actor.update({ "flags.wfrp4e.showExtendedTests": !getProperty(this.actor, "data.flags.wfrp4e.showExtendedTests") })
    this.render(true)
  }

  _onExtendedTestSelect(ev) {
    let itemId = this._getItemId(ev)
    let item = this.actor.items.get(itemId)
    this.actor.setupExtendedTest(item)
  }

  _onExtendedSLClick(ev) {
    let itemId = this._getItemId(ev)
    let item = duplicate(this.actor.items.get(itemId))
    if (ev.button == 0) item.data.SL.current++;
    else if (ev.button == 2) item.data.SL.current--;
    this.actor.updateEmbeddedDocuments("Item", [item])
  }
  _onWeaponNameClick(ev) {
    ev.preventDefault();
    let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let weapon = duplicate(this.actor.items.get(itemId))
    if (weapon) this.actor.setupWeapon(duplicate(weapon)).then(setupData => {
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
    let skill = this.actor.data.skills.find(s => s.name == game.i18n.localize("NAME.Dodge") && s.type == "skill")
    if (skill)
      this.actor.setupSkill(skill).then(setupData => {
        this.actor.basicTest(setupData)
      });
    else
      this.actor.setupCharacteristic("ag", { dodge: true }).then(setupData => {
        this.actor.basicTest(setupData)
      })
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
    let skill = this.actor.data.skills.find(s => s.name == game.i18n.localize("NAME.Endurance"));
    if (skill)
      this.actor.setupSkill(skill, { rest: true, tb: this.actor.characteristics.t.bonus }).then(setupData => {
        this.actor.basicTest(setupData)
      });
    else
      this.actor.setupCharacteristic("t", { rest: true }).then(setupData => {
        this.actor.basicTest(setupData)
      })
  }

  _onTraitRoll(ev) {
    ev.preventDefault();
    if (ev.button == 2)
      return this._onItemSummary(ev);

    let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let trait = duplicate(this.actor.items.get(itemId))
    this.actor.setupTrait(duplicate(trait)).then(setupData => {
      this.actor.traitTest(setupData)
    })
  }
  _onSpellRoll(ev) {
    ev.preventDefault();
    if (ev.button == 2)
      return this._onItemSummary(ev);

    let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let spell = duplicate(this.actor.items.get(itemId))
    this.spellDialog(duplicate(spell))
  }

  _onPrayerRoll(ev) {
    ev.preventDefault();
    if (ev.button == 2)
      return this._onItemSummary(ev);

    let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let prayer = duplicate(this.actor.items.get(itemId))
    this.actor.setupPrayer(duplicate(prayer)).then(setupData => {
      this.actor.prayerTest(setupData)
    })
  }

  _onAPClick(ev) {
    let itemId = this._getItemId(ev);
    let APlocation = $(ev.currentTarget).parents(".armour-box").attr("data-location");
    let item = duplicate(this.actor.items.get(itemId))
    if (item.data.currentAP[APlocation] == -1) item.data.currentAP[APlocation] = item.data.maxAP[APlocation];
    switch (ev.button) {
      case 0:
        item.data.currentAP[APlocation]++;
        if (item.data.currentAP[APlocation] > item.data.maxAP[APlocation])
          item.data.currentAP[APlocation] = item.data.maxAP[APlocation]
        break;
      case 2:
        item.data.currentAP[APlocation]--;
        if (item.data.currentAP[APlocation] < 0)
          item.data.currentAP[APlocation] = 0;
        break
    }
    this.actor.updateEmbeddedDocuments("Item", [item])
  };

  _onWeaponDamageClick(ev) {
    let itemId = this._getItemId(ev);
    let item = duplicate(this.actor.items.get(itemId))
    if (!item.data.weaponDamage)
      item.data["weaponDamage"] = 0;
    if (ev.button == 2) {
      item.data.weaponDamage++;
      WFRP_Audio.PlayContextAudio({ item: item, action: "damage", outcome: "weapon" })
    }
    else if (ev.button == 0)
      item.data.weaponDamage--;
    if (item.data.weaponDamage < 0)
      item.data.weaponDamage = 0;

    this.actor.updateEmbeddedDocuments("Item", [item])
  };

  _onArmourTotalClick(ev) {
    let location = $(ev.currentTarget).closest(".column").find(".armour-box").attr("data-location")
    if (!location) location = $(ev.currentTarget).closest(".column").attr("data-location");
    if (!location) return;

    let armourTraits = this.actor.data.traits.filter(i => i.name.toLowerCase() == "armour" || i.name.toLowerCase() == "armor");
    if (armourTraits.length)
      armourTraits = duplicate(armourTraits);
    let armourItems = this.actor.data.armour;
    let armourToDamage;
    let usedTrait = false;
    for (let armourTrait of armourTraits) {
      if (armourTrait && !armourTrait.APdamage) armourTrait.APdamage = { head: 0, body: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0 };
      if (armourTrait) {
        if (ev.button == 0) {
          if (armourTrait.APdamage[location] != 0) {
            armourTrait.APdamage[location]--;
            usedTrait = true
          }
        }
        if (ev.button == 2) {
          if (armourTrait.APdamage[location] == Number(armourTrait.data.specification.value)) { continue }
          if (armourTrait.APdamage[location] != Number(armourTrait.data.specification.value)) {
            armourTrait.APdamage[location]++;
            usedTrait = true
          }
        }
        if (usedTrait) {
          this.actor.updateEmbeddedDocuments("Item", [armourTrait])
          return
        }
      }
    }
    if (armourItems && !usedTrait) {
      for (let a of armourItems) {
        if (ev.button == 2) {
          if (a.data.maxAP[location] != 0 && a.data.currentAP[location] != 0) {
            armourToDamage = duplicate(a);
            break
          }
        }
        else if (ev.button == 0) {
          if (a.data.maxAP[location] != 0 && a.data.currentAP[location] != -1 && a.data.currentAP[location] != a.data.maxAP[location]) {
            armourToDamage = duplicate(a);
            break
          }
        }
      }
      if (!armourToDamage)
        return
      if (armourToDamage.data.currentAP[location] == -1)
        armourToDamage.data.currentAP[location] = armourToDamage.data.maxAP[location]
      if (ev.button == 2) {
        if (armourToDamage.data.currentAP[location] != 0) armourToDamage.data.currentAP[location]--
      }
      if (ev.button == 0) {
        if (armourToDamage.data.currentAP[location] != armourToDamage.data.maxAP[location])
          armourToDamage.data.currentAP[location]++
      }
      this.actor.updateEmbeddedDocuments("Item", [armourToDamage])
    }
  }
  _onShieldClick(ev) {
    let weapons = this.actor.data.weapons
    let shields = weapons.filter(w => w.properties.qualities.find(p => p.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase())))
    let shieldDamaged = false;
    for (let s of shields) {
      let shield = duplicate(this.actor.items.get(s._id));
      let shieldQualityValue = s.properties.qualities.find(p => p.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase())).split(" ")[1];
      if (!shield.data.APdamage)
        shield.data.APdamage = 0;
      if (ev.button == 2) {
        if (shield.data.APdamage < Number(shieldQualityValue)) {
          shield.data.APdamage++;
          shieldDamaged = true;
          WFRP_Audio.PlayContextAudio({ item: shield, action: "damage", outcome: "shield" })
        }
      }
      if (ev.button == 0) {
        if (shield.data.APdamage != 0) {
          shield.data.APdamage--;
          shieldDamaged = true
        }
      }
      if (shieldDamaged) {
        this.actor.updateEmbeddedDocuments("Item", [shield])
        return
      }
    }
  }
  async _onMemorizedClick(ev) {
    let itemId = this._getItemId(ev);
    const spell = duplicate(this.actor.items.get(itemId))
    spell.data.memorized.value = !spell.data.memorized.value;
    if (spell.data.memorized.value)
      WFRP_Audio.PlayContextAudio({ item: spell, action: "memorize" })
    else
      WFRP_Audio.PlayContextAudio({ item: spell, action: "unmemorize" })
    await this.actor.updateEmbeddedDocuments("Item", [spell]);
  }

  async _onSpellSLClick(ev) {
    let itemId = this._getItemId(ev);
    const spell = duplicate(this.actor.items.get(itemId))
    switch (ev.button) {
      case 0: spell.data.cn.SL++;
        if (spell.data.cn.SL > (spell.data.memorized.value ? spell.data.cn.value : spell.data.cn.value * 2))
          spell.data.cn.SL = (spell.data.memorized.value ? spell.data.cn.value : spell.data.cn.value * 2);
        break;
      case 2:
        spell.data.cn.SL--;
        break
    }
    await this.actor.updateEmbeddedDocuments("Item", [spell])
  };

  async _onAutoCalcToggle(ev) {
    let toggle = ev.target.attributes["toggle-type"].value;
    if (ev.button == 2) {
      let newFlags = duplicate(this.actor.data.flags);
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

      this.actor.update({ 'flags': newFlags })
    }
  };

  async _onDiseaseRoll(ev) {
    let itemId = this._getItemId(ev);
    const disease = duplicate(this.actor.items.get(itemId))
    let type = ev.target.dataset["type"];
    if (type == "incubation")
      disease.data.duration.active = false;
    if (!isNaN(disease.data[type].value)) {
      let number = Number(disease.data[type].value)
      if (ev.button == 0)
        return this.actor.decrementDisease(disease)
      else
        number++
      disease.data[type].value = number;
      this.actor.updateEmbeddedDocuments("Item", [disease])
    }
    else if (ev.button == 0) {
      try {
        let rollValue = new Roll(disease.data[type].value).roll().total
        disease.data[type].value = rollValue
        if (type == "duration")
          disease.data.duration.active = true
      }
      catch
      {
        return ui.notifications.error("Could not parse disease roll")
      }
      this.actor.updateEmbeddedDocuments("Item", [disease])
    }
  };

  async _onInjuryDurationClick(ev) {
    let itemId = this._getItemId(ev);
    let injury = duplicate(this.actor.items.get(itemId))
    if (!isNaN(injury.data.duration.value)) {
      if (ev.button == 0)
        return this.actor.decrementInjury(injury)
      else injury.data.duration.value++
      this.actor.updateEmbeddedDocuments("Item", [injury])
    }
    else {
      try {
        let rollValue = new Roll(injury.data.duration.value).roll().total
        injury.data.duration.value = rollValue;
        injury.data.duration.active = true;
        this.actor.updateEmbeddedDocuments("Item", [injury])
      }
      catch
      {
        return ui.notifications.error("Could not parse injury roll")
      }
    }
  }
  ;

  async _onMetaCurrrencyClick(ev) {
    let type = $(ev.currentTarget).attr("data-point-type");
    let newValue = ev.button == 0 ? this.actor.status[type].value + 1 : this.actor.status[type].value - 1
    this.actor.update({ [`data.status.${type}.value`]: newValue })
  };

  _onItemEdit(ev) {
    let itemId = this._getItemId(ev);
    const item = this.actor.items.find(i => i.data._id == itemId)
    item.sheet.render(true)
  };

  _onEffectClick(ev) {
    let id = this._getItemId(ev);
    let effect = this.actor.effects.find(i => i.data._id == id)
    if (!effect)
      effect = new ActiveEffect(this.actor._data.effects.find(i => i._id == id), this.actor)
    effect.sheet.render(true)
  };

  _onEffectDelete(ev) {
    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    this.actor.deleteEmbeddedDocuments("ActiveEffect", [id])
  };

  _onEffectEdit(ev) {
    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let effect = duplicate(this.actor.effects.get(id))
    effect.disabled = !effect.disabled
    this.actor.updateEmbeddedDocuments("ActiveEffect", [effect])
  };

  _onEffectTarget(ev) {
    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    let effect = duplicate(this.actor.effects.get(id))
    if (getProperty(effect, "flags.wfrp4e.effectTrigger") == "apply")
      game.wfrp4e.utility.applyEffectToTarget(effect)
    else {
      try {
        let func = new Function("args", getProperty(effect, "flags.wfrp4e.script")).bind({ actor: this.actor, effect })
        func()
      }
      catch (ex) {
        ui.notifications.error("Error when running effect " + effect.label + ": " + ex)
        console.log("Error when running effect " + effect.label + ": " + ex)
      }
    }
  }
  ;

  _onAdvanceDisease(ev) {
    this.actor.decrementDiseases()
  };

  _onItemDelete(ev) {
    let li = $(ev.currentTarget).parents(".item"), itemId = li.attr("data-item-id");
    if (this.actor.items.get(itemId).name == "Boo") {
      AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}squeek.wav` }, false)
      return
    }
    renderTemplate('systems/wfrp4e/templates/dialog/delete-item-dialog.html').then(html => {
      new Dialog({
        title: "Delete Confirmation", content: html, buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>', label: "Yes", callback: dlg => {
              this.actor.deleteEmbeddedDocuments("Item", [itemId]);
              this.actor.deleteEffectsFromItem(itemId)
              li.slideUp(200, () => this.render(false))
            }
          }, cancel: { icon: '<i class="fas fa-times"></i>', label: "Cancel" },
        }, default: 'Yes'
      }).render(true)
    })
  };

  _onItemRemove(ev) {
    let li = $(ev.currentTarget).parents(".item"), itemId = li.attr("data-item-id");
    const item = duplicate(this.actor.items.get(itemId))
    item.data.location.value = 0;
    this.actor.updateEmbeddedDocuments("Item", [item])
  };

  _onToggleContainerEncumbrance(ev) {
    let itemId = this._getItemId(ev);
    let item = duplicate(this.actor.items.get(itemId))
    item.data.countEnc.value = !item.data.countEnc.value;
    this.actor.updateEmbeddedDocuments("Item", [item])
  };

  _onItemToggle(ev) {
    let itemId = this._getItemId(ev);
    let item = duplicate(this.actor.items.get(itemId))
    let equippedState;
    if (item.type == "armour") {
      item.data.worn.value = !item.data.worn.value;
      equippedState = item.data.worn.value
    } else if (item.type == "weapon") {
      item.data.equipped = !item.data.equipped;
      equippedState = item.data.equipped
      let newEqpPoints = item.data.twohanded.value ? 2 : 1
      if (game.settings.get("wfrp4e", "limitEquippedWeapons"))
        if (this.actor.data.flags.eqpPoints + newEqpPoints > 2 && equippedState) {
          AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav` }, false)
          return ui.notifications.error(game.i18n.localize("ErrorLimitedWeapons"))
        }
      setProperty(item, "data.offhand.value", false)
    }
    else if (item.type == "trapping" && item.data.trappingType.value == "clothingAccessories") {
      item.data.worn = !item.data.worn;
      equippedState = item.data.worn
    }
    WFRP_Audio.PlayContextAudio({ item: item, action: "equip", outcome: equippedState })
    this.actor.updateEmbeddedDocuments("Item", [item])
  };

  _onCheckboxClick(ev) {
    let itemId = this._getItemId(ev);
    let target = $(ev.currentTarget).attr("data-target")
    this.toggleItemCheckbox(itemId, target)
  };

  _onLoadedClick(ev) {
    let itemId = this._getItemId(ev);
    let item = duplicate(this.actor.items.get(itemId))
    this.actor
    let preparedItem = this.actor.prepareWeaponCombat(duplicate(item))
    if (preparedItem.data.loaded.repeater) {
      if (ev.button == 0 && item.data.loaded.amt >= preparedItem.data.loaded.max) return
      if (ev.button == 2 && item.data.loaded.amt <= 0)
        return
      if (ev.button == 0) item.data.loaded.amt++
      if (ev.button == 2) item.data.loaded.amt--;
      item.data.loaded.value = !!item.data.loaded.amt
    }
    else {
      item.data.loaded.value = !item.data.loaded.value
      if (item.data.loaded.value)
        item.data.loaded.amt = preparedItem.data.loaded.max || 1
      else item.data.loaded.amt = 0
    }
    this.actor.updateEmbeddedDocuments("Item", [item]).then(i => this.actor.checkReloadExtendedTest(item))
  };

  _onRepeaterClick(ev) {
    let itemId = this._getItemId(ev);
    let item = duplicate(this.actor.items.get(itemId))
    let preparedItem = this.actor.prepareWeaponCombat(duplicate(item))
    item.data.loaded.value = !item.data.loaded.value
    if (item.data.loaded.value) item.data.loaded.amt = preparedItem.data.loaded.max || 1
    this.actor.updateEmbeddedDocuments("Item", [item])
  };

  _onWornClick(ev) {
    let itemId = this._getItemId(ev);
    let item = duplicate(this.actor.items.get(itemId))
    item.data.worn.value = !item.data.worn.value;
    this.actor.updateEmbeddedDocuments("Item", [item])
  };

  _onQuantityClick(ev) {
    let itemId = this._getItemId(ev);
    let item = duplicate(this.actor.items.get(itemId));
    switch (ev.button) {
      case 0: if (ev.ctrlKey) item.data.quantity.value += 10;
      else item.data.quantity.value++;
        break;
      case 2: if (ev.ctrlKey) item.data.quantity.value -= 10;
      else item.data.quantity.value--;
        if (item.data.quantity.value < 0) item.data.quantity.value = 0;
        break
    }this.actor.updateEmbeddedDocuments("Item", [item])
  };

  async _onAggregateClick(ev) {
    let itemType = $(ev.currentTarget).attr("data-type")
    if (itemType == "ingredient") itemType = "trapping"
    let items = duplicate(this.actor.data.inventory[itemType])
    for (let i of items) {
      let duplicates = items.filter(x => x.name == i.name)
      if (duplicates.length > 1) {
        let newQty = duplicates.reduce((prev, current) => prev + current.data.quantity.value, 0)
        i.data.quantity.value = newQty
      }
    }
    let noDuplicates = []
    for (let i of items) {
      if (!noDuplicates.find(x => x.name == i.name)) {
        noDuplicates.push(i);
        await this.actor.updateEmbeddedDocuments("Item", [{ "_id": i._id, "data.quantity.value": i.data.quantity.value }])
      }
      else await this.actor.deleteEmbeddedDocuments("Item", [i._id])
    }
  }
  _onItemSplit(ev) {
    if (ev.button == 2) {
      new Dialog({
        title: game.i18n.localize("SHEET.SplitTitle"), content: `<p>${game.i18n.localize("SHEET.SplitPrompt")}</p><div class="form-group"><input name="split-amt"type="text"/></div>`, buttons: {
          split: {
            label: "Split", callback: (dlg) => {
              let amt = Number(dlg.find('[name="split-amt"]').val());
              if (isNaN(amt))
                return this.splitItem(this._getItemId(ev), amt)
            }
          }
        }, default: "split"
      }).render(true)
    }
  }
  _onConditionValueClicked(ev) {
    let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
    if (ev.button == 0)
      this.actor.addCondition(condKey)
    else if (ev.button == 2)
      this.actor.removeCondition(condKey)
  }
  _onConditionToggle(ev) {
    let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
    if (game.wfrp4e.config.statusEffects.find(e => e.id == condKey).flags.wfrp4e.value == null) {
      if (this.actor.hasCondition(condKey))
        this.actor.removeCondition(condKey)
      else this.actor.addCondition(condKey)
      return
    }
    if (ev.button == 0)
      this.actor.addCondition(condKey)
    else if (ev.button == 2)
      this.actor.removeCondition(condKey)
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
    await this.actor.update({ "data.details.species.value": speciesKey, "data.details.species.subspecies": subspeciesKey });
    if (this.actor.type == "character")
      return
    try {
      let initialValues = WFRP_Utility.speciesCharacteristics(speciesKey, true, subspeciesKey);
      let characteristics = duplicate(this.actor._data.data.characteristics);
      for (let c in characteristics) {
        characteristics[c].initial = initialValues[c].value
      }

      new Dialog({
        content: "<p>Do you want to apply this species's characteristics to the actor?", title: "Species Characteristics", buttons: {
          yes: {
            label: "Yes", callback: async () => {
              await this.actor.update({ 'data.characteristics': characteristics })

              await this.actor.update({ "data.details.move.value": WFRP_Utility.speciesMovement(species) || 4 })
            }
          }, no: { label: "No", callback: () => { } }
        }
      }).render(true)
    } catch{ }
  };

  async _onRandomizeClicked(ev) {
    ev.preventDefault();
    let species = this.actor.details.species.value;
    let subspecies = this.actor.details.species.subspecies;
    try {
      switch (ev.target.text) {
        case "C": let creatureMethod = false;
          let characteristics = duplicate(this.actor._data.data.characteristics);
          if (this.actor.type == "creature" || !species) creatureMethod = true;
          if (!creatureMethod) {
            let averageCharacteristics = WFRP_Utility.speciesCharacteristics(species, true, subspecies);
            for (let char in characteristics) {
              if (characteristics[char].initial != averageCharacteristics[char].value) creatureMethod = true
            }
          }
          if (!creatureMethod) {
            let rolledCharacteristics = WFRP_Utility.speciesCharacteristics(species, false, subspecies);
            for (let char in rolledCharacteristics) {
              characteristics[char].initial = rolledCharacteristics[char].value
            }
            await this.actor.update({ "data.characteristics": characteristics })
          }
          else if (creatureMethod) {
            let roll = new Roll("2d10");
            roll.roll();
            let characteristics = duplicate(this.actor._data.data.characteristics);
            for (let char in characteristics) {
              if (characteristics[char].initial == 0)
                continue
              characteristics[char].initial -= 10;
              characteristics[char].initial += roll.reroll().total;
              if (characteristics[char].initial < 0)
                characteristics[char].initial = 0
            }
            await this.actor.update({ "data.characteristics": characteristics })
          }
          return

        case "S":
          this.actor._advanceSpeciesSkills()
          return
        case "T":
          this.actor._advanceSpeciesTalents()
          return
      }
    }
    catch (error) {
      console.log("wfrp4e | Could not randomize: " + error)
    }
  };

  _onConditionClicked(ev) {
    ev.preventDefault();
    let li = $(ev.currentTarget).parents(".sheet-condition"),
      elementToAddTo = $(ev.currentTarget).parents(".condition-list"),
      condkey = li.attr("data-cond-id"), expandData = TextEditor.enrichHTML(`<h2>${game.wfrp4e.config.conditions[condkey]}</h2>` + game.wfrp4e.config.conditionDescriptions[condkey])

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
    const item = this.actor.items.find(i => i.data._id == itemId);
    item.postItem()
  }

  _onNameClicked(ev) {
    let name = NameGenWfrp.generateName({ species: this.actor.data.data.details.species.value, gender: this.actor.data.data.details.gender.value })
    this.actor.update({ "name": name });
  }

  _onMountToggle(ev) {
    ev.stopPropagation();
    this.actor.update({ "data.status.mount.mounted": !this.actor.status.mount.mounted })
  }

  _onMountRemove(ev) {
    ev.stopPropagation();
    let mountData = { id: "", mounted: false, isToken: false }
    this.actor.update({ "data.status.mount": mountData })
  }
  _onMountClicked(ev) {
    this.actor.mount.sheet.render(true)
  }
  _onSystemEffectChanged(ev) {
    let ef = ev.target.value;
    let data = ev.target.options[ev.target.selectedIndex].dataset
    let effect = game.wfrp4e.config[data.source][ef]
    this.actor.createEmbeddedDocuments("ActiveEffect", [effect])
  }

  async _onMoneyIconClicked(ev) {
    ev.preventDefault();
    let money = duplicate(this.actor.data.money.coins);
    money = MarketWfrp4e.consolidateMoney(money);
    await this.actor.updateEmbeddedDocuments("Item", [money]);
  }


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
  _onDragItemStart(ev) {
    let itemId = ev.currentTarget.getAttribute("data-item-id");
    const item = duplicate(this.actor.items.get(itemId))
    ev.dataTransfer.setData("text/plain", JSON.stringify({
      type: "Item",
      sheetTab: this.actor.data.flags["_sheetTab"],
      actorId: this.actor._id,
      data: item,
      root: ev.currentTarget.getAttribute("root")
    }));
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
    let dropID = $(ev.target).parents(".item").attr("data-item-id"); // Only relevant if container drop

    // Inventory Tab - Containers - Detected when you drop something onto a container, otherwise, move on to other drop types
    if ($(ev.target).parents(".item").attr("inventory-type") == "container") {
      if (dragData.data._id == dropID) // Prevent placing a container within itself (we all know the cataclysmic effects that can cause)
        throw "";
      else if (dragData.data.type == "container" && $(ev.target).parents(".item").attr("last-container"))
        throw game.i18n.localize("SHEET.NestedWarning")

      else if (dragData.data.type == "container") {
        // If container A has both container B and container C, prevent placing container B into container C without first removing B from A
        // This resolves a lot of headaches around container loops and issues of that natures
        if (dragData.root == $(ev.target).parents(".item").attr("root")) {
          ui.notifications.error("Remove the container before changing its location");
          throw game.i18n.localize("SHEET.LocationWarning");
        }
      }
      dragData.data.data.location.value = dropID; // Change location value of item to the id of the container it is in

      //  this will unequip/remove items like armor and weapons when moved into a container
      if (dragData.data.type == "armour")
        dragData.data.data.worn.value = false;
      if (dragData.data.type == "weapon")
        dragData.data.data.equipped = false;
      if (dragData.data.type == "trapping" && dragData.data.data.trappingType.value == "clothingAccessories")
        dragData.data.data.worn = false;


      await this.actor.updateEmbeddedDocuments("Item", [dragData.data]);
    }
    // Dropping an item from chat
    else if (dragData.type == "postedItem") {
      this.actor.createEmbeddedDocuments("Item", [dragData.payload]);
    }
    // Dropping a character creation result
    else if (dragData.type == "generation") {

      let data = duplicate(this.actor._data.data);
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
        await this.actor.update({ "data": data })
      }
      else if (dragData.generationType === "details") // hair, name, eyes
      {
        data.details.eyecolour.value = dragData.payload.eyes
        data.details.haircolour.value = dragData.payload.hair
        data.details.age.value = dragData.payload.age;
        data.details.height.value = dragData.payload.height;
        let name = dragData.payload.name
        await this.actor.update({ "name": name, "data": data, "token.name": name.split(" ")[0] })
      }


    }
    // This is included in character creation, but not limited to.
    // lookupType is either skill or talent. Instead of looking up the
    // data on the drag ev (could cause a delay), look it up on drop
    else if (dragData.type == "lookup") {
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
        this.actor.createEmbeddedDocuments("Item", [item.data]);
    }
    // From character creation - exp drag values
    else if (dragData.type == "experience") {
      let data = duplicate(this.actor._data.data);
      data.details.experience.total += dragData.payload;
      data.details.experience.log = this.actor._addToExpLog(dragData.payload, "Character Creation", undefined, data.details.experience.total)

      await this.actor.update({ "data": data })
    }
    // From Income results - drag money value over to add
    else if (dragData.type == "money") {
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
      let money = duplicate(this.actor.data.money.coins);

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
      if (!amt)
        money.forEach(m => m.data.quantity.value = 0);
      else // Otherwise, add amount to designated type
        moneyItem.data.quantity.value += amt;

      // add halves
      if (halfS)
        money.find(i => i.name === game.i18n.localize("NAME.BP")).data.quantity.value += 6;
      if (halfG)
        money.find(i => i.name === game.i18n.localize("NAME.SS")).data.quantity.value += 10;

      await this.actor.updateEmbeddedDocuments("Item", [money]);
    }
    else if (dragData.type == "wounds") {
      this._modifyWounds(`+${dragData.payload}`)
    }
    else if (dragData.type == "condition") {
      this.actor.addCondition(`${dragData.payload}`)
    }
    else // If none of the above, just process whatever was dropped upstream
    {
      super._onDrop(ev)
    }
  }


  /**
   * All item types have a drop down description, this handles what is 
   * displayed for each item type and adds additional lities
   * and listeners.
   * 
   * @private
   * 
   * @param {Object} ev    ev generated by the click 
   */
  _onItemSummary(ev) {
    ev.preventDefault();
    let li = $(ev.currentTarget).parents(".item"),
      item = this.actor.items.find(i => i.data._id == li.attr("data-item-id")),
      // Call the item's expandData() which gives us what to display
      expandData = item.getExpandData(
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
        let effectButtons = expandData.targetEffects.map(e => `<a class="apply-effect" data-item-id=${item.id} data-effect-id=${e._id}>${game.i18n.format("SHEET.ApplyEffect", { effect: e.label })}</a>`)
        let effects = $(`<div>${effectButtons}</div>`)
        div.append(effects)
      }
      if (expandData.invokeEffects.length) {
        let effectButtons = expandData.invokeEffects.map(e => `<a class="invoke-effect" data-item-id=${item.id} data-effect-id=${e._id}>${game.i18n.format("SHEET.InvokeEffect", { effect: e.label })}</a>`)
        let effects = $(`<div>${effectButtons}</div>`)
        div.append(effects)
      }


      li.append(div.hide());
      div.slideDown(200);

      this._dropdownListeners(div);
    }
    li.toggleClass("expanded");
  }



  _dropdownListeners(html) {
    // Clickable tags
    // Post an Item Quality/Flaw
    html.on("click", ".item-property", ev => {
      WFRP_Utility.postProperty(ev.target.text)
    })

    // Roll a career income skill
    html.on("click", ".career-income", ev => {
      let skill = this.actor.items.find(i => i.data.name === ev.target.text.trim() && i.data.type == "skill");
      let career = this.actor.items.get($(ev.target).attr("data-career-id"));
      if (!skill) {
        ui.notifications.error(game.i18n.localize("SHEET.SkillMissingWarning"))
        return;
      }
      if (!career.data.current.value) {
        ui.notifications.error(game.i18n.localize("SHEET.NonCurrentCareer"))
        return;
      }
      this.actor.setupSkill(skill.data, { title: `${skill.name} - ${game.i18n.localize("Income")}`, income: this.actor.details.status, career }).then(setupData => {
        this.actor.incomeTest(setupData)
      });
    })

    html.on("click", ".apply-effect", async ev => {

      let effectId = ev.target.dataset["effectId"]
      let itemId = ev.target.dataset["itemId"]

      let effect = this.actor.populateEffect(effectId, itemId)
      let item = this.actor.items.get(itemId)

      if ((item.data.range && item.data.range.value.toLowerCase() == game.i18n.localize("You").toLowerCase()) && (item.data.target && item.data.target.value.toLowerCase() == game.i18n.localize("You").toLowerCase()))
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
      AOETemplate.fromString(ev.target.text).drawPreview(ev);
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
  _expandProperty(ev) {
    ev.preventDefault();

    let li = $(ev.currentTarget).parents(".item"),
      property = ev.target.text, // Proprety clicked on
      properties = mergeObject(WFRP_Utility.qualityList(), WFRP_Utility.flawList()), // Property names
      propertyDescr = Object.assign(duplicate(game.wfrp4e.config.qualityDescriptions), game.wfrp4e.config.flawDescriptions); // Property descriptions

    property = property.replace(/,/g, '').trim(); // Remove commas/whitespace

    let propertyKey = "";
    if (property == game.i18n.localize("Special Ammo")) // Special Ammo comes from user-entry in an Ammo's Special box
    {
      let item = duplicate(this.actor.items.get(li.attr("data-item-id")))
      let ammo = duplicate(this.actor.items.get(item.data.currentAmmo.value))
      // Add the special value to the object so that it can be looked up
      propertyDescr = Object.assign(propertyDescr,
        {
          [game.i18n.localize("Special Ammo")]: ammo.data.special.value
        });
      propertyKey = game.i18n.localize("Special Ammo");
    }
    else if (property == "Special") // Special comes from user-entry in a Weapon's Special box
    {
      let item = duplicate(this.actor.items.get(li.attr("data-item-id")))
      // Add the special value to the object so that it can be looked up
      propertyDescr = Object.assign(propertyDescr,
        {
          "Special": item.data.special.value
        });
      item = this.actor.prepareWeaponCombat(item);
      propertyKey = "Special";
    }
    else // Otherwise, just lookup the key for the property and use that to lookup the description
    {
      propertyKey = WFRP_Utility.findKey(WFRP_Utility.parsePropertyName(property), properties)
    }

    let propertyDescription = "<b>" + property + "</b>" + ": " + propertyDescr[propertyKey];
    if (propertyDescription.includes("(Rating)"))
      propertyDescription = propertyDescription.replace("(Rating)", property.split(" ")[1])

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

    let item = this.actor.data.items.find(i => i._id == li.attr("data-item-id"))
    // Breakdown weapon range bands for easy reference (clickable, see below)
    if (classes.hasClass("weapon-range")) {
      expansionText =
        `<a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Point Blank"]}">${item.rangeBands["Point Blank"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Point Blank"].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Point Blank"]]}</a><br>
          <a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Short Range"]}">${item.rangeBands["Short Range"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Short Range"].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Short Range"]]}</a><br>
          <a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Normal"]}">${item.rangeBands["Normal"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Normal"].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Normal"]]}</a><br>
          <a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Long Range"]}">${item.rangeBands["Long Range"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Long Range"].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Long Range"]]}</a><br>
          <a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Extreme"]}">${item.rangeBands["Extreme"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Extreme"].range[1]} ${game.i18n.localize("yds")}: ${game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Extreme"]]}</a><br>
          `
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
        let difficulty = $(ev.currentTarget).attr("data-range")

        let weapon = duplicate(item)
        if (weapon)
          this.actor.setupWeapon(duplicate(weapon), { absolute: { difficulty: difficulty } }).then(setupData => {
            this.actor.weaponTest(setupData)
          });
      })

    }
    li.toggleClass("expanded");


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
      return this.actor.createEmbeddedDocuments("ActiveEffect", [{ name: "New Effect" }])

    if (data.type == "vehicle-role" && this.actor.type == "vehicle") {
      let roles = duplicate(this.actor.roles)
      let newRole = { name: "New Role", actor: "", test: "", testLabel: "" }
      roles.push(newRole)
      return this.actor.update({ "data.roles": roles })
    }

    // Conditional for creating skills from the skills tab - sets to the correct skill type depending on column
    if (ev.currentTarget.attributes["data-type"].value == "skill") {
      data = mergeObject(data,
        {
          "data.advanced.value": ev.currentTarget.attributes["data-skill-type"].value
        });
    }

    if (data.type == "trapping")
      data = mergeObject(data,
        {
          "data.trappingType.value": ev.currentTarget.attributes["item-section"].value
        })

    if (data.type == "ingredient") {
      data = mergeObject(data,
        {
          "data.trappingType.value": "ingredient"
        })
      data.type = "trapping"
    }

    // Conditional for creating spells/prayers from their tabs, create the item with the correct type
    else if (data.type == "spell" || data.type == "prayer") {
      let itemSpecification = ev.currentTarget.attributes[`data-${data.type}-type`].value;

      if (data.type == "spell") {
        data = mergeObject(data,
          {
            "data.lore.value": itemSpecification
          });
      }
      else if (data.type == "prayer") {
        data = mergeObject(data,
          {
            "data.type.value": itemSpecification
          });
      }
    }
    data["img"] = "systems/wfrp4e/icons/blank.png";
    data["name"] = `New ${data.type.capitalize()}`;
    this.actor.createEmbeddedDocuments("Item", [data]);
  }

  _onEffectCreate(ev) {
    let type = ev.currentTarget.attributes["data-effect"].value
    let effectData = { label: "New Effect" };
    if (type == "temporary") {
      effectData["duration.rounds"] = 1;
    }
    if (type == "applied") {
      effectData["flags.wfrp4e.effectApplication"] = "apply"
    }
    this.actor.createEmbeddedDocuments("ActiveEffect", [effectData])
  }

  /**
   * Duplicates an owned item given its id.
   * 
   * @param {Number} itemId   Item id of the item being duplicated
   */
  duplicateItem(itemId) {
    let item = duplicate(this.actor.items.get(itemId))
    this.actor.createEmbeddedDocuments("Item", [item]);
  }

  splitItem(itemId, amount) {
    let item = duplicate(this.actor.items.get(itemId))
    let newItem = duplicate(item)
    if (amount >= item.data.quantity.value)
      return ui.notifications.notify("Invalid Quantity")

    newItem.data.quantity.value = amount;
    item.data.quantity.value -= amount;
    this.actor.createEmbeddedDocuments("Item", [newItem]);
    this.actor.updateEmbeddedDocuments("Item", [item]);
  }


  async toggleItemCheckbox(itemId, target) {
    let item = duplicate(this.actor.items.get(itemId))
    setProperty(item, target, !getProperty(item, target))
    this.actor.updateEmbeddedDocuments("Item", [item]);
    return getProperty(item, target);
  }

  /* -------------------------------------------- */
}

