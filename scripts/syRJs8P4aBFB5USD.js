if (this.actor?.system?.details?.god?.value !== "Sigmar") return
if (this.actor?.currentCareer?.careergroup?.value !== "Priest" 
  && this.actor?.currentCareer?.careergroup?.value !== "Warrior Priest" ) return
  
let currentSin = this.actor.system.status.sin.value 
let updatedSin = currentSin + 2
await this.actor.update({"system.status.sin.value": updatedSin})