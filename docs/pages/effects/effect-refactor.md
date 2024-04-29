---
layout: default
title: The Effect Refactor
parent: Active Effects
---

# What is the Effect Refactor?

Years ago, I implemented an extension to Foundry's Active Effects documents that let me (and users who learned the process) create almost any behavior for a spell, talent, etc. More specifically, it provided various "triggers" where code could be inserted. However, it proved rather awkward in this initial stage. It was my first attempt at creating something like this, and through development of the other Warhammer systems, I iterated on the process. Finally with the new Foundry V11 database capabilities, it's time to bring all that development back into this system, taking what worked, and ignoring/changing what didn't, that is the Effect Refactor. 

## What was wrong with the old version?

Basically, it was confusing, inconsistent, and still too limited, patched with various fixes and alterations as new Foundry versions released.

A distinct limitation was the architecture I was working with. V10 and below did not support Active Effects as true "grand-children" of an Actor. When you added an Item with an Effect to an Actor, it *copied* the effect to the Actor as a direct child, which resulted in two completely independent effects, one on the owned Item (which couldn't be edited) and another on the Actor. If you have ever configured the Robes or Magical Staff Item from Winds of Magic, this is why you must edit the Item's effect *before* adding it to the Actor.

In V11, this has improved, where Actors can just "use" grand-child Active Effects without needing to create a copy of them, and they can be edited!

## So what does the Refactor do?

Have you ever forgotten to click the Instinctive Diction bonus when casting spells?  
Are you tired of the Roll dialog being flooded with irrelevant talent/effect bonuses?  
Have you ever completely forgotten about the Distracting penalty?  
**The refactor fixes all of this! But that only skims the surface.**

### Effect Areas / Auras

Effects can now be attached to an Area Template. This had only partial implementation in the previous implementation, but now, you can create templates that persisently (or only one-time) apply an effect to Actors within. Additionally, Auras follow a similar system which uses an Area Template attached to a Token, adding an Effect to anyone within. 

### Multiple Scripts

A major improvement to the scripting system is that a single effect can have multiple scripts! Previously, only one script/trigger can be configured for an effect, so if multiple triggers were needed to accomplish an Item's mechanics, multiple Active Effects were needed. This is especially useful when utilized with the **On Create** feature below.

### On Create/Delete Scripts

Effects can now run scripts when they are created and deleted, and these scripts can do some useful things. 

For example, the Acute Sense talent can choose one of 5 senses to apply a bonus to. So when the Item is created on the Actor, it can use the Immediate script to provide a dialog for the user to choose which sense the Talent should improve, changing **Perception (Sense)** to **Perception (Sight)** or whatever was chosen. Or, another commonly used example would be Robes from **Winds of Magic**, where instead of needing to manually change the name of the effect, adding the item to the Actor provides a dialog choice to automatically handle which Arcane Lore to provide a bonus to. If you want to learn more about Creation scripts [Immediate](./triggers/immediate) or [Add Items](./triggers/add-items) trigger.

This is possible because now effects support **Multiple Scripts** (see above), as they can define the creation script as well as whatever mechanics the Item needs.

### The Roll Dialog

Likely the most powerful aspect of the update, the roll dialog's internals have been completely overhauled for an improved experience, particularly the Talent / Effect bonus list. This list has been converted to **Dialog Modifiers** which includes effects from all different sources. Crucially, these modifiers have the ability to hide and activate themselves via scripts, so when rolling a Charm Test, only modifiers related to Charm Tests will be shown (a decision written as a script inside the effect itself). If you want to learn more about the aspects of Dialog scripts, see the [Dialog Trigger](./triggers/dialog)

#### Example
As the Dialog rework has the most impact to all users, here's an example featuring the Supreme Patriarch, the mighty Thyrus Gormann. Thyrus is an adept spellcaster, having a multitude of bonuses to his spellcasting from his talents and equipment. 

**Casting**: Instinctive Diction (2), Perfect Pitch (2), Staff of Volans, and the Fire Stone of Agni  
**Channelling**: Aethyric Attunement (3), Staff of Volans

**Before the Refactor**: When casting a Lore of Fire spell, notice the Bonuses list is completely filled with irrelevant Talent bonuses, as I'm sure many users are aware of. What needs to be selected here is **Language (Magick) when casting** to receive the Instinctive Diction bonus and **Entertain (Sing), Language (Tonal Languages, such as Elthárin, Cathayan, and Magick)** to receive the Perfect Pitch bonus. 

![Before](https://github.com/moo-man/WFRP4e-FoundryVTT/assets/28637157/b5b4f68b-daac-4476-a815-a32dc6441624)

**After the Refactor**: Now, the list is much smaller, why? Because scripts from each Talent are telling the dialog when to show and when to hide their bonus values. Also an important note is that I did not provide any input to this dialog, it automatically selected the relevant bonuses it knows should be applied, how? Again, scripts are determining it. 

![image](https://github.com/moo-man/WFRP4e-FoundryVTT/assets/28637157/2c2947f6-1c0c-4d93-a69f-72e758140352)

Now, Thyrus is going to attempt a Charm test, this is what the dialog looks like. While nothing was automatically selected in this case, the way the Dialog Modifiers are filtered lets you know that these are the only modifiers that could possibly be relevant to this test, and you can select them if they should be used.

![image](https://github.com/moo-man/WFRP4e-FoundryVTT/assets/28637157/d9591315-1e70-4eb2-9794-72371e797ea7)

## TLDR; what should I do so my game doesn't break?

Consider these steps if you want to utilize the Effect Refactor

1. **First of all, make sure you have backups.** Hopefully nothing "breaks" from this refactor, as there are migrations in place that should handle, but there are always edge cases. 
2. [Delete and reinitialize Module content](Module Initialization)
3. You should replace every Talent, Spell, and Prayer on all important Actors, such as Player Characters. If you want to be more selective, see the [Effect Refactor Spreadsheet](https://docs.google.com/spreadsheets/d/1NG0v0o8BtLyo-YrgSFz0Sfwev_6QTd45p69JZ_WkYCU/edit#gid=0) to see specifically what talents have received changes. 

### Is there way to automate this?

Yes! Sort of, you don't expect me to do the above steps for every single Actor (over a thousand) in the various modules, do you?

{: .warning}
**BACKUP YOUR WORLD BEFORE PROCEEDING**

1. Delete all non-custom Actors and Items from your world. If you have hundreds of Actors from the official modules, there's no reason to send them through this migration, as that has already been done for you. Simply reimport them from the Compendium when you're done with this process. 

2. Copy the code below into your console (F12) and press **Enter**. 

This code performs a series of steps on every Actor in the world, before running the code, please try to understand the process: 

1. For every Item the Actor owns, find a replacement
    - A replacement is retrieved via the original item's `sourceId`, if it exists, if not, simply search for an Item with the same name and type. (a `sourceId` is the identifier for where the Item came from, and may or may not exist for an Item)

2. Decide what data to keep from the old Item and put it into the new Item.
    - For instance, if an Actor has a memorized spell that is being replaced, the new Item should also be memorized. 

3. If the new or old Item modifies the Actor (such as Savvy modifying Intelligence), special care must be taken in offsetting the modification. It's not desirable for this migration to change the final value of characteristics or skills, so if any change is detected with the new Items, the Actor is modified to offset the new changes. (This is likely not an issue for your custom Actors)

4. Delete the old Items, add the new Items

{: .warning}
> A lot could go wrong with this migration, particularly when **Finding Replacements**. For instance, weapons and armour on an Actor may be replaced with alternate versions, like those found in **Up in Arms**. Check Actor careers, talents, spells, and weapons. 
>
> More importantly: **If any Item has been created from an existing compendium Item, it may be at risk of being overwritten!**


```js
async function updateEffectsRefactor(actor, update=false)
{
    let items = actor.items.contents;
    let toDelete = [];
    let toAdd = [];
    let actorUpdate = {};
    for(let item of items)
    {
        let newItem = await findReplacement(item);
        if (newItem)
        {
            let data = keepData(item, newItem)      
            let offset = {};
            offsetChanges(item, newItem, offset);
            applyOffset(offset, actorUpdate, actor)
            toAdd.push(data);
            toDelete.push(item.id)
        }
    }

    let summary = 
    `${actor.name}
    Deleting ${toDelete.map(i => actor.items.get(i).name).join(", ")}
    Adding ${toAdd.map(i => i.name)}
    `
    console.log(summary);

    if (toDelete.length && update)
    {
        await actor.deleteEmbeddedDocuments("Item", toDelete);
    }
    if (toAdd && update)
    {
        await actor.createEmbeddedDocuments("Item", toAdd, {keepId : true});
        await actor.update(actorUpdate);
    }
}

async function findReplacement(item)
{
    let sourceId = item.getFlag("core", "sourceId")
    if (sourceId)
    {
        let sourceItem = await fromUuid(sourceId);
        if (sourceItem)
        {
            return sourceItem;
        }
    }
    return game.wfrp4e.utility.findItem(item.name, item.type)
}

function keepData(oldItem, newItem)
{
    let keep = {
        _id : oldItem._id,
        name : oldItem.name,
        img: oldItem.img,
        "system.description.value" : oldItem.system.description.value,
        "system.gmdescription.value" : oldItem.system.gmdescription.value
    }
    if (oldItem.system.quantity?.value)
    {
        keep["system.quantity.value"] = oldItem.system.quantity.value;
    }
    if (oldItem.system.tests?.value)
    {
        keep["system.tests.value"] = oldItem.system.tests.value;
    }
    if (oldItem.system.location?.value)
    {
        keep["system.location.value"] = oldItem.system.location.value
    }
    if (oldItem.system.worn?.value)
    {
        keep["system.worn.value"] = oldItem.system.worn?.value
    }
    if (oldItem.system.worn)
    {
        keep["system.worn"] = oldItem.system.worn
    }
    if (oldItem.system.equipped)
    {
        keep["system.equipped"] = oldItem.system.equipped
    }
    if (oldItem.system.advances)
    {
        keep["system.advances"] = oldItem.system.advances
    }
    if (oldItem.system.modifier?.value)
    {
        keep["system.modifier.value"] = oldItem.system.modifier.value;
    }
    if (oldItem.system.memorized?.value)
    {
        keep["system.memorized.value"] = oldItem.system.memorized.value;
    }
    if (oldItem.system.skill?.value)
    {
        keep["system.skill.value"] = oldItem.system.skill.value;
    }
    if (oldItem.system.ingredients)
    {
        keep["system.ingredients"] = oldItem.system.ingredients;
        keep["system.currentIng"] = oldItem.system.currentIng;
    }
    if (oldItem.system.wind?.value)
    {
        keep["system.wind"] = oldItem.system.wind;
    }
    if (oldItem.system.current?.value)
    {
        keep["system.current.value"] = oldItem.system.current.value;
    }
    if (oldItem.system.complete?.value)
    {
        keep["system.complete.value"] = oldItem.system.complete.value;
    }
    if (oldItem.type == "trait")
    {
        keep.system = oldItem.system
    }
    return mergeObject(newItem.toObject(), keep);
}

function offsetChanges(oldItem, newItem, offsets)
{
    let oldChanges = oldItem.effects.contents.reduce((changes, effect) => changes.concat(effect.changes), []).filter(i => i.mode == 2);
    let newChanges = newItem.effects.contents.reduce((changes, effect) => changes.concat(effect.changes), []).filter(i => i.mode == 2);
    let diffChanges = {};

    let oldTotals = oldChanges.reduce((totals, change) => {
        if (totals[change.key])
        {
            totals[change.key] += Number(change.value);
        }
        else 
        {
            totals[change.key] = Number(change.value);
        }
        return totals
    }, {});

    let newTotals = newChanges.reduce((totals, change) => {
        if (totals[change.key])
        {
            totals[change.key] += Number(change.value);
        }
        else 
        {
            totals[change.key] = Number(change.value);
        }
        return totals
    }, {});


    for(let newTotalKey in newTotals)
    {
        let diff = newTotals[newTotalKey] - (oldTotals[newTotalKey] || 0)
        diffChanges[newTotalKey] = diff;
    }

    for(let diffKey in diffChanges)
    {
        let current = getProperty(offsets, diffKey) || 0;

        current -= diffChanges[diffKey]

        setProperty(offsets, diffKey, current);
    }

    if (!isEmpty(diffChanges))
    {
        console.log(`@@@ Diff Changes for $${oldItem.name} - ${newItem.name} @@@`)
        console.log(diffChanges);
    }
}

function applyOffset(offset, update, actor)
{
    for(let key in flattenObject(offset))
    {
        let current = getProperty(update, key) || getProperty(actor._source, key);
        current += getProperty(offset, key);
        setProperty(update, key, current);
    }
}

for(let actor of game.actors.contents)
{
    await updateEffectsRefactor(actor, true);
}
```