---
layout: default
title: Troubleshooting
nav_order: 60
---

{: .warning}
> Do you have an **immediate/time sensitive** problem (e.g. you're in the middle of a session and you need help)? Your best course of action is to **join a Discord and ask the question there**. The Bug Reporter or Email will not have a quick response time and are not very suitable for back-and-forth troubleshooting.  
>
> [FoundryVTT Discord (recommended)](https://discord.gg/foundryvtt) - Describe your problem in the `#warhammer` channel for support.  
> [Moohammer Discord](https://discord.gg/GrMcdeDHh8) - Describe your problem in the `#wfrp` channel for support.  
> [Rat Catcher's Guild Discord](https://discord.gg/key8RMSCSb) - Describe your problem in the `#the-foundry-vtt` channel for support.  
>
> *Even so, there might simply not be anyone online that can help. You can also send a message to me directly on Discord (`moo.man`), and I will try to help if I am available.*

{: .question}
Everything broke after an update! What do I do?

Your first troubleshooting steps should always be:

1. Ensure the WFRP4e **System** is up to date. 
2. Ensure the WFRP4e **Core Module** is up to date.
3. **IMPORTANT**: Ensure the **Warhammer Library** module is up to date, this is a foundation of code that the system is built off of, and is often forgotten in updates. 
4. Disable all other modules.

If this does not resolve the problem, it's time to consult the above Discords. If you do not use Discord, you can email me. See the [home page](./home.md).

{: .question}
Did you find a typo or some data error?

Fill out a Bug Report, selecting the `Domain` as whatever module has the error, and select `Text or Data` as the Label

{: .question}
Is some automated behavior not working right?

The first step in troubleshooting should **ALWAYS** be disabling all non-official modules. If the behavior persists and you are confident it's not the correct behavior, fill out a Bug Report

If you're not confident or unsure, you can always pop in one of the Discords (see above) to ask!

### Frequently Encountered Problems

{: .question}
All of the Talent Bonuses have disappeared from the roll dialog, so I can't select them to gain bonus SL.

This is a consequence of the Effect Refactor. You are likely using Talents that have Effects coded from before the Refactor. See the [Effect Refactor](./effects/effect-refactor#tldr-what-should-i-do-so-my-game-doesnt-break)

{: .question}
There's an unremovable Fear icon on a Token

This is a status effect that comes from the "Fear" Extended Test. See [Extended Tests](./basics/actor-tabs/skills.md). This Test must be removed or completed. 

### The Bug Reporter

As discussed in the warning above, please do not use the Bug Reporter for general help requests if something goes wrong. Don't panic, just join one of the Discords and someone will most likely be able to help you. 