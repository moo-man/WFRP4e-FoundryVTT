import WFRP_Utility from "./utility-wfrp4e";
import {PhysicalItemModel} from "../model/item/components/physical";

export default class Migration {

  static async migrateWorld() {
    ui.notifications.info(`Applying WFRP4e System Migration for version ${game.system.version}. Please be patient and do not close your game or shut down your server.`, { permanent: true });


      let updates = [];
      // Migrate Journals
      for (let i of game.journal.contents) {
        try {
          let updateData = Migration.migrateJournalData(i);
          if (!foundry.utils.isEmpty(updateData) || updateData.pages.length > 0) {
            updates.push(updateData);
            console.log(`Migrating Journal document ${i.name}`);
          }
        } catch (err) {
          err.message = `Failed wfrp4e system migration for Journal ${i.name}: ${err.message}`;
          console.error(err);
        }
      }
      await JournalEntry.updateDocuments(updates)

      updates = [];
      // Migrate Tables
      for (let i of game.tables.contents) {
        try {
          let updateData = Migration.migrateTableData(i);
          if (!foundry.utils.isEmpty(updateData) || updateData.results.length > 0) {
            updates.push(updateData);
            console.log(`Migrating Table document ${i.name}`);
          }
        } catch (err) {
          err.message = `Failed wfrp4e system migration for RollTable ${i.name}: ${err.message}`;
          console.error(err);
        }
      }
      await RollTable.updateDocuments(updates)



    // Migrate World Items
    for (let i of game.items.contents) {
      try {
        let updateData = Migration.migrateItemData(i);
        if (!foundry.utils.isEmpty(updateData)) {
          console.log(`Migrating Item document ${i.name}`);
          await i.update(updateData, { enforceTypes: false });
        }
        let loreIds = this._loreEffectIds(i);
        if (loreIds.length)
        {
          await i.deleteEmbeddedDocuments("ActiveEffect", loreIds);
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
        }
        let loreIds = this._loreEffectIds(a);
        if (loreIds.length)
        {
          await a.deleteEmbeddedDocuments("ActiveEffect", loreIds);
        }
        await this.migrateActorEffects(a, true);
      } catch (err) {
        err.message = `Failed wfrp4e system migration for Actor ${a.name}: ${err.message}`;
        console.error(err);
      }
    }

    // // Migrate Actor Override Tokens
    // for (let s of game.scenes.contents) {
    //   try {
    //     let updateData = Migration.migrateSceneData(s);
    //     if (!foundry.utils.isEmpty(updateData)) {
    //       console.log(`Migrating Scene document ${s.name}`);
    //       await s.update(updateData, { enforceTypes: false });
    //       // If we do not do this, then synthetic token actors remain in cache
    //       // with the un-updated actorData.
    //       s.tokens.contents.forEach(t => t._actor = null);
    //     }
    //   } catch (err) {
    //     err.message = `Failed wfrp4e system migration for Scene ${s.name}: ${err.message}`;
    //     console.error(err);
    //   }
    // }

    // // Set the migration as complete
    ui.notifications.info(`wfrp4e System Migration to version ${game.system.version} completed!`, { permanent: true });
  };

  /* -------------------------------------------- */

