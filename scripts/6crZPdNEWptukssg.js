let roll = await new Roll("1d10").roll();

roll.toMessage(this.script.getChatData());

if (roll.total == 1)
{
    this.item.updateSource({"system.description.value" : this.item.system.description.value += `<p><strong>${this.effect.name}</strong>: The weapon counts as a @Corruption[minor]{minor source of Corruption}.</p>`});
}
else if (roll.total <= 5)
{
    let quirks = await fromUuid("Compendium.wfrp4e-archives2.tables.RollTable.LbNZOF6Ov7xKHS5Z");
    if (quirks)
    {
        let quirkRoll = await new Roll("1d100 + 40").roll();
        quirkRoll.toMessage(this.script.getChatData());
        let quirkResult = (await quirks.roll({roll: quirkRoll})).results[0].text;
        this.item.updateSource({"system.description.value" : this.item.system.description.value += `<p><strong>${this.effect.name}</strong>: ${quirkResult.replace("<p>", "")}</p>`});
    }
    else 
    {
        this.item.updateSource({"system.description.value" : this.item.system.description.value += `<p><strong>${this.effect.name}</strong>: Generate an additional Quirk or Curse by rolling on the @UUID[Compendium.wfrp4e-archives2.tables.RollTable.LbNZOF6Ov7xKHS5Z]{Quirks and Curses} Table and adding +40 to the result.</p>`});
    }
}
else
{
    this.item.updateSource({"system.description.value" : this.item.system.description.value += `<p><strong>${this.effect.name}</strong>: People who recognise the weapon are subject to @UUID[Compendium.wfrp4e-core.items.Item.0VpT5yubw4UL7j6f]{Animosity} towards the bearer.</p>`});
}