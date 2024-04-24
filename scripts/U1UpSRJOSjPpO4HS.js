let mutations = await game.wfrp4e.utility.findAll("mutation", "Loading Mutations")
let roll = Math.floor(CONFIG.Dice.randomUniform() * mutations.length);
this.actor.createEmbeddedDocuments("Item", [mutations[roll]]);
this.script.scriptNotification(`Added ${mutations[roll].name}`)