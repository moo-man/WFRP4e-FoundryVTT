---
layout: default
title: Manually Invoked
parent: Scripts
nav_order: 0
grand_parent: Active Effects
---
Manual scripts are executed on-demand. They will provide a button on the Actor Sheet that, when clicked, runs the code on the script. 

## Key
`manual`

## Arguments 

`args.actor` - The Actor executing the script, as manual scripts are only executable via the Actor Sheet of the parent Actor. 

## Examples


### Prompt Corruption

**Usage**: Easily post a corruption prompt to chat

```js
game.wfrp4e.utility.postCorruptionTest("moderate", this.script.getChatData())
```

**Notes**: Use `"minor"` or `"major"` to alter the severity of corruption

---

### Prompt Fear

**Usage**: Easily post a Fear prompt to chat

```js
game.wfrp4e.utility.postFear(2, this.actor.name)
```

**Notes**: `args.actor.name` also works.

---

### Free Attack with Advantage spend

**Usage**: Spend Advantage to perform an Attack

```js
if (this.actor.system.status.advantage.value > 0)
{
    await this.actor.modifyAdvantage(-1);
    this.script.notification("Advantage Subtracted")
}
else 
{
    return this.script.notification("Not enough Advantage!", "error")
}

let test = await this.actor.setupTrait(this.item)
await test.roll();
```

**Notes**: This script would be attached to an effect owned by the Item being used to attack, which is why `this.actor.setupTrait(this.item)` is used. 