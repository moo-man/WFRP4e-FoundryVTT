let damage = this.effect.sourceActor.characteristics.int.bonus + 6;
if (this.actor.has(game.i18n.localize("NAME.Undead")) || this.actor.has(game.i18n.localize("NAME.Daemonic"))) { 
   damage += 6
}
this.script.scriptMessage(await this.actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg: true}));

let test = await this.actor.setupCharacteristic("int", {fields : {difficulty : "average"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.failed) {
	this.actor.addCondition("stunned");
}