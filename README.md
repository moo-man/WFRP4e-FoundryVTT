# Warhammer Fantasy Roleplay 4th Ed. (FoundryVTT)

![](https://user-images.githubusercontent.com/28637157/97379891-e4a1cc00-1893-11eb-9e0c-d93b92844d5b.jpg)

![](https://img.shields.io/github/v/release/moo-man/WFRP4e-FoundryVTT?label=Latest%20Version)

![](https://img.shields.io/github/downloads/moo-man/WFRP4e-FoundryVTT/latest/wfrp4e.zip?label=Downloads%20%28Latest%20Version%29)

![](https://img.shields.io/badge/FoundryVTT%20Compatibility-V10-orange)

This system is intended for use with [Foundry Virtual Tabletop](http://foundryvtt.com/) to play in the grim and perilous world of Warhammer.

## Installation - Auto Installer (Recommended)

You can install the system from the Foundry system installer, simply search for Warhammer Fantasy and it should show in the results.

## Current State

**Version 1.0** marked, by our estimation, where the system is fully equipped with all the necessary features as well as the bells and whistles that should provide a very smooth experience when playing Warhammer Fantasy 4th Edition.

**Version 2.0** marked the removal of content due to increasing copyright concerns. Luckily Cubicle 7 was open to supporting Foundry officially, bringing us to 3.0

**Version 3.0** brought back warhammer better than ever, the official modules provided by me working with Cubicle 7 brings the Warhammer system to the forefront of the possibilites of gaming in Foundry VTT and the seamlessness of official content to make the GM's life easier. See below for more details on official modules.

**Version 4.0**, Foundry 0.8.x compatible, major refactoring for cleaner code to take advantage of the Document refactor.

**Version 5.0**, Compatible with Foundry V9

**Version 6.0**, The current version, compatible with V10, which uses a bundler, see **Environment Setup**

Please feel free to message me on Discord - Moo Man#7518

[Official Module Video](https://www.youtube.com/watch?v=uf7pqi7HpYY) - Goes through the initial official module offerings - Core, Starter Set, RNHD, and EIS

[1.0 Release Video](https://youtu.be/HMjXCLDDfWE)- Goes through the new features between Beta and 1.0

[Beta Release Video](https://www.youtube.com/watch?v=XMEJt5OB4Bc) - Goes through the NPC/Creature sheet, tables, items, as well as other features

[Alpha Video](https://www.youtube.com/watch?v=-CthIoE9o2E) - Shows off the initial character sheet and some functionality.

### Notable Features
- Opposed Test and Damage calculation that takes into account Size, weapons, armor (qualities and flaws), and talents

- Complete test result evaluation (everything from miscasting, ingredients, wrath of the gods, blackpowder misfires, overcasts)

- A complete character generation suite

- Random NPC generation tools that utilize career and race to generate NPC stat blocks

- Inventory management with complete support for drag and dropping items into containers, calculating total encumbrance.

- No need to calculate advancement costs, just click on a button to advance a characteristic/skill/talent and it automatically deducts exp

- A plethora of optional rules, such as Fast SL and Tests Above 100%

- Ability to edit and recalculate test results - because we all know how many modifiers we forget in 4e!

- Easy monetary commands, post payment/reward requests and availability rolls, which can be clicked to automatically roll or deduct money\

- Automated Conditions! Apply conditions with a click of a button, prompted for you during combat!

- Mounts! Saddle up and easily have the benefits of mounts calculated for you.

- Automated Talents: Slayer, Instinctive Diction, Robust, Resolute, Daemonic, name a talent, we've got it. 

### Thanks
I also wanted to thank the following for the help in continuing to improve the system with various feature contributions or fixes!
- silent_mark
- JDW
- Jagusti  
- LeRatierBretonnian
- HerveDarritchon
- DasSauerkraut
- Forien


## Environment Setup

If you want to contribute to system development, clone the project to any folder to begin setting up your environment

### 1. Install Dependencies

```
npm install
```
### 2. Configure your Foundry Data Path

Copy and rename `example.foundryconfig.json` to `foundryconfig.json` and change the `path` property to your Foundry's Data location

### 3. Build the project

```
npm run build
```
This will build the project into the location specified by the path property in step 2, which provides a working system that Foundry can use.

## Modules

**Official**

- [Core Module](https://foundryvtt.com/packages/wfrp4e-core/) - Adds the Core Rulebook support, all the compendium packs, tables, and features!

- [Starter Set](https://foundryvtt.com/packages/wfrp4e-starter-set/) - Adds the Starter Set Adventure and Setting material. Explore Ubersreik in this fully integrated module!

- [Rough Nights & Hard Days](https://foundryvtt.com/packages/wfrp4e-rnhd/) - Adds the 5 new and classic adventures, with fully detailed actors, items, and journal entries. Includes new features like a clock and gnome character generation

- [Enemy In Shadows](https://foundryvtt.com/packages/wfrp4e-eis/) - The entire Enemy In Shadows campaign and companion, including tables, mutations, spells, talents, and so much more to start your players on the incredible Enemy Within campaign.

- [Ubersreik Adventures I](https://foundryvtt.com/packages/wfrp4e-ua1/) - 6 ready to play adventures within the Duchy of Ubersreik, the best resource to expand Starter Set with.

- [Death on the Reik](https://foundryvtt.com/packages/wfrp4e-dotr/) - The entire Death on the Reik campaign and companion, including tables, mutations, spells, talents, as well as integrated trading rules!

- [Middenheim: City of the White Wolf](https://foundryvtt.com/packages/wfrp4e-middenheim/) - Dive into the centre of Ulrican influence and power in the Old World and explore Middenheim, the heart of the Empire's North.

- [Archives of the Empire: Vol 1.](https://foundryvtt.com/packages/wfrp4e-archives1/) - A fascinating and diverse collection of articles on topics that cover the length and breath of the Old World.

- [Power Behind the Throne](https://foundryvtt.com/packages/wfrp4e-pbtt/) - Carrying on from where Death of the Reik left off, Power Behind the Throne takes your brave heroes from Altdorf to the city of Middenheim, a towering city-state in the north of the Empire where trouble brews and a play for power is made.

- [Altdorf: Crown of the Empire](https://foundryvtt.com/packages/wfrp4e-altdorf/) - A fascinating and entertaining guide to the capital, the nexus of government, religion, magic and military power in the Empire. Each district is carefully detailed with a wide variety of locations, plot hooks, and NPCs.

- [The Horned Rat](https://foundryvtt.com/packages/wfrp4e-horned-rat/) - The penultimate volume of the five-part series of the Enemy Within campaign. Includes lore, spells, items, and weapons, and enemies centered on the Skaven and their wicked schemes. 

- [Empire in Ruins](https://foundryvtt.com/packages/wfrp4e-empire-ruins/) - The final part of the five-part series of grim and perilous Warhammer Fantasy Roleplay adventures.

- [Archives of the Empire: Vol 2.](https://foundryvtt.com/packages/wfrp4e-archives2/) - A varied collection of excellent and entertaining expansions to any gaming table.

- [Up In Arms](https://foundryvtt.com/packages/wfrp4e-up-in-arms/) - Provides options and guidance for Warhammer Fantasy Roleplay Characters who follow warrior careers. It focuses on abilities that players and GMs can make use of to add variety and expertise to the fighting folk of the Old World in Warhammer Fantasy Roleplay

- [Winds of Magic](https://foundryvtt.com/packages/wfrp4e-wom/) - A comprehensive guide to the practices and traditions taught by the eight Colleges of Magic. As well as providing background to the development of magic in the Empire it includes details of a multitude of magic practices, creatures, and places.

- [The Imperial Zoo](https://foundryvtt.com/packages/wfrp4e-zoo/) - A bestiary and travelogue of three daring expeditions into the Old World, ranging from the heights of Karak Kadrin to the city of Miragliano in the southern land of Tilea, and including dozens of creatures, beasts and monsters.


**Unofficial**

- [The GM Toolkit](https://foundryvtt.com/packages/wfrp4e-gm-toolkit) - Adds advantage automation, extends the Token HUD for more information, and adds useful macros!

- [Unofficial Grimoire](https://foundryvtt.com/packages/wfrp4e-unofficial-grimoire) - Adds new spells and an Elementalist and Druid career

- Fan-made Maps for [Ubersreik](https://foundryvtt.com/packages/wfrp4e-ubersreik-maps), [Enemy In Shadows](https://foundryvtt.com/packages/wfrp4e-eis-maps), [Death on the Reik](https://foundryvtt.com/packages/wfrp4e-dotr-maps), and [Power Behind The Throne](https://foundryvtt.com/packages/wfrp4e-pbth-maps)

**Out of Date or Abandoned**

- [Arcane Marks & Careers](https://foundryvtt.com/packages/arcane-marks-careers) - I've made a module out of my [homebrew supplement](https://drive.google.com/file/d/1uTy2r0EDMdcISFqqyxeIOSadtzz-OTAg/view) which can also serve as an example for others to build off of. It includes a compendium pack of all the careers as well as tables to roll for marks. 

- [Character Detail Generator](https://foundryvtt.com/packages/wfrp4e-character-details) - Generates additional information for characters, including birth date and star sign.

- [Eye for an Eye Adventure](https://github.com/CStuartEKerrigan/WFRP-e4e-4e-FVTT) - Converted 3e adventure complete with tokens, maps, audio, and macros!

- [Night of Blood](https://github.com/CStuartEKerrigan/WFRP-Night-of-Blood-4e-FVTT) - The classic Night of Blood Adventure ready to go!




