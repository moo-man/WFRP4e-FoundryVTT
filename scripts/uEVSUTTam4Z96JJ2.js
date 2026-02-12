if (this.item.equipped.value
  && args.sourceItem 
  && (args.sourceItem.isRanged || args.sourceItem.type == "spell")
  ) 
{
  args.modifiers.other.push({label : this.effect.name, details : "Damage Reduction", value : -2})
}