---
layout: default
title: Take Damage
parent: Scripts
nav_order: 21
grand_parent: Active Effects
---
This trigger runs when an Actor applies damage (via opposed test) to another Actor, specifically after all the modifiers and reductions are applied, but before the Actor is updated and the result is displayed in chat, letting us modify values right before they are applied. 

This is very similar to [Apply Damage](./applyDamage.md), but this trigger runs on the Actor receiving damage.


## Key

`takeDamage`

## Arguments 

`args.actor` - The Actor *taking damage*

`args.attacker` - The Actor *doing damage*

`args.opposedTest` - The Opposed Test that was used to calculate damage

`args.damageType` - Whether to ignore AP, TB, or both. This argument is obsolete and has already been derived into `applyAP` and `applyTB`

`args.weaponProperties` - What properties (qualities and flaws) the weapon has. This can be modified to add properties to the calculation. (e.g. `args.weaponProperties.qualities.damaging` or `args.weaponProperties.flaws.unbalanced`)

`args.applyAP` - Whether armour was used to reduce the incoming damage

`args.applyTB` - Whether Toughness bonus was used to reduce the incoming damage

`args.totalWoundLoss` - This will *eventually* be the actual amount of wounds deducted from the Actor. At this point in the process, it is the raw damage value from the test. 

`args.AP` - The data of the location taking damage. See [Armour Calculation](./APCalc.md) to see the object structure.

`args.modifiers` - Modifiers for armour, toughness, and damage. Note that these modifiers have *already been applied* and modifications in this trigger will not be reflected in the damage values. See [Compute Apply Damage Modifiers](./computeApplyDamageModifiers.md) to see the object structure (modifiers generally should be changed in that trigger, not this one).

`args.extraMessages` - Array of strings that can be added to for displaying in chat.

`args.ward` - Ward value of the Actor (If ward is some number, a roll is made and if that roll is greater or eual to the ward value, the damage is ignored)

`args.wardRoll` - The Ward roll is determined, but only checked if ward isn't null. This occurs after this trigger runs. 

`args.abort` - Set this to a string value to abort the process (with the string being the message shown in chat)

## Examples

### Add Bleeding

**Usage**: Add Bleeding if the location struct was the left leg

```js
if (args.opposedTest.result.hitloc.value == "lLeg" && args.totalWoundLoss > 0)
{
    args.actor.addCondition("bleeding", 1);
    this.script.notification("Added Bleeding")
}
```

**Notes**: Location values are `head`, `body`, `lLeg`, `rLeg`, `lArm`, `rArm`

---

### Resist damage from Undead

**Usage**: 

```js
if (args.attacker.has(game.i18n.localize("NAME.Undead")))
{
    args.totalWoundLoss =  Math.floor(args.totalWoundLoss / 2)
    args.modifiers.other.push({label : this.effect.name, details : game.i18n.localize("Halved"), value : "× 0.5"})
}
```

**Notes**: This halves wounds received *after* reductions are calculated. If you want to halve the damage pre-armour and TB reductions, use [Pre-Take Damage](./preTakeDamage.md). Also note that `args.modifiers.other` was used to show this effect halved the wounds taken.