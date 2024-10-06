let resistance
if (this.item.name.includes("(") && !this.item.name.toLowerCase().includes("(any)"))
{
	resistance = this.item.parenthesesText
}
else 
{
    resistance = await ValueDialog.create({text : "Enter Resistance", title : "Resistance"}) 
    
    if (resistance)
    {
        this.item.updateSource({name : `${this.item.name.split("(")[0].trim()} (${resistance})`})
        this.effect.updateSource({name : this.effect.name + ` (${resistance})`})
    }
}    
this.item.updateSource({"system.tests.value" : this.item.system.tests.value.replace("the associated Threat", resistance)})

if (resistance && !this.effect.name.includes("("))
{
    this.effect.updateSource({name : this.effect.name += ` (${resistance})`})
}