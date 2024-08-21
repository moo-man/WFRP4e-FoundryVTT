let table = game.wfrp4e.tables.findTable("mutatephys");
if (!table)
{
	return ui.notifications.error("Mutation table not found, please ensure a table with the `mutatephys` key is imported in the world.")
}
let result = (await table.roll()).results[0];
let uuid = `Compendium.${result.documentCollection}.${result.documentId}`
let item = await fromUuid(uuid);

if (item)
{
    this.script.notification(`${item.name} added`)
    this.actor.createEmbeddedDocuments("Item", [item])
}
else 
{
    ui.notifications.error("Item could not be found: " + uuid)
}