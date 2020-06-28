// Adds tooltips to conditions in the condition menu
Hooks.on("renderTokenHUD", async (obj, html) => {
  for (let condition of html.find("img.effect-control"))
  {
    condition.title = WFRP_Utility.parseConditions([condition.src])[0]
  }
})