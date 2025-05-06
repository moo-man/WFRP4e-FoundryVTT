---
layout: default
title: End Combat
parent: Scripts
nav_order: 53
grand_parent: Active Effects
---
This trigger runs when the combat the owner is in ends.

## Key

`endCombat`

## Arguments 

`args.combat` - The Combat this Actor is in.

## Examples

### End Frenzy

**Usage**: Once the combat is done, remove Frenzy

```js
const frenzy = this.actor.items.filter(i => i.type == "psychology" && i.name == "Frenzy")
if (frenzy) 
{
    this.actor.deleteEmbeddedDocuments("Item",[frenzy.id])  ;
    this.script.notification(`Removed ${frenzy.name}`);
}
    
```