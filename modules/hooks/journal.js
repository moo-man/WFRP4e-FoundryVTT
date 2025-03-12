import WFRP_Utility from "../system/utility-wfrp4e.js";

export default function() {
  /**
   * Adds tooltips to journal sheet buttons and adds listeners for pseudo entities
   */
  Hooks.on("renderJournalPageSheet", (obj, html, data) => {
    // Remove button to reveal hooks, there isn't really a need for that and it messes up the css
    html.find(".secret.hook .reveal").remove(); 

  })

  Hooks.on("renderJournalEntrySheet", (document, html) => {
    let theme = game.settings.get("wfrp4e", "theme")
    if (!theme.journal.enabled)
    {
      html.classList.add("no-theme");
      html.classList.remove("classic-font");
    }
    else 
    {
      html.classList.remove("no-theme");

      if (theme.journal.font == "classic")
      {
        html.classList.add("classic-font");
      }
      else
      {
        html.classList.remove("classic-font");
      }
    }
  });
}
