let caster = this.effect.sourceActor
let targetedItem = this.effect.system.itemTargets[0];

let qualities = foundry.utils.deepClone(game.wfrp4e.config.itemQualities);
let flaws = foundry.utils.deepClone(game.wfrp4e.config.itemFlaws);

if (targetedItem.type == "weapon")
{
    foundry.utils.mergeObject(qualities, game.wfrp4e.config.weaponQualities)
    foundry.utils.mergeObject(flaws, game.wfrp4e.config.weaponFlaws)
}
else if (targetedItem.type == "armour")
{
    foundry.utils.mergeObject(qualities, game.wfrp4e.config.armorQualities)
    foundry.utils.mergeObject(flaws, game.wfrp4e.config.armorFlaws)
}

for(let q in qualities)
{
    // If the weapon already has a flaw, don't put it in the dialog
    if (targetedItem.system.properties.qualities[q])
    {
        delete qualities[q]
    }
}
for(let f in flaws)
{
    // If a weapon doesn't have a flaw, don't put it in the dialog
    if (!targetedItem.system.properties.flaws[f])
    {
        delete flaws[f]
    }
}
            
let added = await ItemDialog.create(ItemDialog.objectToArray(qualities), "unlimited", "Choose Qualities to add");
let removed = []
if (!foundry.utils.isEmpty(flaws))
{
    removed = await ItemDialog.create(ItemDialog.objectToArray(flaws), "unlimited", "Choose Flaws to remove");
}

this.effect.updateSource({"flags.wfrp4e.propertiesChanged" : {added : added.map(i => i.id), removed : removed.map(i => i.id)}})
