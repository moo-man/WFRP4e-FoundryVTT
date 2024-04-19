---
layout: default
title: NPC Sheet
nav_order: 1
parent: Actor Sheets
grand_parent: The Basics
---

The NPC sheet is intended for detailed NPCs in the game that would operate similar to player characters, except in a more condensed form. Generally, these would be used for named humanoid characters that have status and careers.

## Special Functions

- You can use careers to quickly generate an NPC. See the $Careers Tab$

![npc-main](https://user-images.githubusercontent.com/28637157/171747193-f2c5ca22-61a0-4d90-8371-8a16abdb2b2a.jpg)

**1. Name** - Name of the NPC. Note that this name is not generally displayed in chat or the canvas. The Token name is what should be used as the "public name". (For more on configuring Tokens, see [the FoundryVTT Knowledge Base](https://foundryvtt.com/article/tokens/){:target="_blank"})

**2. Species** - Species of the NPC. Changing the species on an NPC or Creature will search for the new species in the $Config$ object and if found, will prompt the user whether they want to apply the species characteristics to the Actor.

**3. Gender** - Gender of the NPC

**4. Characteristics** - Characteristics of the Actor. The numeric fields are editable to configure the NPC's characteristics
  * <span class="lc-icon"></span>- Left click on one of the headers to $Roll a Characteristic$

**5. Movement** - Shows the Movement value and the derived Walk/Run speeds of the NPC. The Movement field is editable.
   * <span class="rc-icon"></span>- Right click the walk or run value to switch it to manual mode.

**6. Wounds** - Shows the Current / Maximum Wound value for the NPC. The Current field is editable. The Maximum field is (usually) equal to SB + 2 * TB + WPB. You can also enter a relative value in the Current field to calculate the total (e.g. enter -3 to subtract 3 wounds, or +5 to add 5)
   * <span class="rc-icon"></span>- Right click the Maximum wounds to switch it to disable auto calculation and enter maximum wounds manually. 

**7. Randomization Buttons** - These buttons allow the user to randomize aspects of the NPC.
  * <strong class="orange">C</strong>: Characteristics - If the species is recognized, it uses the randomization defined in $Config$, otherwise, simple adds -10 + 2d10
  * <strong class="orange">S</strong>: Skills - Adds skills given from the species (Requires the species be registered in $Config$)
  * <strong class="orange">T</strong>: Talents - Adds talents given from the species (Requires the species be registered in $Config$)

**8. Tabs** - Tabs of the character sheet.

   * **Main Tab** - You are here! (The NPC main tab is identical to the [Skills Tab](../actor-tabs/skills.md))
   * [Talents Tab](../actor-tabs/talents)
   * $Careers Tab$
   * [Combat Tab](../actor-tabs/combat)
   * [Effects Tab](../actor-tabs/effects)
   * $Trappings Tab$
   * $Notes Tab$

**9. Actor Configuration** - Open the Actor Configuration menu. This menu lets you toggle various settings for the actor. See $Actor Configuration$