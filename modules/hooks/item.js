
export default function () {

  Hooks.on("updateItem", (item, update, options) => {
    if (item.type == "container" && update.data?.location?.value) {
      let allContainers = item.actor.getItemTypes("container")
      if (formsLoop(item, allContainers))
      {
        ui.notifications.error("Loop formed - Resetting Container Location")
        return item.update({ "data.location.value": "" })
      }
    }

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
   * Armour, weapons, and wearables - automatically set to worn for non-characters
   * Talents, traits - apply characteristic bonuses if appropriate.
   * 
   * This file also contains deleteOwnedItem, which undoes the talent/trait bonuses
   */
  Hooks.on("createItem", (item, actor) => {
    if (!item.isOwned)
      return
    if (actor.type == "vehicle")
      return;
    try {
      // If critical, subtract wounds value from actor's
      if (item.type == "critical") {
        let newWounds;
        if (item.data.wounds.value.toLowerCase() == "death")
          newWounds = 0;
        newWounds = actor.status.wounds.value - Number(item.data.wounds.value)
        if (newWounds < 0) newWounds = 0;

        actor.update({ "data.status.wounds.value": newWounds });

        ui.notifications.notify(`${item.data.wounds.value} ${game.i18n.localize("CHAT.CriticalWoundsApplied")} ${actor.name}`)

        if (game.combat) {
          let minorInfections = game.combat.getFlag("wfrp4e", "minorInfections") || []
          minorInfections.push(actor.name)
          game.combat.setFlag("wfrp4e", "minorInfections", null).then(c => game.combat.setFlag("wfrp4e", "minorInfections", minorInfections))
        }
      }
    }
    catch (error) {
      console.error(game.i18n.localize("ErrorCriticalWound") + ": " + error) //continue as normal if exception
    }

    if (item.type == "career" && actor.data.type == "creature") {
      actor._advanceNPC(item.data);
    }
  })

  // Remove items from a container that got deleted
  Hooks.on("deleteItem", (item) => {
    if (item.type == "container" && item.isOwned)
    {
      let updates = item.actor.items
      .filter(i => i.location?.value == item.id)
      .map(i => i.toObject())
      .map(i => {
        return {
          _id : i._id,
          "data.location.value" : ""
      }
    })
    item.actor.updateEmbeddedDocuments("Item", updates)
    }
  })

}