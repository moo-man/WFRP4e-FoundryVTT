/**
 * Provides the data and general interaction with Item Sheets
 *
 * The main purpose of this sheet class is to provide the correct
 * data to the template when rendering depending on what type
 * of item the sheet belongs too. Additionally, item sheet
 * interactivity and events are handled here.
 */

import ItemWfrp4e from "./item-wfrp4e.js";
import WFRP_Utility from "../system/utility-wfrp4e.js";



export default class ItemSheetWfrp4e extends ItemSheet {
  constructor(item, options) {
    super(item, options);
    this.mce = null;
  }


  static get defaultOptions() {
    const options = super.defaultOptions;
    options.tabs = [{ navSelector: ".tabs", contentSelector: ".content", initial: "description" }]
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
    $(this._element).find(".close").attr("title", game.i18n.localize("SHEET.Close"));
    $(this._element).find(".configure-sheet").attr("title", game.i18n.localize("SHEET.Configure"));
    $(this._element).find(".post").attr("title", game.i18n.localize("SHEET.Post"));
    $(this._element).find(".import").attr("title", game.i18n.localize("SHEET.Import"));
  }


  /**
   * Use a type-specific template for each different item type
   */
  get template() {
    let type = this.item.type;
    return `systems/wfrp4e/templates/items/item-${type}-sheet.html`;
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
  getData() {
    const data = super.getData();
    data.data = data.item.data._source.data // Use source data to avoid modifications beincg applied

    if (this.item.type == "spell") {
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
      data['skills'] = data.data.skills.join(", ").toString();
      data['earningSkills'] = data.data.incomeSkill.map(function (item) {
        return data.data.skills[item];
      });
      data['talents'] = data.data.talents.toString();
      data['trappings'] = data.data.trappings.toString();
      let characteristicList = duplicate(game.wfrp4e.config.characteristicsAbbrev);
      for (let char in characteristicList) {
        if (data.data.characteristics.includes(char))
          characteristicList[char] = {
            abrev: game.wfrp4e.config.characteristicsAbbrev[char],
            checked: true
          };
        else
          characteristicList[char] = {
            abrev: game.wfrp4e.config.characteristicsAbbrev[char],
            checked: false
          };
      }
      data['characteristicList'] = characteristicList;
    }

    else if (this.item.type == "cargo") {
      data.cargoTypes = game.wfrp4e.config.trade.cargoTypes
      data.qualities = game.wfrp4e.config.trade.qualities
      data["dotrActive"] = (game.modules.get("wfrp4e-dotr") && game.modules.get("wfrp4e-dotr").active)
    }

    if (this.item.type == "critical" || this.item.type == "injury" || this.item.type == "disease" || this.item.type == "mutation")
      this.addConditionData(data)
    data.showBorder = data.item.img == "systems/wfrp4e/icons/blank.png" || !data.item.img
    data.isOwned = this.item.isOwned;
    return data;
  }

  addConditionData(data) {
    this.filterActiveEffects(data);
    data.conditions = duplicate(game.wfrp4e.config.statusEffects).filter(i => i.id != "fear" && i.id != "grappling");
    delete data.conditions.splice(data.conditions.length - 1, 1)
    for (let condition of data.conditions) {
      let existing = data.item.conditions.find(e => e.flags.core.statusId == condition.id)
      if (existing) {
        condition.value = existing.flags.wfrp4e.value
        condition.existing = true;
      }
      else condition.value = 0;

      if (condition.flags.wfrp4e.value == null)
        condition.boolean = true;

    }
  }

  filterActiveEffects(data) {
    data.item.conditions = []

    for (let e of this.item.effects) {
      e.data.sourcename = e.sourceName
      let condId = e.getFlag("core", "statusId")
      if (condId && condId != "fear" && condId != "grappling")
        data.item.conditions.push(e.data)
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
    html.find('.effect-create').click(this._onEffectCreate.bind(this))
    html.find('.effect-title').click(this._onEffectTitleClick.bind(this))
    html.find('.effect-delete').click(this._onEffectDelete.bind(this))
    html.find(".condition-value").mousedown(this._onConditionClick.bind(this))
    html.find(".condition-toggle").mousedown(this._onConditionToggle.bind(this))


    html.find(".edit-item-properties").click(ev => {
      new game.wfrp4e.apps.ItemProperties(this.item).render(true)
    })
    html.find(".cargo-sell").click(ev => {
      game.wfrp4e.apps.Wfrp4eTradeManager.processTradeSell(this.item)
    })

    // Support custom entity links
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

  }

  // Lore input is tricky because we need to choose from a set of defined choices, but it isn't a dropdown
  async _onLoreChange(event) {
    if (!this.item.isOwned)
    {
      let loreEffects = this.item.effects.filter(i => i.flags.wfrp4e.lore)
      await this.item.deleteEmbeddedDocuments("ActiveEffect", loreEffects.map(i => i._id))
      let inputLore = event.target.value;
      // Go through each lore name
      for (let lore in game.wfrp4e.config.magicLores) {
        // If lore value matches config, use that (Update the actor with the "key" value)
        if (inputLore == game.wfrp4e.config.magicLores[lore]) {
          this.item.createEmbeddedDocuments("ActiveEffect", [game.wfrp4e.config.loreEffects[lore]])
          return this.item.update({ 'data.lore.value': lore });
        }
      }
      // Otherwise, if the input isn't recognized, store user input directly as a custom lore
      return this.item.update({ 'data.lore.value': inputLore });
    }
    else 
      return ui.notifications.error(game.i18n.localize("ERROR.SpellLore"));
  }


  // For a career, when characteristic checkbox is changed, ensure list of 
  // characteristics for that career remains valid.
  _onCharCheckboxClick(event) {
    this._onSubmit(event);
    let charChanged = $(event.currentTarget).attr("name")

    let characteristicList = duplicate(this.item.characteristics);

    // If the charChanged is already in the list, remove it
    if (characteristicList.includes(charChanged))
      characteristicList.splice(characteristicList.findIndex(c => c == charChanged));
    else // If it isn't in the list, add it
      characteristicList.push(charChanged);

    this.item.update({ 'data.characteristics': characteristicList })
  }

  _onCheckboxClick(event) {
    this._onSubmit(event);
    let target = $(event.currentTarget).attr("data-target");
    let data = this.item.toObject()
    setProperty(data, target, !getProperty(data, target))
    this.item.update(data)
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
          await this.item.update({ 'data.skills': list });
        }
        break;

      // find the indices of the skills that match the earning skill input, send those
      // values to data.incomeSkill
      case 'earning':
        {
          this.item.update({ 'data.incomeSkill': [] });
          let earningSkills = [];
          for (let sk in list) {
            let skillIndex = this.item.skills.indexOf(list[Number(sk)])

            if (skillIndex == -1)
              continue;
            else
              earningSkills.push(skillIndex);

          }
          await this.item.update({ 'data.incomeSkill': earningSkills });
        }
        break;
      case 'talents':
        {
          await this.item.update({ 'data.talents': list });
        }
        break;

      case 'trappings':
        {
          await this.item.update({ 'data.trappings': list });
        }
        break;

    }
  }

