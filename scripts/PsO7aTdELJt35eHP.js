let morale = await new Roll("-1d10").roll();
let mood = await new Roll("-2d10").roll();

morale.toMessage(this.script.getChatData({flavor : "Morale"}));
mood.toMessage(this.script.getChatData({flavor : "Manann's Mood"}));

await this.actor.system.status.morale.addEntry("Albatross Died", morale.total)
await this.actor.system.status.mood.addEntry("Albatross Died", mood.total);

this.effect.delete();