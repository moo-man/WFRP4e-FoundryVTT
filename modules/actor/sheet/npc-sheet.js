
import ActorSheetWFRP4e from "./actor-sheet.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
import MarketWFRP4e from "../../apps/market-wfrp4e.js";
import WFRP_Audio from "../../system/audio-wfrp4e.js";

/**
 * Provides the specific interaction handlers for NPC Sheets.
 *
 * ActorSheetWFRP4eNPC is assigned to NPC type actors, and the specific interactions
 * npc type actors need are defined here, specifically for careers. NPCs have the unique
 * functionality with careers where clicking "complete" automatically advances characteristics,
 * skills, and talents from that career.
 * 
 */
export default class ActorSheetWFRP4eNPC extends ActorSheetWFRP4e {
  static get defaultOptions() {
    const options = super.defaultOptions;
    foundry.utils.mergeObject(options,
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
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.hbs";
    return "systems/wfrp4e/templates/actors/npc/npc-sheet.hbs";
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
    let tier = warhammer.utility.findKey(status[0], game.wfrp4e.config.statusTiers)[0] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    let standing = Number(status[1]);     // Multilpy that first letter by your standing (Brass 4 = 8d10 pennies)
    let {earned} = await game.wfrp4e.market.rollIncome(null, {standing, tier});

    let paystring
    switch (tier) {
      case "b":
        paystring = `${earned}${game.i18n.localize("MARKET.Abbrev.BP").toLowerCase()}.`
        break;
      case "s":
        paystring = `${earned}${game.i18n.localize("MARKET.Abbrev.SS").toLowerCase()}.`
        break;
      case "g":
        paystring = `${earned}${game.i18n.localize("MARKET.Abbrev.GC").toLowerCase()}.`
        break;
    }
    let money = MarketWFRP4e.creditCommand(paystring, this.actor, { suppressMessage: true })
    WFRP_Audio.PlayContextAudio({ item: { type: "money" }, action: "gain" })
    this.actor.updateEmbeddedDocuments("Item", money);
  }

  async _onNpcCareerClick(event) {
    event.preventDefault();
    let id = $(event.currentTarget).parents(".item").attr("data-id");
    let careerItem = this.actor.items.get(id)
    await careerItem.update({"system.complete.value" : !careerItem.complete.value})

    if (careerItem.complete.value) {

      new Dialog({
        content: game.i18n.localize("CAREERAdvHint"),
        title: game.i18n.localize("CAREERAdv"),
        buttons: {
          yes: {
            label: game.i18n.localize("Yes"),
            callback: async () => {

              await this.actor.system.advance(careerItem)
              await this.actor.update({ "system.details.status.value": game.wfrp4e.config.statusTiers[careerItem.system.status.tier] + " " + careerItem.system.status.standing })
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