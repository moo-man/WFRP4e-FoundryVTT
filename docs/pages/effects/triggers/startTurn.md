---
layout: default
title: Start Turn
parent: Scripts
nav_order: 51
grand_parent: Active Effects
---
This trigger runs when the owner starts their turn in combat. 

## Key

`startTurn`

## Arguments 

`args.combat` - The Combat this Actor is in.

## Examples

### Test against Stunned

**Usage**: Roll a Test to resist being Stunned.

```js
let test = await this.actor.setupSkill(game.i18n.localize("NAME.Cool"), {fields : {difficulty : "difficult"}, appendTitle : ` - ${this.effect.name}`})
await test.roll();
if (test.failed) 
{
        this.actor.addCondition("stunned");
}
```