  async _onSymptomChange(event) {
    // Alright get ready for some shit

    // Get all symptoms user inputted
    let symptoms = event.target.value.split(",").map(i => i.trim());

    // Extract just the name (with no severity)
    let symtomNames = symptoms.map(s => {
      if (s.includes("("))
        return s.substring(0, s.indexOf("(") - 1)
      else return s
    })

    // take those names and lookup the associated symptom key
    let symptomKeys = symtomNames.map(s => game.wfrp4e.utility.findKey(s, game.wfrp4e.config.symptoms))

    // Remove anything not found
    symptomKeys = symptomKeys.filter(s => !!s)

    // Map those symptom keys into effects, renaming the effects to the user input
    let symptomEffects = symptomKeys.map((s, i) => {
      if (game.wfrp4e.config.symptomEffects[s]) {
        let effect = duplicate(game.wfrp4e.config.symptomEffects[s])
        effect.label = symptoms[i];
        return effect

      }
    }).filter(i => !!i)

    // Remove all previous symptoms from the item
    let effects = this.item.effects.map(i => i.toObject()).filter(e => getProperty(e, "flags.wfrp4e.symptom"))

    // Delete previous symptoms
    await this.item.deleteEmbeddedDocuments("ActiveEffect", effects.map(i => i._id))

    // Add symptoms from input
    await this.item.createEmbeddedDocuments("ActiveEffect", symptomEffects)

    this.item.update({ "data.symptoms.value": symptoms.join(", ") })
  }

  _onEffectCreate(ev) {
    if (this.item.isOwned)
      return ui.notifications.warn(game.i18n.localize("ERROR.AddEffect"))
    else
      this.item.createEmbeddedDocuments("ActiveEffect", [{ label: this.item.name, icon: this.item.data.img, transfer: !(this.item.data.type == "spell" || this.item.data.type == "prayer") }])
  }

  _onEffectTitleClick(ev) {
    if (this.item.isOwned)
      return ui.notifications.warn(game.i18n.localize("ERROR.EditEffect"))

    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    const effect = this.item.effects.find(i => i.data._id == id)
    effect.sheet.render(true);
  }

  _onEffectDelete(ev) {
    let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
    this.item.deleteEmbeddedDocuments("ActiveEffect", [id])
  }

  _onConditionClick(ev) {
    let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
    if (ev.button == 0)
      this.item.addCondition(condKey)
    else if (ev.button == 2)
      this.item.removeCondition(condKey)
  }

  _onConditionToggle(ev) {
    let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")

    if (game.wfrp4e.config.statusEffects.find(e => e.id == condKey).flags.wfrp4e.value == null) {
      if (this.item.hasCondition(condKey))
        this.item.removeCondition(condKey)
      else
        this.item.addCondition(condKey)
      return
    }

    if (ev.button == 0)
      this.item.addCondition(condKey)
    else if (ev.button == 2)
      this.item.removeCondition(condKey)
  }

}

Items.unregisterSheet("core", ItemSheet);
Items.registerSheet("wfrp4e", ItemSheetWfrp4e,
  {
    makeDefault: true
  });