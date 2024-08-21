let location = (Math.ceil(CONFIG.Dice.randomUniform() * 2) == 2 ? "r" : "l") + "Arm"

if (location == "lArm")
{
	this.script.notification("Rolled Left")
}
else if (location == "rArm")
{
	this.script.notification("Rolled Right")
}

this.effect.updateSource({"flags.wfrp4e.location" : location});

if (location)
{
    let dropped = this.actor.itemTypes.weapon.filter(i => i.isEquipped & i.system.usesHands.includes(location));

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