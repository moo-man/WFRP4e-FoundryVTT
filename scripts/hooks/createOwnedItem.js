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
Hooks.on("createOwnedItem", (actor, item) => {
  try {
    // If critical, subtract wounds value from actor's
    if (item.type == "critical")
    {
      let newWounds;
      if (item.data.wounds.value.toLowerCase() == "death")
        newWounds = 0;
      newWounds = actor.data.data.status.wounds.value - Number(item.data.wounds.value)
      if (newWounds < 0) newWounds = 0; 

      actor.update({"data.status.wounds.value" : newWounds});

      ui.notifications.notify(`${item.data.wounds.value} ${game.i18n.localize("CHAT.CriticalWoundsApplied")} ${actor.name}`)
    }
  }
  catch (error)
  {
    console.error(game.i18n.localize("Error.CriticalWound") + ": " + error) //continue as normal if exception
  }

    // If talent - see if it's a characteristic increasing talent, if so, apply the bonus.
    if (item.type == "talent")
    {
      let charToIncrease = WFRP4E.talentBonuses[item.name.toLowerCase().trim()] // TODO: investigate why trim is needed here
      if (charToIncrease)
      {
        let newValue = actor.data.data.characteristics[charToIncrease].initial + 5;
        actor.update({[`data.characteristics.${charToIncrease}.initial`] : newValue})
      }
    }
    // If trait, see if it gives a bonus, if so, apply that bonus.
    if (item.type == "trait")
    {
      if (actor.data.data.excludedTraits && actor.data.data.excludedTraits.length && actor.data.data.excludedTraits.includes(item._id))
        return
      let bonuses = WFRP4E.traitBonuses[item.name.toLowerCase().trim()] // TODO: investigate why trim is needed here
      let data = duplicate(actor.data.data)
      for (let char in bonuses)
      {
        data.characteristics[char].initial += bonuses[char]
      }
      actor.update({data : data})
    }  
    if (item.type == "career" && actor.data.type == "creature")
    {
      actor._advanceNPC(item.data);
    }
})

// If deleting a talent or trait, if that talent or trait gives a bonus, remove that bonus.
Hooks.on("deleteOwnedItem", (actor, item) => {
  if (item.type == "talent")
  {
    let charToDecrease = WFRP4E.talentBonuses[item.name.toLowerCase().trim()] // TODO: investigate why trim is needed here

    if (charToDecrease)
    {
      let newValue = actor.data.data.characteristics[charToDecrease].initial - 5;
      actor.update({[`data.characteristics.${charToDecrease}.initial`] : newValue})
    }
  }
  if (item.type == "trait")
  {
    if (actor.data.data.excludedTraits.length && actor.data.data.excludedTraits.includes(item._id))
      return
    
    let bonuses = WFRP4E.traitBonuses[item.name.toLowerCase().trim()] // TODO: investigate why trim is needed here
    let data = duplicate(actor.data.data)
    for (let char in bonuses)
    {
      data.characteristics[char].initial -= bonuses[char]
    }
    actor.update({data : data})
  }  
})
