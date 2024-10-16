---
layout: default
title: Pre-Apply Damage
parent: Scripts
nav_order: 18
grand_parent: Active Effects
---

This trigger runs when an Actor applies damage (via opposed test) to another Actor. The arguments provided allow us to modify how this is handled. This is very similar to [Pre-Take Damage](./preTakeDamage.md), but this trigger runs on the Actor doing damage.

## Key

`preApplyDamage`

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

### Ignore AP

**Usage**: Ignore AP when applying this damage.

```js
args.applyAP = false;
```

**Notes**: This is what the vast majority of `preApplyDamage` scripts do, changing `applyAP` or `applyTB` is ideal here as neither has been used at this point in the process to reduce the damage applied. 

---

### Add Impale

**Usage**: Add Impale if the location struck has no AP.

```js
if (args.AP.value == 0)
{
    args.weaponProperties.impale = true;
    args.extraMessages.push(`<strong>${this.item.name}</strong>: Impale Added`)
}
```

**Notes**: Changing `weaponProperties` is ideal in `preApplyDamage` as it has not been used to modify damage at this stage.

---

### Add Damage conditionally

**Usage**: Add 5 Damage if the target is a spellcaster (has Spell items)

```js
if (args.actor.itemTypes.spell.length > 0)
{
	args.modifiers.other.push({label : this.effect.name, value : 5, details : "Target is a Spellcaster"});
}
```
**Notes**: `args.modifiers.other` is for adding any sort of arbitrary generic damage. Can also be done in [Compute Apply Damage Modifiers](./computeApplyDamageModifiers.md)