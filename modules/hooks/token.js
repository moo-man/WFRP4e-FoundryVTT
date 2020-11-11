import WFRP_Utility from "../system/utility-wfrp4e.js";
import passengerRender from "../system/passengerRender.js"

export default function() {
  // Adds tooltips to conditions in the condition menu
  Hooks.on("renderTokenHUD", async (obj, html) => {
    for (let condition of html.find("img.effect-control")) {
      condition.title = WFRP_Utility.parseConditions([condition.src])[0]
    }
  })


  // Hooks.on("updateToken", (scene, token) => {
  //   if (game.actors.get(token.actorId).data.type == "vehicle")
  //     passengerRender()
  // })

  Hooks.on("createToken", (scene, token) => {
    setTimeout(() => {
      if (game.actors.get(token.actorId).data.type == "vehicle")
        passengerRender()
    }, 200)

  })
}