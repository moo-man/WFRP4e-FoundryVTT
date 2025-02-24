/**
 * Provides the data and general interaction with Item Sheets
 *
 * The main purpose of this sheet class is to provide the correct
 * data to the template when rendering depending on what type
 * of item the sheet belongs too. Additionally, item sheet
 * interactivity and events are handled here.
 */

import WFRP_Utility from "../system/utility-wfrp4e.js";
import ActiveEffectWFRP4e from "../system/effect-wfrp4e.js";


export default class ItemSheetWfrp4e extends WarhammerItemSheet
{
  classes = ['item-sheet'];

  constructor(item, options) {
    super(item, options);
    this.mce = null;

    this.options.classes.push(...this.sheetClasses);
  }

  get sheetClasses() {
    let classes = this.classes;

    switch (this.item?.type) {
      case 'armour':
        classes.push('equipment-sheet');
        break;
      case 'ammunition':
        classes.push('ammo-sheet');
        break;
      case 'cargo':
      case 'trapping':
      case 'vehicleMod':
        classes.push('trapping-sheet');
        break;
      case 'critical':
      case 'extendedTest':
      case 'injury':
        classes.push('injury-sheet');
        break;
      case 'career':
      case 'container':
      case 'disease':
      case 'money':
      case 'mutation':
      case 'prayer':
      case 'psychology':
      case 'skill':
      case 'spell':
      case 'talent':
      case 'trait':
      case 'weapon':
      default:
        classes.push(`${this.item?.type}-sheet`);
        break;
    }

    return classes;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.tabs = [{ navSelector: ".tabs", contentSelector: ".content", initial: "description" }]
    options.dragDrop = [{dragSelector: ".effect-list .effect", dropSelector: "form"}],
    options.scrollY = [".details"]
    return options;
  }


