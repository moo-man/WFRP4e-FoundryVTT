let damage = this.actor.itemTypes.mutation * 6;

if (!damage)
{
  return 
}

await this.actor.applyDamage(damage, {
  loc: "roll",
  damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL,
  createMessage: this.script.getChatData(),
});