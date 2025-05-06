---
layout: default
title: Opposed Attacker
parent: Scripts
nav_order: 43
grand_parent: Active Effects
---
This trigger is called after the computation between two opposed tests is done. This trigger specifically runs if the owner is the attacker. 

If an effect with this trigger is owned by an Item and designated as an `Item` Document Type effect, scripts with this trigger will only run when that specific Item is used to attack in an opposed test

## Key

`opposedAttacker`

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

`args.opposedTest.result.other` - Array of strings to display in the damage chat message.

## Examples

This trigger is currently unused, so in the future it may be reworked to be more useful. 
