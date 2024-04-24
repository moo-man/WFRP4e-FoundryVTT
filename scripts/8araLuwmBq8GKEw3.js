let APIgnored = args.AP.layers.reduce((prev, current) => prev + ((current.weakpoints && !current.ignored) ? current.value : 0), 0)

if (APIgnored)
{
    args.modifiers.ap.ignored += APIgnored
    args.modifiers.ap.details.push(`<strong>${this.effect.name}</strong>: Ignore AP with Weakpoints (${APIgnored})`)
}