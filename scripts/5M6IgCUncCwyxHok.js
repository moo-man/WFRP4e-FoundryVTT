let etiquette = (await fromUuid("Compendium.wfrp4e-core.items.Item.sYbgpSnRqSZWgwFP")).toObject();
etiquette.name += ` (Followers of Tzeentch)`;

let animosity = (await fromUuid("Compendium.wfrp4e-core.items.Item.0VpT5yubw4UL7j6f")).toObject();
animosity.system.specification.value = "Followers of Nurgle";

let roll = await new Roll("ceil(1d10 / 3)").roll();

roll.toMessage(this.script.getChatData());

let mutations = [];
let msg = `<p><strong>Mutations Gained</strong></p>`
for(let i = 0; i < roll.total; i++)
{
    let item;
    let uuid;
    let result;
    if (i % 2 == 0)
    {
        result = await game.wfrp4e.tables.rollTable("mutatemental", {hideDSN: true}, "Tzeentch")
    }
    else 
    {
        result = await game.wfrp4e.tables.rollTable("mutatephys", {hideDSN: true}, "Tzeentch")
    }
    uuid = `Compendium.${result.object.documentCollection}.${result.object.documentId}`;
    item = await fromUuid(uuid);
    if (item)
    {
        msg += `<p>@UUID[${uuid}]{${item.name}}</p>`
        mutations.push(item.toObject());
    }
}
this.actor.createEmbeddedDocuments("Item", mutations.concat([etiquette, animosity]), {fromEffect : this.effect.id})
this.script.message(msg);