import GenericActions from "../system/actions.js";

export default function() {
  Hooks.on("renderJournalEntrySheet", (sheet, html, options, context) => {
    if (context.isFirstRender === true)
    {
      GenericActions.addEventListeners(html, this);
    }

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
