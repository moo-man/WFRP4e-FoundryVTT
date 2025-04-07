---
layout: default
title: Effect Deleted
parent: Scripts
nav_order: 49
grand_parent: Active Effects
---
This trigger runs when the Effect is deleted. This is generally used to reset any updates that were made by other scripts. 

## Key

`deleteEffect`

## Arguments 

`args.options` - Options provided to the deletion call

`args.user` - ID of the user who deleted the effect

## Examples

### Test for Fatigued

**Usage**: Some spell or potion may give some bonus, but when it's removed, might have some debuff. This trigger is ideal for that.

```js
let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`, fields : {difficulty : "average"}})
await test.roll();

if (test.failed)
{
    this.actor.addCondition("fatigued");
}
```

---

### Delete Conditions

**Usage**: Conditions and effects created from other effects aren't linked or tracked, so they aren't deleted if the origin effect is deleted. This can be done manually.

```js
this.actor.hasCondition("blinded")?.delete();
this.actor.hasCondition("deafened")?.delete()
this.actor.hasCondition("unconscious")?.delete()
```

---

### Reset Light

**Usage**: Reset light settings from [Create Token](./createToken.md).

```js
this.actor.getActiveTokens().forEach(t => t.document.update({light : {
    "dim": 0,
    "bright": 0,
    "alpha": 0.5,
    "animation": {
        "type": "",
    },
    "color": "#000000",
}}));
```