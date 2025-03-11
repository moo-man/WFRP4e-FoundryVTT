import WFRP_Utility from "../system/utility-wfrp4e.js";

export default function() {
  /**
   * Adds tooltips to journal sheet buttons and adds listeners for pseudo entities
   */
  Hooks.on("renderJournalPageSheet", (obj, html, data) => {
    $(html).find(".close").attr("title", game.i18n.localize("Close"));
    $(html).find(".entry-image").attr("title", game.i18n.localize("JOURNAL.ModeImage"));
    $(html).find(".entry-text").attr("title", game.i18n.localize("JOURNAL.ModeText"));
    $(html).find(".share-image").attr("title", game.i18n.localize("JOURNAL.ActionShow"));
    
    html.find(".secret.hook .reveal").remove(); // Remove button to reveal hooks, there isn't really a need for that and it messes up the css

  })
}
