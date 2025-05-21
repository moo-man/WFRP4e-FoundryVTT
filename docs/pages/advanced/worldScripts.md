---
layout: default
title: World Scripts
parent: Advanced Topics
nav_order: 0
---

World Scripts, similar to Modules and Macros, are a way for users to input additional functionality into Foundry VTT.

## Differences
### Macros
Macros in general are small, standalone pieces of code that are meant to only run once, when prompted and only on the 
side of the user triggering the Macro. As a rule of thumb, core Foundry VTT's Macros cannot "react" or "run when X" 
and generally are not allowed to run code on other users (unless assisted by the System or Modules)

### Modules
Modules are very similar to World Scripts, as both allow custom JavaScript files to be loaded and executed by Foundry.
The main difference is that one is attached to a Module and the other is attached to a World. Because of this, learning 
resources designed for modules are often also applicable to world scripts.

{: .highlight}
> Unless you specifically want to add always-on code to one world only, you should instead add your scripts to a local 
> module. There is a full guide for this 
> [made by GamerFlix](https://github.com/GamerFlix/foundryvtt-api-guide/blob/main/module_guide_create.md).

## Setup

To create a working World Script, you need to:
1. Modify the World's manifest file to tell Foundry to load that JS file. 
2. Create a JavaScript file(s) in your World's folder.

### Creating a JavaScript file and Modifying World's manifest file
To include a JavaScript file in your world, perform the following steps:
1. Shut down Foundry
2. Go to your World's folder (`Data/worlds/your-world/`) in your Foundry [User Data](https://foundryvtt.com/article/user-data/) folder 
3. Open the `world.json` file. This is your World's **manifest**. It contains all important configuration data about your World package. 
4. In your manifest, look for a line with `esmodules` key. If there isn't any, insert a new line with the following 
text: `"esmodules": ["your-script.mjs"],` anywhere (good place is for example right after line with `id`). 
The first five lines of the file could look, for example, like this:
```json
{
  "title": "Your World",
  "id": "your-world",
  "esmodules": ["your-script.mjs"],
  "system": "wfrp4e",
```
5. Please note that the comma is required at the end of **every** entry in JSON, except the last. 
If in doubt, use any available online "JSON Validators" to make sure your file is a valid JSON.
6. Save and close `world.json`.
7. In the same folder create a file and name it `your-script.mjs`. Make sure that its full name and extension are  
exactly matching the one that you added in step 4.
8. Launch Foundry and launch your world. 

{: .important}
> Every time you change _anything_ about the manifest file, you should fully restart the Foundry server. 
> 
> If you use Foundry App, that means restarting the App, if you use node.js, that means stopping and restarting the process.

{: .highlight}
> The actual name of your JavaScript file does not really matter, as long as it matches the path supplied in step 4. 
> Extension could be either `.js` or `.mjs` – it's customary to use `.js` for scripts and `.mjs` for ESModules, but both 
> will work just fine
> 
> Avoid spaces and special characters in your file names. Best practices often suggest keeping files named in `snake-case` 
> for scripts and `StudlyCaps` for classes. 
> 
> Common issue on Windows is that your file might in reality have `.mjs.txt` extension, so make sure to watch out for that


Congratulations, you now have a World Script that will be loaded and executed for every connecting user once upon login!

Let's test it!
1. Open your JavaScript file and add the following inside:
```js
alert("Hello World!");
```
2. Save the file and refresh the World (press F5, `CTRL+R` or use any other way of refreshing your browser)
3. You should be greeted by an alert popup. Now remove it so you don't annoy your players ;)


## Examples

### Item Availability
How can I add more Item availabilities?
{: .question}
```js
Hoks.once("init", () => {
  game.wfrp4e.config.availability = foundry.utils.mergeObject(game.wfrp4e.config.availability, {
    legendary: "Legendary",
    unique: "Unique"
  });
});
```

### Test Difficulties
How can I add custom Test difficulties?
{: .question}
```js
Hoks.once("init", () => {
  const config = {
    difficultyModifiers: {},
    difficultyLabels: {},
  };

  config.difficultyModifiers["godly"] = 100;
  config.difficultyModifiers["ungodly"] = -100;
  config.difficultyLabels["godly"] = "Godly (+100)";
  config.difficultyLabels["ungodly"] = "Ungodly (–100)";
  
  game.wfrp4e.config = foundry.utils.mergeObject(game.wfrp4e.config, config);
});
```

### Alternative XP Cost per Advance
I personally believe the 6th Skill Advancement should cost 10 XP because Actor currently having 5 Advances looks at the
first line in `XP Cost per Advance` table. System, however, calculates 15 XP. How can I change that?
{: .question}
```js
function myCalculateAdvCost(currentAdvances, type, modifier = 0) {
  let index = (Math.ceil(currentAdvances / 5) - 1);
  index = Math.max(0, index);

  if (index >= game.wfrp4e.config.xpCost[type].length)
    return game.wfrp4e.config.xpCost[type][game.wfrp4e.config.xpCost[type].length - 1] + modifier;

  return game.wfrp4e.config.xpCost[type][index] + modifier;
}

Advancement.calculateAdvCost = myCalculateAdvCost;
```

## Merging Hooks

{: .highlight}
> Examples that require Hooks are usually shown wrapped in their own `Hooks.once("init", () => { code here });` so they 
> can be copied and pasted in a working condition.
> 
> While it's not necessarily wrong to have multiple registered Hooks, sometimes it is cleaner to keep everything merged 
> under a single Hook. 

Using the above examples of Availability and Test Difficulties, merged Hook could look like this:

```js
Hoks.once("init", () => {
  const config = {
    availability: {},
    difficultyModifiers: {},
    difficultyLabels: {},
  };
  
  config.availability = {
    legendary: "Legendary",
    unique: "Unique"
  };

  config.difficultyModifiers["godly"] = 100;
  config.difficultyModifiers["ungodly"] = -100;
  config.difficultyLabels["godly"] = "Godly (+100)";
  config.difficultyLabels["ungodly"] = "Ungodly (–100)";
  
  game.wfrp4e.config = foundry.utils.mergeObject(game.wfrp4e.config, config);
});
```
or like this:
```js
function registerAvailability() {
  game.wfrp4e.config.availability = foundry.utils.mergeObject(game.wfrp4e.config.availability, {
    legendary: "Legendary",
    unique: "Unique"
  });
}

function registerDifficulties() {
  const config = {
    difficultyModifiers: {},
    difficultyLabels: {},
  };

  config.difficultyModifiers["godly"] = 100;
  config.difficultyModifiers["ungodly"] = -100;
  config.difficultyLabels["godly"] = "Godly (+100)";
  config.difficultyLabels["ungodly"] = "Ungodly (–100)";

  game.wfrp4e.config = foundry.utils.mergeObject(game.wfrp4e.config, config);
}

Hooks.once("init", () => {
  registerAvailability();
  registerDifficulties();
});
```