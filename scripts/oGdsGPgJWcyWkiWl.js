this.actor.addCondition("broken")

if (this.actor.has(game.i18n.localize("NAME.Undead")))
{
    this.script.scriptMessage(await this.actor.applyBasicDamage(this.effect.sourceTest.result.damage, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg: true}))
}