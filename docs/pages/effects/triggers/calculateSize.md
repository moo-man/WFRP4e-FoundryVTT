---
layout: default
title: Size Calculation
parent: Scripts
nav_order: 15
grand_parent: Active Effects
---

Before scripting was a feature, the system looked for the Size Trait item to determine its Size, this is still the case (to avoid issues with user's existing monsters). This script runs after items are searched and Size is determined, so any script using the trigger will be the final size value.

## Key

`calculateSize`

## Arguments 

`args.size` - Size of the Actor

## Examples

### Small

**Usage**: Set Size to Small

```js
args.size = "sml"
```