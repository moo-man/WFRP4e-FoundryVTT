fromUuid("Compendium.wfrp4e-core.items.5QcrpLQWWrsbKR79").then(item => {
     let data = item.toObject();
     data.system.tests.value = data.system.tests.value.replace("coins", "metal objects");
     data.system.description.value += "<p>This Talent also extends to any metal object because of <strong>Metallic Affinity</strong></p>"
     this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
})