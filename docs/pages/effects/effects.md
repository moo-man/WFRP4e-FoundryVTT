---
layout: default
title: Active Effects
has_children: true
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

An important part of the effect system is considering *when* and *how* the effect applied and transferred. Consider a basic Talent that increases Strength, this effect simply runs on the owning Actor and increases its strength. But what if the effect was on a spell? A spell's effect generally should not run on the owning Actor, it needs to go through casting the spell, and may not run on the owner at all, but instead transfer to an entirely different Actor. However, an important paradigm of this system is that **all effects owned by the Actor directly are considered *applied***. Only effects owned by Items need to be configured in this way. 

The following elements are added to the Active Effect Config to handle the problem described above. Note that these are only added when the Effect is owned by an *Item*. As discussed above, effects owned by an Actor have been transferred/applied already, so these fields aren't relevant. 

![effect-config](https://github.com/moo-man/WFRP4e-FoundryVTT/assets/28637157/a54c2376-ae30-46e6-8402-db9d7f24e7bb)

### 1. Effect Application

This is the primary decider on how this effect is applied, but also works in conjunction with **Document Type** (see below). 

The options are as follows:

1. **Owning Document** - Transfer this effect directly to the owning Document.
2. **Damage** - This effect is transferred to another Actor via damage.
3. **Target** - This effect is applied via targeting
4. **Area** - This effect is applied via an Area Template, the template is placed on the canvas and the effect is given to tokens within the template.
5. **Aura** - This effect is applied via an Area Template attached to an Actor. Auras are applied like **Target** effects but create an Area Template around them. 
6. **Other** - This effect is not applied at all (typically used with custom scripts to handle transferring in specific ways)

### 2. Document Type

The Document Type is used as a specifier with **Effect Application**. See the examples below.

The options are as follows:

1. **Actor**
2. **Item**

Using **Effect Application** and **Document Type** together is the main way of configuring how effects get transferred.

| Effect Application | Document Type | Result |
|-----------------|-------|--------------------------------|
| Owning Document | Actor | Transferred to the owning Actor, for example, Talents generally use this. 
| Owning Document | Item  | Trnasferred to the Owning Item. This generally isn't used.
| Damage          | Actor | Transferred when the Actor does damage (transferred to the Actor taking damage)
| Damage          | Item  | Transferred when the Item does damage (transferred to the Actor taking damage)
| Target          | Actor | Transferred to the target Actor
| Target          | Item  | Transferred to the target Item (which Item is determined by **Filter** below)
| Area            | Actor | Places an Area Template on the canvas, and is transferred to Actors within
| Area            | Item  | Places an Area Template on the canvas, and is transferred to the Items owned by the Actors within
| Aura            | Actor | Places an Area Template on the canvas anchored to the owning Actor, and is transferred to Actors within that area
| Aura            | Item  | N/A
| Other           | Actor | Not transferred
| Other           | Item  | Not transferred

{: .important}
When an effect uses an **Item** type and is applied, it is *still created on the Actor* but usually has some data to tell the system internally to compute on a certain Item(s). This gives some distinct advantages as Foundry does not intend for effects owned by Items to be *for* the item, but for the Actor who owns it.

### 3. Avoid Test 

When an Effect is transferred, this option can add a method to avoid (abort the creation of) this effect under certain conditions

The options are as follows:

1. **Custom** - Define a custom Test that is performed
2. **Script** - Write a custom script to determine if the effect is avoided or not (return true to avoid)

### 4. Test Independent

This is a very specific property used with **Target**, **Area**, and **Aura** types. These can generally only be applied via a Test, like a spell placing an Area. However, with this option checked, the effect can be applied directly from the Actor sheet. This is useful for Items that don't perform tests, like Armour or Talents. 

### 5. Pre-Apply Script

This is also used with **Target**, **Area**, and **Aura** types, and runs this script before applying the effect. If the script returns true, the effect is applied, if false, it is aborted. This can be used, for example, if the Actor needs to roll a test before applying an effect to another Actor. 

### 6. Equip Transfer

Most often, trappings that have effects apply them specifically when worn or equipped. This uses **Owning Document** and **Actor** types, but this does not account for the Item being equipped, and thus always transfers the effect to the owning Actor regardless. This property adds an additional check, requiring the Item to be equipped for the effect to transfer. 

### 7. Enable Script

This script can automate whether the effect is enabled or disabled, the script should return true or false respectively.

### 8. Filter

This script has some essential uses when used with various **Effect Application** and **Document Types** combos. If the script **returns true** it is considered "Filtered" and not applied. 

| Effect Application | Document Type | Result (if filtered)|
|-----------------|-------|--------------------------------|
| Owning Document | Actor | N/A
| Owning Document | Item  | N/A
| Damage          | Actor | The effect is not created on the damaged Actor
| Damage          | Item  | The effect is not created on the damaged Actor
| Target          | Actor | The effect is not created on the targeted Actor
| Target          | Item  | The effect is created on the targeted Actor, but only runs on Items not filtered
| Area            | Actor | The effect is not applied to the Actor within the Area
| Area            | Item  | The effect is created on the Actor within the Area, but only runs on Items not filtered
| Aura            | Actor | The effect is not applied to the Actor within the Aura
| Aura            | Item  | The effect is created on the Actor within the Area, but only runs on Items not filtered
| Other           | Actor | N/A
| Other           | Item  | N/A

### 9. Prompt

This is generally only used for **Item** Document Types, which lets the user select the Item to apply to. For example, if a spell modifies a weapon's damage (using a **Filter** to only apply to weapons). If **Prompt** is false, it would apply to all weapons, if it's true, a dialog to select which weapon(s) to apply to will be provided..


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
