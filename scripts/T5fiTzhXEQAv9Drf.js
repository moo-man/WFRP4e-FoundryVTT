let item = await fromUuid("Compendium.wfrp4e-core.items.rlDZZTj5PXjuRXa2")
let data = item.toObject();
data.system.location.key = this.item.system.location.key;
await this.actor.createEmbeddedDocuments("Item", [data], {fromEffect: this.effect.id})

let location = this.item.system.location.key;

if (location)
{
    let dropped = this.item.system.weaponsAtLocation;

    if (dropped.length)
    {
        this.script.notification(`Dropped ${dropped.map(i => i.name).join(", ")}!`)
        for(let weapon of dropped)
        {
            await weapon.system.toggleEquip();
        }
    }
}