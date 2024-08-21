---
layout: default
title: Pre Update
parent: Scripts
nav_order: 4
grand_parent: Active Effects
---

Pre Update scripts are executed right before the document is updated, i.e. right before the data is sent to the database. This lets you intercept and modify this data.

## Key

`preUpdate`

## Arguments 

`args.data` - data with which to update the document

`args.options` - options used in this update, not generally used

`args.user` - ID of the user performing the update

## Examples

### Prevent Healing

**Usage**: Prevents any update to Wounds resulting in a higher current wounds value

```js
let wounds = foundry.utils.getProperty(args.data, "system.status.wounds.value")
if (wounds > this.actor.system.status.wounds.value)
{
	this.script.notification("Cannot Heal Wounds");
    delete args.data.system.wounds.value;
}
```

**Notes**: Because the update hasn't been sent to the database yet, we can compare the to-be-updated Wounds value with the current Wounds value. If the update is trying to increase Wounds (heal), simply delete the new wounds value from the data to be sent to the database, preventing it from occuring. 