  /**
   * Apply migration rules to all Entities within a single Compendium pack
   * @param pack
   * @return {Promise}
   */
  static async migrateCompendium(pack) {
    const document = pack.metadata.type;
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
            await this.migrateActorEffects(doc, true);
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
        if (!foundry.utils.isEmpty(itemUpdate)) {
          itemUpdate._id = i.id;
          arr.push(foundry.utils.expandObject(itemUpdate));
        }

        return arr;
      }, []);
      if (items.length > 0) updateData.items = items;
    }

    let html = this._migrateV10Links(actor.system.details.biography?.value)
    if (html != actor.system.details.biography?.value)
    {
      updateData["system.details.biography.value"] = html;
    }

    html = this._migrateV10Links(actor.system.details.gmnotes?.value)
    if (html != actor.system.details.gmnotes?.value)
    {
      updateData["system.details.gmnotes.value"] = html;
    }
    
    html = this._migrateV10Links(actor.system.details.description?.value)
    if (html != actor.system.details.description?.value)
    {
      updateData["system.details.description.value"] = html;
    }

    html = this._migrateV10Links(actor.system.details.gmdescription?.value)
    if (html != actor.system.details.gmdescription?.value)
    {
      updateData["system.details.gmdescription.value"] = html;
    }


    if (actor.type == "vehicle")
    {
      if (actor.system.roles?.length)
      {
        let roleItems = [];
        for(let role of actor.system.roles)
          {
            roleItems.push({name : role.name, img : "systems/wfrp4e/icons/blank.png", type : "vehicleRole", system : {
              test : role.test
            }})
      }
      if (roleItems.length)
        {
          updateData.items = updateData.items ? updateData.items.concat(roleItems) : roleItems
          updateData["system.roles"] = [];
        }
      }
    }

    return updateData;
  };

  static async migrateActorEffects(actor, update=false)
  {
    let itemsUpdate = [], deleteActorEffects = []

    for (let effect of actor.effects)
    {
      let origin = effect.origin?.split(".");
      let item = actor.items.get(origin?.[origin.length-1]);
      if (origin && item)
      {
          let existingUpdate = itemsUpdate.find(i => i._id == item.id)
          let itemEffect = item.effects.getName(effect.name)?.toObject() || {};
          let oldId = itemEffect._id;
          let oldChanges = itemEffect.changes;
          foundry.utils.mergeObject(itemEffect, effect.toObject()) 
          itemEffect._id = oldId; // Preserve item id so effect isn't duplicated on the item
          
          if (itemEffect.changes.length == 0)
          {
            itemEffect.changes = oldChanges;
          }
          
          if (existingUpdate)
          {
            existingUpdate.effects.push(itemEffect)
          }
          else 
          {
            itemsUpdate.push({_id : item.id, effects : [itemEffect]})
          }
          
          deleteActorEffects.push(effect.id)
      }
      else if (effect.changes.length == 0 && (effect.scripts.length == 0 || effect.scripts.every(c => !c.trigger)))
      {
        deleteActorEffects.push(effect.id)
        console.log(`Deleting empty effect ${effect.name}`);
      }
    }
    if (update)
    {
      if (itemsUpdate.length)
      {
        await actor.update({items : itemsUpdate})
        console.log(itemsUpdate);
      }
      if (deleteActorEffects.length)
      {
        await actor.deleteEmbeddedDocuments("ActiveEffect", deleteActorEffects, {skipDeletingItems : true})
        console.log(deleteActorEffects);
      }
    }


    let effectModels = []
    for (let effect of actor.effects)
    {
      effectModels.push(this.migrateEffectData(effect))
    }
    effectModels = effectModels.filter(e => !foundry.utils.isEmpty(e));

    await actor.updateEmbeddedDocuments("ActiveEffect", effectModels);
  }

  static migrateJournalData(journal)
  {
    let updateData = {_id : journal.id, pages : []};

    for(let page of journal.pages)
    {
      let html = page.text.content;
      console.log(`Checking Journal Page HTML ${journal.name}.${page.name}`)
      let newHTML = this._migrateV10Links(html)

      if (html != newHTML)
      {
        updateData.pages.push({_id : page.id, "text.content" : newHTML});
      }
    }
    return updateData;
  }

  static migrateTableData(table)
  {
    let updateData = {_id : table.id, results : []};

    for(let result of table.results)
    {
      if (result.type == 0)
      {
        let html = result.text;
        let newHTML = this._migrateV10Links(html)

        if (html != newHTML)
        {
          updateData.results.push({_id : result.id, text : newHTML});
        }
      }

      else if (result.type == 2 && this.v10Conversions[result.documentCollection])
      {
        updateData.results.push({_id : result.id, documentCollection : this.v10Conversions[result.documentCollection]});
      }
    }
    return updateData;
  }

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
    const model = game.model.Actor[actorData.type];
    actorData.data = foundry.utils.filterObject(actorData.data, model);

    // Scrub system flags
    const allowedFlags = CONFIG.wfrp4e.allowedActorFlags.reduce((obj, f) => {
      obj[f] = null;
      return obj;
    }, {});
    if (actorData.flags.wfrp4e) {
      actorData.flags.wfrp4e = foundry.utils.filterObject(actorData.flags.wfrp4e, allowedFlags);
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

      foundry.utils.mergeObject(updateData, this.migrateProperties(item))

    return updateData;
  };

     static migrateWeaponData(item) {
      let updateData = {};

      foundry.utils.mergeObject(updateData, this.migrateProperties(item))
      return updateData;
    };

    static migrateAmmoData(item) {
      let updateData = {};

      foundry.utils.mergeObject(updateData, this.migrateProperties(item))
      return updateData;
    };

    static migrateProperties(item)
    {
      let updateData = {};
      if (typeof item.system.qualities.value == "string")
      {
        let allQualities = WFRP_Utility.qualityList();
        updateData["system.qualities.value"] = item.system.qualities.value.split(",").map(i => i.trim()).map(i => {return {name : warhammer.utility.findKey(i.split(" ")[0], allQualities), value : Number(i.split(" ")[1]) }}).filter(i => i.name)
      }
      if (typeof item.system.flaws.value == "string")
      {
        let allFlaws = WFRP_Utility.flawList();
        updateData["system.flaws.value"] = item.system.flaws.value.split(",").map(i => i.trim()).map(i => {return {name : warhammer.utility.findKey(i.split(" ")[0], allFlaws), value : Number(i.split(" ")[1])}}).filter(i => i.name)
      }
      return updateData;
    }


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

    if (item.type == "weapon")
    {
      updateData = Migration.migrateWeaponData(item)
    }

    if (item.type == "ammunition")
    {
      updateData = Migration.migrateAmmoData(item)
    }
    
    if (item.type == "spell")
    {
      if (typeof item.system.lore.effect == "string")
      {
        updateData["system.lore.effectString"] = item.system.lore.effect;
      }
    }

    if (item.type == "trait" && !item.system.disabled)
    {
      updateData["system.disabled"] = item.actor?.system?.excludedTraits?.includes(item.id) || false;
    }

    
    let newDescription = this._migrateV10Links(item.system.description.value);
    let newGMDescription = this._migrateV10Links(item.system.gmdescription.value);

    if (item.system.description.value != newDescription)
    {
      updateData["system.description.value"] = newDescription
    }

    if (item.system.gmdescription.value != newGMDescription)
    {
      updateData["system.gmdescription.value"] = newGMDescription
    }

    // Migrate Effects
    if (item.effects) {
      const effects = item.effects.reduce((arr, e) => {

        let effectUpdate = Migration.migrateEffectData(e);

        // Update the Owned Item
        if (!foundry.utils.isEmpty(effectUpdate)) {
          effectUpdate._id = e.id;
          arr.push(foundry.utils.expandObject(effectUpdate));
        }

        return arr;
      }, []);
      if (effects.length > 0) updateData.effects = effects;
    }

    if (!foundry.utils.isEmpty(updateData))
      // console.log("Migration data for " + item.name, updateData)
    return updateData;
  };

  static removeLoreEffects(docData)
  {
    let loreEffects = (docData.effects || []).filter(i => i.flags?.wfrp4e?.lore)
    if (loreEffects.length)
    {
      warhammer.utility.log("Removing lore effects for " + docData.name, true, loreEffects);
      // return document.deleteEmbeddedDocuments("ActiveEffect", loreEffects.map(i => i.id));
    }
    return docData.effects?.filter(e => !loreEffects.find(le => le._id == e._id)) || [];
  }

  /* -------------------------------------------- */

  /**
   * Migrate a single Effect entity to incorporate latest data model changes
   *
   * @param {object} effect Effect data to migrate
   * @return {object}      The updateData to apply
   */
  static migrateEffectData(effect) {
    let updateData = Migration._migrateEffectFlags(effect)
    if (!foundry.utils.isEmpty(updateData))
    {
      return updateData;
    }
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
        const actorData = foundry.utils.duplicate(t.actorData);
        actorData.type = token.actor?.type;
        const update = Migration.migrateActorData(actorData);
        ['items', 'effects'].forEach(embeddedName => {
          if (!update[embeddedName]?.length) return;
          const updates = new Map(update[embeddedName].map(u => [u._id, u]));
          t.actorData[embeddedName].forEach(original => {
            const update = updates.get(original._id);
            if (update) foundry.utils.mergeObject(original, update);
          });
          delete update[embeddedName];
        });

        foundry.utils.mergeObject(t.actorData, update);
      }
      return t;
    });
    return { tokens };
  };

  /* -------------------------------------------- */
  /*  Low level migration utilities
  /* -------------------------------------------- */

  
