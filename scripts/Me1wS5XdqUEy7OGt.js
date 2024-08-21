let loc = (await game.wfrp4e.tables.rollTable("hitloc")).result;
let critTable = `crit${this.generalizeTable(loc)`;
let crit = (await game.wfrp4e.tables.rollTable(critTable)).result;

this.script.message(`{this.actor.name} suffers a ${crit} (location : ${loc}). Do not apply bleeding or any additonnal wounds.`);