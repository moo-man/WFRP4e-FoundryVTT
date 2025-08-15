let type = this.item.getFlag("wfrp4e", "breath");

if (type == "cold")
{
	let stunned = Math.max(1, Math.trunc(args.totalWoundLoss / 5))
	await args.actor.addCondition("stunned", stunned);
}

if (type == "corrosion")
{
    let damageItems = await foundry.applications.api.DialogV2.confirm({window: {title : this.item.name}, content : `<p>Damage all Items carried?</p>`})
	if (damageItems)
	{
		let msg = ``
		let weapons = args.actor.itemTypes.weapon.filter(i => i.isEquipped);
		let armour = args.actor.itemTags.armour.filter(i => i.isEquipped);
		let trappings = args.actor.itemTypes.trapping.filter(i => i.isEquipped);
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
		for(let item of trappings)
		{
			await item.system.damageItem(1);
			msg += `<p><strong>${item.name}</strong> damage by 1</p>`
		}
		if (msg)
		{
			this.script.message(msg, {speaker : {alias : args.actor.name}});
		}
	}
}

if (type == "fire")
{
	await args.actor.addCondition("ablaze");
}

if (type == "electricity")
{
	await args.actor.addCondition("stunned");
}

if (type == "poison")
{
	await args.actor.addCondition("poisoned");
}

if (type == "warpfire")
{
	await this.actor.corruptionDialog("moderate")
	this.actor.applyEffect({effectUuids : this.item.effects.getName("Warpfire").uuid})	
}