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

    // ---- Listen for custom entity links -----
    html.find(".chat-roll").click(WFRP_Utility.handleRollClick.bind(WFRP_Utility))
    html.find(".symptom-tag").click(WFRP_Utility.handleSymptomClick.bind(WFRP_Utility))
    html.find(".condition-chat").click(WFRP_Utility.handleConditionClick.bind(WFRP_Utility))
    html.find(".property-chat").click(WFRP_Utility.handlePropertyClick.bind(WFRP_Utility))
    html.find('.table-click').mousedown(WFRP_Utility.handleTableClick.bind(WFRP_Utility))
    html.find('.pay-link').mousedown(WFRP_Utility.handlePayClick.bind(WFRP_Utility))
    html.find('.credit-link').mousedown(WFRP_Utility.handleCreditClick.bind(WFRP_Utility))
    html.find('.corruption-link').mousedown(WFRP_Utility.handleCorruptionClick.bind(WFRP_Utility))
    html.find('.fear-link').mousedown(WFRP_Utility.handleFearClick.bind(WFRP_Utility))
    html.find('.terror-link').mousedown(WFRP_Utility.handleTerrorClick.bind(WFRP_Utility))
    html.find('.exp-link').mousedown(WFRP_Utility.handleExpClick.bind(WFRP_Utility))

  })
}
