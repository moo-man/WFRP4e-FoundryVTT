if (args.equipped) {
  const spell = await game.wfrp4e.utility.findItem("Vindictive Glare", "spell");
  const skillUUID = "Compendium.wfrp4e-core.items.Item.e3McIND4Rrsn5cE6";

  await this.actor.addEffectItems([skillUUID, spell.uuid], this.effect, [{
  "system.advances.value": 75 - this.actor.system.characteristics.int.value
}, {}]);
} else {
  this.effect.deleteCreatedItems();
}