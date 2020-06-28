/**
 * Provides the specific interaction handlers for Creature Sheets.
 *
 * ActorSheetWfrp4eCreature is assigned to Creature type actors, which have a very 
 * different layout in their sheet compared to the others, requiring different 
 * functionality in the main tab (creature overview), as well as the notes tab, 
 * where the user excludes traits.
 * 
 */
class ActorSheetWfrp4eCreature extends ActorSheetWfrp4e
{
  static get defaultOptions()
  {
    const options = super.defaultOptions;
    mergeObject(options,
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
  get template()
  {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.html";
    return "systems/wfrp4e/templates/actors/creature-sheet.html";
  }


  /**
   * Prevents a dropdown event from immediately firing - allows for double clicking items
   * in the creature overview to open the sheet.
   * 
   * @param {Object} event    event fired by clicking on a dropdown element 
   */
  _delayedDropdown(event)
  {

    // count clicks
    if (this.clicks)
      this.clicks++;
    else
      this.clicks = 1;

    // If first click, set a timeout value, and if it expires, reset clicks and show dropdown
    if (this.clicks === 1)
    {
      this.timer = setTimeout(() =>
      {
        this._onCreatureItemSummary(event);
        this.clicks = 0; //after action performed, reset counter
      }, 250);
    } // If the timeout does not expire before another click, open the item sheet
    else
    {
      clearTimeout(this.timer); //prevent single-click action
      let itemId = $(event.currentTarget).attr("data-item-id");
      const item = this.actor.items.find(i => i.data._id == itemId)
      item.sheet.render(true);
      this.clicks = 0; //after action performed, reset counter
    }
  }

  /**
   * Handle traits being included or excluded - add or subtract appropriate characteristics if the
   * trait offered bonuses (Big, Elite, etc.)
   * 
   * @param {Number} traitId    id of trait that was clicked
   * @param {Boolean} include   whether that trait is now included or excluded
   */
  _onTraitClick(traitId, include)
  {
    let trait = this.actor.getEmbeddedEntity("OwnedItem", traitId)
    let data = duplicate(this.actor.data.data)

    let bonuses = WFRP4E.traitBonuses[trait.name.toLowerCase()]
    for (let char in bonuses)
    {
      if (include)
        data.characteristics[char].initial += bonuses[char]
      else
        data.characteristics[char].initial -= bonuses[char]
    }

    this.actor.update(
    {
      "data": data
    })
  }

  /**
   * Handles when the user clicks on a trait in the creature overview - shows the item summary
   * as dropdown info
   * 
   * @param {Object} event    event fired from clicking on an item
   */
  _onCreatureItemSummary(event)
  {
    event.preventDefault();
    let li = $(event.currentTarget).parent('.list'),
      item = this.actor.items.find(i => i.data._id == $(event.currentTarget).attr("data-item-id")),
      // Get expansion info to place in the dropdown
      expandData = item.getExpandData(
      {
        secrets: this.actor.owner
      });


    // If already has expanded class, remove it
    if (li.hasClass("expanded"))
    {
      let summary = li.children(".item-summary");
      summary.slideUp(200, () => summary.remove());
    }
    else
    {
      let div = "";
      div = $(`<div class="item-summary"><b>${item.data.name}:</b>${expandData.description.value}</div>`);

      let props = $(`<div class="item-properties"></div>`);
      expandData.properties.forEach(p => props.append(`<span class="tag">${p}</span>`));
      div.append(props);
      li.append(div.hide());
      div.slideDown(200);
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
  activateListeners(html)
  {
    super.activateListeners(html);

    // div elementns need focus for the DEL key to work on them
    html.find(".content").hover(event =>
    {
      $(event.currentTarget).focus();
    })

    // Can use the delete key in the creature overview to delete items
    html.find('.content').keydown(event =>
    {
      if (event.keyCode == 46)
      {
        let itemId = $(event.currentTarget).attr("data-item-id");
        this.actor.deleteEmbeddedEntity("OwnedItem", itemId);
      }
    });
    // Use delayed dropdown to allow for double clicks
    html.find(".creature-dropdown").mousedown(event =>
      {
        this._delayedDropdown(event);
      })
      .on("dblclick", function (e)
      {
        e.preventDefault(); //cancel system double-click event
      });

    if (!this.options.editable) return;

    // Allow for holding shift or crtl on a skill when clicking on the main tab to advance it by 10 or 1
    html.find(".skills.name, .skills.total").mousedown(event =>
    {
      let newAdv
      let advAmt;
      let skill = duplicate(this.actor.getEmbeddedEntity("OwnedItem", $(event.currentTarget).parents(".content").attr("data-item-id")))

      if (event.shiftKey || event.ctrlKey)
      {
        if (event.shiftKey)
          advAmt = 10;
        else if (event.ctrlKey)
          advAmt = 1;
      }

      // Add if left click
      if (event.button == 0)
      {
        if (advAmt)
        {
          newAdv = skill.data.advances.value + advAmt;
          this.actor.updateEmbeddedEntity("OwnedItem",
          {
            _id: skill._id,
            "data.advances.value": newAdv
          })
        }
        else // If neither control or shift was held, roll the skill instead
          this.actor.setupSkill(skill);
      }
      // Subtract if right click
      else if (event.button == 2)
      {
        if (advAmt)
        {
          newAdv = skill.data.advances.value - advAmt;
          if (newAdv < 0)
            newAdv = 0;
          this.actor.updateEmbeddedEntity("OwnedItem",
          {
            _id: skill._id,
            "data.advances.value": newAdv
          })
        }
        else // If neither control or shift was held, show the item sheet
        {
          let itemId = $(event.currentTarget).parents(".content").attr("data-item-id");
          const item = this.actor.items.find(i => i.data._id == itemId)
          item.sheet.render(true);
        }
      }
    })

    // Show a dropdown for the trait, or prompt to roll for it, depending on context
    // Right click will always display dropdown, left click will sometimes display (if the trait isn't rollable)
    html.find(".traits.content").mousedown(event =>
    {
      let trait = duplicate(this.actor.getEmbeddedEntity("OwnedItem", $(event.currentTarget).attr("data-item-id")))

      // If rightclick or not rollable, show dropdown
      if (event.button == 2 || !trait.data.rollable.value)
      {
        this._delayedDropdown(event);
        return;
      }

      // Otherwise, prompt to roll
      this.actor.setupTrait(trait);

    })

    // Click on characteristic header to roll characteristic
    html.find('.ch-roll').click(event =>
    {
      event.preventDefault();
      let characteristic = $(event.currentTarget).attr("data-char");
      this.actor.setupCharacteristic(characteristic, event);
    });

    // Handler for traits in the notes tab - excluding or not excluding them
    html.find('.trait-name').mousedown(async event =>
    {
      // Creatures have an excludedTraits array that holds the ids of the excluded traits
      // Update that array when a new trait is clicked
      event.preventDefault();
      let traitId = $(event.currentTarget).parents(".item").attr("data-item-id");
      let included = false;

      if (event.button == 0)
      {
        let newExcludedTraits = duplicate(this.actor.data.data.excludedTraits);

        // If excludedTraits includes the clicked trait - it is excluded, so include it
        if (this.actor.data.data.excludedTraits.includes(traitId))
        {
          newExcludedTraits = newExcludedTraits.filter(i => i != traitId)
          included = true;
        }
        // If excludedTraits does not include clicked trait, it is included, so exclude it
        else
        {
          newExcludedTraits.push(traitId);
          included = false
        }

        await this.actor.update(
        {
          "data.excludedTraits": newExcludedTraits
        });
        this._onTraitClick(traitId, included) // Do further processing depending on trait

      }
      // If right click, show description
      else if (event.button == 2)
      {
        this._onItemSummary(event);
      }

    });

  }

}

// Register Creature Sheet
Actors.registerSheet("wfrp4e", ActorSheetWfrp4eCreature,
{
  types: ["creature"],
  makeDefault: true
});