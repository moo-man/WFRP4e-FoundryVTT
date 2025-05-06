import WFRP_Utility from "../system/utility-wfrp4e.js";

export default function() {
  Hooks.on("renderJournalEntrySheet", (sheet, html) => {
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

    for(let header of html.querySelectorAll(".no-toc"))
    {
      html.querySelector(`nav [data-anchor='${header.dataset.anchor}']`)?.remove();
    }

  });

  Hooks.on("renderJournalEntryPageProseMirrorSheet", (sheet, html) => {
    let selector = html.querySelector("[name='title.level']");
    selector?.insertAdjacentHTML("beforeend", `<option value='4' ${sheet.document.title.level == 4 ? "selected" : ""}>Level 4</option>`)
  })
}
