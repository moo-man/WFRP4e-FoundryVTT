let spells = await game.wfrp4e.utility.findAll("spell", "Loading Spells", true);

let choice = await ItemDialog.create(spells, 1);

if (choice[0])
{
    this.script.scriptMessage(`Chose @UUID[${choice[0].uuid}]{${choice[0].name}}`)
    let spell = (await fromUuid(choice[0].uuid)).toObject(); // Might be an index so retrieve item object for sure
    setProperty(spell, "flags.wfrp4e.boonOfTzeentch", true);
    spell.system.wind.value = "Channelling (Dhar)";
    spell.system.memorized.value = true;
    this.actor.createEmbeddedDocuments("Item", [spell], {fromEffect: this.effect.id})
}