let aoeDamage = this.effect.sourceTest.result.damage - 5 // Easily handle magic missile damage by just subtracting 5 from the item's (which has +10 base)

this.script.message(await this.actor.applyBasicDamage(aoeDamage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg : true}))

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Dodge"), {skipTargets: true, appendTitle :  ` - Ablaze`})

await test.roll();

if (!test.succeeded)
{
    this.actor.addCondition("ablaze");
}