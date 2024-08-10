if (this.item.system.tests.value.includes("(Social Group)"))
{
    let tests = this.item.system.tests.value
    let name = this.item.name

    // If name already specifies, make sure tests value reflects that
    if (name.includes("("))
    {
        let group = name.split("(")[1].split(")")[0]
        tests = `${tests.split("(")[0].trim()} (${group})`
    }
    else if (!name.includes("("))
    {
        let value = await ValueDialog.create("Enter Etiquette Group", this.effect.name);
        if (value)
        {
            name = this.item.name + ` (${value})`;
            tests = this.item.system.tests.value.replace("Social Group", value);
        }
    }
    this.item.updateSource({name, "system.tests.value" : tests})
}