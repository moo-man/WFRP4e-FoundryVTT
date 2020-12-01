import BugReportFormWfrp4e from "../apps/bug-report.js";
import GeneratorWfrp4e from "../apps/char-gen.js";

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

    if (app.options.id == "tables")
    {
      let button = $(`<button class='wfrp4e-tables'>${game.i18n.localize("WFRP4e Tables")}</button>`)
  
      button.click(ev => {
        ui.sidebar.activateTab("chat")
        ChatMessage.create({content : game.wfrp4e.tables.tableMenu()})
      })
  
      button.insertAfter(html.find(".header-actions"))
      
    }

    if (app.options.id == "actors")
    {
      let button = $(`<button class='character-creation'>${game.i18n.localize("Character Cretaion")}</button>`)
  
      button.click(ev => {
        ui.sidebar.activateTab("chat")
        CONFIG.Actor.entityClass.create({type : "character", name : "New Character"}, {renderSheet: true} )
        GeneratorWfrp4e.speciesStage();
      })
  
      button.insertAfter(html.find(".header-actions"))
      
    }
  })
}