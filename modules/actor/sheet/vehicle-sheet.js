import WFRP4E from "../../system/config-wfrp4e.js"
import ActorSheetWfrp4e from "./actor-sheet.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
import MarketWfrp4e from "../../apps/market-wfrp4e.js";
import WFRP_Audio from "../../system/audio-wfrp4e.js";

/**
 * Provides the specific interaction handlers for NPC Sheets.
 *
 * ActorSheetWfrp4eNPC is assigned to NPC type actors, and the specific interactions
 * npc type actors need are defined here, specifically for careers. NPCs have the unique
 * functionality with careers where clicking "complete" automatically advances characteristics,
 * skills, and talents from that career.
 * 
 */
export default class ActorSheetWfrp4eVehicle extends ActorSheetWfrp4e
{
  static get defaultOptions()
  {
    const options = super.defaultOptions;
    mergeObject(options,
    {
      classes: options.classes.concat(["wfrp4e", "actor", "vehicle-sheet"]),
      width: 610,
      height: 740,
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}, {dragSelector: ".actor-list .actor", dropSelector: null}]
    });
    return options;
  }

  async _onDrop(event) 
  {
    let dragData = JSON.parse(event.dataTransfer.getData("text/plain"));
    if (dragData.type == "Actor")
    {
      let passengers = duplicate(this.actor.data.data.passengers);
      passengers.push({id : dragData.id, count : 1});
      this.actor.update({"data.passengers" : passengers})
    }
    else return super._onDrop(event);
  }

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template()
  {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.html";
    return "systems/wfrp4e/templates/actors/vehicle/vehicle-sheet.html";
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

  
  }
}

// Register NPC Sheet
Actors.registerSheet("wfrp4e", ActorSheetWfrp4eVehicle,
{
  types: ["vehicle"],
  makeDefault: true
});