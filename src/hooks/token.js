import passengerRender from "../system/passengerRender.js"

export default function() {


  Hooks.on("createToken", async (token, data, user) => {

    if(game.user.isUniqueGM) // Prevents multiple mount tokens
    {
      let scene = token.parent;

      if (token.actor.isMounted && canvas.scene.id == scene.id)
      {
        let mount = token.actor.mount;
        let mountToken = await mount.getTokenDocument();
        mountToken.updateSource({ x : token.x, y : token.y, hidden: token.hidden, sort : token.sort - 1 })

        // Shift token slightly if same size
        if (mountToken.actor.details.size.value == token.actor.details.size.value)
        {
          mountToken.updateSource({
            x : mountToken.x + canvas.grid.size/4,
            y : mountToken.y + canvas.grid.size/4
          })
        }
        mountToken = (await scene.createEmbeddedDocuments("Token", [mountToken]))[0]
        await token.update({"flags.wfrp4e.mount" : mountToken.id }) // place mount id in token so when it moves, the mount moves (see updateToken)
        token.zIndex = 1 // Ensure rider is on top

        if (!mountToken.actorLink)
        {
            let tokenData = {
              scene : scene._id,
              token : mountToken._id
            }
          token.actor.update({"system.status.mount.isToken" : true, "system.status.mount.tokenData" : tokenData})
        }
      }

    }

    if (game.user.id == user)
    {
        token.actor.runScripts("createToken", token);
    }
  })

  Hooks.on("updateToken", (token, updateData, options) => {
      let scene = token.parent
      if (game.user.isUniqueGM)
      {
        if (foundry.utils.hasProperty(token, "flags.wfrp4e.mount") && (updateData.x || updateData.y) && scene.id == canvas.scene.id)
        {
          if (canvas.tokens.get(token.id).actor.isMounted)
          {
            let mountId = token.getFlag("wfrp4e", "mount")
            let mountToken = canvas.tokens.get(mountId)
            if (mountToken)
            {

              let tokenUpdate = {_id : mountId, x : updateData.x || token.x, y: updateData.y || token.y, sort : token.sort - 1 }
              if (token.actor?.details.size.value == token.actor?.mount.details.size.value)
              {
                tokenUpdate.x += canvas.grid.size / 4
                tokenUpdate.y += canvas.grid.size / 4
              }
              mountToken.document.update(tokenUpdate)
            }
          }
        }
      }
    })

  Hooks.on('renderTokenHUD', (hud, html) => {
    _addMountButton(hud, html)
    _addPassengerButton(hud, html)

    for (let condition of html.querySelectorAll("img.effect-control")) {
      condition.dataset.tooltip = game.wfrp4e.config.conditions[condition.dataset["statusId"]]
      if (condition.dataset.statusId == "dead")
        condition.dataset.tooltip = "Dead"
    }
  })

  Hooks.on("refreshToken", token => {
    if (token.document?.getFlag("wfrp4e", "hidePassengers"))
      token.passengers?.destroy();
    else
      passengerRender(token);
    })
    



  
  function _addMountButton(hud, html)
  {
    if (canvas.tokens.controlled.length == 2)// && canvas.tokens.controlled[0].actor.details.size.value != canvas.tokens.controlled[1].actor.details.size.value)
    {
      const button = document.createElement("button");
      button.classList.add("control-icon");
      button.innerHTML = `<i class="fas fa-horse"></i>`

      button.addEventListener("click", (async event => {
        let token1 = canvas.tokens.controlled[0].document;
        let token2 = canvas.tokens.controlled[1].document;

        if (!token1 || !token2)
          return  

        let mountee = hud.object.document;
        let mounter = hud.object.document.id == token1.id ? token2 : token1
        if (game.wfrp4e.config.actorSizeNums[mounter.actor.details.size.value] > game.wfrp4e.config.actorSizeNums[mountee.actor.details.size.value])
        {
          let temp = mountee;
          mountee = mounter
          mounter = temp
        }

        let tokenData = undefined
        if (!mountee.actorLink) {
          tokenData = {
            scene: canvas.scene.id,
            token: mountee.id
          }
          if (mounter.actorLink)
            ui.notifications.warn(game.i18n.localize("WarnUnlinkedMount"))
        }
        await mounter.actor.update({ "system.status.mount.id": mountee.actorId, "system.status.mount.mounted": true, "system.status.mount.isToken": !mountee.actorLink, "system.status.mount.tokenData": tokenData })
        await mounter.update({"flags.wfrp4e.mount" : mountee._id, x : mountee.x, y : mountee.y})
        mounter.zIndex = 1 // Ensure rider is on top


      }))
      html.querySelector('.col.right').insertAdjacentElement("beforeend", button);
    }
  }

  function _addPassengerButton(hud, html)
  {
      if (hud.object.actor?.type != "vehicle")
      {
        return
      }

      const button = document.createElement("button");
      button.classList.add("control-icon");
      if (hud.object.document.getFlag("wfrp4e", "hidePassengers"))
      {
        button.classList.add("active");
      }
      button.innerHTML = `<i class="fa-solid fa-user-slash"></i>`

      button.dataset.tooltip = "WFRP4E.TogglePassengers"

      button.addEventListener("click", (event => {
        let newState = !hud.object.document.getFlag("wfrp4e", "hidePassengers")
        event.currentTarget.classList.toggle("active", newState)
        
        hud.object.document.setFlag("wfrp4e", "hidePassengers", newState).then(() => {
          // newState ? hud.object.passengers?.destroy() : passengerRender(hud.object);
        })
      }))
      html.querySelector('.col.right').insertAdjacentElement("beforeend", button);

  }
}