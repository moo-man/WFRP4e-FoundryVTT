// Brawling management
let base = this.actor.characteristics.ws.value;
let melee = this.actor.has("Melee (Brawling)", "skill");
if (!melee) {
  melee = await fromUuid("Compendium.wfrp4e-core.items.Item.jLyoyqwmBVPjRjhM");
  melee = melee.toObject();
  melee.system.modifier.value = 55 - base;
  await this.actor.createEmbeddedDocuments("Item", [melee], {fromEffect : this.effect.id});
} else {
  //this.actor.updateEmbeddedDocuments("Item", { _id: melee.id, 'system.modifier.value': 55-base});
  await this.effect.update({"flags.wfrp4e.fistsOfGork" : 55 - base})
}

// Weapon management
base = this.actor.characteristics.s.bonus;
weapon = await fromUuid("Compendium.wfrp4e-core.items.Item.AtpAudHA4ybXVlWM");
weapon = weapon.toObject();
weapon.name = "Fists of Gork";
weapon.img = this.effect.img;
weapon.system.rollable.skill = "Melee (Brawling)";
weapon.system.specification.value = 9 - base;
await this.actor.createEmbeddedDocuments("Item", [weapon], {fromEffect : this.effect.id});

//this.script.scriptMessage(`${this.actor.name} now has Melee (Brawling) 55 and Weapon (Fists) +9`);