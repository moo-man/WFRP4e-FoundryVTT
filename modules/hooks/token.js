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
            let tokenUpdate = {_id : mountId, x : token.data.x, y: token.data.y }
            if (token.actor.details.size.value == token.actor.mount.details.size.value)
            {
              tokenUpdate.x += canvas.grid.size / 4
              tokenUpdate.y += canvas.grid.size / 4
            }
            scene.updateEmbeddedDocuments("Token", [tokenUpdate])

          }
        }
      }


      if (hasProperty(updateData, "flags.wfrp4e.mask") && token.actorLink == true)
      {
        game.actors.get(token.actorId).update({"token.flags.wfrp4e.mask" : getProperty(updateData, "flags.wfrp4e.mask") })
      }
  })


  Hooks.on('renderTokenHUD', (hud, html) => {

    if (canvas.tokens.controlled.length == 2)// && canvas.tokens.controlled[0].actor.details.size.value != canvas.tokens.controlled[1].actor.details.size.value)
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

        let mountee = hud.object;
        let mounter = hud.object.id == token1.id ? token2 : token1
        if (game.wfrp4e.config.actorSizeNums[mounter.actor.details.size.value] > game.wfrp4e.config.actorSizeNums[mountee.actor.details.size.value])
        {
          let temp = mountee;
          mountee = mounter
          mounter = temp
        }

        let tokenData = undefined
        if (!mountee.data.actorLink) {
          tokenData = {
            scene: canvas.scene.id,
            token: mountee.id
          }
          if (mounter.data.actorLink)
            ui.notifications.warn(game.i18n.localize("WarnUnlinkedMount"))
        }
        mounter.actor.update({ "data.status.mount.id": mountee.data.actorId, "data.status.mount.mounted": true, "data.status.mount.isToken": !mountee.data.actorLink, "data.status.mount.tokenData": tokenData })
        canvas.scene.updateEmbeddedDocuments("Token", [{ "flags.wfrp4e.mount": mountee.id, _id: mounter.id }, { _id: mounter.id, x: mountee.data.x, y: mountee.data.y }])
        mounter.zIndex = 1 // Ensure rider is on top


      })
      html.find('.col.right').append(button);
    }


  })
}