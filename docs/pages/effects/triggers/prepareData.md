---
layout: default
title: Prepare Data
parent: Scripts
nav_order: 9
grand_parent: Active Effects
---

"Preparation" is the term for processing the Actor's base data, such as determining Wounds (derived from Toughness, Willpower, annd Strength Bonus), or determining Encumbrance (adding all item encumbrance together), or calculating damage for equipped Weapons (SB + 4 => 7), and much much more.

This trigger executes after these calculations occur, so it is ideal for modifying properties that are derived, or the result of a calculation of other properties. 

{: .important}
There is a [bug](https://github.com/foundryvtt/foundryvtt/issues/7987) when using this trigger when being applied to Items. This causes the script to be executed twice, so this must be accounted for when modifying properties. If a property is being *added* to, the workaround is to add half the value instead. If a property is being *set* (as above), it should work normally.

## Key

`prepareData`

## Arguments 

`args.actor` - If the effect is applied to an Actor, this is the Actor being prepared

`args.item` - If the effect is applied to an Item, this is the Item being prepared

## Examples

### Halve Movement

**Usage**: Add 4 to the Run property

```js
args.actor.system.details.move.run += 4
```

**Notes**: Since Run is a *derived* property, we use this trigger to add to the calculated Run value.

### Add AP to all locations

**Usage**: Adds 2 to all AP locations. 

```js
this.actor.system.status.addArmour(2, {source: this.effect})
```

**Notes**: You can add the `locations` property to the second argument, i.e. `locations: ["head", "lArm", "body"]`, as well as `magical: true`

### Set the Ward property

**Usage**: "Ward" is a property on the Actor which is rolled when the Actor takes damage. This property isn't visible on the actor sheet, but can be modified in a script.

```js
this.actor.system.status.ward.value = 9;
```