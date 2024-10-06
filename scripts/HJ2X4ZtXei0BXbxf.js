        let choices = await Promise.all([warhammer.utility.findItemId("PzimjNx9Ojq4g6mV"), warhammer.utility.findItemId("rOPmyLWa37e7s9v6")])
        let items = await game.wfrp4e.apps.ItemDialog.create(choices, 1, "Choose a Skill")

        items = items.map(i => i.toObject())
        items.forEach(i => i.system.advances.value = 20)

items.forEach(i => i.system.equipped.value = true;)

this.actor.createEmbeddedDocuments("Item", items);
