import WFRP_Utility from "../system/utility-wfrp4e.js";

export default function() {

  Hooks.on("preCreateJournalEntry", (document, data, options) => {
    if (data._id)
      options.keepId = WFRP_Utility._keepID(data._id, document)
  })


  Hooks.on("getJournalSheetHeaderButtons", (sheet, buttons) => {
    if (sheet.entity.sceneNote)
      buttons.unshift(
        {
          class: "pin",
          icon: "fas fa-map-pin",
          onclick: async ev => sheet.entity.panToNote()
        })
  })

  /**
   * Adds tooltips to journal sheet buttons and adds listeners for pseudo entities
   */
  Hooks.on("renderJournalSheet", (obj, html, data) => {
    $(html).find(".close").attr("title", "Close");
    $(html).find(".entry-image").attr("title", "Image");
    $(html).find(".entry-text").attr("title", "Text");
    $(html).find(".share-image").attr("title", "Show Image");
    

    // ---- Listen for custom entity links -----
    html.find(".chat-roll").click(WFRP_Utility.handleRollClick)
    html.find(".symptom-tag").click(WFRP_Utility.handleSymptomClick)
    html.find(".condition-chat").click(WFRP_Utility.handleConditionClick)
    html.find('.table-click').mousedown(WFRP_Utility.handleTableClick)
    html.find('.pay-link').mousedown(WFRP_Utility.handlePayClick)
    html.find('.credit-link').mousedown(WFRP_Utility.handleCreditClick)    
    html.find('.corruption-link').mousedown(WFRP_Utility.handleCorruptionClick)
    html.find('.fear-link').mousedown(WFRP_Utility.handleFearClick)
    html.find('.terror-link').mousedown(WFRP_Utility.handleTerrorClick)
    html.find('.exp-link').mousedown(WFRP_Utility.handleExpClick)

  })
}
