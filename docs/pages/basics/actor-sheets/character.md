---
layout: default
title: Character Sheet
nav_order: 0
parent: Actor Sheets
grand_parent: The Basics
---
The Character sheet is intended for player characters and has all the specific functionality for player actions, such as corruption, rolling income, switching careers, etc.

![character-main](https://user-images.githubusercontent.com/28637157/171747172-d137364f-49bd-4725-b911-7d899aa0d5fd.jpg)

**1. Name** - Name of the character. Note that this name is not generally displayed in chat or the canvas. The Token name is what should be used as the "public name". (For more on configuring Tokens, see [the FoundryVTT Knowledge Base](https://foundryvtt.com/article/tokens/){:target="_blank"})

**2. Species** - Species of the character. Changing the species on a *character* sheet has no effect. However, for NPC/Creature sheets it does. See LINK

**3. Gender** - Gender of the character

**4. Character Details** - Details such as class/career/status and height/weight/age. Some of these are derived - Class, Career Group, Career, and Status are derived from your **Current** career. See the Career List (**13**) for more information.
  * <span class="lc-icon"></span>- Left click on the character's status to apply a bonus, increasing the standing or tier
  * <span class="rc-icon"></span>- Right click on the character's status to apply a penalty, decreasing the standing or tier

**5. Tabs** - Tabs of the character sheet.

   * $Main Tab$ - You are here!
   * [Skills Tab](../actor-tabs/skills)
   * [Talents Tab](../actor-tabs/talents)
   * [Combat Tab](../actor-tabs/combat)
   * [Effects Tab](../actor-tabs/effects)
   * $Trappings Tab$
   * $Notes Tab$

**6. Characteristics** - This grid represents the character's characteristics

   * The Header shows the abbreviation for each characteristic, as well as possibly a `+` or `✓`. These are **Advancement Indicators** and mark the characteristic as available to advance (determined by the Actor's Career).
     * <span class="lc-icon"></span>- Left click on an Advancement Indicator to Advance the characteristic and spend the appropriate amount of Experience
     * <span class="rc-icon"></span>- Right click on an Advancement Indicator to un-Advance the characteristic, refunding the appropriate amount of Experience

   * The Initial row defines the starting point of the characteristic from $Character Creation$

   * The Advances row is the number of advances spent on the characteristic

   * The Modifiers row is a field for miscellaneous bonuses/penalties. This is often used by $Effects$

   * The Current row is the total characteristic value with all advances and modifiers added up. 
     * <span class="lc-icon"></span>- $Roll a Characteristic$

**7. Movement** - Shows the Movement value and the derived Walk/Run speeds of the character. The Movement field is editable.
   * <span class="rc-icon"></span>- Right click the walk or run value to switch it to manual mode.

**8. Metacurrencies** - Fate, Fortune, Resilience, and Resolve fields.
   * <span class="lc-icon"></span>- Increase a field by 1
   * <span class="rc-icon"></span>- Decrease a field by 1

**9. Wounds** - Shows the Current / Maximum Wound value for the character. The Current field is editable. The Maximum field is (usually) equal to SB + 2 * TB + WPB. You can also enter a relative value in the Current field to calculate the total (e.g. enter -3 to subtract 3 wounds, or +5 to add 5)
   * <span class="rc-icon"></span>- Right click the Maximum wounds to switch it to disable auto calculation and enter maximum wounds manually. 
   * <span class="lc-icon"></span>- Left Click on the Bed icon to Rest, which automatically rolls and generates Wounds healed. Drag and drop onto the character sheet to apply.

**10. Critical Wounds** - Shows the Current / Maximum Critical Wounds for the character. The Current field is *readonly*. It is derived from the number of Critical Items the Actor has. The Maximum field is equal to the Actor's Toughness.
    * <span class="rc-icon"></span>- Right click the Maximum Critical Wounds to switch it to disable auto calculation and enter maximum manually. 

**11. Corruption** - Shows the Current / Maximum Corruption for the character. The Current field is editable. The Maximum field is equal to the Actor's Toughness Bonus + Willpower Bonus. 
      * <span class="rc-icon"></span>- Right click the Maximum Corruption to switch it to disable auto calculation and enter maximum manually. 

**12. Experience** - Shows the Current, Spent, and Total Experience points. 
  *  Current - Read only, calculated by Total - Spent. This represents how much experience the character has available to spend. 
  *  Spent - Editable. Represents the total experience the character has spent. Changing this value will prompt you for a "Reason for Exp Change" Dialog that will be shown in the $Experience Log$
  *  Total- Editable. Represents the total experience the character has earned. Changing this value will prompt you for a "Reason for Exp Change" Dialog that will be shown in the $Experience Log$

**13. Career List** - Shows the list of careers the character has gone through.
  * Current - Toggle the career the character is currently in. This will fill out the character details (see **4**) and uncheck any other career that is marked as current.
  * Complete - Marks this career as complete. As this is highly GM decision dependent, this is manually checked. Marking it as complete will help calculate the experience cost to switch careers in the $Career Selector$
  * <span class="lc-icon"></span>- Left Click on a career to see more details and show the button to roll Income.

**14. Actor Configuration** - Open the Actor Configuration menu. This menu lets you toggle various settings for the actor. See $Actor Configuration$