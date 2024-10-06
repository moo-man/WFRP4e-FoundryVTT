let test = await this.actor.setupSkill("Dodge", {fields : {difficulty : "average"}})
let caster = this.effect.sourceActor

let fallen = this.effect.sourceTest.result.SL + caster.characteristics.wp.bonus
await test.roll();
if (test.failed)
{
    this.actor.addCondition("prone")
   this.script.message(`<b>${this.actor.prototypeToken.name}</b> falls ${fallen} yards`)
}