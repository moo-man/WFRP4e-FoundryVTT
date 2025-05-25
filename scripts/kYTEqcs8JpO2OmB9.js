if (args.equipped)
    await this.actor.addEffectItems("Compendium.wfrp4e-core.items.Item.Bvd2aZ0gQUXHfCTh", this.effect, {"system.specification.value": "10"});
else
    await this.effect.deleteCreatedItems()