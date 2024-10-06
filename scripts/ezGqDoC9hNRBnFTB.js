let choices = await Promise.all([warhammer.utility.findItemId("1zaqojk0Oq1m8vYv"), warhammer.utility.findItemId("zIuarD5mB0EF0ji0")])
let items = await game.wfrp4e.apps.ItemDialog.create(choices, 1, "Choose a Weapon")
items = items.map(i => i.toObject())

items.forEach(i => i.system.equipped.value = true);

this.actor.createEmbeddedDocuments("Item", items);