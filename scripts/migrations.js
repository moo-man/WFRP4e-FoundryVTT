class Migration
{
 
  static async migrateWorld()
  {
    ui.notifications.notify("Beginning Migration to WFRP4E 1.0")
    for (let i of game.items.entities)
    {
      await i.update(this.migrateItemData(duplicate(i.data)));
    }

    for (let a of game.actors.entities)
    {
      await this.migrateActorData(a);
    }

    for (let p of game.packs)
    {
      if (p.metadata.entity == "Item" && p.metadata.package == "world")
      p.getContent().then(async (items) => {
        items.forEach(async (i) =>  {
          if(i.type == "weapon")
          {
            await p.updateEntity(this.migrateItemData(i.data));
          }
        })
      })

      if (p.metadata.entity == "Actor" && p.metadata.package == "world")
      {
        p.getContent().then(async (actors) => {
          actors.forEach(async (a) => {
           p.updateEntity(await this.migrateActorData(a))
          })
        })
      }

    }
    ui.notifications.notify("Migration to WFRP4E 1.0 Finished")

    game.settings.set("wfrp4e", "systemMigrationVersion", game.system.data.version)

  }

  static async migrateActorData(actor)
  {
    let actorItems = actor.items;
    for (let i of actorItems)
    {
      await actor.updateEmbeddedEntity("OwnedItem", this.migrateItemData(i.data));
    }
    return actor.data
  }

  static migrateItemData(itemData)
  {
    if (itemData.type == "weapon")
      return this.migrateWeaponData(itemData)
    else 
      return itemData;
  }

  static migrateWeaponData(weaponData)
  {
    if (!weaponData.data.damage.value)
    {
      let isMelee = WFRP4E.groupToType[weaponData.data.weaponGroup.value] == "melee"
      
      if (isMelee)
        weaponData.data.damage.value = weaponData.data.damage.meleeValue;
      else
        weaponData.data.damage.value = weaponData.data.damage.rangedValue;
    }
    return weaponData
  }
}