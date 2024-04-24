let infected = await fromUuid("Compendium.wfrp4e-core.items.V0c3qBU1CMm8bmsW")
let fear = await fromUuid("Compendium.wfrp4e-core.items.pTorrE0l3VybAbtn")

let infectedData = infected.toObject();
let fearData = fear.toObject();
fearData.system.specification.value = 2;
this.actor.createEmbeddedDocuments("Item", [fearData, infectedData], {fromEffect : this.effect.id})