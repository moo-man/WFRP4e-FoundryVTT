---
layout: default
title: Active Effects
---

{: .highlight}
This page assumes you have a basic understanding of the Foundry ecosystem, such as familiarity with the concept of Documents, Embedded Documents, Compendium Packs, etc. 

Active Effects ("effects" from here-on), on a basic Foundry level, are Embedded Documents that modify properties on its parent (or grandparent) Actor. This happens in the middle of the Actor's data preparation cycle, which is where all the math happens that calculates various values within the Actor. Data preparation happens upon loading the world or updating the Actor.

Foundry provides the basic implementation of this out of the box, but it is limited to what is described above, it can only modify data points on the Actor. In **WFRP4e**, this has a few applications, however, the system adds many advanced features to enable effects to perform much more powerful operations. 

If you wish to continue with the basics, continue reading through the next sections, if not, skip to the @@SCRIPTS@@ section

## Effect Application / Transfer

Before we talk about how an effect changes data, it's vital to understand the idea of **Effect Application** (though will likely be renamed at some point to **Effect Transfer**, as **Application** is not referring to the UI, but the nature of *applying* the effect.)

{: .important}
What follows in this section is a paradigm I've created specifically for the **Warhammer** systems and may not be relevant or correct for others.

...
TODO
...

## Changes

Active Effect **Changes** are what Foundry provides out of the box. An effect can have multiple changes, and each change has 3 properties, a **Key**, **Mode**, and **Value**

* **Key** — Also could be described as a *path*, this is what property is being changed. Each Document has some data properties, and some properties also have properties, etc. So the key is a path to the value to change. For example, `system.characteristics.ws.modifier` is the path to modify the Weapon Skill of an Actor.

* **Mode** — What operation to perform, such as **Add** or **Override**. There are other options, but those two are the only one's used in the system. 

* **Value** — The value to modify the property with

So, for example, if we wanted to subtract 10 from Fellowship, the **Key** would be `system.characteristics.fel.modifier`, the **Mode** would be `Add`, and the **Value** would be `-10`

{: .important}
It's important to remember that **Items are not data properties of an Actor** and therefore **changes cannot add a bonus or penalty to skills**! This is a common thing users attempt to accomplish with **Changes**, but is simply not supported. If you wish to add a modifier to a skill via an effect, see the @@LINK@@ example in the @@SCRIPTS@@ section

### Keys

Here is a list of useful keys used to modify Actors


#### Characteristics

| Characteristic                 | Key                            |
|:-------------------------------|:------------------------------:|
|Weapon Skill                    | `system.characteristics.ws.*`  |
|Ballistic Skill                 | `system.characteristics.bs.*`  |
|Strength                        | `system.characteristics.s.*`   |
|Toughness                       | `system.characteristics.t.*`   |
|Initiative                      | `system.characteristics.i.*`   |
|Agility                         | `system.characteristics.ag.*`  |
|Dexterity                       | `system.characteristics.dex.*` |
|Intelligence                    | `system.characteristics.int.*` |
|Willpower                       | `system.characteristics.wp.*`  |
|Fellowship                      | `system.characteristics.fel.*` |

Where `*` could be a few options

`initial` - Modifies the initial characteristic value (used for Talents such as **Savvy** or **Suave**)

`modifier` - Modifies the characteristic total value

`calculationBonusModifier` - A mouthful, but a useful tool to offset characteristic modifiers and prevent changing derived values (see examples)

#### Movement

`system.details.move.value` - Modifies the base movement value

### Examples

**Add 10 to Weapon Skill Modifier**

| Key | Mode | Value |
|:--- |:----:|:-----:|
| `system.characteristics.ws.modifier` | Add | 10 |

**Decrease Movement by 1**

| Key | Mode | Value |
|:--- |:----:|:-----:|
| `system.details.move.value` | Add | -1 |

**Add 20 to Toughness Modifier**

| Key | Mode | Value |
|:--- |:----:|:-----:|
| `system.characteristics.t.modifier` | Add | 20 |
| `system.characteristics.t.calculationBonusModifier`* | Add | -2 |

{: .question}
>\***What is `calculationBonusModifier`?**
>
> This property is how the system handles *temporary changes to characteristics that affect a derived property*. For an example, Wounds is a derived property, it is calculated with Strength, Toughness, and Willpower. Now, whether an effect that changes Toughness should also change Wounds is dependent on the nature of the effect. In [Cubicle 7's FAQ](https://cubicle7games.com/blog/wfrp-faq#:~:text=It%E2%80%99s%20worth%20noting%20that%20temporary%20changes%20to%20Characteristics%20don%E2%80%99t%20cause%20this%20recalculation%3A%20so%20a%20Blessing%20of%20Hardiness%20(WFRP%2C%20page%20221)%20does%20not%20give%20additional%20Wounds%2C%20for%20example.), they inform us that temporary increases to characteristics (such as from Spells or Miracles) do not modify Wounds. That is what this property is for, it tells the system that *when calculating, modify the bonus from this characteristic before using it in the formula*. In this example's case, we're offsetting the +2 TB received from the +20 modifier with a -2. 

However, this about the extent of support that **Changes** has with **WFRP4e**. Below, in the **Scripts** section, we talk about the much more powerful things effects can achieve. 

## Scripts


(a lot) TODO
