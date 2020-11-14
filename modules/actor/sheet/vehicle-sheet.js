
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


  getData()
  {
    let data = super.getData();
    data.availabilities =  game.wfrp4e.config.availability;
    return data;
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


    html.find(".passenger-qty-click").mousedown(ev => {
      let multiplier = ev.button == 0 ? 1 : -1;
      multiplier = ev.ctrlKey ? multiplier * 10 : multiplier;

      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let passengers = duplicate(this.actor.data.data.passengers);
      passengers[index].count += 1 * multiplier;
      passengers[index].count = passengers[index].count < 0 ? 0 : passengers[index].count
      this.actor.update({"data.passengers" : passengers});
    })

    html.find(".passenger-delete-click").click(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      let passengers = duplicate(this.actor.data.data.passengers);
      passengers.splice(index, 1)
      this.actor.update({"data.passengers" : passengers});
    })


    html.find(".passenger .name").click(ev => {
      let index = Number($(ev.currentTarget).parents(".item").attr("data-index"))
      game.actors.get(this.actor.data.data.passengers[index].id).sheet.render(true);
    })
  
    html.find(".inventory-list .name").mousedown(ev => {
      if (ev.button != 2) return;
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
        }
      }).render(true);
    })

  }
}

// Register NPC Sheet
Actors.registerSheet("wfrp4e", ActorSheetWfrp4eVehicle,
{
  types: ["vehicle"],
  makeDefault: true
});