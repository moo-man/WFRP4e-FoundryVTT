---
layout: default
title: Add Items
parent: Scripts
nav_order: 3
grand_parent: Active Effects
---

Perhaps the name of this trigger is confusing, but the intention behind using is *to add items*, it does NOT run when items are added. More specifically, it is similar to the [Immediate](./immediate) Trigger, but runs *after* creation is completed. This is particularly important because the ID of the effect and item have been created and can be used for referencing any Items created with this trigger. 

## Key

`addItems`

## Arguments 

`args.data` - The data used to create the Document (Item or Active Effect data)

`args.options` - options used to create the Document

`args.user` - User ID initiating the document creation

## Special Features

When adding items with this script, remember to add `{fromEffect : this.effect.id}` to the second argument (the options) of the creation function. See the examples below. 

{: .question}
> What is `fromEffect?`
> 
> `fromEffect` is generally set to the ID of the effect being created. This lets the system know that when the effect is deleted, it should also delete the Items. 
>
> If you don't want this to happen (i.e. gaining the Items permanently) you can omit this argument and/or use the [Immediate](./immediate) trigger.

## Examples

### Add the Fear (2) Trait

**Usage**: Adds the Fear trait, specifying the Rating of 2

```js
let item = await fromUuid("Compendium.wfrp4e-core.items.Item.pTorrE0l3VybAbtn")
let data = item.toObject();
data.system.specification.value = 2
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
```

---

### Add the Flight Trait

**Usage**: Adds the Flight trait, specifying the Rating as the Actor's Agility value

```js
let flight = await fromUuid("Compendium.wfrp4e-core.items.EO05HX7jql0g605A");
let data = flight.toObject();
data.system.specification.value = this.actor.characteristics.ag.value;
this.actor.createEmbeddedDocuments("Item", [data], {fromEffect : this.effect.id})
```

---

### Add Armour, Fury, and Horns

**Usage**: Adds multiple Traits (represesting some sort of transformation): Armour (1), Fury, and Horns (6)

```js
let armour = await fromUuid("Compendium.wfrp4e-core.items.VUJUZVN3VYhOaPjj")
let armourData = armour.toObject()
armourData.system.specification.value = 1
 
let fury = await fromUuid("Compendium.wfrp4e-core.items.fjd1u9VAgiYzhBRp");
let furyData = fury.toObject();

let horns = await fromUuid("Compendium.wfrp4e-core.items.BqPZn6q3VHn9HUrW")
let hornsData = horns.toObject()
hornsData.system.specification.value = 6

this.actor.createEmbeddedDocuments("Item", [armourData, furyData, hornsData], {fromEffect : this.effect.id})
```