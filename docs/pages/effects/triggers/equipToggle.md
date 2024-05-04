---
layout: default
title: Equip Toggle
parent: Scripts
nav_order: 6
grand_parent: Active Effects
---

The Equip Toggle only runs when the effect is set to `Item` Document Type, more specifically, it executes when its parent Item's equip value changes. This is useful for the common case where a magical necklace, armour, weapon, etc. might grant an Item (such as a Talent) only when worn.

## Key

`equipToggle`

## Arguments 

`args.equipped` - The updated "equipped" value. 

## Examples

### Add the Ward (8+) Trait when equipped

**Usage**: Adds the Ward trait, editing the specification to be 8. 

```js
if (args.equipped)
{
    let ward = await fromUuid("Compendium.wfrp4e-core.items.Bvd2aZ0gQUXHfCTh")
    wardData = ward.toObject()
    wardData.system.specification.value = "8"

    this.actor.createEmbeddedDocuments("Item", [wardData], {fromEffect : this.effect.id})
}
else
{
    this.effect.deleteCreatedItems()
}
```

**Notes**: While this trigger covers unequipping an Item, it does not inherently cover simply deleting it. If an Item is added via this trigger, then the effect's parent Item is deleted, the created Item will remain. However, by passing in `fromEffect` when creating the Item, the system handles deleting it alongside the effect. See [Add Items](./addItems) for more information.