import MarketWfrp4e from "../../apps/market-wfrp4e.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";

import WFRP_Audio from "../../system/audio-wfrp4e.js"
import NameGenWfrp from "../../apps/name-gen.js";

/**
 * Provides the data and general interaction with Actor Sheets - Abstract class.
 *
 * ActorSheetWfrp4e provides the general interaction and data organization shared among all 
 * actor sheets, as this is an abstract class, inherited by either Character, NPC, or Creature
 * specific actor sheet classes. When rendering an actor sheet, getData() is called, which is
 * a large and key function that prepares the actor data for display, processing the raw data
 * and items and compiling them into data to display on the sheet. Additionally, this class
 * contains all the main events that respond to sheet interaction in activateListeners().
 *
 * @see   ActorWfrp4e - Data and main computation model (this.actor)
 * @see   ActorSheetWfrp4eCharacter - Character sheet class
 * @see   ActorSheetWfrp4eNPC - NPC sheet class
 * @see   ActorSheetWfrp4eCreature - Creature sheet class
 */
export default class ActorSheetWfrp4e extends ActorSheet {


  /**
   * Return the type of the current Actor.
   * @return {String} Actor type - character, npc, or creature 
   */
  get actorType() {
    return this.actor.data.type;
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.tabs = [{ navSelector: ".tabs", contentSelector: ".content", initial: "main" }]
    options.width = 576;
    return options;
  }

  /**
   * Overrides the default ActorSheet.render to add functionality.
   * 
   * This function adds scroll position saving support, as well as tooltips for the
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
      $('.tab.skills').find('input[data-item-id="'+this.saveSkillFocusDataItemId+'"')[0].focus();
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
   * This function is called when rendering the sheet, where it calls the base actor class
   * to organize, process, and prepare all actor data for display. See ActorWfrp4e.prepare()
   * 
   * @returns {Object} sheetData    Data given to the template when rendering
   */
  getData() {
    const sheetData = super.getData();
    mergeObject(sheetData.actor, this.actor.prepare())

    if (this.actor.data.type=="character")
      this.addCharacterData(sheetData.actor)
    else if (this.actor.data.type=="npc")
      this.addNPCData(sheetData.actor)
    else if (this.actor.data.type=="creature")
      this.addCreatureData(sheetData.actor)

    this.addConditionData(sheetData);

    if(this.actor.data.type!="vehicle")
    {
      this.addMountData(sheetData);
      sheetData.systemEffects = game.wfrp4e.utility.getSystemEffects();
    }


    sheetData.isGM = game.user.isGM;

    return sheetData;
  }


