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
  

  // Hooks.on("preCreateToken", (scene, token, b) => {
  //   if (token.actorLink)
  //   {
  //     let actor = game.actors.get(token.actorId);
  //     let tokenSize = game.wfrp4e.config.tokenSizes[actor.data.data.details.size.value]
  //     token.width = tokenSize;
  //     token.height = tokenSize;
  //   }
  // })

  Hooks.on("updateToken", (scene, token, updateData) => {
    if (hasProperty(updateData, "actorData"))
    {
      let t = new Token(token);

      let wounds = t.actor._calculateWounds()
      if (t.actor.data.data.status.wounds.max != wounds) // If change detected, reassign max and current wounds
        t.actor.update({"data.status.wounds.max" : wounds, "data.status.wounds.value" : wounds});
    }
})
}