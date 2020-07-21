Hooks.on("renderSidebarTab", async (app, html) => {
  if (app.options.id == "settings")
  {
    let button = $("<button class='bug-report'>Report a Bug</button>")

    button.click(ev => {
      new BugReportFormWfrp4e().render(true);
    })

    button.insertAfter(html.find(".game-system"))
    
  }
})