let test = await this.actor.setupCharacteristic("s", {appendTitle : ` - ${this.effect.name}`, fields : {difficulty : "difficult"}});

await test.roll();

if (test.failed)
{

   if (test.isCriticalFumble == "fumble")
   {
	 return this.script.message(`<strong>${this.actor.name}</strong> dies as they are dragged into the Aethyr (unless they spend a Fate point`);
   }
	
    await this.script.message(await this.actor.applyBasicDamage(3, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg: true }))

}