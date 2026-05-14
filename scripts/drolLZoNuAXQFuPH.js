if (args.totalWoundLoss > 0 && this.item.protects[args.loc])
{
    let roll = await new Roll("1d10").roll();
    roll.toMessage(this.script.getChatData())
    if (roll.total >= 9)
    {
        args.abort = this.effect.name
    }
}