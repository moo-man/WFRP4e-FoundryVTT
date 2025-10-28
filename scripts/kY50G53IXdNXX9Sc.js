for(let e of this.item.effects)
{
  if (e.name.toLowerCase().includes("rune") && e.system.transferData.type == "aura" && e.system.transferData.area.radius == "6")
  {
    e.system.transferData.area.radius = "12"
  }
}