const vomit = this.actor.itemTags.trait.find(t => t.name === "Vomit");
const name = "Corrupting Vomit";

if (!vomit) return;

const effect = vomit.effects.find(e => e.name === "Vomit");
const scriptData = effect.system.scriptData;

scriptData[0].script = `
args.actor.addCondition("stunned");
args.actor.corruptionDialog("moderate");
`

await effect.update({
  name,
  "system.scriptData": scriptData
});

await vomit.update({name});