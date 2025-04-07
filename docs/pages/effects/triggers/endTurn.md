---
layout: default
title: End Turn
parent: Scripts
nav_order: 50
grand_parent: Active Effects
---
This trigger runs when the owner ends their turn in combat. 

## Key

`endTurn`

## Arguments 

`args.combat` - The Combat this Actor is in.

## Examples

### Delete Effect

**Usage**: Many spells/miracles only last until the end of the target's turn. This is an easy way to handle that.

```js
this.effect.delete();
```

---

### Apply Damage

**Usage**: Damaging the Actor at the end of each turn is also common

```js
this.script.message(await this.actor.applyBasicDamage(8, {damageType : game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP, suppressMsg: true}))
```

**Notes**: This applies 8 damage, ignoring AP, and shows a message to chat. 