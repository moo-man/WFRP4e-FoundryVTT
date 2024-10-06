let roll = await new Roll("1d10").roll();
this.script.message(await this.actor.applyBasicDamage(roll.total, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg: true}))

await this.actor.addCondition("deafened", 3)

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty: "average" }, skipTargets: true, appendTitle :  ` - ${this.effect.name}`, context : {failure: "Gain a Broken Condition", success : "Avoided Broken Condition"}})
await test.roll();
if (test.failed)
{
    this.actor.addCondition("broken")
}