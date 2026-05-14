if (args.totalWoundLoss > 0)
{
    let roll = await new Roll("1d10").roll({allowInteractive : false});
    roll.toMessage(this.script.getChatData());
    args.totalWoundLoss += roll.total;
    args.modifiers.other.push({label : this.effect.name, value : roll.total})
}