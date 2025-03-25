if (args.applyAP && args.modifiers.ap.magical) 
{
    args.modifiers.ap.ignored += args.modifiers.ap.magical
    args.modifiers.ap.details.push("<strong>" + this.effect.name + "</strong>: Ignore Magical AP (" + args.modifiers.ap.magical + ")");
}