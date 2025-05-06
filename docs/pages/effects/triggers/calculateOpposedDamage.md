---
layout: default
title: Calculate Opposed Damage
parent: Scripts
nav_order: 45
grand_parent: Active Effects
---
This trigger is called in the middle of computing damage during an Opposed Test. This is before any multpiliers or modifications have been added.

If an effect with this trigger is owned by an Item and designated as an `Item` Document Type effect, scripts with this trigger will only run when that specific Item is used to in an opposed test and computes damage. 

## Key

`calculateOpposedDamage`

## Arguments 

`args.damage` - Numerical damage value currently calculated.  

`args.damageMultiplier` - Numerical multiplier to damage. 

`args.sizeDiff` - Size step difference between Attacker and Defender. `2` means the attacker is two steps larger than the defender.

`args.opposedTest` - See [Opposed Attacker](./opposedAttacker.md#arguments)

`args.addDamaging` - Whether to add the `Damaging` quality to the attacker.

`args.addImpact` - Whether to add the `Impact` quality to the attacker.

## Examples

### Add Impact

**Usage**: Add the Impact quality when attacking Orcs, Goblins, or other greenskins

```js
if (["orc", "ork", "goblin", "hobgoblin", "snotling", "greenskin"].includes(args.opposedTest.defender.details.species.value.toLowerCase()))
{
    args.addImpact = true
    args.opposedTest.result.other.push("Impact Added")
}
```

**Notes**: Checking the species as above is only a "best guess" approach, as there is not codified "tag" to denote something as a orc, goblin, or similar. 