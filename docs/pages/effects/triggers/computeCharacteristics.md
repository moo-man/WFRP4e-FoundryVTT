---
layout: default
title: Compute Characteristics
parent: Scripts
nav_order: 11
grand_parent: Active Effects
---

This trigger is ideal for modifying Actor characteristics. Basic modifications to characteristics can be done via Active Effect [changes](../effects#changes.md), however, this is limited to only modifying the characteristic's total value (via `modifier` or `initial`), but if more nuanced modifications are needed, this is the trigger for doing so.

## Key

`computeCharacteristics`

## Arguments 

`args.actor` - Actor whose characteristics are being computed

## Examples

### Add +1 Strength Bonus

**Usage**: Adds +1 to a Strength's "Bonus" value, without changing the characteristic itself. 

```js
this.actor.system.characteristics.s.bonus += 1
this.actor.system.characteristics.s.calculationBonusModifier -= 1
```

Notes: Can also use `args.actor`. See [Effects](../effects#changes.md) for what `calculationBonusModifier` is.

---

### Set a Characteristic's total value

**Usage**: Sets Initiative to 10 and its bonus to 1, regardless of other modifiers.

```js
this.actor.characteristics.i.value = Math.min(this.actor.characteristics.i.value, 10);
this.actor.characteristics.i.bonus = 1;

for(let skill of this.actor.itemTypes.skill.filter(i => i.system.characteristic.value == "i"))
{
    skill.system.total.value= Math.min(skill.system.total.value, 10) + skill.system.advances.value
}
```

Notes: When this trigger runs, all skill totals have been computed, so we need to go through each skill and set its total to 10 + the skill's advances