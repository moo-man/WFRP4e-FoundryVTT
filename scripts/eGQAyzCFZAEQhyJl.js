const roll = new Roll("2d10");
await roll.evaluate();
const money = game.wfrp4e.market.addMoneyTo(this.actor, `${roll.total}b`);
await this.actor.updateEmbeddedDocuments("Item", money);
this.script.message(game.i18n.format("SCRIPT.Silvertide", {name: this.actor.name, pennies: roll.total}));