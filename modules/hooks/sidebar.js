import BugReportFormWfrp4e from "../apps/bug-report.js";

export default function() {
  Hooks.on("renderSidebarTab", async (app, html) => {


    // WFRP styling makes popout sidebars really narrow because of the border so expand it
    if (app.options.id == "chat" && app.options.popOut)
    {
      html[0].style.width = "390px"
    }


    if (app.options.id == "settings")
    {
      let button = $(`<button class='bug-report'>${game.i18n.localize("BUTTON.PostBug")}</button>`)
  
      button.click(ev => {
        new BugReportFormWfrp4e().render(true);
      })
  
      button.insertAfter(html.find("#game-details"))
      
    }

    if (app instanceof RollTableDirectory)
    {

      // Auto-roll tables if table image is clicked
      html.on("click", ".rolltable img", ev => {
        let table = game.tables.get($(ev.currentTarget).parent().attr("data-document-id"))
        let key = table.getFlag("wfrp4e", "key")
        let column = table.getFlag("wfrp4e", "column")

        if (!key)
          return
        
        game.wfrp4e.tables.formatChatRoll(key, {}, column).then(text => {
          let chatOptions = game.wfrp4e.utility.chatDataSetup(text, game.settings.get("core", "rollMode"), true)
          chatOptions.speaker = {alias: table.name}
          ChatMessage.create(chatOptions);
          ui.sidebar.activateTab("chat")
        })
      })
    }


    if (app instanceof ActorDirectory)
    {
      let button = $(`<button class='character-creation'>${game.i18n.localize("BUTTON.CharacterCreation")}</button>`)
  
      button.click(ev => {
        new game.wfrp4e.apps.CharGenWfrp4e().render(true)
      })
  
      button.insertAfter(html.find(".header-actions"))
      
    }
  })
}