---
layout: default
title: Update Combat
parent: Scripts
nav_order: 54
grand_parent: Active Effects
---
This trigger runs when the combat the owner is in updates (such as changes turn).

## Key

`updateCombat`

## Arguments 

`args.combat` - The Combat this Actor is in.

## Examples

### Remove Effect

**Usage**: A bit confusing, but if some spell you apply to *another* Actor is removed at the start of *the caster's* next turn, this can be accomplished.

```js
if (args.combat.combatant.actor.uuid === this.effect.sourceActor.uuid) 
{
  this.effect.delete();
}
```

**Notes**: `args.combat.combatant` is the combatant whose turn just started. `this.effect.sourceActor` is the Actor who gave the effect. So if the UUIDs match, the caster's next turn just started, so remove the effect. 