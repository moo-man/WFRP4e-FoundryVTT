let table = game.wfrp4e.tables.findTable("mutatemental");
if (!table)
{
	ui.notifications.error("Cannot find table with key: mutatemental")
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