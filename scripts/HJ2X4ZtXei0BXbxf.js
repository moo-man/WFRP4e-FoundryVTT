        let choices = await Promise.all([game.wfrp4e.utility.findItemId("PzimjNx9Ojq4g6mV"), game.wfrp4e.utility.findItemId("rOPmyLWa37e7s9v6")])
        let items = await game.wfrp4e.apps.ItemDialog.create(choices, 1, "Choose a Skill")

        items = items.map(i => i.toObject())
        items.forEach(i => i.system.advances.value = 20)

items.forEach(i => equip(i))

this.actor.createEmbeddedDocuments("Item", items);

function equip(item)
{
    if (item.type == "armour")
        item.data.worn.value = true
    else if (item.type == "weapon")
        item.data.equipped = true
    else if (item.type == "trapping" && item.data.trappingType.value == "clothingAccessories")
        item.data.worn = true
}