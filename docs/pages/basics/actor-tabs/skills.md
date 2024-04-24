---
layout: default
title: Skills Tab
parent: Actor Sheet Tabs
nav_order: 0
grand_parent: The Basics
---

The Skills tab lists all the skills of the Actor. It is separated into two sections: `Basic` and `Grouped & Advanced`

The **Basic** section only contains basic skills that don't have any specializations (specializations such as Stealth (Underground) or Melee (Basic))

The **Grouped & Advanced** section contains any skill that has a specialization ("grouped", includes any basic skills that have specializations) as well as any Advanced skills (grouped or not). When creating a new character, the Grouped & Advanced list will start out with grouped Basic skills, without a group. These are placeholders for you to fill in.

**Example**: _When creating a new character, by default they start out with Ride, Melee, Stealth, and Entertain and Art in their **Grouped & Advanced** Skill section. These are all Grouped skills but without a group, and shouldn't be advanced until they are given a specialization. See $Skill Item Sheet$ for more on skill specializations._ 

## Extended Tests

There's two "modes" for the skills tab, Skills and Extended Tests. Extended Tests (image, right) lists all the currently Extended Tests the Actor is doing. 

***

![skills](https://user-images.githubusercontent.com/28637157/173696062-9f4a31c8-27fc-4a5e-b9e2-b97c1aca9f40.jpg)

**1. Skill Header** - Header for each skill section, listing the column names.
  * <span class="lc-icon"></span>- Left click on <i class="fa-solid fa-plus"></i> to create a new, blank skill in that section

**2. Skill Row** - Lists the details of the skill, including name, characteristic, characteristic value, advancement value, and total skill value.
  * <span class="lc-icon"></span>- Left click on a skill name or total to $Roll a Skill$
  * <span class="lc-icon"></span>- Left click on <i class="fa-solid fa-trash-can"></i> to delete the skill
  * <span class="rc-icon"></span>- Right click on a skill name to open up the $Skill Item Sheet$

  * **Advancement Indicators** - Next to some skill names you may see a `+` or a `✓`. These are **Advancement Indicators** and mark the skill as available to advance (either derived from the career or marked specifically in the $Item Sheet$). Note that the `✓` means that the skill is sufficiently advanced to be considered complete in the Actor's current Career.
     * <span class="lc-icon"></span>- Left click on an Advancement Indicator to Advance the skill and spend the appropriate amount of Experience
     * <span class="rc-icon"></span>- Right click on an Advancement Indicator to un-Advance the skill, refunding the appropriate amount of Experience
 
**3. Extended Tests** - Shows the number of Extended Tests active
  * <span class="lc-icon"></span>- Left Click on the label or arrow to view the Extended Tests list

**4. Untrained Skills** - These are skills that are available to advance from your Career, but that the character doesn't currently have.
  * <span class="lc-icon"></span>- Left click to add the skill to the actor, making it available to use and advance
  * <span class="rc-icon"></span>- Right click to open the skill's sheet 

**5. Extended Tests Header** - Header for the Extended Test list
  * <span class="lc-icon"></span>- Left click <i class="fa-solid fa-reply"></i> to go back to the normal skill view
  * <span class="lc-icon"></span>- Left click <i class="fa-solid fa-plus"></i> to add a blank Extended Test item

**6. Extended Test Row** - Lists details of a particular Extended Test, including name and current progress. See the $Extended Test Item Sheet$ for more on how to configure Extended Tests.
  * <span class="lc-icon"></span>- Left click on the name of the Extended Test to $Roll an Extended Test$
  * <span class="lc-icon"></span> or <span class="rc-icon"></span> - Left/Right Click on the SL Counter of an Extended Test to Increment/Decrement (respectively) the SL.
  * **Item Controls**
    * <i class="fa-solid fa-comment"></i> - $Post$ the Extended Test to Chat
    * <i class="fa-solid fa-pen-to-square"></i> - Open the $Extended Test Sheet$
    * <i class="fa-solid fa-chevron-down"></i> - Open the Dropdown for the Extended Test
    * <i class="fa-solid fa-trash-can"></i> - Delete the Extended Test