if (args.equipped) {
  await this.actor.addEffectItems("Compendium.wfrp4e-core.items.Item.mDgEMOoJpi8DkRYb", this.effect);
} else {
  this.effect.deleteCreatedItems()
}