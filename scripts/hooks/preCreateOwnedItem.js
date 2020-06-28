/**
 * Applies logic depending on actor type and created items
 * Equips equippable items for non-characters
 * 
 */
Hooks.on("preCreateOwnedItem", (actor, item) => {

  // If not a character and wearable item, set worn to true
  if (actor.data.type != "character")
  {
    if (item.type == "armour")
      item.data["worn.value"] = true;
    else if (item.type == "weapon")
      item.data["equipped"] = true;
    else if (item.type == "trapping" && item.data.trappingType.value == "clothingAccessories")
      item.data["worn"] = true;
  }
    
})
