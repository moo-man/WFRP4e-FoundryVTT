let location = this.item.system.location.key
let test = await this.actor.setupCharacteristic("dex", {context : {failure : `<strong>${this.effect.name}</strong>: Drop the item!`}, skipTargets: true, appendTitle :  " - " + this.effect.name, fields : {difficulty : "average"}})
await test.roll();


if (location && test.failed)
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

return test.succeeded