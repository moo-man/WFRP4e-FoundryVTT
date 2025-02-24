if (this.item.system.disabled) {
  await this.effect.deleteCreatedItems();
} else if (!this.actor.items.find(i => i.name === "Stealthy")) {
  await this.actor.addEffectItems("Compendium.wfrp4e-core.items.Item.OzwDT6kzoLYeeR2d", this.effect);
}