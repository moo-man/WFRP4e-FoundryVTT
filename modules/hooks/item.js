
export default function () {

  Hooks.on("updateItem", (item, update, options, id) => {

    if (game.user.id != id)
      return

    if (item.actor) {
      item.actor.runEffects("update", {item, context: "update"})
    }

    if (item.type == "container" && update.system?.location?.value) {
      let allContainers = item.actor.getItemTypes("container")
      if (formsLoop(item, allContainers))
      {
        ui.notifications.error("Loop formed - Resetting Container Location")
        item.update({ "system.location.value": "" })
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
  Hooks.on("createItem", (item, options, id) => {

    if (game.user.id != id)
      return

    if (!item.isOwned)
      return

    item.actor.runEffects("update", {item, context: "create"})

    if (item.actor.type == "vehicle")
      return;
    try {
      // If critical, subtract wounds value from actor's
      if (item.type == "critical") {
        let newWounds;
        let appliedWounds = Number.parseInt(item.wounds.value);
        if (Number.isInteger(appliedWounds)) {
          ui.notifications.notify(`${item.wounds.value} ${game.i18n.localize("CHAT.CriticalWoundsApplied")} ${item.actor.name}`)
          newWounds = item.actor.status.wounds.value - appliedWounds;
          if (newWounds < 0) {
            newWounds = 0;
          }
        } else if (item.wounds.value.toLowerCase() == "death") {
          newWounds = 0;
        }
        item.actor.update({ "system.status.wounds.value": newWounds });

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

  Hooks.on("deleteItem", (item, options, id) => {
    if (game.user.id != id)
      return

    if (item.actor) {
      item.actor.runEffects("update", {item, context: "delete"});
    }
  })

}