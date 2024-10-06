this.script.message(await this.actor.applyBasicDamage(12, {damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg : true}))
let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields: {difficulty: "hard"}})
await test.roll();
if (test.failed)
{
   this.actor.addSystemEffect("cold1")
}

