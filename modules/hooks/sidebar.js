import BugReportFormWfrp4e from "../apps/bug-report.js";

export default function() {
  Hooks.on("renderSidebarTab", async (app, html) => {
    if (app.options.id == "settings")
    {
      let button = $(`<button class='bug-report'>${game.i18n.localize("BUTTON.PostBug")}</button>`)
  
      button.click(ev => {
        new BugReportFormWfrp4e().render(true);
      })
  
      button.insertAfter(html.find("#game-details"))
      
    }
  })
}