  addConditionData(data)
  {
    this.filterActiveEffects(data);
    data.conditions = duplicate(game.wfrp4e.config.statusEffects);
    delete data.conditions.splice(data.conditions.length - 1, 1)
    for (let condition of data.conditions)
    {
      let existing = data.actor.conditions.find(e => e.flags.core.statusId == condition.id)
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
    data.actor.conditions = []
    data.actor.tempEffects = []
    data.actor.passiveEffects = []
    data.actor.disabledEffects = []

    for (let e of this.actor.effects)
    {
      if (!game.user.isGM && e.getFlag("wfrp4e", "hide"))
        continue;
      e.data.sourcename = e.sourceName
      if (e.data.sourcename == "Unknown")
      {
        let sourceItem = this.actor.getEffectItem(e.data)
        if (sourceItem)
          e.data.sourcename = sourceItem.name;
        if (sourceItem && sourceItem.data.type == "disease" && !game.user.isGM)
          e.data.sourcename = "???";
      }
      if (CONFIG.statusEffects.map(i => i.id).includes(e.getFlag("core", "statusId"))) data.actor.conditions.push(e.data)
      else if (e.data.disabled) data.actor.disabledEffects.push(e.data)
      else if (e.isTemporary) data.actor.tempEffects.push(e.data)
      else data.actor.passiveEffects.push(e.data);
    }

    data.actor.passiveEffects = this._consolidateEffects(data.actor.passiveEffects)
    data.actor.tempEffects = this._consolidateEffects(data.actor.tempEffects)
    data.actor.disabledEffects = this._consolidateEffects(data.actor.disabledEffects)

    data.actor.appliedEffects = this.actor.data.effects.filter(e => ((getProperty(e, "flags.wfrp4e.effectApplication") == "apply" || getProperty(e, "flags.wfrp4e.effectTrigger") == "invoke") && !e.origin))
  }

  _consolidateEffects(effects)
  {
    let consolidated = []
    for(let effect of effects)
    {
      let existing = consolidated.find(e => e.label == effect.label)
      if (!existing)
        consolidated.push(effect)
    }
    for(let effect of consolidated)
    {
      let count = effects.filter(e => e.label == effect.label).length
      if (count > 1)
        effect.displayLabel = `${effect.label} (${count})`
      else 
        effect.displayLabel = effect.label
    }
    return consolidated
  }

  addMountData(data)
  {
    try {
    if (!this.actor.mount)
      return

    
    data.mount = this.actor.mount.data
    if (data.mount.data.status.wounds.value == 0)
      this.actor.data.data.status.mount.mounted = false;
    if (data.actor.data.status.mount.isToken)
      data.mount.sceneName =  game.scenes.get(data.actor.data.status.mount.tokenData.scene).data.name
    }
    catch(e)
    {
      console.error(this.actor.name + ": Failed to get mount data: " + e.message)
    }
  }

  addCharacterData(actorData) {

    let untrainedSkills = []
    let untrainedTalents = []
    let hasCurrentCareer = false;
    this.actor.data.flags.careerTalents = [];
    // For each career, find the current one, and set the details accordingly (top of the character sheet)
    // Additionally, set available characteristics, skills, and talents to advance (advancement indicator)
    for (let career of actorData.careers) {
      if (career.data.current.value) {
        hasCurrentCareer = true; // Used to remove indicators if no current career

        // Setup Character detail values
        actorData.currentClass = career.data.class.value;
        actorData.currentCareer = career.name;
        actorData.currentCareerGroup = career.data.careergroup.value;

        if (!actorData.data.details.status.value) // backwards compatible with moving this to the career change handler
          actorData.data.details.status.value =  game.wfrp4e.config.statusTiers[career.data.status.tier] + " " + career.data.status.standing;

        // Setup advancement indicators for characteristics
        let availableCharacteristics = career.data.characteristics
        for (let char in actorData.data.characteristics) {
          if (availableCharacteristics.includes(char))
          {
            actorData.data.characteristics[char].career = true;
            if (actorData.data.characteristics[char].advances >= career.data.level.value * 5)
            {
              actorData.data.characteristics[char].complete = true;
            }

          }
        }

        // Find skills that have been trained or haven't, add advancement indicators or greyed out options (untrainedSkills)
        for (let sk of career.data.skills) {
          let trainedSkill = actorData.basicSkills.concat(actorData.advancedOrGroupedSkills).find(s => s.name.toLowerCase() == sk.toLowerCase())
          if (trainedSkill) {
            trainedSkill.career = true;
            if (trainedSkill.data.advances.value >= career.data.level.value * 5)
              trainedSkill.complete = true;
          }
          else {
            untrainedSkills.push(sk);
          }
        }

        // Find talents that have been trained or haven't, add advancement button or greyed out options (untrainedTalents)
        for (let talent of career.data.talents) {
          let trainedTalents = actorData.talents.find(t => t.name == talent)
          if (trainedTalents) {
            trainedTalents.career = true;
            this.actor.data.flags.careerTalents.push(trainedTalents)
          }
          else {
            untrainedTalents.push(talent);
          }
        }
      }
    }

    // Remove advancement indicators if no current career
    if (!hasCurrentCareer) {
      for (let char in actorData.data.characteristics)
        actorData.data.characteristics[char].career = false;
    }

    //Add advancement indicators
    actorData.basicSkills.forEach(skill => skill.career = skill.flags.forceAdvIndicator ? true : skill.career);
    actorData.advancedOrGroupedSkills.forEach(skill => skill.career = skill.flags.forceAdvIndicator ? true : skill.career);
    actorData.talents.forEach((talent) => {
      if (!talent.career)
        this.actor.data.flags.careerTalents.push(talent);
      talent.career = talent.flags.forceAdvIndicator ? true : talent.career;
    });
    // Add arrays to prepared actotr datas
    actorData.untrainedSkills = untrainedSkills;
    actorData.untrainedTalents = untrainedTalents;


    actorData.data.details.experience.log = actorData.data.details.experience.log.reverse();
  }

  addNPCData(actorData) {

  }

  addCreatureData(actorData) {
        // notes traits is all traits - for display in the notes tab
    actorData.notesTraits = actorData.traits.sort(WFRP_Utility.nameSorter);
    // "traits" is only included traits 
    actorData.traits = actorData.traits.filter(t => t.included);

    // Combine all skills into a skill array (for creatur overview in the maintab)
    actorData.skills = (actorData.basicSkills.concat(actorData.advancedOrGroupedSkills)).sort(WFRP_Utility.nameSorter);
    // Filter those skills by those trained (only show skills with an advancement in the main tab)
    actorData.trainedSkills = actorData.skills.filter(s => s.data.advances.value > 0)

    for (let weapon of actorData.weapons) {
      try // For each weapon, if it has ammo equipped, add the ammo name to the weapon
      {   // This is needed because we can't have both ammo dropdowns functional in the main tab and the combat tab easily
        if (weapon.data.currentAmmo.value)
          weapon.ammoName = actorData.inventory.ammunition.items.find(a => a._id == weapon.data.currentAmmo.value).name;
      }
      catch
      { }
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
    let wounds;
    if (sign === "+" || sign === "-") // Relative
    {
      let possibleWounds = eval(this.actor.data.data.status.wounds.value + parseInt(value));
      wounds = possibleWounds > this.actor.data.data.status.wounds.max ? this.actor.data.data.status.wounds.max : possibleWounds;
    }
    else                            // Absolute
      wounds = parseInt(value);

    this.actor.update({ "data.status.wounds.value": wounds });
  }

    /**
   * Display a dialog for the user to choose casting or channelling.
   *
   * When clicking on a spell, the user will get an option to Cast or Channel that spell
   * Each option leads to their respective "setup" functions.
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
  /* ------------------------------------ Event Listeners and Handlers --------------------------------------- */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * This gargatuan list is all the interactions shared between all types of sheets. Every button click and text
   * fields that require special interaction are handled here. See each event handler for more details. 
   *
  /* --------------------------------------------------------------------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Item summaries - displays a customized dropdown description
    html.find('.item-dropdown').click(event => this._onItemSummary(event));

    // Item Properties - depending on the item property selected, display a dropdown definition, this can probably be consolidated...TODO
    html.find('.melee-property-quality, .melee-property-flaw, .ranged-property-quality, .ranged-property-flaw, .armour-quality, .armour-flaw').click(event => this._expandProperty(event));

    // Other dropdowns - for other clickables (range, weapon group, reach) - display dropdown helpers
    html.find('.weapon-range, .weapon-group, .weapon-reach').click(event => this._expandInfo(event));

    // Autoselect entire text 
    $("input[type=text]").focusin(function () {
      $(this).select();
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find("#configure-actor").click(ev => {
      new game.wfrp4e.apps.ActorSettings(this.actor).render(true);
    })


    // Use customized input interpreter when manually changing wounds 
    html.find(".wounds-value").change(event => {
      this._modifyWounds(event.target.value)
    })

    // This disgusting mess allows characteristics to be tabbed through. (Used only by Creature and NPC sheets, placed here to maintain DRY code)
    // This specific function is for keydown, specifically looking for tabs (which shouldn't update immediately or else it disrupts the user), see the listener below for more behavior
    html.find(".ch-edit").keydown(event => {
      if (event.keyCode == 9) // If Tabbing out of a characteristic input, save the new value (and future values) in updateObj
      {
        let characteristics = this.actor._data.data.characteristics
        let ch = event.currentTarget.attributes["data-char"].value;
        let newValue = Number(event.target.value);

        if (!this.updateObj) // Create a new updateObj (every time updateObj is used for an update, it is deleted, see below)
          this.updateObj = duplicate(this.actor._data.data.characteristics);;


        if (!(newValue == characteristics[ch].initial + characteristics[ch].advances)) // don't update a characteristic if it wasn't changed
        {
          this.updateObj[ch].initial = newValue;
          this.updateObj[ch].advances = 0;
        }
        this.charUpdateFlag = false;
      }
      else {
        this.charUpdateFlag = true; // If the user did not click tab, OK to update
      }
    })

    // 
    html.find('.ch-edit').focusout(async event => {
      event.preventDefault();
      // Do not proceed with an update until the listener aboves sets this flag to true or the last characteristic was tabbed
      if (!this.charUpdateFlag && event.currentTarget.attributes["data-char"].value != "fel")
        return                  // When this flag is true, that means the focus out was not from a tab

      // This conditional allows for correctly updating only a single characteristic. If the user editted only one characteristic, the above listener wasn't called, meaning no updateObj
      if (!this.updateObj)
        this.updateObj = duplicate(this.actor._data.data.characteristics)

      // In order to correctly update the last element, we use the normal procedure (similar to above)
      let characteristics = this.actor._data.data.characteristics
      let ch = event.currentTarget.attributes["data-char"].value;
      let newValue = Number(event.target.value);

      if (!(newValue == characteristics[ch].initial + characteristics[ch].advances)) {
        this.updateObj[ch].initial = newValue;
        this.updateObj[ch].advances = 0;
      }
      // Finally, update and delete the updateObj
      await this.actor.update({ "data.characteristics": this.updateObj })
      this.updateObj = undefined;
    });

    html.find('.skill-advances').change(async event => {
      event.preventDefault()

      let itemId = event.target.attributes["data-item-id"].value;
      let itemToEdit = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      itemToEdit.data.advances.value = Number(event.target.value);

      await this.actor.updateEmbeddedEntity("OwnedItem", itemToEdit);

      // Record this for later if press they tab or click on another skill. 
      this.saveSkillFocusDataItemId = $(document.activeElement).attr('data-item-id');
    });

    // I don't remember why this was added ¯\_(ツ)_/¯ TODO: evaluate
    // html.find('.skill-advances').focusin(async event => {
    //   event.target.focus();
    // });

    // Ammo selector in the combat tab - change the currentAmmo value of the item to the selected value
    html.find('.ammo-selector').change(async event => {
      let itemId = event.target.attributes["data-item-id"].value;
      const itemToEdit = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      itemToEdit.data.currentAmmo.value = event.target.value;
      this.actor.updateEmbeddedEntity("OwnedItem", itemToEdit);
      WFRP_Audio.PlayContextAudio({ item: itemToEdit, action: "load" }) // 'load' is unused
    });


    // Spells & Ingredients - ingredients can map to one spell, so any spell may have 0 to N available ingredients, but ingredients can only have 0 to 1 spell
    // ingredient.spellIngredient - what spell this ingredient maps to
    // spell.currentIng - what ingredient a spell is using currently (selected)

    // Spell selector for ingredients - change the spellIngredient value of the item to the selected spell
    html.find('.spell-selector').change(async event => {
      let itemId = event.target.attributes["data-item-id"].value;
      const ing = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      ing.data.spellIngredient.value = event.target.value;
      this.actor.updateEmbeddedEntity("OwnedItem", ing);
    });

    // Ingredient Selector for spells - change the currently used ingredient to the selected value
    html.find('.ingredient-selector').change(async event => {
      let itemId = event.target.attributes["data-item-id"].value;
      const spell = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      spell.data.currentIng.value = event.target.value;
      this.actor.updateEmbeddedEntity("OwnedItem", spell);
    });

    // Characteristic Tests
    html.find('.ch-value').click(event => {
      event.preventDefault();
      let characteristic = event.currentTarget.attributes["data-char"].value;
      this.actor.setupCharacteristic(characteristic).then(setupData => {
        this.actor.basicTest(setupData)
      });
    });

    // Skill Tests (right click to open skill sheet)
    html.find('.skill-total, .skill-select').mousedown(ev => {
      let itemId = this._getItemId(ev);

      if (ev.button == 0)
      {
        let skill = this.actor.data.items.find(i => i._id == itemId);
        this.actor.setupSkill(skill).then(setupData => {
          this.actor.basicTest(setupData)
        });
      }
      else if (ev.button == 2)
      {
        let skill = this.actor.items.get(itemId);
        skill.sheet.render(true);
      }
    })


    html.find(".skill-switch").click(ev => {
      this.actor.update({"flags.wfrp4e.showExtendedTests" : !getProperty(this.actor, "data.flags.wfrp4e.showExtendedTests")})
      this.render(true)
    })

    html.find(".test-select").click(ev => {
      let itemId = this._getItemId(ev)
      let item = this.actor.getEmbeddedEntity("OwnedItem", itemId)
      this.actor.setupExtendedTest(item);
    })

    html.find(".extended-SL").mousedown(ev => {
      let itemId = this._getItemId(ev)
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      if (ev.button == 0)
        item.data.SL.current++;
      else if (ev.button == 2)
        item.data.SL.current--;
      
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    })

    // Weapon tests (combat tab)
    html.find('.weapon-item-name').click(event => {
      event.preventDefault();
      let itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
      let weapon = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      if (weapon)
        this.actor.setupWeapon(duplicate(weapon)).then(setupData => {
          this.actor.weaponTest(setupData)
        });
    })

    // Unarmed attack button (fist in the combat tab)
    html.find('.fist-icon').click(async event => {
      event.preventDefault();
      let unarmed = game.wfrp4e.config.systemItems.unarmed
      this.actor.setupWeapon(unarmed).then(setupData => {
        this.actor.weaponTest(setupData)
      });
      // Roll Fist Attack
    })

    // Dodge (Arrow in the combat tab)
    html.find('.dodge-icon').click(async event => {
      let skill = this.actor.data.skills.find(s => s.name == game.i18n.localize("NAME.Dodge") && s.type == "skill")
      if (skill)
        this.actor.setupSkill(skill).then(setupData => {
          this.actor.basicTest(setupData)
        });
      else
        this.actor.setupCharacteristic("ag", {dodge: true}).then(setupData => {
          this.actor.basicTest(setupData)
        });
    })

    // Dodge (Arrow in the combat tab)
    html.find('.improvised-icon').click(async event => {
      event.preventDefault();
      let improv = game.wfrp4e.config.systemItems.improv;
      this.actor.setupWeapon(improv).then(setupData => {
        this.actor.weaponTest(setupData)
      });
    })

    // Stomp (Creature)
    html.find('.stomp-icon').click(async event => {
      event.preventDefault();
      let stomp = game.wfrp4e.config.systemItems.stomp;
      this.actor.setupTrait(stomp).then(setupData => {
        this.actor.traitTest(setupData)
      });
    })

    // Rest
    html.find('.rest-icon').click(async event => {

      let skill = this.actor.data.skills.find(s => s.name == game.i18n.localize("NAME.Endurance"));
      if (skill)
        this.actor.setupSkill(skill, { rest: true, tb: this.actor.data.data.characteristics.t.bonus }).then(setupData => {
          this.actor.basicTest(setupData)
        });
      else
        this.actor.setupCharacteristic("t", { rest: true }).then(setupData => {
          this.actor.basicTest(setupData)
        });

    })

    // Roll a trait (right click to show dropdown description)
    html.find('.trait-roll').mousedown(event => {
      event.preventDefault();
      if (event.button == 2) {
        this._onItemSummary(event);
        return;
      }
      let itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
      let trait = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      this.actor.setupTrait(duplicate(trait)).then(setupData => {
        this.actor.traitTest(setupData)
      });;
    })

    // Roll a spell (right click to show dropdown description)
    html.find('.spell-roll').mousedown(event => {
      event.preventDefault();
      if (event.button == 2) {
        this._onItemSummary(event);
        return;
      }
      let itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
      let spell = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      this.spellDialog(duplicate(spell));
    })

    // Roll a prayer (right click to show dropdown description)
    html.find('.prayer-roll').mousedown(event => {
      event.preventDefault();
      if (event.button == 2) {
        this._onItemSummary(event);
        return;
      }
      let itemId = $(event.currentTarget).parents(".item").attr("data-item-id");
      let prayer = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      this.actor.setupPrayer(duplicate(prayer)).then(setupData => {
        this.actor.prayerTest(setupData)
      });;
    })

    // Change the AP Damaged value in the combat tab based no left click or right click
    html.find('.ap-value').mousedown(ev => {
      let itemId = this._getItemId(ev);
      let APlocation = $(ev.currentTarget).parents(".armour-box").attr("data-location");
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      if (item.data.currentAP[APlocation] == -1)
        item.data.currentAP[APlocation] = item.data.maxAP[APlocation];
      switch (event.button) {
        case 0:
          item.data.currentAP[APlocation]++;
          if (item.data.currentAP[APlocation] > item.data.maxAP[APlocation])
            item.data.currentAP[APlocation] = item.data.maxAP[APlocation]
          break;
        case 2:
          item.data.currentAP[APlocation]--;
          if (item.data.currentAP[APlocation] < 0)
            item.data.currentAP[APlocation] = 0;
          break;
      }
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

    // Change the Weapon Damage value in the combat tab based on left click or right click (damage TO weapon)
    html.find('.weapon-damage').mousedown(ev => {
      let itemId = this._getItemId(ev);
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
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
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

    // Click on the AP total in the combat tab - damage AP by one, prioritizing Armour trait over Armour Items
    html.find(".armour-total").mousedown(ev => {
      let location = $(ev.currentTarget).closest(".column").find(".armour-box").attr("data-location")
      if (!location) location = $(ev.currentTarget).closest(".column").attr("data-location");
      if (!location) return;
      let armourTraits = this.actor.data.traits.filter(i => i.name.toLowerCase() == "armour" || i.name.toLowerCase() == "armor")
      if (armourTraits.length)
        armourTraits = duplicate(armourTraits);
      let armourItems = this.actor.data.armour;
      let armourToDamage;
      let usedTrait = false;

      for (let armourTrait of armourTraits)
      {
        // Add damage values if trait hasn't been damaged before
        if (armourTrait && !armourTrait.APdamage)
          armourTrait.APdamage = { head: 0, body: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0 };

        // Used trait is a flag to denote whether the trait was damaged or not. If it was not, armor is damaged instead
        if (armourTrait) {
          // Left click decreases APdamage (makes total AP increase)
          if (ev.button == 0) {
            if (armourTrait.APdamage[location] != 0) {
              armourTrait.APdamage[location]--;
              usedTrait = true;
            }
          }
          // Right click increases Apdamage (makes total AP decrease)
          if (ev.button == 2) {
            
            if (armourTrait.APdamage[location] == Number(armourTrait.data.specification.value)) {
              continue // skip fully damaged traits
            }
            // Don't increase APdamage past total AP value
            if (armourTrait.APdamage[location] != Number(armourTrait.data.specification.value)) {
              armourTrait.APdamage[location]++;
              usedTrait = true;
            }
          }
          // If trait was damaged, update
          if (usedTrait) {
            this.actor.updateEmbeddedEntity("OwnedItem", armourTrait)
            return;
          }
        }
      }

      if (armourItems && !usedTrait) {
        // Find the first armor item that has AP at the damaged area
        for (let a of armourItems) {
          if (ev.button == 2) {
            // If damaging the item, only select items that have AP at the location
            if (a.data.maxAP[location] != 0 && a.data.currentAP[location] != 0) {
              armourToDamage = duplicate(a);
              break;
            }
          }
          else if (ev.button == 0) {
            // If repairing, select only items that *should* have AP there, ie has a maxAP, and isn't at maxAP
            if (a.data.maxAP[location] != 0 && a.data.currentAP[location] != -1 && a.data.currentAP[location] != a.data.maxAP[location]) {
              armourToDamage = duplicate(a);
              break;
            }
          }
        }
        if (!armourToDamage)
          return

        // Replace -1 flag with maxAP
        if (armourToDamage.data.currentAP[location] == -1)
          armourToDamage.data.currentAP[location] = armourToDamage.data.maxAP[location]

        if (ev.button == 2) {
          if (armourToDamage.data.currentAP[location] != 0)
            armourToDamage.data.currentAP[location]--
        }
        if (ev.button == 0) {
          if (armourToDamage.data.currentAP[location] != armourToDamage.data.maxAP[location])
            armourToDamage.data.currentAP[location]++
        }
        this.actor.updateEmbeddedEntity("OwnedItem", armourToDamage)
      }
    })

    // Damage a shield item by clicking on the shield AP amount in the combat tab
    html.find(".shield-total").mousedown(ev => {
      let weapons = this.actor.prepareItems().weapons
      let shields = weapons.filter(w => w.properties.qualities.find(p => p.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase())))
      let shieldDamaged = false;
      // If for some reason using multiple shields...damage the first one available 
      for (let s of shields) {
        let shield = duplicate(this.actor.getEmbeddedEntity("OwnedItem", s._id));
        let shieldQualityValue = s.properties.qualities.find(p => p.toLowerCase().includes(game.i18n.localize("PROPERTY.Shield").toLowerCase())).split(" ")[1];

        if (!shield.data.APdamage)
          shield.data.APdamage = 0;
        // Right click - damage
        if (ev.button == 2) {
          if (shield.data.APdamage < Number(shieldQualityValue)) // Don't damage more than shield value
          {
            shield.data.APdamage++
            shieldDamaged = true;
            WFRP_Audio.PlayContextAudio({ item: shield, action: "damage", outcome: "shield" })
          }
        }
        // Left click - repair
        if (ev.button == 0) {
          if (shield.data.APdamage != 0) {
            shield.data.APdamage--;
            shieldDamaged = true;
          }
        }
        if (shieldDamaged) {
          this.actor.updateEmbeddedEntity("OwnedItem", shield)
          return;
        }
      }
    })

    // Toggle whether a spell is memorized
    html.find('.memorized-toggle').click(async ev => {
      let itemId = this._getItemId(ev);
      const spell = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      spell.data.memorized.value = !spell.data.memorized.value;

      if (spell.data.memorized.value)
        WFRP_Audio.PlayContextAudio({ item: spell, action: "memorize" })
      else
        WFRP_Audio.PlayContextAudio({ item: spell, action: "unmemorize" })
      await this.actor.updateEmbeddedEntity("OwnedItem", spell);
    });

    // Manually increment/decrement spell SL for channelling 
    html.find('.sl-counter').mousedown(async ev => {
      let itemId = this._getItemId(ev);
      const spell = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      switch (event.button) {
        case 0:
          spell.data.cn.SL++;
          if (spell.data.cn.SL > (spell.data.memorized.value ? spell.data.cn.value : spell.data.cn.value * 2))
            spell.data.cn.SL = (spell.data.memorized.value ? spell.data.cn.value : spell.data.cn.value * 2);
          break;
        case 2:
          spell.data.cn.SL--;
          break;
      }
      await this.actor.updateEmbeddedEntity("OwnedItem", spell);
    });

    // Change auto calculation flags on right click
    html.find('.auto-calc-toggle').mousedown(async ev => {
      let toggle = event.target.attributes["toggle-type"].value;

      if (event.button == 2) {
        let newFlags = duplicate(this.actor.data.flags);

        if (toggle == "walk")
          newFlags.autoCalcWalk = !newFlags.autoCalcWalk;

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
    });

    // Roll a disease and then right click decrement once rolled
    html.find('.disease-roll').mousedown(async ev => {
      let itemId = this._getItemId(ev);
      const disease = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      let type = ev.target.dataset["type"]; // incubation or duration


      if (type == "incubation")
        disease.data.duration.active = false;

      if (!isNaN(disease.data[type].value))
      {
        let number = Number(disease.data[type].value)

        if (ev.button == 0)
          return this.actor.decrementDisease(disease)
        else 
          number++

        disease.data[type].value = number;

        this.actor.updateEmbeddedEntity("OwnedItem", disease);
      }

      // If left click - TODO: Enum
      else if (ev.button == 0) { // Parse disease length and roll it
        try {
          let rollValue = new Roll(disease.data[type].value).roll().total
          disease.data[type].value = rollValue
          if (type == "duration")
            disease.data.duration.active = true;
        }
        catch
        {
          return ui.notifications.error("Could not parse disease roll")
        }

        this.actor.updateEmbeddedEntity("OwnedItem", disease);
      }
    });

      html.find('.injury-duration').mousedown(async ev => {
        let itemId = this._getItemId(ev);
        let injury = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
  
        if (!isNaN(injury.data.duration.value))
        {
  
          if (ev.button == 0)
            return this.actor.decrementInjury(injury)
          else 
            injury.data.duration.value++
  
          this.actor.updateEmbeddedEntity("OwnedItem", injury);
        }
        else
        {
          try {
            let rollValue = new Roll(injury.data.duration.value).roll().total
            injury.data.duration.value = rollValue
            injury.data.duration.active = true;
            this.actor.updateEmbeddedEntity("OwnedItem", injury);
          }
          catch
          {
            return ui.notifications.error("Could not parse injury roll")
          }
        }
  
      });

    // Increment/Decrement Fate/Fortune/Resilience/Resolve
    html.find('.metacurrency-value').mousedown(async ev => {
      let type = $(ev.currentTarget).attr("data-point-type");
      let newValue = ev.button == 0 ? this.actor.data.data.status[type].value + 1 : this.actor.data.data.status[type].value - 1
      this.actor.update({ [`data.status.${type}.value`]: newValue })
    });


    /* -------------------------------------------- */
    /*  Inventory
    /* -------------------------------------------- */

    // Create New Item
    html.find('.item-create').click(ev => this._onItemCreate(ev));
    html.find('.effect-create').click(ev => this._onEffectCreate(ev));


    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      let itemId = this._getItemId(ev);
      const item = this.actor.items.find(i => i.data._id == itemId)
      item.sheet.render(true);
    });


