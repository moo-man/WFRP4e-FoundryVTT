let trait = args.opposedTest.attackerTest.item
let woundLossEffect = this.item.effects.get("7Amhi75wLv0PvGjd")
if (trait && trait.name.includes("Bite") && woundLossEffect)
{
    args.actor.applyEffect({effectUuids : woundLossEffect.uuid})
}