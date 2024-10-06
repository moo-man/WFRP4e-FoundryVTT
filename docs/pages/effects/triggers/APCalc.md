---
layout: default
title: Armour Calculation
parent: Scripts
nav_order: 17
grand_parent: Active Effects
---

This trigger runs after Armour has been computed into layers on the various hit locations. You can use this script to add more layers.

Note that the scripts below don't actually manipulate `args` directly, but call a helper function to handle adding armour layers.

## Key

`APCalc`

## Arguments 

```js
args.AP = {
            head: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Head"),
                show: true,
            },
            body: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Body"),
                show: true
            },
            rArm: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Right Arm"),
                show: true
            },
            lArm: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Left Arm"),
                show: true
            },
            rLeg: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Right Leg"),
                show: true

            },
            lLeg: {
                value: 0,
                layers: [],
                label: game.i18n.localize("Left Leg"),
                show: true
            },
            shield: 0,
            shieldDamage: 0
        }
```

## Examples

### Add AP to all locations

**Usage**: Adds 2 to all AP locations. 

```js
this.actor.system.status.addArmour(2, {source: this.effect})
```

**Notes**: You can add the `locations` property to the second argument, i.e. `locations: ["head", "lArm", "body"]`, as well as `magical: true`

---

### Add AP to the Head location

**Usage**: Adds 1 magical AP to the head location. 

```js
this.actor.system.status.addArmour(1, {locations : "head", source : this.effect, magical : true})
```


