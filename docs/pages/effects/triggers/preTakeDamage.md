---
layout: default
title: Pre-Take Damage
parent: Scripts
nav_order: 20
grand_parent: Active Effects
---

This trigger runs when another Actor applies damage (via opposed test) to this Actor. The arguments provided allow us to modify how this is handled. This is very similar to [Pre-Apply Damage](./preApplyDamage.md), but this trigger runs on the Actor taking damage.

## Key

`preTakeDamage`


## Arguments 

`args.actor` - The Actor *taking damage*

`args.attacker` - The Actor *doing damage*

`args.opposedTest` - The Opposed Test that was used to calculate damage

`args.damageType` - Whether to ignore AP, TB, or both. This argument is obsolete and has already been derived into `applyAP` and `applyTB`

`args.weaponProperties` - What properties (qualities and flaws) the weapon has. This can be modified to add properties to the calculation. (e.g. `args.weaponProperties.qualities.damaging` or `args.weaponProperties.flaws.unbalanced`)

`args.applyAP` - Whether to apply armour to reduce the incoming damage

`args.applyTB` - Whether to apply Toughness bonus to reduce the incoming damage

`args.totalWoundLoss` - This will *eventually* be the actual amount of wounds deducted from the Actor. At this point in the process, it is the raw damage value from the test. 

`args.AP` - The data of the location taking damage. See [Armour Calculation](./APCalc.md) to see the object structure.

`args.modifiers` - Modifiers for armour, toughness, and damage. See [Compute Apply Damage Modifiers](./computeApplyDamageModifiers.md) to see the object structure (modifiers generally should be changed in that trigger, not this one).

`args.extraMessages` - Array of strings that can be added to for displaying in chat.

`args.ward` - Ward value of the Actor (If ward is some number, a roll is made and if that roll is greater or eual to the ward value, the damage is ignored)

`args.wardRoll` - The Ward roll is determined at the beginning of damage application, but only checked if needed.

`args.abort` - Set this to a string value to abort the process (with the string being the message shown in chat)



## Examples

### Ignore Non-magical Damage

**Usage**: Ignore any damage that comes from a non-magical source

```js
if (!args.opposedTest.attackerTest.item?.system?.isMagical)
{
	args.abort = `<strong>${this.effect.name}</strong>: Ignored`
}
```