static _migrateEffectFlags(effect)
{
    let applicationData = foundry.utils.getProperty(effect, "flags.wfrp4e.applicationData") || {};
    let scriptData = foundry.utils.getProperty(effect, "flags.wfrp4e.scriptData") || [];
    let conditionValue = foundry.utils.getProperty(effect, "flags.wfrp4e.value");
    let update = {};
    if (Number.isNumeric(conditionValue))
    {
      foundry.utils.setProperty(update, "system.condition.value", conditionValue);
    }
    if (isEmpty(applicationData) && scriptData.length == 0)
    {
      return update;
    }

    let selfOnly = false;
    if (effect.item &&
    effect.item.range && 
    effect.item.range.value.toLowerCase() == game.i18n.localize("You").toLowerCase() && 
    effect.item.target && 
    effect.item.target.value.toLowerCase() == game.i18n.localize("You").toLowerCase())
    {
      selfOnly = true;
    }

    let system = {
        transferData: {
            type : applicationData.type,
            documentType : applicationData.documentType,
            avoidTest : applicationData.avoidTest,
            testIndependent : applicationData.testIndependent,
            preApplyScript : applicationData.preApplyScript,
            equipTransfer : applicationData.equipTransfer,
            enableConditionScript : applicationData.enableConditionScript,
            filter : applicationData.filter,
            prompt : applicationData.prompt,
            selfOnly,
            area: {
              radius : applicationData.radius,
              templateData : applicationData.templateData,
  
              duration : applicationData.areaType,
              keep : applicationData.keep,
  
              aura: {
                  render : applicationData.renderAura,
                  transferred : applicationData.targetedAura,
              }
          },
        },
        scriptData: effect.system.scriptData.length ? effect.system.scriptData : scriptData,
        zone: {},
        sourceData: {
            item : effect.flags?.wfrp4e?.sourceItem,
            test : effect.flags?.wfrp4e?.sourceTest,
            area : effect.flags?.wfrp4e?.fromArea,
        }
    }

    system.scriptData.forEach(script => {
      if (typeof script == "string")
      {
        script = {script : script};
      }
      if (!script.options)
      {
        script.options = {};
      }
      script.options = foundry.utils.mergeObject(foundry.utils.mergeObject(script.options, script.options.dialog || {}), script.options.immediate || {})
    })
    return {"flags.wfrp4e.-=applicationData" : null,  "flags.wfrp4e.-=scriptData" : null, system};
}

  static _loreEffectIds(document)
  {
    return document.effects.filter(e => e.flags.wfrp4e?.lore).map(i => i.id)
  }

  static _migrateV10Links(html)
  {
    try 
    {
      if (!html) return html
      
      for(let key in this.v10Conversions)
      {
        let priorHTML = html
        html = html.replaceAll(key, this.v10Conversions[key])
        if (html != priorHTML)
        {
          console.log(`Replacing ${key} with ${this.v10Conversions[key]}`)
        }
      }
      return html;
    }
    catch (e)
    {
      console.error("Error replacing links: " + e);
    }
  }

  static v10Conversions = {
    "wfrp4e-core.journal-entries" : "wfrp4e-core.journals",
    "wfrp4e-core.maps" : "wfrp4e-core.scenes",
    "wfrp4e-core.bestiary" : "wfrp4e-core.actors",
    "wfrp4e-core.careers" : "wfrp4e-core.items",
    "wfrp4e-core.criticals" : "wfrp4e-core.items",
    "wfrp4e-core.skills" : "wfrp4e-core.items",
    "wfrp4e-core.talents" : "wfrp4e-core.items",
    "wfrp4e-core.traits" : "wfrp4e-core.items",
    "wfrp4e-core.psychologies" : "wfrp4e-core.items",
    "wfrp4e-core.mutations" : "wfrp4e-core.items",
    "wfrp4e-core.injuries" : "wfrp4e-core.items",
    "wfrp4e-core.diseases" : "wfrp4e-core.items",
    "wfrp4e-core.spells" : "wfrp4e-core.items",
    "wfrp4e-core.prayers" : "wfrp4e-core.items",
    "wfrp4e-core.trappings" : "wfrp4e-core.items",
    "wfrp4e-eis.mutations" : "wfrp4e-eis.items",
    "wfrp4e-eis.spells" : "wfrp4e-eis.items",
  }
}