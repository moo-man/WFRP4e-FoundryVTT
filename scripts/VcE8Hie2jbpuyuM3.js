const vomit = this.actor.itemTags.trait.find(t => t.name === "Vomit");
const name = "Bileful Vomit";

if (!vomit) return;

const effect = vomit.effects.find(e => e.name === "Vomit");
const scriptData = effect.system.scriptData;

// REMINDER

scriptData.push({
  label:  'Spell Rules Reminder'
  trigger: 'rollTest',
  script: ` 
    args.test.result.other.push("This Vomit attack follows the rules for the Lore of Nurgle spell @UUID[Compendium.wfrp4e-core.items.Item.XhyZ140R1iA1J7wZ].");
  `
});

// /REMINDER

// update Effect's name
await effect.update({
  name,
  "system.scriptData": scriptData
});


// update Trait's name
await vomit.update({name});

// copy effect from Stream of Corruption spell
const effectData = (await fromUuid("Compendium.wfrp4e-core.items.Item.XhyZ140R1iA1J7wZ.ActiveEffect.KAXAHr5NdusLTz6k")).toObject();

await vomit.createEmbeddedDocuments("ActiveEffect", [effectData]);