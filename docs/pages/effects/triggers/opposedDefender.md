---
layout: default
title: Opposed Defender
parent: Scripts
nav_order: 44
grand_parent: Active Effects
---
This trigger is called after the computation between two opposed tests is done. This trigger specifically runs if the owner is the defender. 

If an effect with this trigger is owned by an Item and designated as an `Item` Document Type effect, scripts with this trigger will only run when that specific Item is used to defend in an opposed test

## Key

`opposedDefender`

## Arguments 

`args.attackerTest` - Attacker's Test, see the `test` object in [Roll Test](./rollTest.md)

`args.defenderTest` - Defender's Test, see the `test` object in [Roll Test](./rollTest.md)

`args.opposedTest` - Opposed Test object that houses the result and attacker/defender data

`args.opposedTest.attacker` - Actor that is attacking in this opposed Test

`args.opposedTest.defender` - Actor that is defending in this opposed Test

`args.opposedTest.result` - Actor that is defending in this opposed Test

`args.opposedTest.result.winner` - `"attacker"` or `"defender"`

`args.opposedTest.result.differenceSL` - The difference in SL values between the Attacker and Defender

`args.opposedTest.result.damage` - `.description` for the display value, `.value` for the raw damage value

## Examples

### Gain Advantage on Defense

**Usage**: If an opposed test is lost when using a shield, gain 1 Advantage (after losing any you currently have)

```js
if (args.opposedTest.result.winner == "attacker") 
{
  if (args.opposedTest.defenderTest.weapon && args.opposedTest.defenderTest.item.properties.qualities.shield) 
  {
    this.script.notification(`Gained 1 Advantage`)
    this.actor.setAdvantage(1)
  }
}
```