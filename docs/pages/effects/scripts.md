---
layout: default
title: Scripts
has_children: true
parent: Active Effects
---

{: .important}
There is sometimes more to an effect than just a single script! Some mechanical behavior in the game might need more than one script and specific configuration of the effect's application data.

While all scripts have their own arguments that are dependent on their triggers, all scripts have a **context** that can be accessed via `this`

`this.script` - The script object itself (see below)

`this.effect` - The Active Effect that owns the script

`this.item` - The Item that owns the Active Effect that owns the script (possibly null)

`this.actor` - The Actor that owns the Active Effect that owns the script directly, or owns the Item that owns the Active Effect

### The Script Object

The script object has data about the script, like it's label and code, but it also have some useful helper functions.

`script.notification(content, type)` - Creates a notification formatted as "**Effect Name**: Message"

`script.message(content, chatData)` - Creates a ChatMessage with the `alias` of the Actor or Item name owning the effect, and the `flavor` as the effect name

`script.getChatData()` - Creates a chat data object with the alias and flavor set as described above.

### Source Helpers

The Active Effect class also has some helpful getters 

`effect.sourceTest` - If this effect originated from a Test, like a spell's effect being applied to a target, this is how you can retrieve the data from that Test. 

`effect.sourceActor` - Similar to the above, but instead of retrieving the Test itself, it retrieves the Actor who performed that Test.

`effect.sourceItem` - Retrieves the Item that originally had the Effect.

### Additional Tips

- You can always add a `console.log(args)` to log exactly what's available in the script to the console

- Add `debugger` to the script to break upon reaching this statement (assuming DevTools is open)

- Enter the command `CONFIG.debug.scripts = true` which will add `debugger` to the beginning of every script. 