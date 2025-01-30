const tables = [
  game.wfrp4e.tables.findTable("mutatephys"),
  game.wfrp4e.tables.findTable("mutatephys", "Khorne"),
];

if (!tables.length) {
  return ui.notifications.error("Mutation table not found, please ensure a table with the `mutatephys` key is imported in the world.");
}

const values = {}

let i = 0;
for (const table of tables) {
  values[i] = table.name;
  i++;
}

const key = await ValueDialog.create({}, null, values);
const table = tables[key];

const results = (await table.drawMany(2)).results;
const uuids = results.map(result => `Compendium.${result.documentCollection}.${result.documentId}`);

await this.actor.addEffectItems(uuids, this.effect);
this.script.notification("Rolled and applied mutations");