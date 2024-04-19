---
layout: default
title: Creature Sheet
nav_order: 2
parent: Actor Sheets
grand_parent: The Basics
---
The Creature sheet is intended for generic enemies or NPCs in the world, typically non-humanoid or very generic (e.g. "Villager"), and who utilize Traits. 

## Special Functions

- You can use careers to quickly generate creature statistics. Simply drag and drop a career onto the sheet and it will add the characteristics, skills, and talents of that career. 

![creature-main](https://user-images.githubusercontent.com/28637157/171969185-d9ee122b-ecd8-478e-bd99-042067339d0e.jpg)

**1. Name** - Name of the Creature. Note that this name is not generally displayed in chat or the canvas. The Token name is what should be used as the "public name". (For more on configuring Tokens, see [the FoundryVTT Knowledge Base](https://foundryvtt.com/article/tokens/){:target="_blank"})

**2. Species** - Species of the Creature. Changing the species on an NPC or Creature will search for the new species in the $Config$ object and if found, will prompt the user whether they want to apply the species characteristics to the Actor.

**3. Gender** - Gender of the Creature

**4. Characteristics** - Characteristics of the Actor. The numeric fields are editable to configure the Creature's characteristics
  * <span class="lc-icon"></span>- Left click on one of the headers to $Roll a Characteristic$

**5. Movement** - Shows the Movement value and the derived Walk/Run speeds of the Creature. The Movement field is editable.
   * <span class="rc-icon"></span>- Right click the walk or run value to switch it to manual mode.

**6. Wounds** - Shows the Current / Maximum Wound value for the Creature. The Current field is editable. The Maximum field is (usually) equal to SB + 2 * TB + WPB. You can also enter a relative value in the Current field to calculate the total (e.g. enter -3 to subtract 3 wounds, or +5 to add 5)
   * <span class="rc-icon"></span>- Right click the Maximum wounds to switch it to disable auto calculation and enter maximum wounds manually. 

**7. Randomization Buttons** - These buttons allow the user to randomize aspects of the Creature.
  * <strong class="orange">C</strong>: Characteristics - If the species is recognized, it uses the randomization defined in $Config$, otherwise, simple adds -10 + 2d10
  * <strong class="orange">S</strong>: Skills - Adds skills given from the species (Requires the species be registered in $Config$)
  * <strong class="orange">T</strong>: Talents - Adds talents given from the species (Requires the species be registered in $Config$)

**8. Tabs** - Tabs of the character sheet.

   * $Main Tab$ - You are here! See **Creature Overview** below
   * [Skills Tab](../actor-tabs/skills)
   * [Combat Tab](../actor-tabs/combat)
   * [Effects Tab](../actor-tabs/effects)
   * $Trappings Tab$
   * $Notes Tab$

**9. Actor Configuration** - Open the Actor Configuration menu. This menu lets you toggle various settings for the actor. See $Actor Configuration$

**10. Creature Overview** - The main tab of Creature sheets features the Creature Overview, which consolidates many of the item types of the actor for easy access. The dice symbol next to an item name indicates that the item is rollable. 
  * <span class="lc-icon"></span>- Left Click on an item name to either show item info as a dropdown, or (if the item is rollable) show a prompt to $roll$ whatever the item's associated test may be. 
  * <span class="rc-icon"></span>- Right click will *always* show item info as a dropdown, regardless of if the item is rollable or not.
  * **Double RC** - Double right click will open the item's sheet for editing. 
  * **Del** - Hover over an item and press the delete key to delete the item from the Actor.

**11. Weapon Lists** - The equipped weapons are shown here to roll from, which works the same way as in the [Combat Tab](../actor-tabs/combat)

**12. Hit Locations** - Hit locations are shown here, along with the associated AP on each location. The Orange represents Armour, Blue represents Shield, and Green is the TB of the Actor.
  * <span class="rc-icon"></span>- Right click on the Armour or Shield AP values to reduce by 1, representing damage to the item (from things such as Hack or Critical Deflection)
  * <span class="lc-icon"></span>- Left click to repair/undo damage to that location

**13. Quick Roll Buttons** - Commonly used rolls are always available in the header of the Creature Overview
  * <i class="fa-solid fa-paw"></i> - Perform a **Stomp** attack
  * <i class="fa-solid fa-reply"></i> - Roll the Dodge Skill
  * <i class="fa-solid fa-question"></i> - Roll an Improvised Weapon Attack