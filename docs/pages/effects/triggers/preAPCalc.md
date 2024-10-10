---
layout: default
title: Pre-Armour Calculation
parent: Scripts
nav_order: 16
grand_parent: Active Effects
---

This trigger runs after the armour (AP) objcet has been initialized (as shown below).

## Key

`preAPCalc`

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

There are no scripts that currently use this trigger. Generally modifications to AP is used in [Armour Calculation](./APCalc.md)