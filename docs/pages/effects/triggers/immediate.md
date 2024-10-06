---
layout: default
title: Immediate
parent: Scripts
nav_order: 1
grand_parent: Active Effects
---
Immediate scripts are executed as it's being created on the Document. This is for any effect that should do some action *one time.* Common use cases are applying a static amount of Damage, adding conditions, or invoking Tests.

{: .warning}
Immediate scripts shouldn't be used for adding Items to the parent Actor. See the [Add Items](./addItems.md) trigger.

## Key
`immediate`

## Arguments 

`args.actor` - The Actor executing the script, this Actor owns the Effect (or owns the Item that owns the Effect) with the script. 

`args.data` - The data used to create the Document (Item or Active Effect data)

`args.options` - options used to create the Document

`args.user` - User ID initiating the document creation

## Special Features

If an Effect has no other scripts or changes than their immediate scripts, it should likely be deleted when it is finished executing. There are two ways to do this. 

1. When the Immediate trigger is selected, a checkbox is shown for whether the effect should be deleted. 
2. The script can `return false` to denote that the effect should be deleted. 

## Examples

### Stun

**Usage**: Add a Stunned Condition

```js
args.actor.addCondition("stunned")
```

**Notes**: `this.actor` also works.

---

### Prompt Value

**Usage**: The Item added needs to have some value to be defined, such as Ward, or Corruption strength. This script prompts the user with a Dialog whenever this Item is added to an Actor

```js
if (!this.item.system.specification.value)
{
    let value = await ValueDialog.create({title : "Value", text : "Enter Value"});
    if (value)
    {
     this.item.updateSource({"system.specification.value" : value});
    }
}
```

**Notes**: Since Immediate scripts run *before* the Item or Effect has completed creation, `this.item.updateSource` tells Foundry to use this data when creating the Document. See the [Add Items](./addItems.md) Trigger for examples on how to update the parent Document after creation. 

---

### Add SL Blinded Conditions

**Usage**: Adds Blinded Conditions to the Actor, the amount of which depends on the SL of the Test (this script is assumed to be used with a Spell or Prayer Effect)

```js
this.actor.addCondition("blinded", Math.max(0, this.effect.sourceTest.result.SL))
```

**Notes**: Remember that `this.actor` is not going to be the owner of the Item used to generate SL (the Spell or Prayer), but the Actor it is being applied to. See the next example for how to use the original owning Actor. 

---

### Heal Willpower Bonus Wounds

**Usage**: Heals wounds equal to the caster's willpower (this script is assumed to be used with a Spell or Prayer Effect)

```js
let caster = this.effect.sourceActor;

this.actor.modifyWounds(caster.system.characteristics.wp.bonus);

this.script.message(`Healed ${caster.system.characteristics.wp.bonus} Wounds`);
```

**Notes**: Remember that `this.actor` is the Actor the effect is running on, `this.effect.sourceActor` is a getter for the Actor the effect came from.