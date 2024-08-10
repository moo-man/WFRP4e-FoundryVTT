let animalCare = this.actor.itemTypes.skill.find(s => s.name === game.i18n.localize("NAME.AnimalCare"));
let animalTrainings = this.actor.itemTypes.skill.filter(s => s.name.includes(game.i18n.localize("NAME.AnimalTraining")));

if (animalCare) 
  animalCare.system.modifier.value += 20;

for (let training of animalTrainings) {
  training.system.modifier.value += 30;
}