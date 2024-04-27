let weakpointsAP = args.AP.layers.filter(i => !i.ignored && i.weakpoints).reduce((ap, layer) => ap + layer.value, 0);

if (weakpointsAP > 0)
{
    args.modifiers.ap.ignored += weakpointsAP;
    args.modifiers.ap.details.push(`${this.effect.name} - Ignore Weakpoints (${weakpointsAP})`);
}