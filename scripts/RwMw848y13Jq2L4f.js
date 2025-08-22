let test = await this.actor.setupSkill("Endurance", {fields : {difficulty : "difficult"}, appendTitle : ` - ${this.effect.name}`});
await test.roll();
if (test.failed)
{
	await this.actor.addCondition("blinded");
}

let msg = ``
let armour = args.actor.itemTags.armour.filter(i => i.system.isMetal && i.system.isEquipped);
for(let item of armour)
{
	for(let key in item.system.AP)
	{
		let AP = item.system.AP[key]
		let damage = Math.floor(AP / 2);
		await item.system.damageItem(damage, [key]);
	}
	msg += `<p><strong>${item.name}</strong> AP reduced by half</p>`
}
if (msg)
{
	this.script.message(msg, {speaker : {alias : args.actor.name}});
}