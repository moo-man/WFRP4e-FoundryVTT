---
layout: default
title: Adding Lores
parent: Advanced Topics
nav_order: 10
---

Adding new Lores of Magic requires modifying the WFRP4e's config. You can achieve this using either [World Script](./worldScripts.md) or Module. 

Config data can be found under the `game.wfrp4e.config` as soon as `init` hook. There are 4 fields pertaining to the Magic Lores:
- `magicLores` – holds the names of Magic Lores. key is used to recognize lore programatically and value is displayed label
- `magicWind` – holds names of Winds linked to a given Lore, where key matches the key of an entry in `magicLores` 
and value is the displayed label of the Wind (used for example as specialization in Channelling skill)
- `loreEffectDescriptions` – holds the descriptions of Lores, where key matches the key of an entry in `magicLores` 
and value is string representing HTML that will be appended to the Spell's description 
- `loreEffects` – holds Object data for Active Effect, where key matches the key of an entry in `magicLores`

### Example: Simple Lore with Description

{: .question}
> I want to add a "Lore of Blood Magic", unrelated to Winds, with simple description and no automation:
>
> Blood Magic spells are forbidden and warp your soul. Every time you kill a target using one of your spells, gain 1 Corruption.

```js
Hooks.once("init", () => {
  const config = {
    magicLores: {},
    loreEffectDescriptions: {},
  };

  config.magicLores["blood-magic"] = "Blood Magic";
  config.loreEffectDescriptions["blood-magic"] = "<p>Blood Magic spells are forbidden and warp your soul. Every time you kill a target using one of your spells, gain 1 Corruption.";

  foundry.utils.mergeObject(game.wfrp4e.config, config);
});
```

### Example: Lore linked with Wind for Channelling, Description and Active Effect

{: .question}
> I want to add a "Lore of Ice" that is linked to "Azyr" Wind and has the following effects:
> 
> Ice Spells inflicting Damage cause the target to become _Chilled_ for one minute, reducing their Agility by 10 and 
> their Movement by 1 (down to minimum of 3). Target can suffer from only one _Chilled_ Effect at a time.

```js
Hooks.once("init", () => {
  const config = {
    magicLores: {},
    magicWind: {},
    loreEffectDescriptions: {},
    loreEffects: {},
  };

  config.magicLores.ice = "Ice";
  config.magicWind.ice = "Azyr";
  config.loreEffectDescriptions.ice = "<p>Ice Spells inflicting Damage cause the target to become <em>Chilled</em> for one minute, reducing their Agility by 10 and their Movement by 1 (down to minimum of 3). Target can suffer from only one <em>Chilled</em> Effect at a time.</p>";

  config.loreEffects.ice = {
    name: "Chilled",
    img: "icons/magic/water/ice-crystal-white.webp",
    duration: {
      seconds: 60
    },
    system: {
      transferData: {
        type: "target"
      },
      scriptData: [
        {
          label: "@effect.name",
          trigger: "prePrepareData",
          script: `
            args.actor.system.characteristics.ag.modifier -= 10;
            
            if (args.actor.system.details.move.value > 3)
              args.actor.system.details.move.value -= 1;
          `
        }
      ]
    }
  };

  foundry.utils.mergeObject(game.wfrp4e.config, config);
});
```