let nonmagical = args.modifiers.ap.value - args.modifiers.ap.magical
if (args.applyAP && nonmagical) 
{
    let nonmagical = args.modifiers.ap.value - args.modifiers.ap.magical
    args.modifiers.ap.ignored += nonmagical
    args.modifiers.ap.details.push("<strong>" + this.effect.name + "</strong>: Ignore Non-Magical AP (" + nonmagical + ")");
}