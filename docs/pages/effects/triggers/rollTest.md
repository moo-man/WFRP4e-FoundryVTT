---
layout: default
title: Roll Test
parent: Scripts
nav_order: 34
grand_parent: Active Effects
---

There are two triggers concerning rolling tests, one for [before](./preRollTest.md) the roll is computed and after the roll is computed.

{: .important}
If you want to add modifiers to the Test target or SL, you should use the [Dialog](./dialog.md) trigger.

## Key

`rollTest`

## Arguments 

`args.test` - This is the entire test object, it is recommended to manually go through the properties within as it's too numerous to list here, though commonly used ones will be listed.

`args.test.preData` - The data used specifically to determine the outcome of the test, such as `target`, `roll`, `testModifier`, and much more

`args.test.context` - Contextual data relevant to the using the roll, such as `rollMode`, `reroll`, `edited`, `speaker`, `targets` and more

`args.test.result` - Result of the test.

Below are helpers that are oftenly used

`args.test.succeeded` - Whether the test succeeded

`args.test.failed` - Whether the test failed

`args.test.isCritical` - Whether the test is a critical

`args.test.isFumble` - Whether the test is a fumble

`args.test.message` - The message associated with the test

`args.test.item` - The Item used to perform the test (e.g. weapon, trait, spell, etc.)

`args.test.characteristicKey` - The base characteristic used in the test

## Examples

### Consequence of Failure

**Usage**: Add Broken condition if any Willpower test is failed

```js
if (args.test.failed && args.test.characteristicKey == "wp")
{
    this.actor.addCondition("broken")
}
```

---

### Automatic Success

**Usage**: Automatically succeed on any Athletics test, regardless of what is rolled.

```js
if (args.test.item?.name == "Athletics")
{
	if (parseInt(args.test.result.SL) < 0 || args.test.failed)
	{
		if (parseInt(args.test.result.SL) < 0)
		{
			args.test.result.SL = "+0";
			args.test.result.description = "Marginal Success"
		}
		args.test.result.outcome = "success"
        args.test.result.other.push(`<strong>${this.effect.name}</strong>: Minimum +0 SL`)
	}
}
```

**Notes**: This checks if the test was a failure, and if so, set the SL instead to +0, result to "Marginal Success", and the outcome to "success".

---

### Argumentative Talent

**Usage**: Uses a variable set in a [Dialog](./dialog.md#argumentative-talent) script to alter the SL after the Test is computed

```js
if (args.test.options.useOnesArgumentative && (args.test.result.roll <= game.settings.get("wfrp4e", "automaticSuccess") || args.test.result.roll <= args.test.target))
{

let SL = Math.floor(args.test.target / 10) - Math.floor(args.test.result.roll / 10)
let ones = Number(args.test.result.roll.toString().split("").pop())

if (ones > SL)
	args.test.data.result.SL = "+" + (ones + args.test.successBonus + args.test.slBonus)
   args.test.result.other.push(`<b>${this.effect.name}</b>: Used unit dice as SL`)
}
```

**Notes**: `args.test.options.useOnesArgumentative` was set by the [dialog effect's submission script](./dialog.md#argumentative-talent). When that flag is set, we can see if the test is a success, and recompute SL with the bonus. 