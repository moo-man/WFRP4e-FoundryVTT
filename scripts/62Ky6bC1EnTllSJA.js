if (this.effect.sourceActor.uuid != args.actor.uuid)
{
    this.script.message(await this.actor.applyBasicDamage(this.effect.sourceTest.result.overcast.usage.other.current, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg: true}));
}