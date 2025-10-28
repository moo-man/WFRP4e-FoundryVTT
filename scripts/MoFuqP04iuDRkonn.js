return this.item.equipped.value 
  && args?.weapon
  && args.actor?.isOpposing
  && args?.attackType === "melee"
  && this.item == args?.weapon