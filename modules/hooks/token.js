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
  

  Hooks.on("renderTokenConfig", async (obj, html) => {
    let checkbox = $(`
    <div class="form-group" title="Hides token name and image in chat and combat tracker.">
    <label>Mask Token</label>
    <input type='checkbox' name='flags.wfrp4e.mask' data-dtype="Boolean" ${obj.object.getFlag("wfrp4e", "mask") ? "checked" : ""}>
    </div>`)
    html.find("[data-tab=character].tab").append(checkbox)
    html.css("height", "365px")
  })



  Hooks.on("createToken", async (token) => {
    setTimeout(() => {
      if (game.actors.get(token.data.actorId).data.type == "vehicle")
        passengerRender()
    }, 200)

    if(game.user.isUniqueGM) // Prevents multiple mount tokens
    {
      let scene = token.parent;

      if (token.actor.isMounted && canvas.scene.id == scene.id)
      {
        let mount = token.actor.mount;
        let mountToken = new TokenDocument(await mount.getTokenData(), mount)
        mountToken.data.update({ x : token.data.x, y : token.data.y, hidden: token.data.hidden })
        mountToken = (await scene.createEmbeddedDocuments("Token", [mountToken.data]))[0]
        await token.update({"flags.wfrp4e.mount" : mountToken.id }) // place mount id in token so when it moves, the mount moves (see updateToken)
        token.zIndex = 1 // Ensure rider is on top

        if (!mountToken.actorLink)
        {
            let tokenData = {
              scene : scene._id,
              token : mountToken._id
            }
          token.actor.update({"data.status.mount.isToken" : true, "data.status.mount.tokenData" : tokenData})
        }
      }
    }

  })

  Hooks.on("updateToken", (token, updateData, options) => {
      let scene = token.parent
      if (game.user.isUniqueGM)
      {
        if (hasProperty(token, "data.flags.wfrp4e.mount") && (updateData.x || updateData.y) && scene.id == canvas.scene.id)
        {
          if (canvas.tokens.get(token.id).actor.isMounted)
          {
            let mountId = token.getFlag("wfrp4e", "mount")
            scene.updateEmbeddedDocuments("Token", [{_id : mountId, x : token.data.x, y: token.data.y }])
          }
        }
      }


      if (hasProperty(updateData, "flags.wfrp4e.mask") && token.actorLink == true)
      {
        game.actors.get(token.actorId).update({"token.flags.wfrp4e.mask" : getProperty(updateData, "flags.wfrp4e.mask") })
      }
  })


  Hooks.on('renderTokenHUD', (hud, html) => {

    if (canvas.tokens.controlled.length == 2 && canvas.tokens.controlled[0].actor.details.size.value != canvas.tokens.controlled[1].actor.details.size.value)
    {
      const button = $(
        `<div class='control-icon'><i class="fas fa-horse"></i></div>`
      );
      button.attr(
        'title',
        'Mount'
      );

      button.mousedown(event => {

        let token1 = canvas.tokens.controlled[0];
        let token2 = canvas.tokens.controlled[1];

        let largerToken = token1;
        let smallerToken = token2;
        if (game.wfrp4e.config.actorSizeNums[token2.actor.details.size.value] > game.wfrp4e.config.actorSizeNums[token1.actor.details.size.value])
        {
          largerToken = token2
          smallerToken = token1
        }

        let tokenData = undefined
        if (!largerToken.data.actorLink) {
          tokenData = {
            scene: canvas.scene.id,
            token: largerToken.id
          }
        }
        smallerToken.actor.update({ "data.status.mount.id": largerToken.data.actorId, "data.status.mount.mounted": true, "data.status.mount.isToken": !largerToken.data.actorLink, "data.status.mount.tokenData": tokenData })
        canvas.scene.updateEmbeddedEntity("Token", [{ "flags.wfrp4e.mount": largerToken.id, _id: smallerToken.id }, { _id: smallerToken.id, x: largerToken.data.x, y: largerToken.data.y }])
        smallerToken.zIndex = 1 // Ensure rider is on top


      })
      html.find('.col.right').append(button);
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
    //     tokenInstance.actor.deleteEmbeddedDocuments("ActiveEffect", [effects.map(e => e._id)])
    //   }
    //   console.log("RETURN")
    //   return false
    // }
})
}