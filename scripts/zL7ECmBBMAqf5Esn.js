let hasMagazine = await foundry.applications.api.DialogV2.confirm({window : {title : this.effect.name}, content: "<p>Does the vessel have a magazine or any other kind of store for blackpowder?</p>"});

if (!hasMagazine) return;

let roll = new Roll("d10");
await roll.evaluate();
// await roll.toMessage();
let anchor = roll.toAnchor();

let crits = [];

for (let i = 0; i < roll.total; i++) {
  let result = await WFRP_Tables.rollTable('crithull');
  let collection = game.packs.get(result.object.documentCollection)

  if (collection)
    await collection.getDocuments()

  if (!collection)
    collection = game.items;

    let item = collection.get(result.object.documentId)
    if (item)
      crits.push(item);
}

const items = await this.actor.createEmbeddedDocuments("Item", crits);
const speaker = ChatMessage.getSpeaker({actor: this.actor});
const uuids = items.map(i => `@UUID[${i.uuid}]`);
this.script.message(`<p><b>${this.item.name}</b> caused an additional ${anchor.outerHTML} Critical Hits to the Hull!</p><ul><li>${uuids.join('<li>')}</ul>`)