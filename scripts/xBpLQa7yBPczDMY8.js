    let scythe = (await fromUuid("Compendium.wfrp4e-core.items.CXg7XOFJwu4LZ9LM")).toObject();
    scythe.name = "Scythe of Shyish";
    scythe.system.damage.value = "WPB + 3"
    scythe.system.equipped = true;
    scythe.img = this.effect.img;
    scythe.system.qualities.value.push({name : "magical"})
    this.actor.createEmbeddedDocuments("Item", [scythe], {fromEffect : this.effect.id})