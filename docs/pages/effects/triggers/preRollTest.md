---
layout: default
title: Pre-Roll Test
parent: Scripts
nav_order: 28
grand_parent: Active Effects
---

There are two triggers concerning rolling tests, one for before the roll is computed and [after](./rollTest) the roll is computed.

{: .important}
If you want to add modifiers to the Test target or SL, you should use the [Dialog](./dialog.md) trigger.

## Key

`preRollTest`

## Arguments 

`args.test` - This is the entire test object, it is recommended to manually go through the properties within as it's too numerous to list here, though commonly used ones will be listed.

`args.test.preData` - The data used specifically to determine the outcome of the test, such as `target`, `roll`, `testModifier`, and much more

`args.test.context` - Contextual data relevant to the using the roll, such as `rollMode`, `reroll`, `edited`, `speaker`, `targets` and more

Below are helpers that are oftenly used

`args.test.item` - The Item used to perform the test (e.g. weapon, trait, spell, etc.)

`args.test.characteristicKey` - The base characteristic used in the test

## Examples

### Allow Reversal

**Usage**: Sets the variable that allows the dice to be reversed if the result would be better. 

```js
if (args.test.item && args.test.item.name == game.i18n.localize("NAME.ConsumeAlcohol"))
{
    args.test.preData.canReverse = true
}
```