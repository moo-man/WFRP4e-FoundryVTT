let blunt = await Dialog.confirm({label : "test", content :`<p>Apply blunt damage reduction? (-3)</p>`})

if (blunt)
{
    args.modifiers.other.push({label : this.effect.name, details : "Blunt Damage Reduction", value : -3})
}