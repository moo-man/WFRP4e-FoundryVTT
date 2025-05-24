let cured = await ValueDialog.create({text : "Enter the number of diseases/poisons cured", title : this.effect.name})

let damage = 0;

let rolls = new Array(cured).fill("").map(i => `max(0, 1d10 - ${this.actor.system.characteristics.fel.bonus})`)

let test = new Roll(`${rolls.join(" + ")}`);
await test.roll();
test.toMessage({speaker : {alias : this.actor.name}, flavor : this.effect.name});
this.script.message(await this.actor.applyBasicDamage(test.total, { damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg : true }))