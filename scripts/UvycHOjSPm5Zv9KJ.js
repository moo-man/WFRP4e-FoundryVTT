let test = await this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`})
await test.roll();
let baseDamage = "4";
if (test.succeeded)
    baseDamage = "0";
   
let damage = this.effect.sourceItem.system.computeSpellDamage(baseDamage, true) + parseInt(this.effect.sourceTest.result.SL);

this.script.message(await this.actor.applyBasicDamage(damage, {suppressMsg : true}))
this.actor.addCondition("ablaze")