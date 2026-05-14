let damage = await new Roll("1d10 + 1").roll();
damage.toMessage(this.script.getChatData());
this.actor.applyDamage(damage.total, {
    damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP,
  createMessage: this.script.getChatData()
});