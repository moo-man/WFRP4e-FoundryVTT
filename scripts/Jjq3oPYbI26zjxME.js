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

let roll = await new Roll("1d10").roll()

roll.toMessage(this.script.getChatData({flavor : `${this.effect.name} (Duration)`}));

this.effect.updateSource({"duration.rounds" : roll.total})