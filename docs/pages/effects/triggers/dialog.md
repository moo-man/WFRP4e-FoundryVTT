---
layout: default
title: Dialog
parent: Scripts
nav_order: 2
grand_parent: Active Effects
---

Dialog scripts show up within the **Dialog Modifiers** section in roll dialog windows, and are able to be toggled on or off, causing some sort of behavior. They are probably the most powerful type of script, especially when used in conjunction with other scripts. They are unique in that they have their main script, which is generally used to modify the dialog fields (adding to modifier, SL bonus, etc.), but they also have 3 subscripts, described below. 

- Hide Script: Returning true with this script hides the option from selection, taking precedent over Activate Script

- Activate Script: Returning true with this script results in this modifier being automatically activated in the dialog window (as opposed to manually clicking on the option)

- Submission Script: This script runs when this script is *activated* and the dialog is submitted. Usually this is for setting some special flag for another script to use. See the examples below. 


## Key

`dialog`

## Arguments 

The `args` parameter corresponds the dialog application itself. which has some useful properties. 

`args.actor` - Actor performing the test (important distinction to `this.actor` because of the targeter option (see **Special Features**))

`args.characteristic` - The characteristic being used for the roll

`args.skill` - If a skill is being used, it is available here

`args.fields` - Specifically the editable properties (fields) in the dialog window

`args.fields.modifier` - The modifier field

&emsp;`fields.slBonus` - The slBonus field

&emsp;`fields.successBonus` - The successBonus field

&emsp;`fields.difficulty` - The difficulty field

&emsp;`fields.hitLocation` - The hit location selection field

&emsp;`fields.charging` - The charging checkbox

&emsp;`fields.dualWielding` - The dual wielding checkbox

&emsp;`fields.malignantInfluence` - The malignant influence checkbox

`args.flags` - An object that is intended to freely be used by scripts, it is useful to prevent duplicate executions, such as for Talents that have been taken multiple times but should only execute once. 


There are a plethora of other properties available to look at, you can use the console command `ui.activeWindow` with a dialog in focus to see everything available.

## Special Features

You can select dialog effects to apply not to yourself, but to anyone who targets you and opens a dialog. This is useful for effects that increase or decrease your defensive situation, such as "-20 to anyone attacking you with a ranged weapon."

## Examples

### Scale Sheer Surface Talent

**Usage**: This is a simple effect that automates a Talent's `Tests` property, that being +1 SL on a successful related Test. In this case, it's very straightforward: any Climb Test

#### Hide
```js
return args.skill?.name != "Climb";
```

#### Activate
```js
return args.skill?.name == "Climb";

```

#### Script
```js
args.fields.successBonus++;
```

**Notes**: We hide the option if the skill isn't Climb, and we activate it if the skill is Climb. Once activated, it adds 1 to the Success Bonus field

---
### The Carouser Talent

**Usage**: Now for something a little more complicated, the `Tests` property for this Talent is "Charm at Parties, Gossip at Parties, Consume Alcohol". We can't know if a character is at a party, so we have to do scripting a little differently

#### Hide
```js
return args.skill?.name != "Charm" && args.skill?.name != "Gossip" && args.skill?.name != "Consume Alcohol";
```

#### Activate
```js
return args.skill?.name == "Consume Alcohol";

```

#### Script
```js
args.fields.successBonus++;

```

**Notes** We hide the option if the skill is neither Charm, Gossip, or Consume Alcohol, as those are the only possible relevant ones. However, we *only* activate it if it's Consume Alcohol, as Charm and Gossip are under the condition of "At parties." which isn't possible to automate. As long as we don't hide the modifier, the user can select the option in the dialog if they meet the condition. 

---
### Deadeye Shot Talent

**Usage**: Deadeye shot lets us ignore the called shot penalty when using ranged weapons. 

#### Hide
```js
return ["roll", "none"].includes(args.fields.hitLocation) || args.item?.attackType != "ranged"
```

#### Activate
```js
return !["roll", "none"].includes(args.fields.hitLocation)
```

#### Script
```js
args.fields.modifier += 20;
```

**Notes** The Hide script hides this modifier if either "Roll" or "None" is selected as the hit location (which means not a called shot) OR if the weapon used isn't ranged, as that's only what the talent applies to. The Activate script activates if any option is selected as the hit location *except* "Roll" or "None", meaning it's a called shot. 

The script itself, +20 to the modifier field, offsets the normal penalty of -20. 

---


### Argumentative Talent

**Usage**: Argumentative has a normal Talent bonus: `Charm Tests when arguing and debating`, but also an additional effect of using the ones value of the roll as the SL of the test.  

#### Hide
```js
return args.skill?.name != "Charm";
```

#### Activate
```js
// No Activation script, there's no way to tell if the character is "arguing or debating"
```

#### Submission
```js
args.options.useOnesArgumentative = true;
```

#### Script
```js
args.fields.successBonus++;
```

**Notes** As mentioned above, there's two things this talent does, add success SL like normal talents, but also using the ones value of the roll as the SL, both of these fall under the same condition of "arguing or debating" so we can handle them together, however, we can't do everything with one script.

The **Submission Script** is `args.options.useOnesArgumentative = true;`, this adds a property to the `options` of the dialog, which is merged into the `options` property of the test itself. We can use this in conjunction with another script, see the [Roll Test](./rollTest#argumentative-talent) trigger to see how we can complete the Argumentative effect.
