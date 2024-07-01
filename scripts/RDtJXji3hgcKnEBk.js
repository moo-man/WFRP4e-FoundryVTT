let as = (await fromUuid("Compendium.wfrp4e-core.items.Item.9h82z72XGo9tfgQS")).toObject();
let hv = (await fromUuid("Compendium.wfrp4e-core.items.Item.Nj3tC8A5fZ3zEdMR")).toObject();
let ms = (await fromUuid("Compendium.wfrp4e-core.items.Item.6w30u0VPsAicrqb5")).toObject();
let ss = (await fromUuid("Compendium.wfrp4e-core.items.Item.OEjUvJKi0xmBwbS2")).toObject();

as.name += ` (${game.i18n.localize("SPEC.Sight")})`;

let roll = (await new Roll("1d10").roll());
roll.toMessage(this.script.getChatData())
let items = []

if (roll.total <= 2)
{
    items = items.concat([as]);
}
else if (roll.total <= 4)
{
    items = items.concat([hv]);
}
else if (roll.total <= 6)
{
    items = items.concat([ms]);
}
else if (roll.total <= 8)
{
    items = items.concat([ss]);
}
else if (roll.total <= 10)
{
    items = items.concat([as, hv, ms, ss]);
}

this.actor.createEmbeddedDocuments("Item", items, {fromEffect: this.effect.id})