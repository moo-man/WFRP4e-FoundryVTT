let damage = await new Roll("1d10").roll();
damage.toMessage(this.script.getChatData());
this.actor.applyDamage(damage.total, {
    damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL,
  createMessage: this.script.getChatData()
});

this.actor.addCondition("prone");