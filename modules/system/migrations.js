export default class Migration {

  static async migrateWorld() {
    ui.notifications.info(`Applying WFRP4e System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true });

    // Migrate World Items
    for (let i of game.items.contents) {
      try {
        let updateData = Migration.migrateItemData(i.toObject());
        if (!foundry.utils.isEmpty(updateData)) {
          console.log(`Migrating Item document ${i.name}`);
          await i.update(updateData, { enforceTypes: false });
        }
      } catch (err) {
        err.message = `Failed wfrp4e system migration for Item ${i.name}: ${err.message}`;
        console.error(err);
      }
    }

    for (let p of game.packs) {
      if (p.metadata.type == "Item" && p.metadata.package == "world")
        await Migration.migrateCompendium(p);
    }
    for (let p of game.packs) {
      if (p.metadata.type == "Actor" && p.metadata.package == "world")
        await Migration.migrateCompendium(p);
    }
    for (let p of game.packs) {
      if (p.metadata.type == "Scene" && p.metadata.package == "world")
        await Migration.migrateCompendium(p);
    }

    // Migrate World Actors
    for (let a of game.actors.contents) {
      try {
        let updateData = Migration.migrateActorData(a);
        if (!foundry.utils.isEmpty(updateData)) {
          console.log(`Migrating Actor document ${a.name}`);
          await a.update(updateData, { enforceTypes: false });
          // await Migration.migrateOwnedItemEffects(a)
        }
      } catch (err) {
        err.message = `Failed wfrp4e system migration for Actor ${a.name}: ${err.message}`;
        console.error(err);
      }
    }

    // Migrate Actor Override Tokens
    for (let s of game.scenes.contents) {
      try {
        let updateData = Migration.migrateSceneData(s);
        if (!foundry.utils.isEmpty(updateData)) {
          console.log(`Migrating Scene document ${s.name}`);
          await s.update(updateData, { enforceTypes: false });
          // If we do not do this, then synthetic token actors remain in cache
          // with the un-updated actorData.
          s.tokens.contents.forEach(t => t._actor = null);
        }
      } catch (err) {
        err.message = `Failed wfrp4e system migration for Scene ${s.name}: ${err.message}`;
        console.error(err);
      }
    }

    // // Set the migration as complete
    game.settings.set("wfrp4e", "systemMigrationVersion", game.system.version);
    ui.notifications.info(`wfrp4e System Migration to version ${game.system.version} completed!`, { permanent: true });
  };

  /* -------------------------------------------- */

  /**
   * Apply migration rules to all Entities within a single Compendium pack
   * @param pack
   * @return {Promise}
   */
  static async migrateCompendium(pack) {
    const document = pack.metadata.document;
    if (!["Actor", "Item", "Scene"].includes(document)) return;

    // Unlock the pack for editing
    const wasLocked = pack.locked;
    await pack.configure({ locked: false });

    // Begin by requesting server-side data model migration and get the migrated content
    await pack.migrate();
    const documents = await pack.getDocuments();

    // Iterate over compendium entries - applying fine-tuned migration functions
    for (let doc of documents) {
      let updateData = {};
      try {
        switch (document) {
          case "Actor":
            updateData = Migration.migrateActorData(doc);
            break;
          case "Item":
            updateData = Migration.migrateItemData(doc);
            break;
          case "Scene":
            updateData = Migration.migrateSceneData(doc);
            break;
        }

        // Save the entry, if data was changed
        if (foundry.utils.isEmpty(updateData)) continue;
        await doc.update(updateData);
        console.log(`Migrated ${document} document ${doc.name} in Compendium ${pack.collection}`);
      }

      // Handle migration failures
      catch (err) {
        err.message = `Failed wfrp4e system migration for document ${doc.name} in pack ${pack.collection}: ${err.message}`;
        console.error(err);
      }
    }

    // Apply the original locked status for the pack
    await pack.configure({ locked: wasLocked });
    console.log(`Migrated all ${document} entities from Compendium ${pack.collection}`);
  };

  /* -------------------------------------------- */
  /*  Entity Type Migration Helpers               */
  /* -------------------------------------------- */

  /**
   * Migrate a single Actor entity to incorporate latest data model changes
   * Return an Object of updateData to be applied
   * @param {object} actor    The actor data object to update
   * @return {Object}         The updateData to apply
   */
  static migrateActorData(actor) {
    let updateData = {};

    // Migrate Owned Items
    if (actor.items) {
      const items = actor.items.reduce((arr, i) => {
        // Migrate the Owned Item
        let itemUpdate = Migration.migrateItemData(i);

        // Update the Owned Item
        if (!isEmpty(itemUpdate)) {
          itemUpdate._id = i.id;
          arr.push(expandObject(itemUpdate));
        }

        return arr;
      }, []);
      if (items.length > 0) updateData.items = items;

    }

    // Migrate Effects
    if (actor.actorEffects) {
      const effects = actor.actorEffects.reduce((arr, e) => {
        // Migrate the Owned Item
        let effectUpdate = Migration.migrateEffectData(e);

        // Update the Owned Item
        if (!isEmpty(effectUpdate)) {
          effectUpdate._id = e.id;
          arr.push(expandObject(effectUpdate));
        }

        return arr;
      }, []);
      if (effects.length > 0) updateData.effects = effects;
    }
    return updateData;
  };

  /**
 * Migrate a single Actor entity to incorporate latest data model changes
 * Return an Object of updateData to be applied
 * @param {object} actor    The actor data object to update
 * @return {Object}         The updateData to apply
 */
  static async migrateOwnedItemEffects(actor) {

    let itemsToRemove = [];

    let itemsToAdd = [];

    for (let item of actor.items) {
      if (item.getFlag("core", "sourceId")) {
        let source = item.getFlag("core", "sourceId")
        let newItem = item.toObject();
        let sourceItem = await fromUuid(source)
        if (sourceItem)
          sourceItem = sourceItem.toObject();

        if (sourceItem.name == item.name) {
          newItem.effects = sourceItem.effects
          itemsToRemove.push(item.id)
          itemsToAdd.push(newItem);
        }
      }
    }

    await actor.deleteEmbeddedDocuments("Item", itemsToRemove)
    await actor.createEmbeddedDocuments("Item", itemsToAdd, { keepId: true })

    console.log(`Replaced Items ${itemsToAdd.map(i => i.name).join(", ")} for actor ${actor.name}`)
  };


  /* -------------------------------------------- */


  /**
   * Scrub an Actor's system data, removing all keys which are not explicitly defined in the system template
   * @param {Object} actorData    The data object for an Actor
   * @return {Object}             The scrubbed Actor data
   */
  static cleanActorData(actorData) {

    // Scrub system data
    const model = game.system.model.Actor[actorData.type];
    actorData.data = filterObject(actorData.data, model);

    // Scrub system flags
    const allowedFlags = CONFIG.wfrp4e.allowedActorFlags.reduce((obj, f) => {
      obj[f] = null;
      return obj;
    }, {});
    if (actorData.flags.wfrp4e) {
      actorData.flags.wfrp4e = filterObject(actorData.flags.wfrp4e, allowedFlags);
    }

    // Return the scrubbed data
    return actorData;
  }


/* -------------------------------------------- */

  /**
   * Migrate a single Item entity to incorporate latest data model changes
   *
   * @param {object} item  Item data to migrate
   * @return {object}      The updateData to apply
   */
   static migrateArmourData(item) {
    let updateData = {};

    if (item.type == "armour" && item.system.currentAP) {
      updateData["system.AP"] = duplicate(item.system.maxAP)
      updateData["system.APdamage"] = duplicate(item.system.currentAP)
      updateData["system.-=currentAP"] = null

      for(let loc in item.system.currentAP)
      {
        if(item.system.currentAP[loc] == -1)
          updateData["system.APdamage"][loc] = 0
        else {
          updateData["system.APdamage"][loc] = item.system.maxAP[loc] - item.system.currentAP[loc]
        }
      }
    }

    return updateData;
  };

  /**
   * Migrate a single Item entity to incorporate latest data model changes
   *
   * @param {object} item  Item data to migrate
   * @return {object}      The updateData to apply
   */
  static migrateItemData(item) {
    let updateData = {};

    if (item.type == "armour")
    {
      updateData = Migration.migrateArmourData(item);
    }
    
    // Migrate Effects
    if (item.effects) {
      const effects = item.effects.reduce((arr, e) => {

        let effectUpdate = Migration.migrateEffectData(e);

        // Update the Owned Item
        if (!isEmpty(effectUpdate)) {
          effectUpdate._id = e.id;
          arr.push(expandObject(effectUpdate));
        }

        return arr;
      }, []);
      if (effects.length > 0) updateData.effects = effects;
    }

    if (!isEmpty(updateData))
      console.log("Migration data for " + item.name, updateData)
    return updateData;
  };

  /* -------------------------------------------- */

  /**
   * Migrate a single Effect entity to incorporate latest data model changes
   *
   * @param {object} effect Effect data to migrate
   * @return {object}      The updateData to apply
   */
  static migrateEffectData(effect) {
    let updateData = {};
    Migration._migrateEffectScript(effect, updateData)
    if (!isEmpty(updateData))
      console.log("Migration data for " + effect.label, updateData)
    return updateData;
  };

  /* -------------------------------------------- */

  /**
   * Migrate a single Scene entity to incorporate changes to the data model of it's actor data overrides
   * Return an Object of updateData to be applied
   * @param {Object} scene  The Scene data to Update
   * @return {Object}       The updateData to apply
   */
  static migrateSceneData(scene) {
    const tokens = scene.tokens.map(token => {
      const t = token.toJSON();
      if (!t.actorId || t.actorLink) {
        t.actorData = {};
      }
      else if (!game.actors.has(t.actorId)) {
        t.actorId = null;
        t.actorData = {};
      }
      else if (!t.actorLink) {
        const actorData = duplicate(t.actorData);
        actorData.type = token.actor?.type;
        const update = Migration.migrateActorData(actorData);
        ['items', 'effects'].forEach(embeddedName => {
          if (!update[embeddedName]?.length) return;
          const updates = new Map(update[embeddedName].map(u => [u._id, u]));
          t.actorData[embeddedName].forEach(original => {
            const update = updates.get(original._id);
            if (update) mergeObject(original, update);
          });
          delete update[embeddedName];
        });

        mergeObject(t.actorData, update);
      }
      return t;
    });
    return { tokens };
  };

  /* -------------------------------------------- */
  /*  Low level migration utilities
  /* -------------------------------------------- */




  static _migrateEffectScript(effect, updateData) {
    let script = effect.flags.wfrp4e.script

    if (!script)
      return updateData


    script = script.replaceAll("actor.data.token", "actor.prototypeToken")
    script = script.replaceAll("actor.data", "actor")


    if (script != effect.flags.wfrp4e.script)
      updateData["flags.wfrp4e.script"] = script

    return updateData
  }

}