    // Update Effect Item
    html.find('.effect-title').click(ev => {
      let id = this._getItemId(ev);
      let effect = this.actor.effects.find(i => i.data._id == id)
      if (!effect)
        effect = new ActiveEffect(this.actor._data.effects.find(i => i._id == id), this.actor)
      effect.sheet.render(true);
    });
    
    html.find('.effect-delete').click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
      this.actor.deleteEmbeddedEntity("ActiveEffect", id)
    });
    

    html.find('.effect-toggle').click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
      let effect = duplicate(this.actor.getEmbeddedEntity("ActiveEffect", id))
      effect.disabled = !effect.disabled
      this.actor.updateEmbeddedEntity("ActiveEffect", effect)
    });

    html.find('.effect-target').click(ev => {
      let id = $(ev.currentTarget).parents(".item").attr("data-item-id");
      let effect = duplicate(this.actor.getEmbeddedEntity("ActiveEffect", id))
      if (getProperty(effect, "flags.wfrp4e.effectTrigger") == "apply")
        game.wfrp4e.utility.applyEffectToTarget(effect)
      else
      {
        try {
          let func = new Function("args", getProperty(effect, "flags.wfrp4e.script")).bind({ actor: this.actor, effect })
          func()
          }
          catch (ex) {
            ui.notifications.error("Error when running effect " + effect.label + ": " + ex)
            console.log("Error when running effect " + effect.label + ": " + ex)
          }
      }
    });
    

    html.find('.advance-diseases').click(ev => this.actor.decrementDiseases());


    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      let li = $(ev.currentTarget).parents(".item"),
        itemId = li.attr("data-item-id");
      if (this.actor.getEmbeddedEntity("OwnedItem", itemId).name == "Boo") {
        AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}squeek.wav`}, false)
        return // :^)
      }

      renderTemplate('systems/wfrp4e/templates/dialog/delete-item-dialog.html').then(html => {
        new Dialog({
          title: "Delete Confirmation",
          content: html,
          buttons: {
            Yes: {
              icon: '<i class="fa fa-check"></i>',
              label: "Yes",
              callback: dlg => {
                this.actor.deleteEmbeddedEntity("OwnedItem", itemId);
                this.actor.deleteEffectsFromItem(itemId)
                li.slideUp(200, () => this.render(false));
              }
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel"
            },
          },
          default: 'Yes'
        }).render(true)
      });
    });

    // Remove Inventory Item from Container - change location value to 0
    html.find('.item-remove').click(ev => {
      let li = $(ev.currentTarget).parents(".item"),
        itemId = li.attr("data-item-id");
      const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      item.data.location.value = 0;
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

    // Toggle Count Enc for containers 
    html.find('.toggle-enc').click(ev => {
      let itemId = this._getItemId(ev);
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      item.data.countEnc.value = !item.data.countEnc.value;
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

    // Switch an item's toggle, such as wearing armor, clothing, or equipping weapons
    html.find('.item-toggle').click(ev => {
      let itemId = this._getItemId(ev);
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      let equippedState;
      if (item.type == "armour") {
        item.data.worn.value = !item.data.worn.value;
        equippedState = item.data.worn.value
      }
      else if (item.type == "weapon") {

        item.data.equipped = !item.data.equipped;
        equippedState = item.data.equipped
        let newEqpPoints = item.data.twohanded.value ? 2 : 1
        if (game.settings.get("wfrp4e", "limitEquippedWeapons"))
          if (this.actor.data.flags.eqpPoints + newEqpPoints > 2 && equippedState)
          {
            AudioHelper.play({ src: `${game.settings.get("wfrp4e", "soundPath")}no.wav`}, false)
            return ui.notifications.error(game.i18n.localize("Error.LimitedWeapons"))
          }

          setProperty(item, "data.offhand.value", false); // Reset offhand state to prevent multiple offhands
      }
      else if (item.type == "trapping" && item.data.trappingType.value == "clothingAccessories") {
        item.data.worn = !item.data.worn;
        equippedState = item.data.worn
      }

      WFRP_Audio.PlayContextAudio({ item: item, action: "equip", outcome: equippedState })
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

      // Switch an equipped item's offhand state
      html.find('.item-checkbox').click(ev => {
        let itemId = this._getItemId(ev);
        let target = $(ev.currentTarget).attr("data-target")
        this.toggleItemCheckbox(itemId, target);
      });

            // Switch an equipped item's offhand state
      html.find('.loaded-checkbox').mousedown(ev => {
        let itemId = this._getItemId(ev);
        let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))

        this.actor
        let preparedItem = this.actor.prepareWeaponCombat(duplicate(item))

        if (preparedItem.data.loaded.repeater)
        {
          if (ev.button == 0 && item.data.loaded.amt >= preparedItem.data.loaded.max)
            return
          if (ev.button == 2 && item.data.loaded.amt <= 0)
            return


          if (ev.button == 0)
            item.data.loaded.amt++
          if (ev.button == 2)
            item.data.loaded.amt--;

          
          item.data.loaded.value = !!item.data.loaded.amt
        }
        else 
        {
          item.data.loaded.value = !item.data.loaded.value

          if (item.data.loaded.value)
            item.data.loaded.amt = preparedItem .data.loaded.max || 1
          else
            item.data.loaded.amt = 0;
        }


        this.actor.updateEmbeddedEntity("OwnedItem", item).then(i => this.actor.checkReloadExtendedTest(item));
      });

    // Switch an equipped item's offhand state
    html.find('.repeater').click(ev => {
      let itemId = this._getItemId(ev);
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      let preparedItem = this.actor.prepareWeaponCombat(duplicate(item))

      item.data.loaded.value = !item.data.loaded.value

      if (item.data.loaded.value)
        item.data.loaded.amt = preparedItem.data.loaded.max || 1

      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });
      

    // Toggle whether a container is worn
    html.find('.worn-container').click(ev => {
      let itemId = this._getItemId(ev);
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      item.data.worn.value = !item.data.worn.value;
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

    // Increment or decrement an items quantity by 1 or 10 (if holding crtl)
    html.find('.quantity-click').mousedown(event => {
      let itemId = this._getItemId(event);
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId));
      switch (event.button) {
        case 0:
          if (event.ctrlKey)
            item.data.quantity.value += 10;
          else
            item.data.quantity.value++;

          break;
        case 2:
          if (event.ctrlKey)
            item.data.quantity.value -= 10;
          else
            item.data.quantity.value--;

          if (item.data.quantity.value < 0)
            item.data.quantity.value = 0;
          break;
      }
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    }); 

    // Clicking the 'Qty.' label in an inventory section - aggregates all items with the same name
    html.find(".aggregate").click(async ev => {
      let itemType = $(ev.currentTarget).attr("data-type")
      if (itemType == "ingredient") itemType = "trapping"
      let items = duplicate(this.actor.data.inventory[itemType])

      for (let i of items) {
        let duplicates = items.filter(x => x.name == i.name) // Find all the items with the same name
        if (duplicates.length > 1) {
          let newQty = duplicates.reduce((prev, current) => prev + current.data.quantity.value, 0) // Sum the quantity of all items with the same name
          i.data.quantity.value = newQty                                                           // Change the quantity to the sum 
        }
      }

      // Array that will hold the aggregated items (with *no duplicates*)
      let noDuplicates = []
      for (let i of items) {
        // Add item to noDuplicates if the array doesn't already contain the item
        if (!noDuplicates.find(x => x.name == i.name)) {
          noDuplicates.push(i);
          await this.actor.updateEmbeddedEntity("OwnedItem", { "_id": i._id, "data.quantity.value": i.data.quantity.value })
        }
        else
          await this.actor.deleteEmbeddedEntity("OwnedItem", i._id);
      }
    })


    // Right click - duplicate option for trappings
    html.find(".tab.inventory .item .item-name").mousedown(ev => {
      if (ev.button == 2) {
        new Dialog({
          title: game.i18n.localize("SHEET.SplitTitle"),
          content: `<p>${game.i18n.localize("SHEET.SplitPrompt")}</p><div class="form-group"><input name="split-amt" type="text" /></div>`,
          buttons: {
            split: {
              label: "Split",
              callback: (dlg) => {
                let amt = Number(dlg.find('[name="split-amt"]').val());
                if (isNaN(amt)) return
                this.splitItem(this._getItemId(ev), amt);
              }
            }
          },
          default : "split"
        }).render(true);
      }
    })


    html.find(".condition-value").mousedown(ev => {
      let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")
      if (ev.button == 0)
        this.actor.addCondition(condKey)
      else if (ev.button == 2)
        this.actor.removeCondition(condKey)
    })

    html.find(".condition-toggle").mousedown(ev => {
      let condKey = $(ev.currentTarget).parents(".sheet-condition").attr("data-cond-id")

      if (game.wfrp4e.config.statusEffects.find(e => e.id == condKey).flags.wfrp4e.value == null)
      {
        if (this.actor.hasCondition(condKey))
          this.actor.removeCondition(condKey)
        else 
          this.actor.addCondition(condKey)
        return
      }

      if (ev.button == 0)
        this.actor.addCondition(condKey)
      else if (ev.button == 2)
        this.actor.removeCondition(condKey)
    })

    /*****************************************************
    * Randomization options used by NPC and Creature sheets
    ******************************************************/

    // Entering a recognized species sets the characteristics to the average values
    html.find('.input.species').change(async event => {
      if (this.actor.data.type == "character")
        return
      if (game.settings.get("wfrp4e", "npcSpeciesCharacteristics")) {

        let species = event.target.value;
        await this.actor.update({ "data.details.species.value": species });

        try {
          let initialValues = WFRP_Utility.speciesCharacteristics(species, true);
          let characteristics = duplicate(this.actor._data.data.characteristics);

          for (let c in characteristics) {
            characteristics[c].initial = initialValues[c].value;
          }

          new Dialog({
            content : "<p>Do you want to apply this species's characteristics to the actor?",
            title : "Species Characteristics",
            buttons : {
              yes : {
                label : "Yes",
                callback : async () => {
                  await this.actor.update({ 'data.characteristics': characteristics })
                  await this.actor.update({ "data.details.move.value": WFRP_Utility.speciesMovement(species) || 4 })
                }
              },
              no : {
                label : "No",
                callback : () => {}
              }
            }
          }).render(true);
        }
        catch
        {
          // Do nothing if exception trying to find species
        }
      }
    });

    // Randomization buttons that randomize characteristics, skills, and talents, of a recognized species
    html.find('.randomize').click(async event => {
      event.preventDefault();
      let species = this.actor.data.data.details.species.value;

      try {
        switch (event.target.text) {
          // Characteristic button
          case "C":
            // TODO: this could do with a refactor
            // Characteristics is a bit confusing due to 

            // creatureMethod means -10 + 2d10 
            let creatureMethod = false;
            let characteristics = duplicate(this.actor._data.data.characteristics);

            if (this.actor.data.type == "creature" || !species)
              creatureMethod = true;

            // This if will do another test to see if creatureMethod should be used - If the user has modified the initial values, use creatureMethod
            if (!creatureMethod) {
              let averageCharacteristics = WFRP_Utility.speciesCharacteristics(species, true);

              // If this loop results in turning creatureMethod to true, that means an NPCs statistics have been edited manually, use -10 + 2d10 method
              for (let char in characteristics) {
                if (characteristics[char].initial != averageCharacteristics[char].value)
                  creatureMethod = true;
              }
            }

            // Get species characteristics
            if (!creatureMethod) {
              let rolledCharacteristics = WFRP_Utility.speciesCharacteristics(species, false);
              for (let char in rolledCharacteristics) {
                characteristics[char].initial = rolledCharacteristics[char].value;
              }
              await this.actor.update({ "data.characteristics": characteristics })
            }

            // creatureMethod: -10 + 2d10 for each characteristic
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
              await this.actor.update({ "data.characteristics": characteristics });
            }

            return

          // Skills button
          case "S":
            this.actor._advanceSpeciesSkills()
            return

          // Talents button
          case "T":
            this.actor._advanceSpeciesTalents()
            return
        }
      }
      catch (error) {
        console.log("wfrp4e | Could not randomize: " + error)
      }

    });


    html.find(".condition-click").click(ev => {
      event.preventDefault();
    let li = $(event.currentTarget).parents(".sheet-condition"),
    elementToAddTo = $(event.currentTarget).parents(".condition-list"),
    condkey = li.attr("data-cond-id"),
      // Call the item's expandData() function which gives us what to display
      expandData = TextEditor.enrichHTML(`<h2>${game.wfrp4e.config.conditions[condkey]}</h2>` + game.wfrp4e.config.conditionDescriptions[condkey])

    // Toggle expansion for an item
    if (elementToAddTo.hasClass("expanded")) // If expansion already shown - remove
    {
      let summary = elementToAddTo.parents(".effects").children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    }
    else {
      let div = $(`<div class="item-summary">${expandData}</div>`);

      if (game.wfrp4e.config.conditionScripts[condkey] && this.actor.hasCondition(condkey))
      {
        let button = $(`<br><br><a class="condition-script">${game.i18n.format("CONDITION.Apply", {condition : game.wfrp4e.config.conditions[condkey]})}</a>`)
        div.append(button)
      }

      elementToAddTo.after(div.hide());
      div.slideDown(200);

      div.on("click", ".condition-script", async ev => {
        ui.sidebar.activateTab("chat")
        ChatMessage.create(await game.wfrp4e.config.conditionScripts[condkey](this.actor))
      })
    }
    elementToAddTo.toggleClass("expanded");
  })


    // Post Item to chat
    html.find(".item-post").click(ev => {
      let itemId = this._getItemId(ev);
      const item = this.actor.items.find(i => i.data._id == itemId)
      item.postItem();
    })

    // Creature and NPC sheets - click on the 'name' label to generate a name
    html.find(".name-gen").click(ev => {
      let name = NameGenWfrp.generateName({ species: this.actor.data.data.details.species.value, gender: this.actor.data.data.details.gender.value })
      this.actor.update({ "name": name });
    })

    // Item Dragging
    let handler = ev => this._onDragItemStart(ev);
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
      if (game.wfrp4e.config.actorSizeNums[mount.data.data.details.size.value] <= game.wfrp4e.config.actorSizeNums[this.actor.data.data.details.size.value])
        return ui.notifications.error("You can only mount creatures of a larger size.")
      
      let mountData = {
        id : dragData.id,
        mounted : true,
        isToken : false
      }
      this.actor.update({"data.status.mount" : mountData})
    })

    html.find('.mount-toggle').click(ev => {
      ev.stopPropagation();
      this.actor.update({"data.status.mount.mounted" : !this.actor.data.data.status.mount.mounted})
    })

    html.find('.mount-remove').click(ev => {
      ev.stopPropagation();
      let mountData = {
        id : "",
        mounted : false,
        isToken : false
      }
      this.actor.update({"data.status.mount" : mountData})
    })
    

    html.find('.mount-section').click(ev => {
      this.actor.mount.sheet.render(true)
    })


    html.find(".system-effect-select").change(ev => {
      let ef = ev.target.value;
      let data = ev.target.options[ev.target.selectedIndex].dataset

      let effect = game.wfrp4e.config[data.source][ef]

      this.actor.createEmbeddedEntity("ActiveEffect", effect)
    })




    // ---- Listen for custom entity links -----
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

    
    html.on('mousedown', '.exp-link', ev => {
      WFRP_Utility.handleExpClick(ev)
    })


    // Consolidate common currencies
    html.find('.dollar-icon').click(async event => {
      event.preventDefault();
      let money = duplicate(this.actor.data.money.coins);
      money = MarketWfrp4e.consolidateMoney(money);
      await this.actor.updateEmbeddedEntity("OwnedItem", money);
    })

  }

  /* --------------------------------------------------------------------------------------------------------- */
  /* -------------------------------------------- Private Functions ------------------------------------------ */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * These functions are helpers for sheet html interaction or functionality. Mostly handling drag/drop and 
   * dropdown events.
   *
  /* --------------------------------------------------------------------------------------------------------- */


  _getItemId(ev)
  {
    return $(ev.currentTarget).parents(".item").attr("data-item-id")
  }

  /**
   * Sets up the data transfer within a drag and drop event. This function is triggered
   * when the user starts dragging an inventory item, and dataTransfer is set to the 
   * relevant data needed by the _onDrop function. See that for how drop events
   * are handled.
   * 
   * @private
   * 
   * @param {Object} event    event triggered by item dragging
   */
  _onDragItemStart(event) {
    let itemId = event.currentTarget.getAttribute("data-item-id");
    const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
    event.dataTransfer.setData("text/plain", JSON.stringify({
      type: "Item",
      sheetTab: this.actor.data.flags["_sheetTab"],
      actorId: this.actor._id,
      data: item,
      root: event.currentTarget.getAttribute("root")
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
   * @param {Object} event     event triggered by item dropping
   */
  async _onDrop(event) 
  {
    let dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
    let dropID = $(event.target).parents(".item").attr("data-item-id"); // Only relevant if container drop

    // Inventory Tab - Containers - Detected when you drop something onto a container, otherwise, move on to other drop types
    if ($(event.target).parents(".item").attr("inventory-type") == "container") {
      if (dragData.data._id == dropID) // Prevent placing a container within itself (we all know the cataclysmic effects that can cause)
        throw "";
      else if (dragData.data.type == "container" && $(event.target).parents(".item").attr("last-container"))
        throw game.i18n.localize("SHEET.NestedWarning")

      else if (dragData.data.type == "container") {
        // If container A has both container B and container C, prevent placing container B into container C without first removing B from A
        // This resolves a lot of headaches around container loops and issues of that natures
        if (dragData.root == $(event.target).parents(".item").attr("root")) {
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


      await this.actor.updateEmbeddedEntity("OwnedItem", dragData.data);
    }
    // Dropping an item from chat
    else if (dragData.type == "postedItem") {
      this.actor.createEmbeddedEntity("OwnedItem", dragData.payload);
    }
    // Dropping a character creation result
    else if (dragData.type == "generation") {

      let data = duplicate(this.actor._data.data);
      if (dragData.generationType == "attributes") // Characteristsics, movement, metacurrency, etc.
      {
        data.details.species.value = dragData.payload.species;
        data.details.move.value = dragData.payload.movement;

        if (this.actor.data.type == "character") // Other actors don't care about these values
        {
          data.status.fate.value = dragData.payload.fate;
          data.status.fortune.value = dragData.payload.fate;
          data.status.resilience.value = dragData.payload.resilience;
          data.status.resolve.value = dragData.payload.resilience;
          data.details.experience.total += dragData.payload.exp;
        }
        for (let c in  game.wfrp4e.config.characteristics) {
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
        await this.actor.update({ "name": name, "data": data, "token.name" : name.split(" ")[0]})
      }


    }
    // This is included in character creation, but not limited to.
    // lookupType is either skill or talent. Instead of looking up the
    // data on the drag event (could cause a delay), look it up on drop
    else if (dragData.type == "lookup") {
      let item;
      if (dragData.payload.lookupType === "skill") {
        // Advanced find function, returns the skill the user expects it to return, even with skills not included in the compendium (Lore (whatever))
        item = await WFRP_Utility.findSkill(dragData.payload.name)
      }
      else if (dragData.payload.lookupType === "talent") {
        // Advanced find function, returns the talent the user expects it to return, even with talents not included in the compendium (Etiquette (whatever))
        item = await WFRP_Utility.findTalent(dragData.payload.name)
      }
      else {
        item = await WFRP_Utility.findItem(dragData.payload.name, dragData.payload.lookupType)
      }
      if (item)
        this.actor.createEmbeddedEntity("OwnedItem", item.data);
    }
    // From character creation - exp drag values
    else if (dragData.type == "experience") {
      let data = duplicate(this.actor.data.data);
      data.details.experience.total += dragData.payload;
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

      await this.actor.updateEmbeddedEntity("OwnedItem", money);
    }
    else if (dragData.type == "wounds") {
      this._modifyWounds(`+${dragData.payload}`)
    }
    else if (dragData.type == "condition") {
      this.actor.addCondition(`${dragData.payload}`)
    }
    else // If none of the above, just process whatever was dropped upstream
    {
      super._onDrop(event)
    }
  }


  /**
   * All item types have a drop down description, this handles what is 
   * displayed for each item type and adds additional functionalities
   * and listeners.
   * 
   * @private
   * 
   * @param {Object} event    event generated by the click 
   */
  _onItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item"),
      item = this.actor.items.find(i => i.data._id == li.attr("data-item-id")),
      // Call the item's expandData() function which gives us what to display
      expandData = item.getExpandData(
        {
          secrets: this.actor.owner
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


      if (expandData.targetEffects.length)
      {
        let effectButtons = expandData.targetEffects.map(e => `<a class="apply-effect" data-item-id=${item._id} data-effect-id=${e._id}>${game.i18n.format("SHEET.ApplyEffect", {effect : e.label})}</a>`)
        let effects = $(`<div>${effectButtons}</div>`)
        div.append(effects)
      }
      if (expandData.invokeEffects.length)
      {
        let effectButtons = expandData.invokeEffects.map(e => `<a class="invoke-effect" data-item-id=${item._id} data-effect-id=${e._id}>${game.i18n.format("SHEET.InvokeEffect", {effect : e.label})}</a>`)
        let effects = $(`<div>${effectButtons}</div>`)
        div.append(effects)
      }

      
      li.append(div.hide());
      div.slideDown(200);

      this._dropdownListeners(div);
    }
    li.toggleClass("expanded");
  }



  _dropdownListeners(html)
  {
      // Clickable tags
      // Post an Item Quality/Flaw
      html.on("click", ".item-property", ev => {
        WFRP_Utility.postProperty(ev.target.text)
      })

      // Roll a career income skill
      html.on("click", ".career-income", ev => {
        let skill = this.actor.items.find(i => i.data.name === ev.target.text.trim() && i.data.type == "skill");
        let career = this.actor.getEmbeddedEntity("OwnedItem", $(ev.target).attr("data-career-id"));
        if (!skill) {
          ui.notifications.error(game.i18n.localize("SHEET.SkillMissingWarning"))
          return;
        }
        if (!career.data.current.value) {
          ui.notifications.error(game.i18n.localize("SHEET.NonCurrentCareer"))
          return;
        }
        this.actor.setupSkill(skill.data, {title : `${skill.name} - ${game.i18n.localize("Income")}`, income: this.actor.data.data.details.status, career }).then(setupData => {
          this.actor.incomeTest(setupData)
        });;
      })

      html.on("click", ".apply-effect", async ev => {

        let effectId = ev.target.dataset["effectId"]
        let itemId = ev.target.dataset["itemId"]
        
        let effect = this.actor.populateEffect(effectId, itemId)
        let item = this.actor.getEmbeddedEntity("OwnedItem", itemId)

        if ((item.data.range && item.data.range.value.toLowerCase() == game.i18n.localize("You").toLowerCase()) && (item.data.target && item.data.target.value.toLowerCase() == game.i18n.localize("You").toLowerCase()))
          game.wfrp4e.utility.applyEffectToTarget(effect, [{actor : this.actor}]) // Apply to caster (self) 
        else
          game.wfrp4e.utility.applyEffectToTarget(effect)
      })

      html.on("click", ".invoke-effect", async ev => {

        let effectId = ev.target.dataset["effectId"]
        let itemId = ev.target.dataset["itemId"]
        
        game.wfrp4e.utility.invokeEffect(this.actor, effectId, itemId)
      })
      // Respond to template button clicks
      html.on("mousedown", '.aoe-template', event => {
        AOETemplate.fromString(event.target.text).drawPreview(event);
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
   * @param {Object} event    event triggered by clicking on a wweapon/armor property
   */
  _expandProperty(event) {
    event.preventDefault();

    let li = $(event.currentTarget).parents(".item"),
      property = event.target.text, // Proprety clicked on
      properties = mergeObject(WFRP_Utility.qualityList(), WFRP_Utility.flawList()), // Property names
      propertyDescr = Object.assign(duplicate( game.wfrp4e.config.qualityDescriptions),  game.wfrp4e.config.flawDescriptions); // Property descriptions

    property = property.replace(/,/g, '').trim(); // Remove commas/whitespace

    let propertyKey = "";
    if (property == game.i18n.localize("Special Ammo")) // Special Ammo comes from user-entry in an Ammo's Special box
    {
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", li.attr("data-item-id")))
      let ammo = duplicate(this.actor.getEmbeddedEntity("OwnedItem", item.data.currentAmmo.value))
      // Add the special value to the object so that it can be looked up
      propertyDescr = Object.assign(propertyDescr,
        {
          [game.i18n.localize("Special Ammo")]: ammo.data.special.value
        });
      propertyKey = game.i18n.localize("Special Ammo");
    }
    else if (property == "Special") // Special comes from user-entry in a Weapon's Special box
    {
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", li.attr("data-item-id")))
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
   * @param {Object} event    event triggered by clicking on range, reach, etc.
   */
  _expandInfo(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents(".item");
    let classes = $(event.currentTarget);
    let expansionText = "";

    let item = this.actor.data.items.find(i => i._id == li.attr("data-item-id"))
    // Breakdown weapon range bands for easy reference (clickable, see below)
    if (classes.hasClass("weapon-range")) {
      expansionText =
         `<a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Point Blank"]}">${item.rangeBands["Point Blank"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Point Blank"].range[1]} ${game.i18n.localize("yds")}: ${ game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Point Blank"]]}</a><br>
          <a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Short Range"]}">${item.rangeBands["Short Range"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Short Range"].range[1]} ${game.i18n.localize("yds")}: ${ game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Short Range"]]}</a><br>
          <a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Normal"]}">${item.rangeBands["Normal"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Normal"].range[1]} ${game.i18n.localize("yds")}: ${ game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Normal"]]}</a><br>
          <a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Long Range"]}">${item.rangeBands["Long Range"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Long Range"].range[1]} ${game.i18n.localize("yds")}: ${ game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Long Range"]]}</a><br>
          <a class="range-click" data-range="${game.wfrp4e.config.rangeModifiers["Extreme"]}">${item.rangeBands["Extreme"].range[0]} ${game.i18n.localize("yds")} - ${item.rangeBands["Extreme"].range[1]} ${game.i18n.localize("yds")}: ${ game.wfrp4e.config.difficultyLabels[game.wfrp4e.config.rangeModifiers["Extreme"]]}</a><br>
          `
    }
    // Expand the weapon's group description
    else if (classes.hasClass("weapon-group")) {
      let weaponGroup = event.target.text;
      let weaponGroupKey = "";
      weaponGroupKey = WFRP_Utility.findKey(weaponGroup,  game.wfrp4e.config.weaponGroups);
      expansionText =  game.wfrp4e.config.weaponGroupDescriptions[weaponGroupKey];
    }
    // Expand the weapon's reach description
    else if (classes.hasClass("weapon-reach")) {
      let reach = event.target.text;
      let reachKey;
      reachKey = WFRP_Utility.findKey(reach,  game.wfrp4e.config.weaponReaches);
      expansionText =  game.wfrp4e.config.reachDescription[reachKey];
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
          this.actor.setupWeapon(duplicate(weapon), { absolute: { difficulty: difficulty }}).then(setupData => {
            this.actor.weaponTest(setupData)
          });
      })

    }
    li.toggleClass("expanded");


  }


  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @private
   * @param {Object} event    event triggered by clicking on the + button for any item list
   *  
   */
  _onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget,
      data = duplicate(header.dataset);

    if (data.type == "effect")
      return this.actor.createEmbeddedEntity("ActiveEffect", {name : "New Effect"})

    if (data.type == "vehicle-role" && this.actor.data.type == "vehicle")
    {
      let roles = duplicate(this.actor.data.data.roles)
      let newRole = {name : "New Role", actor : "", test : "", testLabel : ""}
      roles.push(newRole)
      return this.actor.update({"data.roles" : roles})
    }

    // Conditional for creating skills from the skills tab - sets to the correct skill type depending on column
    if (event.currentTarget.attributes["data-type"].value == "skill") {
      data = mergeObject(data,
        {
          "data.advanced.value": event.currentTarget.attributes["data-skill-type"].value
        });
    }

    if (data.type == "trapping")
      data = mergeObject(data,
        {
          "data.trappingType.value": event.currentTarget.attributes["item-section"].value
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
      let itemSpecification = event.currentTarget.attributes[`data-${data.type}-type`].value;

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
    this.actor.createEmbeddedEntity("OwnedItem", data);
  }

  _onEffectCreate(event) {
    let type = event.currentTarget.attributes["data-effect"].value
    let effectData = {label : "New Effect"};
    if (type == "temporary")
    {
      effectData["duration.rounds"] = 1;
    }
    if (type == "applied")
    {
      effectData["flags.wfrp4e.effectApplication"] = "apply"
    }
    this.actor.createEmbeddedEntity("ActiveEffect", effectData)
  }



  // _onEffectCreate(event) 
  // {
  //   event.preventDefault();
  //   return this.actor.createEmbeddedEntity("ActiveEffect", {name : "New Effect"})
  // }




  /**
   * Duplicates an owned item given its id.
   * 
   * @param {Number} itemId   Item id of the item being duplicated
   */
  duplicateItem(itemId) {
    let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
    this.actor.createEmbeddedEntity("OwnedItem", item);
  }

  splitItem(itemId, amount) {
    let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
    let newItem = duplicate(item)
    if (amount >= item.data.quantity.value)
      return ui.notifications.notify("Invalid Quantity")
    
    newItem.data.quantity.value = amount;
    item.data.quantity.value -= amount;
    this.actor.createEmbeddedEntity("OwnedItem", newItem);
    this.actor.updateEmbeddedEntity("OwnedItem", item);
  }


  async toggleItemCheckbox(itemId, target)
  {
    let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
    setProperty(item, target, !getProperty(item, target))
    this.actor.updateEmbeddedEntity("OwnedItem", item);
    return getProperty(item, target);
  }

  /* -------------------------------------------- */
}

