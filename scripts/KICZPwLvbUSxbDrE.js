let table = game.wfrp4e.tables.findTable("mutatemental");
if (!table)
{
	ui.notifications.error("Cannot find table with key: mutatemental")
}
let result = (await table.roll()).results[0];
if (!result.documentUuid)
{
    return this.script.message(result.description)
}
let item = await fromUuid(result.documentUuid);

if (item)
{
    this.script.notification(`${item.name} added`)
    this.actor.createEmbeddedDocuments("Item", [item])
}
else 
{
    ui.notifications.error("Item could not be found: " + result.documentUuid)
}