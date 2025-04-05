---
layout: default
title: Pre-Prepare Item
parent: Scripts
nav_order: 26
grand_parent: Active Effects
---

"Preparation" is the term for processing the Actor's base data, but part of that preparation is also preparing its embedded Documents, including each Item (for more info on Actor preparation, see [Pre-Prepare Data](./prePrepareData.md)).

This trigger executes *before each Item in an actor is prepared*, so it is ideal for modifying properties that are derived, or the result of a calculation of other properties. 

## Key

`prePrepareItem`

## Arguments 

`args.item` - The Item being prepared

## Examples

### Add Damage

**Usage**: Add +1 Damage to a weapon's damage formula

```js
if (args.item.type == "weapon" && args.item.weaponGroup.value == "brawling")
{
    args.item.damage.value += " + 1"
}
```

**Notes**: Remember since this runs on every Item owned by an Actor, you need to check whether an Item qualifies (based entirely on what you're trying to achieve).

---

### Set all Skill Advances to 0

**Usage**: Lower CN by 1 for all Spells on the Actor

```js
if (args.item.type == "skill")
{
    args.item.system.advances.value = 0
}
```

**Notes**: This needs to use Pre-Prepare Item because the total Skill value hasn't been calculated yet. 