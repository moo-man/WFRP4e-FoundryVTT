/**
 * Provides the specific interaction handlers for NPC Sheets.
 *
 * ActorSheetWfrp4eNPC is assigned to NPC type actors, and the specific interactions
 * npc type actors need are defined here, specifically for careers. NPCs have the unique
 * functionality with careers where clicking "complete" automatically advances characteristics,
 * skills, and talents from that career.
 * 
 */
class ActorSheetWfrp4eNPC extends ActorSheetWfrp4e
{
  static get defaultOptions()
  {
    const options = super.defaultOptions;
    mergeObject(options,
    {
      classes: options.classes.concat(["wfrp4e", "actor", "npc-sheet"]),
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
    return "systems/wfrp4e/templates/actors/npc-sheet.html";
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

    // Do not proceed if sheet is not editable
    if (!this.options.editable) return;

    // Roll a characteristic test by clicking on the characteristic name
    html.find('.ch-roll').click(event =>
    {
      event.preventDefault();
      let characteristic = $(event.currentTarget).attr("data-char");
      this.actor.setupCharacteristic(characteristic, event);
    });


    // Advance NPC if a career is marked as "complete"
    html.find('.npc-career').click(event =>
    {
      event.preventDefault();
      let id = $(event.currentTarget).parents(".item").attr("data-item-id");
      let careerItem = duplicate(this.actor.getEmbeddedEntity("OwnedItem", id))
      careerItem.data.complete.value = !careerItem.data.complete.value
      if (careerItem.data.complete.value)
        this.actor._advanceNPC(careerItem.data)

      this.actor.updateEmbeddedEntity("OwnedItem",
      {
        _id: id,
        'data': careerItem.data
      });
    });
  }
}

// Register NPC Sheet
Actors.registerSheet("wfrp4e", ActorSheetWfrp4eNPC,
{
  types: ["npc"],
  makeDefault: true
});