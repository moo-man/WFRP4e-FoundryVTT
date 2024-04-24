let table = game.wfrp4e.tables.findTable("mutatephys");
if (!table)
{
	ui.notifications.error("Cannot find table with key: mutatephys")
}
let result = (await table.roll()).results[0];
let uuid = `Compendium.${result.documentCollection}.${result.documentId}`
let item = await fromUuid(uuid);

if (item)
{
    this.script.scriptNotification(`${item.name} added`)
    this.actor.createEmbeddedDocuments("Item", [item])
}
else 
{
    ui.notifications.error("Item could not be found: " + uuid)
}