---
layout: default
title: Pre-Update Document
parent: Scripts
nav_order: 4
grand_parent: Active Effects
---

Pre Update Document scripts are executed right before the document is updated, i.e. right before the data is sent to the database. This lets you intercept and modify this data, or abort the process.

Note this trigger covers multiple scenarios: 

1. Actor data gets updated (like changing the name or age)

2. Item data gets updated (adding/modifying/deleting an owned item)

3. Effect data gets updated (adding/modifying/deleting a *directly* owned Effect, not an effect on an owned item)

See **Arguments** for how to determine what called the script. 

## Key

`preUpdateDocument`

## Arguments 

`args.type` - "item", "effect", or "data" for actor data updates

`args.data` - data used for creating or updating the Document

`args.options` - options used in this update

`args.options.action` - "create", "update", or "delete", only used if not "data" type update.

`args.document` - If item or effect is `args.type`, this is the corresponding Document.

`args.user` - ID of the user performing the update

## Examples

### Prevent Healing

**Usage**: Prevents any update to Wounds resulting in a higher current wounds value

```js
if (args.type != "data")
{
  return;
}

let wounds = foundry.utils.getProperty(args.data, "system.status.wounds.value")
if (wounds > this.actor.system.status.wounds.value)
{
	this.script.notification("Cannot Heal Wounds");
    delete args.data.system.wounds.value;
}
```

**Notes**: Because the update hasn't been sent to the database yet, we can compare the to-be-updated Wounds value with the current Wounds value. If the update is trying to increase Wounds (heal), simply delete the new wounds value from the data to be sent to the database, preventing it from occuring. 


### Prevent Condition(s)

**Usage**: Aborts adding an effect if it is a certain condition

```js
if (args.type == "effect" && args.options.action == "create" && ["ablaze", "prone", "poisoned"].some(i => args.document.statuses.has(i)))
{
  this.script.notification("Immune to " + args.document.name);
  return false;
}
```

**Notes**: We check to see if the condition added is ablaze, prone, or poisoned, if so, because the update hasn't been sent to the database yet, we can simply return false, telling Foundry to abort the update entirely. This is preferable to doing in [On Update](./update), which removes the condition after it's added. This is important if the effect has any immediate scripts, which would be executed.

Also it's worth noting that this script will only prevent creation. If it should remove ablaze, prone, and poisoned that already existed, that would need to be a separate immediate script. 