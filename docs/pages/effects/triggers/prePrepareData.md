---
layout: default
title: Pre-Prepare Data
parent: Scripts
nav_order: 7
grand_parent: Active Effects
---

"Preparation" is the term for processing the Actor's base data, such as determining Wounds (derived from Toughness, Willpower, annd Strength Bonus), or determining Encumbrance (adding all item encumbrance together), or calculating damage for equipped Weapons (SB + 4 => 7), and much much more.

This trigger executes before these calculations occur, so it is ideal for modifying properties that need to be taken into account for calculations. 

{: .important}
There is a [bug](https://github.com/foundryvtt/foundryvtt/issues/7987) when using this trigger when being applied to Items. This causes the script to be executed twice, so this must be accounted for when modifying properties. If a property is being *added* to, the workaround is to add half the value instead. If a property is being *set* (as above), it should work normally.

## Key

`prePrepareData`

## Arguments 

`args.actor` - If the effect is applied to an Actor, this is the Actor being prepared

`args.item` - If the effect is applied to an Item, this is the Item being prepared

## Examples

### Halve Movement

**Usage**: Inflict half movement

```js
args.actor.system.details.move.value /= 2
```

**Notes**: Because we halved the Move value before preparation, the Walk and Run values will be calculated with the halved value, and do not need to be adjusted. 

### Set Weapon Damage

**Usage**: When applied to a weapon, set a weapon to a specific damage value (such as being empowered by a spell)

```js
args.item.system.damage.value = "SB + 6";
```

**Notes**: We don't need to take any precautions against the bug mentioned above as the value is *set* to "SB + 6", so being set twice doesn't change anything. See [Prepare Owned Data](./prepareOwned.md) to accomplish this with an alternate trigger.

### Add Damaging to a Weapon

**Usage**: When applied to a weapon, add the Damaging quality (such as being empowered by a spell)

```js
if (!this.item.system.properties.qualities.damaging) 
{
    this.item.system.qualities.value.push({name : 'damaging'});
}
```

**Notes**: We don't want to add a second Damaging property if the weapon already has it, this also guards against the bug mentioned above. See [Prepare Owned Data](./prepareOwned.md) to accomplish this with an alternate trigger.