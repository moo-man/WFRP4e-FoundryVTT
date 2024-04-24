if (this.item.name.includes("(") && this.item.system.tests.value.includes("(Social Group)"))
{
    let tests = this.item.system.tests.value
    let name = this.item.name

    // If name already specifies, make sure tests value reflects that
    if (name.includes("("))
    {
        let group = name.split("(")[1].split(")")[0]
        tests = `${tests.split("(")[0].trim()} (${group})`
    }
    this.item.updateSource({name, "system.tests.value" : tests})
}