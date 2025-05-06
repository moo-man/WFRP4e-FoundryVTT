---
layout: default
title: Pre-Opposed Defender
parent: Scripts
nav_order: 42
grand_parent: Active Effects
---
This trigger is called before any computation between two opposed tests is done. This trigger specifically runs if the owner is the defender. 

If an effect with this trigger is owned by an Item and designated as an `Item` Document Type effect, scripts with this trigger will only run when that specific Item is used to defend in an opposed test

## Key

`preOpposedDefender`

## Arguments 

`args.attackerTest` - Attacker's Test, see the `test` object in [Roll Test](./rollTest.md)

`args.defenderTest` - Defender's Test, see the `test` object in [Roll Test](./rollTest.md)

`args.opposedTest` - Opposed Test object that houses the result and attacker/defender data

`args.opposedTest.attacker` - Actor that is attacking in this opposed Test

`args.opposedTest.defender` - Actor that is defending in this opposed Test

## Examples

This trigger is currently unused, so in the future it may be reworked to be more useful. 