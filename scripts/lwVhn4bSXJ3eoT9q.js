if (this.item.system.weaponGroup.value == "basic")
{
    let slash = this.item.system.qualities.value.find(i => i.name == "slash")
    if (slash)
    {
        slash.value = "2A"
    }
}