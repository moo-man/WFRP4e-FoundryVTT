---
layout: default
title: Create Token
parent: Scripts
nav_order: 48
grand_parent: Active Effects
---

This trigger runs when a Token is created from the Actor that owns this effect.

## Key

`createToken`

## Arguments 

`args` - the Token created

## Examples

### Glowing Token

**Usage**: When a Token is created, add light settings to that token.

```js
args.update({light : {
    "dim": 2,
    "bright": 1,
    "alpha": 0.5,
    "animation": {
        "speed": 4,
        "intensity": 4,
        "type": "pulse",
    },
    "color": "#949bff",
}});
```

**Notes**: This only affects new Tokens. It's recommended to use this in conjunction with an [Immediate](./immediate.md) to update all existing tokens with the same data. Use `this.actor.getActiveTokens()` to get a list of all active Tokens used by that Actor. 

Additionally, if desired, use [Effect Deleted](./deleteEffect.md) to reset the tokens and prototype token setting.
