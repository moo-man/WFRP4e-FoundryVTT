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

    if (app.options.id == "actors")
    {
      let button = $(`<button class='character-creation'>${game.i18n.localize("BUTTON.CharacterCreation")}</button>`)
  
      button.click(ev => {
        new Dialog({
          title : game.i18n.localize("BUTTON.CharacterCreation"),
          content : `<p>${game.i18n.localize("DIALOG.BeginCharacterCreation")}</p>`,
          buttons : {
            yes : {
              label : game.i18n.localize("Yes"),
              callback : dlg => {
                ui.sidebar.activateTab("chat")
                CONFIG.Actor.documentClass.create({type : "character", name : "New Character"}, {renderSheet: true} )
                GeneratorWfrp4e.start()
                game.wfrp4e.generator.speciesStage();
              }
            },
            no : {
              label : game.i18n.localize("No")
            }
          }
        }).render(true)
        
      })
  
      button.insertAfter(html.find(".header-actions"))
      
    }
  })
}