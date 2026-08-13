let roll = await new Roll("2d10").roll();
roll.toMessage(this.script.getChatData());

this.actor.applyDamage(roll.total, {
    damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL,
  createMessage: this.script.getChatData()
});