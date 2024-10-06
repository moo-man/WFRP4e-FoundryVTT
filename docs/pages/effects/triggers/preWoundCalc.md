---
layout: default
title: Pre-Wound Calculation
parent: Scripts
nav_order: 13
grand_parent: Active Effects
---

Wound calculation involves several different Actor values added and multiplied together. This trigger runs before calculation and lets you modify these values before Wounds are computed. 

## Key

`preWoundCalc`

## Arguments 

`args.actor` - Actor whose Wounds are being calculated

`args.sb` - Strength Bonus

`args.tb` - Strength Bonus

`args.wpb` - Strength Bonus

`args.multiplier.sb` - Strength Bonus Multiplier

`args.multiplier.tb` - Toughness Bonus Multiplier

`args.multiplier.wpb` - Willpower Bonus Multiplier


## Examples

### Add an additional Toughness Bonus

**Usage**: Part of Wound calculation is 2 × Toughness Bonus (Assuming Average size Actor). We can lower or increase how many times it's multiplied.

```js
args.multiplier.tb += 1
```

---

### Set Willpower Bonus to be Strength Bonus

**Usage**: Some Creatures don't have Willpower, so use Strength instead of Willpower

```js
args.wpb = args.sb;
```

{: .question}
> I just want to add or modify the final value, how do I do that?
>
> See [Wound Calculation](./woundCalc.md)