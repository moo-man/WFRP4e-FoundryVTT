this.script.message(await this.actor.applyBasicDamage(8, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg: true}))


let msg = ``
let weapons = args.actor.itemTypes.weapon.filter(i => !i.system.location.value);
let armour = args.actor.itemTags.armour.filter(i => !i.system.location.value);
for(let item of weapons)
{
	if (item.system.properties.qualities.shield)
	{
		await item.system.damageItem(1, "shield");
	}
	else 
	{
		await item.system.damageItem(1);
	}
	msg += `<p><strong>${item.name}</strong> damage by 1</p>`
}
for(let item of armour)
{
	await item.system.damageItem(1);
	msg += `<p><strong>${item.name}</strong> damage by 1</p>`
}
if (msg)
{
	this.script.message(msg, {speaker : {alias : args.actor.name}});
}