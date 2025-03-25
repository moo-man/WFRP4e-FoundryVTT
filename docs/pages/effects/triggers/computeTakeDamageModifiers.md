---
layout: default
title: Compute Take Damage Modifiers
parent: Scripts
nav_order: 22
grand_parent: Active Effects
---

This trigger is the best place to add some static damage modifier. This script in particular runs when the *owner of the script takes damage*. See [Compute Apply Damage Modifiers](./computeApplyDamageModifiers) for modifying damage an actor does. This trigger is primarily for modifying the `modifiers` object where you can add or remove reductions.

## Key

`computeTakeDamageModifiers`

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

`args.modifiers` - Modifiers for armour, toughness, and damage.

`args.modifiers.tb` - TB used for damage reduction
`args.modifiers.ap` - AP data used for damage reduction 
`args.modifiers.ap.value` - Total AP at the location,
`args.modifiers.ap.ignored` - Amount of AP ignored based on computed context,
`args.modifiers.ap.metal` - How much AP being used is metal, this field is purely descriptive, not prescriptive. Changes to this field should also be reflected in `ap.value` 
`args.modifiers.ap.nonmetal` - How much AP being used is non-metal, this field is purely descriptive, not prescriptive. Changes to this field should also be reflected in `ap.value` 
`args.modifiers.ap.magical` - How much AP being used is magical, this field is purely descriptive, not prescriptive. Changes to this field should also be reflected in `ap.value` 
`args.modifiers.ap.shield` - How much AP being used is from a shield,
`args.modifiers.ap.details` - Array of objects used for tooltip. {label : string, value : number, details : string}
`args.modifiers.minimumOne` - Whether minimumOne was triggered (used for the tooltip)
`args.modifiers.other` - Array of modifiers used for any miscellaneous damage modifications. {label : string, value : number, details : string}

`args.extraMessages` - Array of strings that can be added to for displaying in chat.

`args.ward` - Ward value of the Actor (If ward is some number, a roll is made and if that roll is greater or eual to the ward value, the damage is ignored)

`args.wardRoll` - The Ward roll is determined at the beginning of damage application, but only checked if needed.

`args.abort` - Set this to a string value to abort the process (with the string being the message shown in chat)

## Examples

### Reduce Damage

**Usage**: Reduce all damage by some static amount. 

```js
args.modifiers.other.push({label : this.effect.name, details : "Damage Reduction", value : -3})
```

### Add Magical AP against Ranged attacks

**Usage**: aoeu

```js
if (args.opposedTest.attackerTest.item && args.opposedTest.attackerTest.item.isRanged)
{
    args.modifiers.ap.value += 3;
    args.modifiers.ap.magical += 3;
    args.modifiers.ap.details.push(`${this.effect.name} (${AP})`)
}
```

**Notes**: As mentioned in the **Arguments** section. Adding +3 to the `magical` field will do nothing on its own, only show up in the tooltip. To actually alter AP, `value` must also be changed.