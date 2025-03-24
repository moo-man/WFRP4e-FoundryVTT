---
layout: default
title: Pre-Apply Condition
parent: Scripts
nav_order: 24
grand_parent: Active Effects
---

Some conditions have scripted behaviors and this script runs at an early point in those scripts, letting you alter the process

## Key

`preApplyCondition`

## Arguments 

`args.effect` - Effect object for the condition

`args.data` - Data which is dependant on the condition being executed.


## Examples

### Take less damage from Bleeding

**Usage**: Reduce the damage from Bleeding by 1

```js
if (args.effect.conditionId == "bleeding")
{
    args.data.damage -= 1
}
```

---

### Modify Formula

**Usage**: modify the damage formula from Ablaze

```js
if (args.effect.conditionId == "ablaze")
{
     args.data.formula += ` - ${this.actor.system.characteristics.t.bonus}`
}
```