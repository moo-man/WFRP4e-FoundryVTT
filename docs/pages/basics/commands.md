---
layout: default
title: Chat Commands
parent: The Basics
---

## Chat Commands

You can print out a list of chat commands by entering `/help` in chat. The output is reproduced here:

---

Below is the list of chat commands and available parameters. You can assign some value to a parmeter by using =. If a command has a **default argument**, it does not need to be assigned, but must be the first value provided.

e.g. `/command 100 someArg=value1 anotherArg=value2`

---

### Roll on a table

`/table`

**Arguments**: table, modifier, column

**Default Argument**: table

**Examples**:

`/table critarm`

`/table mutatephys modifier=20 column=khorne`

---

### Post a prompt for payment.

`/pay`

**Arguments**: amount, for, target

**Default Argument**: amount

**Notes**: If a player, pay some amount from the assigned Actor. If a GM, post a message prompting to a pay some amount

**Examples**:

`/pay 12ss for=Room and Board`

---

### Post a prompt to receive money.

`/credit`

**Arguments**: amount, mode, split, target, reason

**Default Argument**: amount

**Notes**: Mode can be set to 'split' or 'each', if unspecified, only a single reward is available to take (split=1). If the mode is set to split, and the split argument is not defined, it splits the amount between all active players.

**Examples**:

`/credit 100gc reason=Completing the Bounty split=3`

---

### Start Character Creation

`/char`

**Arguments**: None

---

### Show Condition Description

`/cond`

**Arguments**: condition

**Default Argument**: condition

---

### Show a Quality or Flaw

`/prop`

**Arguments**: property

**Default Argument**: property

---

### Generate a name

`/name`

**Arguments**: gender, species

**Default Argument**: gender

**Notes**: Core Species Keys: human dwarf helf welf halfling

---

### Roll an Availability Test

`/avail`

**Arguments**: rarity, size, modifier

**Default Argument**: rarity

---

### Prompt Corruption Test

`/corruption`

**Arguments**: strength, skill, source

**Default Argument**: strength

---

### Prompt Fear Test

`/fear`

**Arguments**: rating, source

**Default Argument**: rating

---

### Prompt Terror Test

`/terror`

**Arguments**: rating, source

**Default Argument**: rating

---

### Prompt XP Reward

`/exp`

**Arguments**: amount, reason

**Default Argument**: amount

---

### Post Travel Distance Tool

`/travel`

**Arguments**: from, to

**Default Argument**: from

---

### Prompt Trade Dialog

`/trade`

**Arguments**: None
