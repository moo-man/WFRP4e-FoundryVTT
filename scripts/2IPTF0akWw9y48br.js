return !this.item.equipped.value 
  || !args?.weapon
  || !(["goblin"].includes(args.target.Species.toLowerCase()))