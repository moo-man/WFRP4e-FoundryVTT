return !this.item.equipped.value 
  || !args.actor?.isOpposing
  || !args?.attackType === "melee"
  || !(this.item == args?.weapon)