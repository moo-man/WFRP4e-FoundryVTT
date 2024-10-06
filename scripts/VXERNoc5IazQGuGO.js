if (args.applyAP && args.modifiers.ap.metal)
{
    args.modifiers.ap.ignored += args.modifiers.ap.metal
    args.modifiers.other.push({value : args.modifiers.ap.metal, label : this.effect.name, details : "Add Metal AP to Damage" })
    args.modifiers.ap.details.push("<strong>" + this.effect.name + "</strong>: Ignore Metal (" + args.modifiers.ap.metal + ")");
    args.modifiers.ap.metal = 0
}