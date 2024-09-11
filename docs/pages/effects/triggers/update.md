---
layout: default
title: On Update
parent: Scripts
nav_order: 5
grand_parent: Active Effects
---

Similar to [Pre-Update](./preUpdate), but this occurs after the update. It is useful to respond to an update under certain conditions. 

## Key

`update`

## Arguments 

`args.data` - data with which to update the document

`args.options` - options used in this update, not generally used

`args.user` - ID of the user performing the update

## Examples

### Immune to the Broken Condition

**Usage**: Automatically removes any Broken conditions the Actor receives.

```js
let broken = this.actor.hasCondition("broken")
if (broken)
{
    broken.delete();
    this.script.notification("Removed Broken")
}
```

{: .question}
Why don't we use [Pre Update](./preUpdate) to prevent the update entirely?

The Pre-Update trigger is meant for *data* updates to the Actor, i.e. editing any sort of properties on the Actor itself, not its Embedded Documents.

---

### Un-removable Fatigued Condition

**Usage**: Automatically add Fatigued conditions to the Actor if none exists.

```js
let fatigued = this.actor.hasCondition("fatigued")
if (!fatigued)
{
    this.actor.addCondition("fatigued");
    this.script.notification("Added Fatigued")
}
```

---