let sumArmour = 0;
for (let key in this.actor.system.status.armour) {
  let armour = this.actor.system.status.armour[key];
  sumArmour += Number(armour?.value || 0);
}
let damage = Math.floor(Number(sumArmour)/2);
if (damage > 0 ) { 
	this.script.scriptMessage(await this.actor.applyBasicDamage(damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg: true}))
}