if (this.actor.getFlag("wfrp4e", "isAttached")) 
{
	let roll = await new Roll("1d10").roll()
	await roll.toMessage(this.script.getChatData());
	if (roll.total == 9 || roll.total == 10)
	{
	  this.script.message(`<strong>${this.actor.name}</strong> attached to <strong>${this.actor.getFlag("wfrp4e", "isAttached")}</strong> gorges and falls off.`)
	  await this.actor.unsetFlag("wfrp4e", "isAttached")      
	}
  }