let filters = [
    {
        property : "type",
        value : "weapon"
    },
    {
        property : "system.weaponGroup.value",
        value : ["twohanded", "polearm"]
    }
]

let items = await game.wfrp4e.apps.ItemDialog.createFromFilters(filters, 1, "Choose an appropriate Polearm or Two-Handed Weapon")
items = items.map(i => i.toObject())

items.forEach(i => equip(i))

this.actor.createEmbeddedDocuments("Item", items);

function equip(item)
{
    if (item.type == "armour")
        item.system.worn.value = true
    else if (item.type == "weapon")
        item.system.equipped = true
    else if (item.type == "trapping" && item.system.trappingType.value == "clothingAccessories")
        item.system.worn = true
}