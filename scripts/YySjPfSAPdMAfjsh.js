let talents = ["Berserk Charge", "Combat Aware", "Combat Reflexes", "Furious Assault", "Implacable", "Magic Resistance", "Resistance (Magic)", "Resolute", "Strike Mighty Blow", "Warrior Born"];
let currentCareer = this.actor.system.currentCareer;

if (!currentCareer) return;

for (let talent of talents) {
  if (currentCareer.system.talents.includes(talent))
    continue;
  currentCareer.system.talents.push(talent);	
}

