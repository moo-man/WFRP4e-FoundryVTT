this.actor.applyDamage(1, {
    damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL,
  createMessage: this.script.getChatData()
});

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {appendTitle: ` - ${this.effect.name}`, skipTargets: true});
await test.roll();
if (test.failed)
{ 
  this.actor.addCondition("broken");
}