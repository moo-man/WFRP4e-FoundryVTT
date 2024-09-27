---
layout: default
title: Wound Calculation
parent: Scripts
nav_order: 14
grand_parent: Active Effects
---

This trigger runs after Wounds have been calculated, letting you modify the final value

## Key

`woundCalc`

## Arguments 

`args.actor` - Actor whose Wounds are being calculated

`args.wounds` - Wound value calculated

## Examples

### Double final Wounds value

**Usage**: Multiply Wounds by ×2

```js
args.wounds *= 2
```