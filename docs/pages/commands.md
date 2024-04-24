---
layout: default
title: Chat Commands
---

The WFRP4e System provides various `/<command>` options within chat. 

## Tables
**Command**: `/table <table-name> <column> <modifier>`

**Example**: `/table critarm +20` `/table career human`

**Note**: `/table <anything-unrecognized>` will pull up the table help menu.

[Learn more about Tables]()

## Conditions
**Command**: `/cond <condition-name>`

**Example**: `/cond ablaze` `/cond unconsc`

**Note**: `/cond` will match the closest spelling condition and display it. `/cond abl` == `/cond ablaze`.

## Character Generation
**Command**: `/char`

**Note**: Begins character generation

[Learn more about Character Generation](https://github.com/moo-man/WFRP4e-FoundryVTT/wiki/Character-Generation)

## Name Generation
**Command**: `/name <species> <gender>`

**Species**: Valid entries are the 'key' values for species - `human` `dwarf` `halfling` `welf` `helf`

**Note**: Generates a name in chat (Also accessible by clicking the "Name" label on a an NPC or creature sheet)

## Availability test
**Command**: `/avail <settlement> <rarity> <option:modifier>`

**Settlement**: Valid entries are `village` `town` `city`

**Rarity**: Valid entries are `common` `scarce` `rare` `exotic`

**Modifier**: Optional. A modifier for the roll. Ex: 10 for +10%

**Note**: Roll an availability test to determine the availability and the stock of an item.

## Pay
**Command**: `/pay <String of money>`

**String of money**: A string that provides the information on the type of money and the quantity to remove from the player's character. It uses the abbreviations of WFRP: bp, ss and gc.

**Examples**:
* /pay 3gc2bp
* /pay 450bp
* /pay 2ss12bp4gc

**Note**: If this command is sent by the GM, it will create instead a chat card where players are offered to pay for the amount entered by the GM.