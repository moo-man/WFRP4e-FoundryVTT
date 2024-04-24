---
layout: default
title: Effects Tab
parent: Actor Sheet Tabs
grand_parent: The Basics
---
The Effects tab lists both Items and Active Effects that modify the actor in some way. It lists Conditions, Temporary, Passive, Disabled, and Applied Effects, as well as Injuries, Criticals, Psychologies, Mutations, and Diseases. 

For more on Active Effects and their implementation in the WFRP4e System, see [Active Effects](../../effects/effects).

![effects](https://user-images.githubusercontent.com/28637157/174202800-8bb7c4e6-9eef-4673-b923-c8bcab3b025f.jpg)

**1. Condition Icons** - Shows the icon of each condition as it appears on the Actor token
  * <span class="lc-icon"></span>- Show a textual description of the Condition

**2. Condition Values** - Shows how many of a certain Condition exists on the Actor, or whether they have the Condition or not. 
  * <span class="lc-icon"></span>- Increase the Condition by one
  * <span class="rc-icon"></span>- Decrease the Condition by one   

**3. Temporary Effects List** - Temporary Effects are effects that last a certain amount of time, or are given special designation as Temporary. This designation is important because Temporary effects are the only type of effect shown on the token.
  * <span class="lc-icon"></span>- Left click on an Active Effect to open the $Active Effect Config$

**4. Effect Controls** - You can disable the effect <i class="fa-regular fa-circle-check"></i> or delete it outright <i class="fa-solid fa-trash-can"></i>

**5. Injury List** - Displays the list of Injury Items the Actor owns. Also displays the location of the injury and the duration.
  * <span class="lc-icon"></span>- Left click on the Injury name to show a dropdown description of the Injury. 
  * <span class="lc-icon"></span>- Left click on the duration to decrease it by 1 day.
  * <span class="rc-icon"></span>- Right click on the duration to increase it by one 1 day. 

**6. Critical List** - Displays the list of Critical Items the Actor owns. Also displays the location of the Critical.
  * <span class="lc-icon"></span>- Left click on the Critical name to show a dropdown description of the Injury. 

**7. Psychology List** - Displays the list of Psychology Items the Actor owns.

**8. Mutation List** - Displays the list of Psychology Items the Actor owns.

**9. Disease List** - Displays the list of Disease Items the Actor owns, as well as time for the disease to incubate and its duration. **Note**: This section does not appear to players, only the GM can see it. 
  * <span class="lc-icon"></span>- Left click incubation to start incubation, or decrease its duration by 1
  * <span class="lc-icon"></span>- Left click duration to start the duration, or decrease its duration by 1
  * **Note**: See $Disease$ for more information on how to use Diseases. 

**10. Passive Effects** - Passive Effects are generally effects that come from Items (such as Talents) that persist forever, unlike Temporary Effects, these do not show up on the Token. 
  * <span class="lc-icon"></span>- Left click on an Active Effect to open the $Active Effect Config$

**11. Invoke Effect Button** - This is an extra control button to execute an Invoke type Effect Script. For more on Effect scripts, see $Active Effects$.

**12. Disabled Effects** - All Active Effects that have been disabled show up in this list. 
  * <span class="lc-icon"></span>- Left click on an Active Effect to open the $Active Effect Config$

**13. Applied Effects** - Active Effects that are applied via targeting generally come from Items, and so can be applied via the "Apply" button that appears in their item dropdown. However, in the rare circumstance that they don't have a parent item, they show up here. 
  * <span class="lc-icon"></span>- Left click on an Active Effect to open the $Active Effect Config$

**14. System Effect Selector** - This selector lets a user add any general effect to the Actor. Effects that appear in this list sometimes don't have a parent item to go with it, or may just be useful to add without the parent Item. Examples include effects from the Stinking Drunk table, Exposure effects, and Symptoms. Notably, this is where you can add the Infighting effect, as well as the On the Defensive effect. See the $FAQ$ for more on Infighting and On the Defensive.