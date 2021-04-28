
export default function() {
  /**
   * Applies logic depending on actor type and created items
   * Equips equippable items for non-characters
   * 
   */
  Hooks.on("preCreateOwnedItem", (actor, item) => {

    // If not a character and wearable item, set worn to true
    if (actor.data.type != "character" && actor.data.type != "vehicle") {
      if (item.type == "armour")
        item.data["worn.value"] = true;
      else if (item.type == "weapon")
        item.data["equipped"] = true;
      else if (item.type == "trapping" && item.data.trappingType.value == "clothingAccessories")
        item.data["worn"] = true;
    }

    if (item.type == "vehicleMod" && actor.data.type != "vehicle")
      return false

    if (getProperty(item, "data.location.value"))
      item.data.location.value = ""

    if (item.effects)
    {
      let immediateEffects = [];
      item.effects.forEach(e => {
        if (getProperty(e, "flags.wfrp4e.effectTrigger") == "oneTime" && getProperty(e, "flags.wfrp4e.effectApplication") == "actor")
          immediateEffects.push(e)
      })

      item.effects = item.effects.filter(e => !immediateEffects.find(immediate => e._id == immediate._id))

      immediateEffects.forEach(effect => {
        game.wfrp4e.utility.applyOneTimeEffect(effect, actor)
      })
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
  Hooks.on("createOwnedItem", (actor, item) => {
    if (actor.type == "vehicle")
      return;
    try {
      // If critical, subtract wounds value from actor's
      if (item.type == "critical") 
      {
        let newWounds;
        if (item.data.wounds.value.toLowerCase() == "death")
          newWounds = 0;
        newWounds = actor.data.data.status.wounds.value - Number(item.data.wounds.value)
        if (newWounds < 0) newWounds = 0;

        actor.update({ "data.status.wounds.value": newWounds });

        ui.notifications.notify(`${item.data.wounds.value} ${game.i18n.localize("CHAT.CriticalWoundsApplied")} ${actor.name}`)

        if (game.combat)
        {
          let minorInfections = game.combat.getFlag("wfrp4e", "minorInfections") || []
          minorInfections.push(actor.name)
          game.combat.setFlag("wfrp4e", "minorInfections", null).then(c => game.combat.setFlag("wfrp4e", "minorInfections", minorInfections))
        }
      }
    }
    catch (error) {
      console.error(game.i18n.localize("Error.CriticalWound") + ": " + error) //continue as normal if exception
    }
  
    if (item.type == "career" && actor.data.type == "creature") {
      actor._advanceNPC(item.data);
    }
  })
  

  // Hooks.on("closeItemSheet", (sheet, html) => {
  //   let messageId = sheet.item.getFlag("wfrp4e", "postedItem")
  //   let newTransfer = {type: "postedItem", payload : JSON.stringify(sheet.item.data)}
  //   if(messageId)
  //   {
  //     let message = game.messages.get(messageId)
  //     message.update({"flags.transfer" : newTransfer})
  //   }
  // })
//   // If deleting a talent or trait, if that talent or trait gives a bonus, remove that bonus.
//   Hooks.on("deleteOwnedItem", (actor, item) => {
//     if (actor.type == "vehicle")
//       return;
//     if (item.type == "talent") {
//       let charToDecrease =  game.wfrp4e.config.talentBonuses[item.name.toLowerCase().trim()] // TODO: investigate why trim is needed here

//       if (charToDecrease) {
//         let newValue = actor.data.data.characteristics[charToDecrease].initial - 5;
//         actor.update({ [`data.characteristics.${charToDecrease}.initial`]: newValue })
//       }
//     }
//     if (item.type == "trait") {
//       if (actor.data.type == "creature" && actor.data.data.excludedTraits.length && actor.data.data.excludedTraits.includes(item._id))
//         return

//       let bonuses =  game.wfrp4e.config.traitBonuses[item.name.toLowerCase().trim()] // TODO: investigate why trim is needed here
//       let data = duplicate(actor.data.data)
//       for (let char in bonuses) {
//         if (char == "m") {
//           try {
//             data.details.move.value = Number(data.details.move.value) - bonuses[char]
//           }
//           catch (e) // Ignore if error trying to convert to number
//           { }
//         }
//         else
//           data.characteristics[char].initial -= bonuses[char]
//       }
//       actor.update({ data: data })
//     }
//       if (item.type == "container")
//       {
//           let items = duplicate(actor.data.items.filter(i => i.data.location  == item._id));
//           items.forEach(i => i.data.location.value = "");
//           actor.updateEmbeddedEntity("OwnedItem", items);
//       }
//   })
 }