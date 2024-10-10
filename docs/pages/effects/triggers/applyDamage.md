---
layout: default
title: Apply Damage
parent: Scripts
nav_order: 19
grand_parent: Active Effects
---

This trigger runs when an Actor applies damage (via opposed test) to another Actor, specifically after all the modifiers and reductions are applied, but before the Actor is updated and the result is displayed in chat, letting us modify values right before they are applied. 

This is very similar to [Take Damage](./takeDamage.md), but this trigger runs on the Actor doing damage.


## Key

`applyDamage`

## Arguments 

`args.actor` - The Actor *taking damage*

`args.attacker` - The Actor *doing damage*

`args.opposedTest` - The Opposed Test that was used to calculate damage

`args.damageType` - Whether to ignore AP, TB, or both. This argument is obsolete and has already been derived into `applyAP` and `applyTB`

`args.weaponProperties` - What properties (qualities and flaws) the weapon has. This can be modified to add properties to the calculation. (e.g. `args.weaponProperties.qualities.damaging` or `args.weaponProperties.flaws.unbalanced`)

`args.applyAP` - Whether armour was used to reduce the incoming damage

`args.applyTB` - Whether Toughness bonus was used to reduce the incoming damage

`args.totalWoundLoss` - This will *eventually* be the actual amount of wounds deducted from the Actor. At this point in the process, it is the raw damage value from the test. 

`args.AP` - The data of the location taking damage. See [Armour Calculation](./APCalc.md) to see the object structure.

`args.modifiers` - Modifiers for armour, toughness, and damage. Note that these modifiers have *already been applied* and modifications in this trigger will not be reflected in the damage values. See [Compute Apply Damage Modifiers](./computeApplyDamageModifiers.md) to see the object structure (modifiers generally should be changed in that trigger, not this one).

`args.extraMessages` - Array of strings that can be added to for displaying in chat.

`args.ward` - Ward value of the Actor (If ward is some number, a roll is made and if that roll is greater or eual to the ward value, the damage is ignored)

`args.wardRoll` - The Ward roll is determined, but only checked if ward isn't null. This occurs after this trigger runs. 

`args.abort` - Set this to a string value to abort the process (with the string being the message shown in chat)


## Examples

### Set Ablaze

**Usage**: If a Wound is dealt, also add an Ablaze condition

```js
if (args.totalWoundLoss > 0)
{
    args.actor.addCondition('ablaze')
} 
```

**Notes**: Since all the reductions have been calculated at this point, we can check `totalWoundLoss` for the actual damage amount taken. 

---

### Prompt a Message

**Usage**: If a Wound is dealt, prompt a message about contracting a disease.

```js
if (args.totalWoundLoss > 0)
{
    this.script.message(`<b>${args.actor.name}</b> must pass an <b>Easy (+40) Endurance</b> Test or gain a @UUID[Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb]{Festering Wound}`, {whisper: ChatMessage.getWhisperRecipients("GM")})
}

```

**Notes**: Use the whisper option if you don't want players to see this message. 

---

### Prompt a Test

**Usage**: If a Wound is dealt, Make an Endurance Test, if failed, gain a Stunned Condition

```js
if (args.totalWoundLoss > 0)
{
    let test = await args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {skipTargets: true, appendTitle :  ` - ${this.effect.name}`});
    await test.roll();
    if (test.failed)
    {
	    args.actor.addCondition("stunned");
    }
}
```

**Notes**: It's important to use `args.actor` instead of `this.actor`.

---

### Add Damage to Daemonic

**Usage**: Add 3 Damage if the target is Daemonic

```js
if (args.actor.has("Daemonic")) 
{
  args.modifiers.other.push({label: this.effect.name, value: 3});
  args.totalWoundLoss += 3;
}
```

**Notes**: This script isn't optimal here, it would be better placed in [Compute Apply Damage Modifiers](./computeApplyDamageModifiers.md), where we wouldn't need to modify `args.totalWoundLoss`. However, it showcases that we *can* still use the `args.modifiers.other` array. The value is not used in the calculation because modifiers have already been processed, but the label and value will still show in the damage breakdown tooltip. In summary, if you need to modify `totalWoundLoss` in this trigger, you can use `args.modifiers.other` to show that to the user. 

