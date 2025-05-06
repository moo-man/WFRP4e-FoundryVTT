let shouldDamage = await foundry.applications.api.DialogV2.confirm({
  window : {title: this.effect.name + " - " + args.actor.name},
  content: "Are you humanoid creature who have not made a sacrifice to Rhya (or another diety of nature or powerful nature spirit to whom the cult of Rhya are well disposed, such as Isha or Taal) since the last spring equinox?"
});

if (shouldDamage) {
  let damage = 1 + this.effect.sourceTest.result.baseSL;
  await args.actor.applyBasicDamage(damage, {damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL});
  args.actor.addCondition("fatigued");
}