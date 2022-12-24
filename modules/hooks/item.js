
export default function () {

  Hooks.on("updateItem", (item, update, options) => {
    if (item.type == "container" && update.data?.location?.value) {
      let allContainers = item.actor.getItemTypes("container")
      if (formsLoop(item, allContainers))
      {
        ui.notifications.error("Loop formed - Resetting Container Location")
        return item.update({ "system.location.value": "" })
      }
    }

    /**
     * Recursive function to determine whether a container (and its location) forms a loop
     * Each call adds a container to the "stack", which becomes a list of the container given
     * and all its ancestors. If at any point the container is an ancestor to itself (stack 
     * includes its id), a loop is detected.
     * 
     * 
     * @param {Object} container     container being tested
     * @param {Array} containerList  all containers
     * @param {Array} stack          List of containers tested (original container + parents)
     */
    function formsLoop(container, containerList, stack = []) {
      if (!container.location.value)
        return false
      else if (stack.includes(container.id))
        return true
      else {
        stack.push(container.id)
        return formsLoop(containerList.find(c => c.id == container.location.value), containerList, stack)
      }
    }
  })

  /**
   * Applies various logic depending on actor type and created items
   * 
   * Criticals - apply wound values
   * 
   */
  Hooks.on("createItem", (item, actor, userId) => {

    if (game.user.id != userId)
      return
    
    if (!item.isOwned)
      return
    if (item.actor.type == "vehicle")
      return;
    try {
      // If critical, subtract wounds value from actor's
      if (item.type == "critical") {
        let newWounds;
        if (Number.isNumeric(item.wounds.value))
        {
          if (item.wounds.value.toLowerCase() == "death")
            newWounds = 0;

            newWounds = item.actor.status.wounds.value - Number(item.wounds.value)
            if (newWounds < 0) newWounds = 0;
            
            item.actor.update({ "system.status.wounds.value": newWounds });
            ui.notifications.notify(`${item.wounds.value} ${game.i18n.localize("CHAT.CriticalWoundsApplied")} ${item.actor.name}`)
        }


        if (game.combat && game.user.isGM) {
          let minorInfections = game.combat.getFlag("wfrp4e", "minorInfections") || []
          minorInfections.push(item.actor.name)
          game.combat.setFlag("wfrp4e", "minorInfections", null).then(c => game.combat.setFlag("wfrp4e", "minorInfections", minorInfections))
        }
      }
    }
    catch (error) {
      console.error(game.i18n.localize("ErrorCriticalWound") + ": " + error) //continue as normal if exception
    }

    if (item.type == "career" && item.actor.type == "creature") {
      item.actor._advanceNPC(item);
    }
  })

  // Remove items from a container that got deleted
  Hooks.on("deleteItem", (item) => {
    if (item.type == "container" && item.isOwned)
    {
      let updates = item.item.actor.items
      .filter(i => i.location?.value == item.id)
      .map(i => i.toObject())
      .map(i => {
        return {
          _id : i._id,
          "system.location.value" : ""
      }
    })
    item.item.actor.updateEmbeddedDocuments("Item", updates)
    }
  })

}