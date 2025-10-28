return (args.item?.system?.attackType != "melee" 
  || this.actor.attacker != undefined 
  || args.target?.hasCondition("surprised") == undefined)