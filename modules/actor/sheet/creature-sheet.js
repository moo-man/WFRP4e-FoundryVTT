
import ActorSheetWFRP4e from "./actor-sheet.js";

/**
 * Provides the specific interaction handlers for Creature Sheets.
 *
 * ActorSheetWFRP4eCreature is assigned to Creature type actors, which have a very 
 * different layout in their sheet compared to the others, requiring different 
 * functionality in the main tab (creature overview), as well as the notes tab, 
 * where the user excludes traits.
 * 
 */
export default class ActorSheetWFRP4eCreature extends ActorSheetWFRP4e {


  // V10 - Dialogs need focus for default button to work with the Enter key. Hovering over traits in the overview focuses on them (required for delete key to work)
  // This variable prevents focusing on these if a dialog is open, so that Enter will work with dialogs
  dialogOpen = false 

  static get defaultOptions() {
    const options = super.defaultOptions;
    foundry.utils.mergeObject(options,
      {
        classes: options.classes.concat(["wfrp4e", "actor", "creature-sheet"]),
        width: 610,
        height: 740,
      });
    return options;
  }


  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.hbs";
    return "systems/wfrp4e/templates/actors/creature/creature-sheet.hbs";
  }


  async getData() { 
    const sheetData = await super.getData();

    this.addCreatureData(sheetData)

    
    sheetData.manualScripts = this.actor.items.contents
    .filter(i => i.included)
    .reduce((scripts, item) => 
      scripts.concat(item.manualScripts
        .filter(script => !scripts
          .find(s => s.label == script.label))), [])  // Reduce all the scripts into a single array, but ignore duplicates (same label) perhaps a kludge fix for multiple talents on creatures (Combat Aware)

    return sheetData;
  }

  addCreatureData(sheetData) {
    sheetData.items.skills.trained = sheetData.actor.itemTags["skill"].filter(i => i.advances.value > 0).sort((a, b) => a.name > b.name ? 1 : -1);
    sheetData.items.includedTraits = sheetData.items.traits.filter(i => i.included).sort((a, b) => a.name > b.name ? 1 : -1);
  }



  /**
   * Prevents a dropdown event from immediately firing - allows for double clicking items
   * in the creature overview to open the sheet.
   * 
   * @param {Object} event    event fired by clicking on a dropdown element 
   */
  _delayedDropdown(event) {

    // count clicks
    if (this.clicks)
      this.clicks++;
    else
      this.clicks = 1;

    // If first click, set a timeout value, and if it expires, reset clicks and show dropdown
    if (this.clicks === 1) {
      this.timer = setTimeout(() => {
        this._onCreatureItemSummary(event);
        this.clicks = 0; //after action performed, reset counter
      }, 250);
    } // If the timeout does not expire before another click, open the item sheet
    else {
      clearTimeout(this.timer); //prevent single-click action
      let itemId = $(event.currentTarget).attr("data-id");
      const item = this.actor.items.get(itemId)
      item.sheet.render(true);
      this.clicks = 0; //after action performed, reset counter
    }
  }

  /**
   * Handles when the user clicks on a trait in the creature overview - shows the item summary
   * as dropdown info
   * 
   * TODO: Reuse onItemSummary instead of this
   * @param {Object} event    event fired from clicking on an item
   */
  async _onCreatureItemSummary(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parent('.list'),
      item = this.actor.items.get($(event.currentTarget).attr("data-id")),
      // Get expansion info to place in the dropdown
      expandData = await item.system.expandData(
        {
          secrets: this.actor.isOwner
        });


    // If already has expanded class, remove it
    if (li.hasClass("expanded")) {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    }
    else {
      let div = "";
      div = $(`<div class="item-summary"><b>${item.name}:</b>${expandData.description.value}</div>`);

      let props = $(`<div class="item-properties"></div>`);
      expandData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
      div.append(props);
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


  /* -------------------------------------------- */
  /*  Event Listeners and Handlers
  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    // // div elementns need focus for the DEL key to work on them
      html.find(".content").hover(event => {
        if (!this.dialogOpen)
          $(event.currentTarget).focus();
      })

    // Can use the delete key in the creature overview to delete items
    html.find('.content').keydown(this._onContentClick.bind(this))

    // // Use delayed dropdown to allow for double clicks
    html.find(".creature-dropdown").mousedown(event => {
      this._delayedDropdown(event);
    })
      .on("dblclick", function (e) {
        e.preventDefault(); //cancel system double-click event
      });

    if (!this.options.editable) return;

    // Allow for holding shift or crtl on a skill when clicking on the main tab to advance it by 10 or 1
    html.find(".skills.name, .skills.total").mousedown(this._onCreatureSkillClick.bind(this))

    // Show a dropdown for the trait, or prompt to roll for it, depending on context
    // Right click will always display dropdown, left click will sometimes display (if the trait isn't rollable)
    html.find(".traits.content").mousedown(this._onTraitClick.bind(this))

    // Click on characteristic header to roll characteristic
    html.find('.ch-roll').click(this._onCharClick.bind(this))

    // Handler for traits in the notes tab - excluding or not excluding them
    html.find('.trait-include').mousedown(this._onTraitNameClick.bind(this))

  }

   _onContentClick(ev) {
     if (ev.keyCode == 46) {
      ev.preventDefault()
      ev.stopPropagation()
      let itemId = $(ev.currentTarget).attr("data-id");
      if (itemId)
        return this.actor.deleteEmbeddedDocuments("Item", [itemId]);
    }
  }

  _onCreatureSkillClick(event) {
    let newAdv
    let advAmt;
    let skill = this.actor.items.get($(event.currentTarget).parents(".content").attr("data-id"))

    if (event.shiftKey || event.ctrlKey) {
      if (event.shiftKey)
        advAmt = 10;
      else if (event.ctrlKey)
        advAmt = 1;
    }

    // Add if left click
    if (event.button == 0) {
      if (advAmt) {
        skill.update({"system.advances.value" : newAdv})
      }
      else // If neither control or shift was held, roll the skill instead
        this.actor.setupSkill(skill).then(setupData => {
          this.actor.basicTest(setupData)
        });;
    }
    // Subtract if right click
    else if (event.button == 2) {
      if (advAmt) {
        newAdv = skill.system.advances.value - advAmt;
        if (newAdv < 0)
          newAdv = 0;
        skill.update({"system.advances.value" : newAdv})

      }
      else // If neither control or shift was held, show the item sheet
      {
        skill.sheet.render(true);
      }
    }
  }

  _onTraitClick(event) {
    event.preventDefault();
    this.dialogOpen = true
    let trait = this.actor.items.get($(event.currentTarget).attr("data-id"))

    // If rightclick or not rollable, show dropdown
    if (event.button == 2 || !trait.rollable.value) {
      this._delayedDropdown(event);
      return;
    }

    // Otherwise, prompt to roll
    this.actor.setupTrait(trait).then(testData => {
      this.actor.traitTest(testData)
    }).finally(() => {
      this.dialogOpen = false 
    })
  }

  _onTraitNameClick(event) {
    event.preventDefault();
    let traitId = $(event.currentTarget).parents(".item").attr("data-id");
    
    if (event.button == 0) {
      let item = this.actor.items.get(traitId);
      item.update({"system.disabled" : !item.system.disabled})
    }
    // If right click, show description
    else if (event.button == 2) {
      this._onItemSummary(event);
    }
  }
}
