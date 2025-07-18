---
layout: default
title: Macros
has_children: true
nav_order: 10
---
## System Generated Macros
The system generates certain macros with drag and drop functionality.

### Dragging Items from Actors
These macros can be used if the actor is selected. Note the only item types this supports currently are weapons, skills, prayers, spells, and traits. 

![2020-01-31_19-43-10](https://user-images.githubusercontent.com/28637157/73584956-f586f380-4461-11ea-9a2c-d6c6811e0b59.gif)

### Dragging Actors and Journal Entries
These macros open the entity's sheet.
![2020-02-02_17-16-52](https://user-images.githubusercontent.com/28637157/73616990-e1690080-45df-11ea-9c23-381f57c85002.gif)

## Script Macros

Characteristics and skills can't be dragged, so they will have be entered manually into the macro, as shown below.

***

### Test a Characteristic

```js
game.wfrp4e.utility.rollItemMacro("ws", "characteristic");
game.wfrp4e.utility.rollItemMacro("bs", "characteristic");
game.wfrp4e.utility.rollItemMacro("s", "characteristic");
game.wfrp4e.utility.rollItemMacro("t", "characteristic");
game.wfrp4e.utility.rollItemMacro("i", "characteristic");
game.wfrp4e.utility.rollItemMacro("ag", "characteristic");
game.wfrp4e.utility.rollItemMacro("dex", "characteristic");
game.wfrp4e.utility.rollItemMacro("int", "characteristic");
game.wfrp4e.utility.rollItemMacro("wp", "characteristic");
game.wfrp4e.utility.rollItemMacro("fel", "characteristic");
```

***

### Test a Skill
Simply match the name of the skill you wish to roll for the test. 

```js
game.wfrp4e.utility.rollItemMacro("Athletics", "skill");
```

***

## Dialog Options

The third argument of `rollItemMacro` can be used to configure the dialog. 

`fields` - Concerns all the actual fillable fields within the dialog, the notable ones are 
- `modifier`, applied to the target number that is needed to be rolled
- `slBonus` always added to the number of Success Levels, regardless of whether the test has succeeded or failed
- `successBonus` - added to the number of Success Levels only if the test has succeeded

`appendTitle` - Adds a string to the title of the dialog and test

`skipTargets` - Whether or not to consider any targets in the test. If skipped, no opposed tests are created.t

`skipDialog` - Whether or not to bypass the roll dialog entirely

#### Examples

```js
game.wfrp4e.utility.rollItemMacro("ws", "characteristic", {fields : {difficulty: "average"}})
```

```js
game.wfrp4e.utility.rollItemMacro("Dodge", "skill", {fields : {modifier: +20}, appendTitle : " - Dive Roll!"})
```

```js
game.wfrp4e.utility.rollItemMacro(
  "Zweihander",  // name of thing to test
  "weapon",  // type of test
  {skipDialog: true, fields: {modifier: -10, slBonus: 2, successBonus: 1}} // optional test options
)
```


### Roll a Table
You can either use a chat macro:

```js 
/table hitloc modifier=20
```

Or a script macro:

```js
ChatMessage.create({content : await game.wfrp4e.tables.formatChatRoll("hitloc"), user : game.user.id})
```

Script macros are more powerful - for example:
*I want a macro to roll the Winds and Weather tables simultaneously*

```js
ChatMessage.create({content : await game.wfrp4e.tables.formatChatRoll("winds"), user : game.user.id})
ChatMessage.create({content : await game.wfrp4e.tables.formatChatRoll("weather"), user : game.user.id})
```

You can find table names by entering `/table` in the chat.