if (!this.item.name.includes("(") || this.item.system.tests.value.includes("(Sense)") || this.item.system.tests.value.toLowerCase().includes("(any)"))
{
    let tests = this.item.system.tests.value
    let name = this.item.name

    // If name already specifies, make sure tests value reflects that
    if (name.includes("(") && !name.toLowerCase().includes("(any)"))
    {
        let sense = name.split("(")[1].split(")")[0]
        tests = `${tests.split("(")[0].trim()} (${sense})`;
    }
    else // If no sense specified, provide dialog choice
    {
        let choice = await ItemDialog.create(ItemDialog.objectToArray({
            taste : "Taste",
            sight : "Sight",
            smell : "Smell",
            hearing : "Hearing",
            touch : "Touch"
        }, this.item.img), 1, {title : this.item.name, text : "Choose Sense"});
        if (choice[0])
        {
            name = `${name.split("(")[0].trim()} (${choice[0].name})`
            tests = `${tests.split("(")[0].trim()} (${choice[0].name})`
        }
    }

        this.item.updateSource({name, "system.tests.value" : tests})
}