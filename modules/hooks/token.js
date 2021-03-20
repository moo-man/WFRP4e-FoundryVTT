import WFRP_Utility from "../system/utility-wfrp4e.js";
import passengerRender from "../system/passengerRender.js"

export default function() {
  // Adds tooltips to conditions in the condition menu
  Hooks.on("renderTokenHUD", async (obj, html) => {
    for (let condition of html.find("img.effect-control")) {
      condition.title = game.wfrp4e.config.conditions[condition.dataset["statusId"]]
      if (condition.dataset["statusId"] == "dead")
        condition.title = "Dead"
    }
  })



  Hooks.on("createToken", async (scene, token) => {
    setTimeout(() => {
      if (game.actors.get(token.actorId).data.type == "vehicle")
        passengerRender()
    }, 200)

    if(game.user.isUniqueGM) // Prevents multiple mount tokens
    {
      let tok = new Token(token);

      if (tok.actor.isMounted && canvas.scene.data._id == scene.data._id)
      {
        let mount = tok.actor.mount;
        let mountToken = await Token.fromActor(mount, {x : token.x, y : token.y, hidden: token.hidden})
        mountToken = await scene.createEmbeddedEntity("Token", mountToken.data)
        scene.updateEmbeddedEntity("Token", {"flags.wfrp4e.mount" : mountToken._id, _id : token._id }) // place mount id in token so when it moves, the mount moves (see updateToken)
        tok = canvas.tokens.get(token._id)
        tok.zIndex = 1 // Ensure rider is on top

        if (!mountToken.actorLink)
        {
            let tokenData = {
              scene : scene._id,
              token : mountToken._id
            }
          tok.actor.update({"data.status.mount.isToken" : true, "data.status.mount.tokenData" : tokenData})
        }
      }
    }

  })

  Hooks.on("updateToken", (scene, token, updateData) => {
      if (game.user.isUniqueGM)
      {
        if (hasProperty(token, "flags.wfrp4e.mount") && (updateData.x || updateData.y) && scene.data._id == canvas.scene.data._id)
        {
          if (canvas.tokens.get(token._id).actor.isMounted)
          {
            let mountId = getProperty(token, "flags.wfrp4e.mount")
            scene.updateEmbeddedEntity("Token", {_id : mountId, x : token.x, y: token.y })
          }
        }
      }
  })

  Hooks.on("preUpdateToken", (scene, token, updateData) => {
    // if (game.user.isGM)
    // {
    //   if (hasProperty(updateData, "actorData.effects"))
    //   {
    //     if (canvas.scene != scene)
    //       return ui.notifications.error("Please move to the scene where effects are being applied")
    //     let effects = getProperty(updateData, "actorData.effects")
    //     let oneTime = effects.filter(e => getProperty(e, "flags.wfrp4e.effectTrigger") == "oneTime")
    //     let tokenInstance = canvas.tokens.get(token._id)

    //     setTimeout((oneTime, tokenInstance) => {
    //     console.log("TIMEOUT")
    //       oneTime.forEach(e => {
    //         try {
    //         let func = new Function("args", getProperty(e, "flags.wfrp4e.script")).bind({ actor: tokenInstance.actor, effect: e })
    //         func({actor : tokenInstance.actor})
    //         }
    //         catch (ex) {
    //           ui.notifications.error("Error when running effect " + e.label + ": " + ex)
    //           console.log("Error when running effect " + e.label + ": " + ex)
    //         }
    //     })
    //     }, 1000, oneTime, tokenInstance)
    //     tokenInstance.actor.deleteEmbeddedEntity("ActiveEffect", effects.map(e => e._id))
    //   }
    //   console.log("RETURN")
    //   return false
    // }
})
}