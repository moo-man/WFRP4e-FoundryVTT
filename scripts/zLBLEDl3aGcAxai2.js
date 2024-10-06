const hasTraits = args.actor.has("Daemonic") || args.actor.has("Undead") || args.actor.has("Spellcaster");
const hasSinOrCorruption = args.actor.status.sin.value > 0 || args.actor.status.corruption.value > 0;
const isSpellcaster = args.actor.itemTags.talent.some(i =>
    i.name.includes(game.i18n.localize("NAME.ArcaneMagic")) ||
    i.name.includes(game.i18n.localize("NAME.ChaosMagic")) ||
    i.name.includes(game.i18n.localize("NAME.PettyMagic"))
  );
const shouldDamage = hasTraits || hasSinOrCorruption || isSpellcaster;

if (shouldDamage) {
  const roll = new Roll("1d10");
  await roll.evaluate();
  let damage = roll.total;
  await roll.toMessage();
  await this.script.message(await this.actor.applyBasicDamage(damage, {damageType: game.wfrp4e.config.DAMAGE_TYPE.IGNORE_ALL, suppressMsg: true}));
}