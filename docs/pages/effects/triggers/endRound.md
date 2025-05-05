---
layout: default
title: End Round
parent: Scripts
nav_order: 52
grand_parent: Active Effects
---
This trigger runs when the combat the owner is in ends the round. 

## Key

`endRound`

## Arguments 

`args.combat` - The Combat this Actor is in.

## Examples

## Heal at Round End

**Usage**: Heal some amount when the round ends

```js
await this.actor.modifyWounds(5);
this.script.message("Healed 5 Wounds", { whisper: ChatMessage.getWhisperRecipients("GM") })
```