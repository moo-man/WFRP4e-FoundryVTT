const roll = new Roll("1d10");

await roll.evaluate();
roll.toMessage();

const slBonus = Number(this.effect.sourceTest.result.SL) + roll.total;

this.effect.setFlag("wfrp4e", "slBonus", slBonus);