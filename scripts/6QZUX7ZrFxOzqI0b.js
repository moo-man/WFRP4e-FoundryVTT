let regenerate = this.actor.items.getName('Regenerate')

if (regenerate)
{
    let effect = regenerate.effects.contents[0]
    let scriptData = effect.system.scriptData;
    
    scriptData[0].script = scriptData[0].script.replace("1d10", "1d10 * 2")
}