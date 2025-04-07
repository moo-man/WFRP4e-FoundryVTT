---
layout: default
title: Get Initiative
parent: Scripts
nav_order: 47
grand_parent: Active Effects
---
This trigger runs before the string initiative formula is evaluated into some value, letting you modify it. 

## Key

`getInitiativeFormula`

## Arguments 

`args.initiative` - A string formula for determining initiative. 

## Examples

### Modify Initiative

**Usage**: Change the initiative formula by adding some value

```js
args.initiative += "+10"
```

**Notes**: The initiative is a string formula, not a numeric value. This is rather clunky but allows for a lot of flexibility.