  /**
   * Override header buttons to add custom ones.
   */
  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Add "Post to chat" button
    // We previously restricted this to GM and editable items only. If you ever find this comment because it broke something: eh, sorry!
    buttons.unshift(
      {
        class: "post",
        icon: "fas fa-comment",
        onclick: ev => this.item.postItem()
      })
    return buttons
  }

  // Add tooltips to header buttons
  async _render(force = false, options = {}) {
    await super._render(force, options);
   this.element.find(".close").attr({"data-tooltip" : game.i18n.localize("SHEET.Close"), "data-tooltip-direction" : "UP"});
   this.element.find(".configure-sheet").attr({"data-tooltip" : game.i18n.localize("SHEET.Configure"), "data-tooltip-direction" : "UP"});
   this.element.find(".post").attr({"data-tooltip" : game.i18n.localize("SHEET.Post"), "data-tooltip-direction" : "UP"});
   this.element.find(".import").attr({"data-tooltip" : game.i18n.localize("SHEET.Import"), "data-tooltip-direction" : "UP"});
   let idLink = this.element.find(".document-id-link")
   this.element.find(".window-title").after(idLink)
  }


  /**
   * Use a type-specific template for each different item type
   */
  get template() {
    let type = this.item.type;
    return `systems/wfrp4e/templates/items/item-${type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /**
   * Prepare item sheet data.
   * 
   * Start with the base item data and extending with additional properties for rendering.
   * Each item type has specific data (typically from config constants) that needs to be rendered
   * 
   * Example: A weapon sheet needs all different weapon types to list in the weaponGroup dropdown (`data['weaponGroups'] =  game.wfrp4e.config.weaponGroups;`)
   */
  async getData() {
    const data = await super.getData();
    data.system = data.item._source.system // Use source data to avoid modifications being applied

    if (this.item.type == "spell") 
    {
      if (game.wfrp4e.config.magicLores[this.item.lore.value]) {
        data["loreValue"] = game.wfrp4e.config.magicLores[this.item.lore.value]
      }
      else {
        data["loreValue"] = this.item.lore.value;
      }
    }

    //@HOUSE
    if (this.item.type == "weapon" && game.settings.get("wfrp4e", "mooRangeBands"))
    {
      game.wfrp4e.utility.logHomebrew("mooRangeBands")
      data.showOptimal = true
    }
    //@/HOUSE

    else if (this.item.type == "career") {
      data['skills'] = this.item.system.skills.join(", ").toString();
      data['earningSkills'] = this.item.system.incomeSkill.map(skillIndex => this.item.system.skills[skillIndex]);
      data['talents'] = this.item.system.talents.toString();
      data['trappings'] = this.item.system.trappings.toString();
    }

    else if (this.item.type == "cargo") {
      data.cargoTypes = game.wfrp4e.trade.tradeData[this.item.system.tradeType || "river"].cargoTypes
      data.qualities = game.wfrp4e.config.trade.qualities
      data["dotrActive"] = (game.modules.get("wfrp4e-dotr") && game.modules.get("wfrp4e-dotr").active)
    }

    if (this.item.type == "critical" || this.item.type == "injury" || this.item.type == "disease" || this.item.type == "mutation")
      this.addConditionData(data)
    data.showBorder = data.item.img == "systems/wfrp4e/icons/blank.png" || !data.item.img
    data.isOwned = this.item.isOwned;
    data.effects = this._handleEffects();
    data.enrichment = await this._handleEnrichment();
    data.fromEffect = this.item.fromEffect;
    if (data.effects.temporary.length)
    {
      ui.notifications.warn(game.i18n.format("SHEET.ItemSheetEditableDisabled", {effects: data.effects.temporary.map(i => i.name).join(", ")}))
      this.options.editable = false;
    }
    return data;
  }

  async _handleEnrichment()
  {
    let enrichment = {}
    enrichment["system.description.value"] = await TextEditor.enrichHTML(this.item.system.description.value, { async: true, secrets: this.item.isOwner, relativeTo: this.item})
    enrichment["system.gmdescription.value"] = await TextEditor.enrichHTML(this.item.system.gmdescription.value, { async: true, secrets: this.item.isOwner, relativeTo: this.item })

    return foundry.utils.expandObject(enrichment)
  }

  _handleEffects()
  {
    let effects = {}

    effects.active = this.item.effects.contents.filter(i => i.active);
    effects.disabled = this.item.effects.contents.filter(i => i.disabled);
    effects.temporary = this.item.actor?.getEffectsApplyingToItem(this.item) || [];

    return effects;
  }

  addConditionData(sheetData) {
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
      sheetData.conditions = conditions
    }
    catch (e)
    {
      ui.notifications.error("Error Adding Condition Data: " + e)
    }
  }


    /** @inheritdoc */
    _onDragStart(event) {
      // Create drag data
      let dragData;

      let li = event.currentTarget;
      if ( li.dataset.effectId ) {
        const effect = this.item.effects.get(li.dataset.effectId);
        dragData = effect.toDragData();
      }
      if ( !dragData ) return;

      // Set data transfer
      event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    async _onDrop(event)
    {
      let data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type == "ActiveEffect")
      {
        const effect = await ActiveEffect.implementation.fromDropData(data);
        if ( !this.item.isOwner || !effect ) 
        {
          return false
        };
        if ( this.item.uuid === effect.parent?.uuid ) 
        {
          return false;
        }
        return ActiveEffect.create(effect.toObject(), {parent: this.item});
      }

    }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('input[type="checkbox"]').change(event => this._onSubmit(event));
    html.find('.lore-input').change(this._onLoreChange.bind(this))
    html.find('.char-checkbox').click(this._onCharCheckboxClick.bind(this))
    html.find(".item-checkbox").click(this._onCheckboxClick.bind(this))
    html.find('.csv-input').change(this._onCSVInput.bind(this))
    html.find('.symptom-input').change(this._onSymptomChange.bind(this))
    html.find('.effect-title').click(this._onEditEmbeddedDoc.bind(this))
    html.find(".condition-value").mousedown(this._onConditionClick.bind(this))
    html.find(".condition-toggle").mousedown(this._onConditionToggle.bind(this))
    html.find(".header-link a").mousedown(this._onClickHeaderLink.bind(this))


    html.find(".edit-item-properties").click(ev => {
      new game.wfrp4e.apps.ItemProperties(this.item).render(true)
    })
    html.find(".cargo-sell").click(ev => {
      game.wfrp4e.trade.attemptSell(this.item)
    })

    // Support custom entity links
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

  }

  // Lore input is tricky because we need to choose from a set of defined choices, but it isn't a dropdown
  async _onLoreChange(event) {
    let inputLore = event.target.value;
    // Go through each lore name
    for (let lore in game.wfrp4e.config.magicLores) {
      // If lore value matches config, use that (Update the actor with the "key" value)
      if (inputLore == game.wfrp4e.config.magicLores[lore]) {
        return this.item.update({ 'system.lore.value': lore });
      }
    }
    // Otherwise, if the input isn't recognized, store user input directly as a custom lore
    return this.item.update({ 'system.lore.value': inputLore });
  }


  // For a career, when characteristic checkbox is changed, ensure list of
  // characteristics for that career remains valid.
  _onCharCheckboxClick(event) {
    this._onSubmit(event);
    let charChanged = event.currentTarget.dataset.name;
    this.item.update({ [`system.characteristics.${charChanged}`]: !this.item.system.characteristics[charChanged] });
  }

  _onCheckboxClick(event) {
    let target = $(event.currentTarget).attr("data-target");
    this.item.update({[target] : !getProperty(this.item, target)})
  }

  // This listener converts comma separated lists in the career section to arrays,
  // placing them in the correct location using update
  async _onCSVInput(event) {
    this._onSubmit(event);
    let list = event.target.value.split(",").map(function (item) {
      return item.trim();
    });

    switch (event.target.attributes["data-dest"].value) {
      case 'skills':
        {
          await this.item.update({ 'system.skills': list });
        }
        break;

      // find the indices of the skills that match the earning skill input, send those
      // values to data.incomeSkill
      case 'earning':
        {
          this.item.update({ 'system.incomeSkill': [] });
          let earningSkills = [];
          for (let sk in list) {
            let skillIndex = this.item.skills.indexOf(list[Number(sk)])

            if (skillIndex == -1)
              continue;
            else
              earningSkills.push(skillIndex);

          }
          await this.item.update({ 'system.incomeSkill': earningSkills });
        }
        break;
      case 'talents':
        {
          await this.item.update({ 'system.talents': list });
        }
        break;

      case 'trappings':
        {
          await this.item.update({ 'system.trappings': list });
        }
        break;

    }
  }

  _onSymptomChange(event) {
    return this.item.system.updateSymptoms(event.target.value)
  } 
  
  _onConditionClick(ev) {
    let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
    if (ev.button == 0)
      this.item.addCondition(condKey)
    else if (ev.button == 2)
      this.item.removeCondition(condKey)
  }

  async _onConditionToggle(ev) {
    let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
    if (!game.wfrp4e.config.statusEffects.find(e => e.id == condKey).system.condition.numbered) {
      if (this.item.hasCondition(condKey))
        await this.item.removeCondition(condKey)
      else 
        await this.item.addCondition(condKey)
      return
    }
    if (ev.button == 0)
      await this.item.addCondition(condKey)
    else if (ev.button == 2)
      await this.item.removeCondition(condKey)
  }

  async _onClickHeaderLink(ev)
  {
    let uuid = ev.currentTarget.dataset.uuid;

    let document = await fromUuid(uuid);
    document?.sheet?.render(true);
  }

}