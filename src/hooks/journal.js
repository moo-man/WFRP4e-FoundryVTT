import WFRP_Utility from "../system/utility-wfrp4e.js";

export default function() {
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
