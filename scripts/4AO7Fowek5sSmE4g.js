const venomUUID = "Compendium.wfrp4e-core.items.gFkRm9wS65qe18Xv";
const venom = this.actor.itemTags.trait.find(t => t.name === "Venom");

if (venom) {
  await this.effect.setFlag("wfrp4e-tribes", "venom", {
    _id: venom.id,
    "system.specification.value": venom.system.specification.value
  });
  await venom.update({"system.specification.value": "Difficult"});
} else {
  await this.actor.addEffectItems(venomUUID, this.effect, {
    "system.specification.value": "Challenging"
  });
}