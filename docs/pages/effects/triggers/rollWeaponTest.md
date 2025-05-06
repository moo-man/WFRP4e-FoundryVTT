---
layout: default
title: Roll Weapon Test
parent: Scripts
nav_order: 36
grand_parent: Active Effects
---

This trigger is the same as [Roll Test](./rollTest), except it only runs for weapon Tests. Additionally, if an effect is owned by a weapon and designated as an `Item` Document Type effect, scripts with this trigger will only run when that specific weapon is rolled. 

## Key

`rollWeaponTest`

## Arguments 

See [Roll Test](./rollTest#arguments)

## Examples

See [Roll Test](./rollTest#examples)

### Add Critical Modifier

**Usage**: Add +20 to Critical Hits 

```js
args.test.result.tables?.critical?.modifier += 20
```

**Notes**: If the effect with this script is set as **Document Type** of **Actor**, this would add a critical modifier to any weapon attack. If **Document Type** is **Item** and the effect is owned by a weapon, it will only modify critical hits for that weapon specifically. 

---

### Add Damage

**Usage**: Add +1 Damage

```js
args.test.result.damage += 1
args.test.result.additionalDamage += 1
args.test.result.breakdown.damage.other.push({label : this.effect.name, value : 1});
```

**Notes**: Adding damage has always been messy, and I'd like to improve it at some point, but for now, this is how it works. 1st line adds +1 to the damage *display* value in the initial attack test. The 2nd line adds the damage value internally which is included the opposed test damage calculation, the 3rd line adds to the tooltip breakdown of damage.
