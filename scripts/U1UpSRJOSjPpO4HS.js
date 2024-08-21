let mutations = await warhammer.utility.findAllItems("mutation", "Loading Mutations")
let roll = Math.floor(CONFIG.Dice.randomUniform() * mutations.length);
this.actor.createEmbeddedDocuments("Item", [mutations[roll]]);
this.script.notification(`Added ${mutations[roll].name}`)