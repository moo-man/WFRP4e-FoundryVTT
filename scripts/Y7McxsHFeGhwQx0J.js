this.actor.createEmbeddedDocuments("Item", [foundry.utils.expandObject({
    name : "Ghostly Flame",
    type : "weapon",
    img : this.effect.img,
    system : {
        "weaponGroup.value" : "throwing",
        "damage.value" : "SB + WPB",
        "qualities.value" : [{name : "magical"}],
        "equipped" : true
    }
})], {fromEffect: this.effect.id})