scatter = await game.wfrp4e.tables.rollTable("scatter");
this.script.message(scatter.result);

let distance = await new Roll("1d10").roll();

distance.toMessage(this.script.getChatData({flavor: "Distance (yds.)"}));

let damage = await new Roll("1d10").roll();
damage.toMessage(this.script.getChatData({flavor: "Damage"}));
this.actor.applyDamage(damage.total, {
    damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP,
  createMessage: this.script.getChatData()
});


this.actor.addCondition("prone");