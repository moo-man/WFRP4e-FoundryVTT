---
layout: default
title: Pre-Prepare Actor Items
parent: Scripts
nav_order: 8
grand_parent: Active Effects
---

"Preparation" is the term for processing the Actor's base data, such as determining Wounds (derived from Toughness, Willpower, annd Strength Bonus), or determining Encumbrance (adding all item encumbrance together), or calculating damage for equipped Weapons (SB + 4 => 7), and much much more.

This trigger executes midway through this process, right after Active Effects have added their [changes](../effects.md#changes), and right before an Actor's Items are computed. 

As Items can't own other Items, this trigger will only do anything on `Actor` transfer type.

## Key

`prePrepareItems`

## Arguments 

`args.actor` - The Actor being prepared

## Examples

### Increase Damage

**Usage**: Increase Melee or Ranged Damage for all weapons

```js
args.actor.flags.meleeDamageIncrease += 1;
args.actor.flags.rangedDamageIncrease += 1;
```

**Notes**: These hard-coded flags are not really how I'd like this to be done, it's an artifact of very old code within the system. However, it's helpful in illustrating the point of the trigger. Since this trigger executes before Item's have been computed, we add to this flag so that when weapon damage is calculated, it includes these values. This could also be done in the [Pre-prepare Data](./prePrepareData).

### Add a Skill Modifier

**Usage**: Add +20 to Animal Care

```js
let skill = this.actor.itemTypes.skill.find(s => s.name === game.i18n.localize("NAME.AnimalCare"));
skill.system.modifier.value += 20;
```

**Notes**: As above, Items haven't been processed yet, so skill totals haven't been added up. Therefore, when we add to the skill modifier, it should be taken into account.