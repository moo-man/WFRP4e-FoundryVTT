
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
export default class ActorSheetWfrp4eNPC extends ActorSheetWfrp4e {
  static get defaultOptions() {
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
  get template() {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.html";
    return "systems/wfrp4e/templates/actors/npc/npc-sheet.html";
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

    // Do not proceed if sheet is not editable
    if (!this.options.editable) return;

    // Roll a characteristic test by clicking on the characteristic name
    html.find('.ch-roll').click(this._onCharClick.bind(this))

    html.find(".npc-income").click(this._onNpcIncomeClick.bind(this))

    // Advance NPC if a career is marked as "complete"
    html.find('.npc-career').click(this._onNpcCareerClick.bind(this))

  }

  //TODO Review with status changes
  async _onNpcIncomeClick(event) {
    let status = this.actor.details.status.value.split(" ");
    let dieAmount = game.wfrp4e.config.earningValues[WFRP_Utility.findKey(status[0], game.wfrp4e.config.statusTiers)][0] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    dieAmount = Number(dieAmount) * status[1];     // Multilpy that first letter by your standing (Brass 4 = 8d10 pennies)
    let moneyEarned;
    if (WFRP_Utility.findKey(status[0], game.wfrp4e.config.statusTiers) != "g") // Don't roll for gold, just use standing value
    {
      dieAmount = dieAmount + "d10";
      moneyEarned = (await new Roll(dieAmount).roll()).total;
    }
    else
      moneyEarned = dieAmount;

    let paystring
    switch (WFRP_Utility.findKey(status[0], game.wfrp4e.config.statusTiers)) {
      case "b":
        paystring = `${moneyEarned}${game.i18n.localize("MARKET.Abbrev.BP").toLowerCase()}.`
        break;
      case "s":
        paystring = `${moneyEarned}${game.i18n.localize("MARKET.Abbrev.SS").toLowerCase()}.`
        break;
      case "g":
        paystring = `${moneyEarned}${game.i18n.localize("MARKET.Abbrev.GC").toLowerCase()}.`
        break;
    }
    let money = MarketWfrp4e.creditCommand(paystring, this.actor, { suppressMessage: true })
    WFRP_Audio.PlayContextAudio({ item: { type: "money" }, action: "gain" })
    this.actor.updateEmbeddedDocuments("Item", money);
  }

  async _onNpcCareerClick(event) {
    event.preventDefault();
    let id = $(event.currentTarget).parents(".item").attr("data-item-id");
    let careerItem = this.actor.items.get(id)
    await careerItem.update({"data.complete.value" : !careerItem.complete.value})

    if (careerItem.complete.value) {

      new Dialog({
        content: game.i18n.localize("CAREERAdvHint"),
        title: game.i18n.localize("CAREERAdv"),
        buttons: {
          yes: {
            label: game.i18n.localize("Yes"),
            callback: async () => {

              await this.actor._advanceNPC(careerItem)
              await this.actor.update({ "data.details.status.value": game.wfrp4e.config.statusTiers[careerItem.status.tier] + " " + careerItem.status.standing })
            }
          },
          no: {
            label: game.i18n.localize("No"),
            callback: () => { }
          }
        }
      }).render(true);
    }
  }
}

// Register NPC Sheet
Actors.registerSheet("wfrp4e", ActorSheetWfrp4eNPC,
  {
    types: ["npc"],
    makeDefault: true
  });