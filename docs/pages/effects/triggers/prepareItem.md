---
layout: default
title: Prepare Item
parent: Scripts
nav_order: 27
grand_parent: Active Effects
---

"Preparation" is the term for processing the Actor's base data, but part of that preparation is also preparing its embedded Documents, including each Item (for more info on Actor preparation, see [Prepare Data](./prepareData.md)).

This trigger executes *after each Item in an actor is prepared*, so it is ideal for modifying properties that are derived, or the result of a calculation of other properties. 

{: .important}
This differs from [Prepare Owned](./prepareOwned.md) as this trigger is intended to be for *Actors* modifying their owned Items. The **Prepare Owned** trigger is for Items modifying themselves if they are owned by an Actor. 

## Key

`prepareItem`

## Arguments 

`args.item` - The Item being prepared

## Examples

### Add Magical

**Usage**: Add the Magical quality to all weapons and traits on this Actor

```js
if ((args.item.type == "weapon" || args.item.system.attackType) && !args.item.isMagical )
{
    args.item.system.qualities.value.push({name : "magical"})
}
```

**Notes**: Remember since this runs on every Item owned by an Actor, you need to check whether an Item qualifies (based entirely on what you're trying to achieve).

---

### Modify Spell CN

**Usage**: Lower CN by 1 for all Spells on the Actor

```js
if (args.item.type == "spell")
{
    args.item.system.cn.value -= 1
}
```

---

### Modify Range

**Usage**: Change the modifiers for Long Range / Extreme on a ranged weapon

```js
if (args.item.range && args.item.range.bands)
{
    args.item.range.bands[game.i18n.localize("Long Range")].modifier = 0
    args.item.range.bands[game.i18n.localize("Extreme")].modifier /= 2
}
```