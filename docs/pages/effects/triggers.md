---
layout: default
title: Triggers
has_children: true
parent: Active Effects
---

While all scripts have their own arguments that are dependent on their triggers, all scripts have a **context** that can be accessed via `this`

`this.script` - The script object itself (see below)

`this.effect` - The Active Effect that owns the script

`this.item` - The Item that owns the Active Effect that owns the script (possibly null)

`this.actor` - The Actor that owns the Active Effect that owns the script directly, or owns the Item that owns the Active Effect

### The Script Object

The script object has data about the script, like it's label and code, but it also have some useful helper functions.

`script.scriptNotification(content, type)` - Creates a notification formatted as "**Effect Name**: Message"

`script.scriptMessage(content, chatData)` - Creates a ChatMessage with the `alias` of the Actor or Item name owning the effect, and the `flavor` as the effect name

`script.getChatData()` - Creates a chat data object with the alias and flavor set as described above.


### Source Helpers

The Active Effect class also has some helpful getters 

`effect.sourceTest` - If this effect originated from a Test, like a spell's effect being applied to a target, this is how you can retrieve the data from that Test. 

`effect.sourceActor` - Similar to the above, but instead of retrieving the Test itself, it retrieves the Actor who performed that Test.

`effect.sourceItem` - Retrieves the Item that originally had the Effect.