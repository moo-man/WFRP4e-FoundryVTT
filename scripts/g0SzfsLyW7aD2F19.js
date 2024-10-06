if (this.item.system.tests.value.includes("(Social Group)"))
{
    let tests = this.item.system.tests.value
    let name = this.item.name

    // If name already specifies, make sure tests value reflects that
    if (name.includes("(") && !name.toLowerCase().includes("(any)"))
    {
        let group = name.split("(")[1].split(")")[0]
        tests = `${tests.split("(")[0].trim()} (${group})`
    }
    else
    {
        let value = await ValueDialog.create({text : "Enter Etiquette Group", title : this.effect.name});
        if (value)
        {
            name = `${name.split("(")[0].trim()} (${value})`
            tests = this.item.system.tests.value.replace("Social Group", value);
        }
    }
    this.item.updateSource({name, "system.tests.value" : tests})
}