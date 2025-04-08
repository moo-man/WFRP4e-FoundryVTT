---
layout: default
title: Talents Tab
parent: Actor Sheet Tabs
nav_order: 1
grand_parent: The Basics
---
The Talents tab displays the list of Talents that the Actor currently owns, while showing the number of times taken and the `Tests` value.

![talents](https://user-images.githubusercontent.com/28637157/173695910-c64b47f8-9473-46d0-a1f6-9315aedccfc7.jpg)

**1. Talent Header** - Header describing the talents.
  * <span class="lc-icon"></span>- Left click on the A-Z sorting button to reorder the talents alphabetically.
  * <span class="lc-icon"></span>- Left click on the `+` symbol to create a new, blank skill in that section

**2. Talent Row** - Lists the details of the Talent: Times taken, and the `Tests` property, if it exists.
  * <span class="lc-icon"></span>- Left click on the name of the Talent to show the full description in a dropdown menu
  * <span class="lc-icon"></span> or <span class="rc-icon"></span> - If the Times Taken value is **bold**, that means it can be advanced (either provided from the career or forced from the $Talent Sheet$). left click to Advance the Talent and deduct appropriate experience, or right click to reverse the process. 
  * **Item Controls**
    * <i class="fa-solid fa-comment"></i> - $Post$ the Talent to Chat
    * <i class="fa-solid fa-pen-to-square"></i> - Open the $Talent Sheet$
    * <i class="fa-solid fa-chevron-down"></i> - Open the Dropdown for the Talent
    * <i class="fa-solid fa-trash-can"></i>  - Delete the Talent

**3. Untrained Talents** - These are Talents that are available to purchase from your Career, but that the character doesn't currently have.
  * <span class="lc-icon"></span>- Left click to purchase the Talent, deducting Experience as appropriate
  * <span class="rc-icon"></span>- Right click to open the Talent's sheet

# Combat Tab 

The Combat Tab displays everything relevant to combat in a concise and useful way

![combat](https://user-images.githubusercontent.com/28637157/173975528-aad04617-55e1-4127-a4cc-133ade67f53d.jpg)

**1. Advantage** - This field lets you see and edit your current Advantage

**2. Melee Weapon Header** - Lists the properties of the weapons used and provides easy to use combat buttons
  * <span class="lc-icon"></span>- Commonly used rolls are accessed via a simple button click
    * Fist - Roll an Unarmed Attack
    * Arrow - Roll the Dodge Skill
    * Question Mark - Roll an Improvised Weapon Attack

**3. Weapon List Row** - Each **equipped** weapon shows up here as their own row.
  * <span class="lc-icon"></span>- Left click on a weapon name to roll a Weapon Attack

**4. Offhand Toggle** - If you have more than one weapon equipped, you can designate one of them as an Offhand Weapon. To learn more about the specifics around dual wielding, see $Dual Wielding$

**5. Weapon Group** - This displays the Weapon Group of the weapon (such as Basic or Polearm).
  * <span class="lc-icon"></span>- Displays details of the Weapon Group, if any specials rules exist for it

**6. Weapon Damage** - This shows the Damage rating of the weapon
  * <span class="rc-icon"></span>- Right Click to cause Damage to the weapon, reducing its Damage by 1
  * <span class="lc-icon"></span>- Left Click to to repair the weapon, increasing its Damage by 1 if the weapon took damage. 

**7. Weapon Reach** - Shows the Reach of the weapon
  * <span class="lc-icon"></span>- Shows a description of the Weapon's reach, typically giving more details on how long the weapon is. 

**8. Miscellaneous Weapon Properties** - Here general properties are displayed, such as whether the weapon is in the offhand, whether it's a two-handed weapon, or whether the weapon is loaded. 
  * <span class="lc-icon"></span>- Left click on the Loaded property to manually load or unload the Weapon. See $Weapon Rolls$ for more information on weapon loading. Additionally, if the weapon has the *Repeater* Quality, this will instead be a numeric value. e.g. `4/4 Loaded`. Left clicking in this case will add 1 to the loaded value
  * <span class="rc-icon"></span>- Right Click to unload the weapon (or decrease loaded value by 1 if it is a repeater)

**9. Weapon Qualities and Flaws** - This shows what the weapon's current Qualities and Flaws are. Note that this is a compiled list taking all factors into account, such as ammo and skill. Note that if a Quality is greyed and crossed out, that means this Actor doesn't have the skill to use this weapon,  meaning they lose all qualities of the weapon (but not from ammunition).
  * <span class="lc-icon"></span>- Shows a textual description of the Quality or Flaw

**10. Ammunition Selector** - This selection allows you to change what ammo is being used by the weapon. 

**11. Weapon Range** - For Ranged Weapons, instead of Reach, their numerical Range is shown (taking currently used ammo into account). 
  * <span class="lc-icon"></span>- Left click on the Range value to display a breakdown of the Range Bands and what modifiers are applied to each band.
    * <span class="lc-icon"></span>- Left click on one of these range bands to roll an attack with that weapon preconfigured with that Range.

![image](https://user-images.githubusercontent.com/28637157/173974434-14758977-f6f5-40f8-88f7-ddaec1a73b68.png)

**12. Hit Location Header** - Shows the Hit Location as well as the current Damage Mitigation applied to that location. The Orange represents Armour, Blue represents Shield, and Green is the TB of the Actor.
  * <span class="rc-icon"></span>- Right click on the Armour or Shield AP values to reduce by 1, representing damage to the item (from things such as Hack or Critical Deflection)
  * <span class="lc-icon"></span>- Left click to repair/undo damage to that location

**13. Individual Armour AP** - Shows the AP value of each individual piece of armour worn
  * <span class="rc-icon"></span>- Right click on the Armour or Shield AP values to reduce by 1, representing damage to the item (from things such as Hack or Critical Deflection)
  * <span class="lc-icon"></span>- Left click to repair/undo damage to that location

**14. Armour Qualities and Flaws** - Lists the Qualities and Flaws of a specific piece of armour
  * <span class="lc-icon"></span>- Shows a textual description of the Quality or Flaw

**15. Mount Section** - Shows the current mount, if one exists. If the Actor is not mounted, this area will be blank. You can add a mount by dragging and dropping an Actor into the mount section. Note that both Actors must be in the **world**, you cannot add a mount from the Compendium. See $Mounting$ for more details. 
  * <span class="lc-icon"></span>- Left click on the mount's image to open the mount's Actor Sheet

**16. Mount Controls** - Here you can easily change the status of your mount
  * <span class="lc-icon"></span>- the `x` button removes the mount from the Actor
  * <span class="lc-icon"></span>- The `down arrow` button dismounts the actor, meaning the mount is still tied to the Actor, but they are not considered mounted. Click again to remount.