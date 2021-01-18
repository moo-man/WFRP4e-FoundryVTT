export default class Migration {

  async migrateWorld() {
    ui.notifications.notify("Chaos has been unleashed...")
    this.content = await this.gatherCompendiumContent();

    for (let i of game.items.entities) {
      let newItem = this.migrateItemData(i)
      if (newItem)
      {
        await i.update(newItem.data);
        console.log("MIGRATION | " + i.name)
      }
    }

    for (let a of game.actors.entities) {
      await this.migrateActorData(a);
    }

    ui.notifications.notify("Chaos has taken over...")

    game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version)

  }

  async migrateActorData(actor) {
    let actorItems = actor.items;
    console.log("MIGRATION | " + actor.name)
    actor.update({"data.details.move.value" : Number(actor.data.data.details.move.value)})
    let newItems = []
    for (let i of actorItems) {
      let newItem = this.migrateItemData(i)
      if (!newItem)
        continue
      newItem = newItem.data
      if (i.data.type == "money" || i.data.type == "weapon" || i.data.type == "skill")
        continue
      else if (i.data.type == "career" && i.data.data.current.value)
      {
        newItem.data.current.value = i.data.data.current.value
      }
      else if (i.data.type == "trait")
      {
        newItem.data.specification.value = i.data.data.specification.value;
      }
      else if (i.data.type == "trait" && i.name.includes("Ranged"))
      {
        newItem.name = i.name
      }
      
      if (i.data.type == "talent" && game.wfrp4e.config.talentBonuses[i.data.name.toLowerCase()])
      {
        let char = game.wfrp4e.config.talentBonuses[i.data.name.toLowerCase()]
        actor.update({[`data.characteristics.${char}.initial`] : actor.data.data.characteristics[char].initial - 5})
      }
      else if (i.data.type == "trait" && game.wfrp4e.config.traitBonuses[i.data.name.toLowerCase()])
      {
        if (!actor.data.data.excludedTraits || !actor.data.data.excludedTraits.includes(i.data._id))
        {
          let data = duplicate(actor.data.data)
          let bonuses =  game.wfrp4e.config.traitBonuses[i.name.toLowerCase().trim()] // TODO: investigate why trim is needed here
          for (let char in bonuses) {
            if (char == "m") {
              try {
                data.details.move.value = Number(data.details.move.value) - bonuses[char]
              }
              catch (e) // Ignore if error trying to convert to number
              { }
            }
            else
              data.characteristics[char].initial -= bonuses[char]
          }
          actor.update({"data" : data})
        }
      }
      newItems.push(newItem);
    }
    actor.updateEmbeddedEntity("OwnedItem", newItems)
    let effects = []
    newItems.forEach(i => {
        i.effects.forEach(e => {
          if (e.transfer)
          {
            e.origin = `Actor.${actor.id}.OwnedItem.${i._id}`
            effects.push(e)
          }
        })
    })
    actor.createEmbeddedEntity("ActiveEffect", effects)
    return actor.data
  }

  migrateItemData(item) {
    let foundItem = this.content.find(i => i.name == item.name && item.data.type == i.data.type)
    if(foundItem)
      foundItem.data._id = item.data._id
    return foundItem
  }

  async gatherCompendiumContent()
  {
    let content = [];
    for (let pack of game.packs)
      content = content.concat(await pack.getContent())
    return content
  }
}