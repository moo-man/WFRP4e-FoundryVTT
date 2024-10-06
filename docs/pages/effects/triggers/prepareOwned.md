---
layout: default
title: Prepare Owned Data (For Items)
parent: Scripts
nav_order: 10
grand_parent: Active Effects
---

"Preparation" is the term for processing the Actor's base data, such as determining Wounds (derived from Toughness, Willpower, annd Strength Bonus), or determining Encumbrance (adding all item encumbrance together), or calculating damage for equipped Weapons (SB + 4 => 7), and much much more.

Additional preparation is exclusively called for each Item owned on an Actor. For example, if a weapon's damage is SB + 4, "Owned Preparation" is where it's computed.

This trigger runs after the owning Actor computes the Owned Item.

## Key

`prepareOwned`

## Arguments 

`args.item` - Item being prepared

## Examples

### Set Weapon Damage

**Usage**: When applied to a weapon, set a weapon to a specific damage value (such as being empowered by a spell)

```js
args.item.system.damage.value = "SB + 6";
```

**Notes**: See [Pre-Prepare Data](./prePrepareData.md) to accomplish this with an alternate trigger.

### Add Damaging to a Weapon

**Usage**: When applied to a weapon, add the Damaging quality (such as being empowered by a spell)

```js
if (!this.item.system.properties.qualities.damaging) 
{
    this.item.system.qualities.value.push({name : 'damaging'});
}
```

**Notes**: We don't want to add a second Damaging property if the weapon already has it, this also guards against the bug mentioned above. See [Pre-Prepare Data](./prePrepareData.md) to accomplish this with an alternate trigger.
