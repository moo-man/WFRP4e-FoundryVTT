if (this.item.system.isEquipped)
{
    let removeRepeater = false
    if(!this.item.system.offhand.value) // main
    {
        let offhandUsed = this.actor.itemTypes.weapon.find(i => i.system.isEquipped && i.system.offhand.value)
        if (offhandUsed)
        {
            removeRepeater = true;
        }
    }
    else // offhand
    {
        let mainhandUsed = this.actor.itemTypes.weapon.find(i => i.system.isEquipped && !i.system.offhand.value)
        if (mainhandUsed)
        {
           removeRepeater = true;
        }
    }
    
    if (removeRepeater)
    {
        this.item.system.qualities.value = this.item.system.qualities.value.filter(i => i.name != "repeater")
    }
}