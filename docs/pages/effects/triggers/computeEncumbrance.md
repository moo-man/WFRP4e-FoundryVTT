---
layout: default
title: Compute Encumbrance
parent: Scripts
nav_order: 12
grand_parent: Active Effects
---

This triggers runs after encumbrance thresholds have been calculated, but before calculating how encumbered the Actor is, this lets us modify the thresholds if we desire. 

## Key

`computeEncumbrance`

## Arguments 

`args.actor` - Actor whose encumbrance is being computed

## Examples

### Add +1 to Encumbrance Max

**Usage**: Adds +1 to the Encumbrance threshold.

```js
this.actor.system.status.encumbrance.max += 1
```

Notes: `max` is a confusing here, as it's not the max encumbrance an Actor have, but when the Actor starts being encumbered. Each state of Encumbrance is a multiple of this max value. e.g. if 10 is the max, 20 is encumbered, 30 is heavily encumbered. 

