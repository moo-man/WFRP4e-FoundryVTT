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
        onclick: ev => new ItemWfrp4e(this.item.data).postItem()
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

    if (this.item.type === "skill") {
      data['characteristics'] =  game.wfrp4e.config.characteristics;
      data['skillGroup'] =  game.wfrp4e.config.skillGroup;
      data['skillTypes'] =  game.wfrp4e.config.skillTypes;
    }
    else if (this.item.type === "talent") {
      data['talentMaxs'] =  game.wfrp4e.config.talentMax;
    }
    else if (this.item.type == "weapon") {
      data['weaponGroups'] =  game.wfrp4e.config.weaponGroups;
      data['availability'] =  game.wfrp4e.config.availability;
      data['weaponReaches'] =  game.wfrp4e.config.weaponReaches
      data['ammunitionGroups'] =  game.wfrp4e.config.ammunitionGroups;
      data['weaponTypes'] =  game.wfrp4e.config.weaponTypes;
      data.isMelee =  game.wfrp4e.config.groupToType[this.item.data.data.weaponGroup.value] == "melee"
    }
    else if (this.item.type == "ammunition") {
      data['availability'] =  game.wfrp4e.config.availability;
      data['ammunitionGroups'] =  game.wfrp4e.config.ammunitionGroups;
    }
    else if (this.item.type == "armour") {
      data['armorTypes'] =  game.wfrp4e.config.armorTypes;
      data['availability'] =  game.wfrp4e.config.availability;
    }
    else if (this.item.type == "spell") {
      if ( game.wfrp4e.config.magicLores[this.item.data.data.lore.value]) {
        data["loreValue"] =  game.wfrp4e.config.magicLores[this.item.data.data.lore.value]
      }
      else {
        data["loreValue"] = this.item.data.data.lore.value;
      }
      data["descriptionAndLore"] = WFRP_Utility._spellDescription(this.item.data)
      data['characteristics'] =  game.wfrp4e.config.characteristics;
    }
    else if (this.item.type == "prayer") {
      data['prayerTypes'] =  game.wfrp4e.config.prayerTypes;
    }


    else if (this.item.type == "career") {
      data['statusTiers'] =  game.wfrp4e.config.statusTiers;
      data['skills'] = data.data.skills.join(", ").toString();
      data['earningSkills'] = data.data.incomeSkill.map(function (item) {
        return data.data.skills[item];
      });
      data['talents'] = data.data.talents.toString();
      data['trappings'] = data.data.trappings.toString();
      let characteristicList = duplicate( game.wfrp4e.config.characteristicsAbbrev);
      for (let char in characteristicList) {
        if (data.data.characteristics.includes(char))
          characteristicList[char] = {
            abrev:  game.wfrp4e.config.characteristicsAbbrev[char],
            checked: true
          };
        else
          characteristicList[char] = {
            abrev:  game.wfrp4e.config.characteristicsAbbrev[char],
            checked: false
          };
      }
      data['characteristicList'] = characteristicList;

    }

    else if (this.item.type == "trapping") {
      data['trappingTypes'] =  game.wfrp4e.config.trappingTypes;
      data['availability'] =  game.wfrp4e.config.availability;
    }

    else if (this.item.type == "trait") {
      data['characteristics'] =  game.wfrp4e.config.characteristics;
      data['difficultyLabels'] =  game.wfrp4e.config.difficultyLabels;
    }

    else if (this.item.type == "container") {
      data['availability'] =  game.wfrp4e.config.availability;
    }

    else if (this.item.type == "mutation") {
      data['mutationTypes'] =  game.wfrp4e.config.mutationTypes;
    }

    else if (this.item.type == "extendedTest") {
      data['extendedTestCompletion'] =  game.wfrp4e.config.extendedTestCompletion;
    }

    // else if (this.item.type == "disease") {
    //   data.data.symptoms.value.split(",").forEach(s => {
    //     if (!data.symptoms.includes(s.trim())) 
    //       data.symptoms += (", " + s.trim())
    //   })
    // }

    if (this.item.type == "critical" || this.item.type == "injury" || this.item.type == "disease" || this.item.type == "mutation")
      this.addConditionData(data)
    data.showBorder = data.item.img == "systems/wfrp4e/icons/blank.png" || !data.item.img
    data.isGM = game.user.isGM;
    data.isOwned = this.item.isOwned;
    return data;
  }

  addConditionData(data)
  {
    this.filterActiveEffects(data);
    data.conditions = duplicate(game.wfrp4e.config.statusEffects).filter(i => i.id != "fear" && i.id != "grappling");
    delete data.conditions.splice(data.conditions.length - 1, 1)
    for (let condition of data.conditions)
    {
      let existing = data.item.conditions.find(e => e.flags.core.statusId == condition.id)
      if (existing)
      {
        condition.value = existing.flags.wfrp4e.value
        condition.existing = true;
      }
      else condition.value = 0;

      if (condition.flags.wfrp4e.value == null)
        condition.boolean = true;
      
    }
  }

  filterActiveEffects(data)
  {
    data.item.conditions = []

    for (let e of this.item.effects)
    {
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

    // Checkbox changes
    html.find('input[type="checkbox"]').change(event => this._onSubmit(event));


    // Lore input is tricky because we need to choose from a set of defined choices, but it isn't a dropdown
    html.find('.lore-input').change(async event => {
      let loreEffects = this.item.data.effects.filter(i => i.flags.wfrp4e.lore)
      await this.item.deleteEmbeddedEntity("ActiveEffect", loreEffects.map(i => i._id))
      let inputLore = event.target.value;
      // Go through each lore name
      for (let lore in  game.wfrp4e.config.magicLores) {
        // If lore value matches config, use that (Update the actor with the "key" value)
        if (inputLore ==  game.wfrp4e.config.magicLores[lore]) {
          this.item.createEmbeddedEntity("ActiveEffect", game.wfrp4e.config.loreEffects[lore])
          return this.item.update({ 'data.lore.value': lore });
        }
      }
      // Otherwise, if the input isn't recognized, store user input directly as a custom lore
      return this.item.update({ 'data.lore.value': inputLore });

    }),


      // For a career, when characteristic checkbox is changed, ensure list of 
      // characteristics for that career remains valid.
      html.find('.char-checkbox').click(async event => {
        this._onSubmit(event);
        let charChanged = $(event.currentTarget).attr("name")

        let characteristicList = duplicate(this.item.data.data.characteristics);

        // If the charChanged is already in the list, remove it
        if (characteristicList.includes(charChanged))
          characteristicList.splice(characteristicList.findIndex(c => c == charChanged));
        else // If it isn't in the list, add it
          characteristicList.push(charChanged);

        await this.item.update({ 'data.characteristics': characteristicList })

      }),

      // Generalized checkbox update for various different items. TODO: is this needed?
      html.find(".item-checkbox").click(async event => {
        this._onSubmit(event);
        let target = $(event.currentTarget).attr("data-target");
        let data = duplicate(this.item.data)
        setProperty(data, target, !getProperty(data, target))
        this.item.update(data)
      }),

      // This listener converts comma separated lists in the career section to arrays,
      // placing them in the correct location using update
      html.find('.csv-input').change(async event => {
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
                let skillIndex = this.item.data.data.skills.indexOf(list[Number(sk)])

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
      });


    html.find('.symptom-input').change(async event => {
      // Alright get ready for some shit

      // Get all symptoms user inputted
      let symptoms = event.target.value.split(",").map(i => i.trim());

      // Extract just the name (with no severity)
      let symtomNames = symptoms.map(s => {
        if (s.includes("("))
          return s.substring(0, s.indexOf("(")-1)
        else return s
      })

      // take those names and lookup the associated symptom key
      let symptomKeys = symtomNames.map(s => game.wfrp4e.utility.findKey(s, game.wfrp4e.config.symptoms))

      // Remove anything not found
      symptomKeys = symptomKeys.filter(s => !!s)

      // Map those symptom keys into effects, renaming the effects to the user input
      let symptomEffects = symptomKeys.map((s, i) => {
        if (game.wfrp4e.config.symptomEffects[s])
        {
          let effect =  duplicate(game.wfrp4e.config.symptomEffects[s])
          effect.label = symptoms[i];
          return effect

        }
      }).filter(i => !!i)

      let effects = duplicate(this.item.data.effects)

      // Remove all previous symptoms from the item
      effects = effects.filter(e => !getProperty(e, "flags.wfrp4e.symptom"))

      effects = effects.concat(symptomEffects)

      this.item.update({"data.symptoms.value" : symptoms.join(", "), effects})
    })

    // If the user changes a grouped skill that is in their current career,
    // offer to propagate that change to the career as well.
    html.on("change", ".item-name", ev => {
      if (this.item.type != "skill" || !this.item.actor || this.item.data.data.grouped.value != "isSpec")
        return;
      // If no change
      if (ev.target.value == this.item.name)
        return

      let currentCareer = duplicate(this.item.actor.data.careers.find(i => i.data.current.value));

      // If career has the skill that was changed, change the name in the career
      if (currentCareer && currentCareer.data.skills.includes(this.item.name))
        currentCareer.data.skills[currentCareer.data.skills.indexOf(this.item.name)] = ev.target.value;
      else // if it doesn't, return
        return;

      let oldName = this.item.name

      // Ask the user to confirm the change
      new Dialog({
        title: game.i18n.localize("SHEET.CareerSkill"),
        content: `<p>${game.i18n.localize("SHEET.CareerSkillPrompt")}</p>`,
        buttons: {
          yes: {
            label: "Yes",
            callback: async dlg => {
              ui.notifications.notify(`Changing ${oldName} to ${ev.target.value} in ${currentCareer.name}`)
              this.item.actor.updateEmbeddedEntity("OwnedItem", currentCareer)
            }
          },
          no: {
            label: "No",
            callback: async dlg => {
              return;
            }
          },
        },
        default: 'yes'
      }).render(true);
    });


    html.find('.effect-create').click(ev => {
      if (this.item.isOwned)
        return ui.notifications.warn("Foundry does not currently support adding Active Effects to Owned Items. Use a world item instead.")
      else 
        this.item.createEmbeddedEntity("ActiveEffect", {label : this.item.name, icon : this.item.data.img, transfer : !(this.item.data.type == "spell" || this.item.data.type == "prayer")})
    });

    html.find('.effect-title').click(ev => {
      if (this.item.isOwned)
        return ui.notifications.warn("Foundry does not currently support editing Active Effects on Owned Items. Use a world item instead.")

      let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
      const effect = this.item.effects.find(i => i.data._id == id)
      effect.sheet.render(true);
    });

    html.find('.effect-delete').click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
      this.item.deleteEmbeddedEntity("ActiveEffect", id)
    });

    
    html.find(".condition-value").mousedown(ev => {
      let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
      if (ev.button == 0)
        this.item.addCondition(condKey)
      else if (ev.button == 2)
        this.item.removeCondition(condKey)
    })

    html.find(".condition-toggle").mousedown(ev => {
      let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")

      if (game.wfrp4e.config.statusEffects.find(e => e.id == condKey).flags.wfrp4e.value == null)
      {
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
    })

    
    

    // Support custom entity links
    html.on("click", ".chat-roll", ev => {
      WFRP_Utility.handleRollClick(ev)
    })

    html.on("click", ".symptom-tag", ev => {
      WFRP_Utility.handleSymptomClick(ev)
    })

    html.on("click", ".condition-chat", ev => {
      WFRP_Utility.handleConditionClick(ev)
    })

    html.on('mousedown', '.table-click', ev => {
      WFRP_Utility.handleTableClick(ev)
    })

    html.on('mousedown', '.pay-link', ev => {
      WFRP_Utility.handlePayClick(ev)
    })

    html.on('mousedown', '.credit-link', ev => {
      WFRP_Utility.handleCreditClick(ev)
    })

    html.on('mousedown', '.corruption-link', ev => {
      WFRP_Utility.handleCorruptionClick(ev)
    })

    html.on('mousedown', '.fear-link', ev => {
      WFRP_Utility.handleFearClick(ev)
    })

    html.on('mousedown', '.terror-link', ev => {
      WFRP_Utility.handleTerrorClick(ev)
    })

  }
}

Items.unregisterSheet("core", ItemSheet);
Items.registerSheet("wfrp4e", ItemSheetWfrp4e,
  {
    makeDefault: true
  });