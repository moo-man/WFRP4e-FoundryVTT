---
layout: default
title: Adding Species
parent: Advanced Topics
nav_order: 20
---

{: .important}
> This page assumes your goal is to add new Species to the Character Creation application. This requires you to have 
> installed, enabled and initialized the [WFRP4e Core Module](https://foundryvtt.com/packages/wfrp4e-core). 
>
> See [Premium Content](../premium.md) for details.

Adding new Species and Subspecies requires modifying the WFRP4e's config. You can achieve this using either 
[World Script](./worldScripts.md) or Module.

Config data can be found under the `game.wfrp4e.config` as soon as `init` hook.  
Whenever this guide starts with `config` it means either `game.wfrp4e.config` or an object that will be merged with 
`game.wfrp4e.config`

### Table of Contents
- [Config Fields](#config-fields)
- [Creating Career's Rolltable](#creating-careers-rolltable)
- [Example 1: Add Wolfkin Species](#example-1-add-wolfkin-species)
- [Example 2: Add "Arctic" Subspecies to the Wolfkin Species](#example-2-add-arctic-subspecies-to-the-wolfkin-species)
- [Example 3: Add Career Replacements to Human and Human (Salzenmunder)](#example-3-add-career-replacements-to-human-and-human-salzenmunder)

## Config Fields
There are 16 fields pertaining to the Species and Subspecies used by Chargen. All values should share matching key 
representing the Species in their object field:

- [`species`](#species)
- [`speciesCharacteristics`](#speciescharacteristics)
- [`speciesSkills`](#speciesskills)
- [`speciesTalents`](#speciestalents)
- [`speciesRandomTalents`](#speciesrandomtalents)
- [`speciesTalentReplacement`](#speciestalentreplacement)
- [`speciesTraits`](#speciestraits)
- [`speciesMovement`](#speciesmovement)
- [`speciesFate`](#speciesfate)
- [`speciesRes`](#speciesres)
- [`speciesExtra`](#speciesextra)
- [`speciesAge`](#speciesage)
- [`speciesHeight`](#speciesheight)
- [`speciesCareerReplacements`](#speciescareerreplacements)
- [`extraSpecies`](#extraspecies)
- [`subspecies`](#subspecies)

For the purpose of this guide we will be using `wolfkin` as the **key** of our new custom Species.

### `species` 
Holds displayed name for the species.
```js
config.species.wolfkin = "Wolfkin";
```

### `speciesCharacteristics` 
Holds object of starting characteristics formulas
```js
config.speciesCharacteristics.wolfkin = {
  ws: "2d10+20",
  bs: "2d10+20",
  s: "2d10+20",
  t: "2d10+20",
  i: "2d10+20",
  ag: "2d10+20",
  dex: "2d10+20",
  int: "2d10+20",
  wp: "2d10+20",
  fel: "2d10+20"
};
```

### `speciesSkills` 
Holds array of species skills
```js
config.speciesSkills.wolfkin = [
    "Animal Care",
    "Charm",
    "Language (Wolventongue)",
    "Ranged (Throwing)"
];
```

### `speciesTalents`
Holds array of Talents granted by the species.
If a value contains a comma `,` Chargen will understand it as "either or" choice.
```js
config.speciesTalents.wolfkin = [
  "Argumentative",
  "Lightning Reflexes, Warrior Born"
];
```
Above will always give the `Argumentative` Talent and offer a choice between `Lightning Reflexes` and `Warrior Born`.
For adding Random Talents, see [below](#speciesrandomtalents)

### `speciesRandomTalents`
Holds an object of table keys and amount of randomized Talents
```js
config.speciesRandomTalents.wolfkin = {
  talents: 1,
  "talents-wolfkin": 2,
};
```
The above will draw 1 random Talent from generic `Talents - Character Creation` Rolltable that is shipped with WFRP4e Core module 
and 2 random Talents from user-defined Rolltable with `talents-wolfkin` key.

### `speciesTalentReplacement`
Holds object where both keys and values are Talent names. It will offer to replace key Talent with value Talent.
Typically unused with Species. 
```js
config.speciesTalentReplacement.wolfkin = {
    "Artistic": "Beneath Notice"
};
```
Above will allow this Species to make a choice of replacing `Artistic` Talent (if they rolled it from Random Talents) with 
the `Beneath Notice` Talent.

### `speciesTraits`
Hold an array of Traits granted by this Species.
Typically unused by most playable species
```js
config.speciesTraits.wolfkin = [
    "Arboreal"
];
```

### `speciesMovement`
Holds a number that defines the Species' Movement value.
```js
config.speciesMovement.wolfkin = 4;
```

### `speciesFate`
Holds a number that defines the Species' starting amount of Fate Points.
```js
config.speciesFate.wolfkin = 1;
```

### `speciesRes`
Holds a number that defines the Species' starting amount of Resilience Points.
```js
config.speciesRes.wolfkin = 2;
```

### `speciesExtra`
Holds a number that defines the Species' amount of extra Points to distribute between Fate and Resilience.
```js
config.speciesExtra.wolfkin = 2;
```

### `speciesAge`
Holds a Formula used to determine the character's age. 
```js
config.speciesExtra.wolfkin = "10+5d10";
```

### `speciesHeight`
Holds an object with data used to determine the character's height.
```js
config.speciesHeight.wolfkin = {
  die: "1d10",
  feet: 5,
  inches: 2
};
```
The above means the random height for Wolfkin is `5’2” + 1d10”`

### `speciesCareerReplacements`
Holds an object describing what available career replacements there are
```js
config.speciesCareerReplacements.wolfkin = {
  "Flagellant": ["Hunter"]
}
```
The above will allow Wolfkin to pick `Hunter` career in case they rolled `Flagellant`

{: .highlight}
> This is not typically used for new Species, as you should provide a dedicated [Random Career Table](#creating-careers-rolltable)
> 
> For existing Species it is also recommended to use the `game.wfrp4e.utility.mergeCareerReplacements` helper method 
> instead of direct definitions to avoid overwriting.
> 
> Check [Example 3](#example-3-add-career-replacements-to-human-and-human-salzenmunder) for details.

### `extraSpecies`
This is an array that holds keys of Species that should appear in Chargen separate from rollable playable Species. 
We use that when we want our Species to be available in Chargen for manual selection, but not necessarily rollable. 
```js
game.wfrp4e.config.extraSpecies.push("wolfkin");
```

### `subspecies`
This object holds nested Species->Subspecies objects. For example, `Human (Reiklander)` is described under 
`game.wfrp4e.config.subspecies.human.reiklander`. 

Available fields are:
- `name` — equivalent of `species`
- `characteristics` — equivalent of `speciesCharacteristics`
- `skills` — equivalent of `speciesSkills`
- `talents` — equivalent of `speciesTalents`
- `speciesTraits` — equivalent of `speciesTraits`
- `randomTalents` — equivalent of `speciesRandomTalents`
- `talentReplacement` — equivalent of `talentReplacement`
- `movement` — equivalent of `speciesMovement`
- `fate` — equivalent of `speciesFate`
- `resilience` — equivalent of `speciesRes`
- `extra` — equivalent of `speciesExtra`

{: .important}
> Subspecies override base Species. Whatever is not defined in Subspecies will be taken from Species.
> 
> For example, if Subspecies defines `skills` but not `talents`, then Skills will be **only** taken exclusively from 
> Subspecies (no skills from Species), but Talents will be taken from base Species.

## Creating Career's Rolltable

[TODO] - _<need v13 rolltable sheets updated with `key` and `column` inputs, make screenshots>_


## Putting it all together
### Example 1: Add Wolfkin Species

```js
Hooks.once("init", () => {
  const config = {
    species: {},
    speciesCharacteristics: {},
    speciesSkills: {},
    speciesTalents: {},
    speciesTraits: {},
    speciesRandomTalents: {},
    speciesTalentReplacement: {},
    speciesMovement: {},
    speciesFate: {},
    speciesRes: {},
    speciesExtra: {},
    speciesAge: {},
    speciesHeight: {}
  };

  config.species.wolfkin = "Wolfkin";
  
  config.speciesCharacteristics.wolfkin = {
    ws: "2d10+20",
    bs: "2d10+20",
    s: "2d10+20",
    t: "2d10+20",
    i: "2d10+20",
    ag: "2d10+20",
    dex: "2d10+20",
    int: "2d10+20",
    wp: "2d10+20",
    fel: "2d10+20"
  };

  config.speciesSkills.wolfkin = [
    "Animal Care",
    "Charm",
    "Language (Wolventongue)",
    "Ranged (Throwing)"
  ];

  config.speciesTalents.wolfkin = [
    "Argumentative",
    "Lightning Reflexes, Warrior Born"
  ];

  config.speciesRandomTalents.wolfkin = {
    talents: 1,
    "talents-wolfkin": 2,
  };

  config.speciesTalents.wolfkin = {
    "Artistic": "Beneath Notice"
  };

  config.speciesTraits.wolfkin = [
    "Arboreal"
  ];

  config.speciesMovement.wolfkin = 4;
  config.speciesFate.wolfkin = 1;
  config.speciesRes.wolfkin = 2;
  config.speciesExtra.wolfkin = 2;
  config.speciesExtra.wolfkin = "10+5d10";
  config.speciesHeight.wolfkin = {
    die: "1d10",
    feet: 5,
    inches: 2
  };
  
  foundry.utils.mergeObject(game.wfrp4e.config, config);
  game.wfrp4e.config.extraSpecies.push("wolfkin");
});
```

### Example 2: Add "Arctic" Subspecies to the Wolfkin Species
We will add a `Wolfkin (Arctic)` Subspecies, that will have different starting Talents and Random Talents.

```js
Hooks.once("init", () => {
  const config = {
    subspecies: {
      wolfkin: {},
    },
  };
  
  config.subspecies.wolfkin.arctic = {
    name: "Arctic",
    talents: [
      "Coolheaded",
      "Lightning Reflexes, Very Resilient",
    ],
    randomTalents: {
      "talents-wolfkin": 3,
    }
  };

  foundry.utils.mergeObject(game.wfrp4e.config, config);
});
```

### Example 3: Add Career Replacements to Human and Human (Salzenmunder)

Using the `game.wfrp4e.utility.mergeCareerReplacements` helper method we can safely add new career replacements without 
worrying about potentially overwriting different module (such as Up in Arms).
```js
Hooks.once("init", () => {
  game.wfrp4e.utility.mergeCareerReplacements({
    human: {
      "Soldier": ["Wizard"],
    },
    "human-salzenmunder": {
      "Engineer": ["Charlatan", "Thief"],
    },
  });
});
```

The above example makes it so all `Human` characters can now pick `Wizard` as a replacement for rolled `Soldier` 
(in addition to what they potentially can in case Up in Arms is enabled).

Additionally, `Human (Salzenmunder)` characters that rolled `Engineer` are now able to also choose either
`Charlatan` or `Thief`.
