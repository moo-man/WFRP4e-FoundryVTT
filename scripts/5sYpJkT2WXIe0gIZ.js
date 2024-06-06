const rating = parseInt(this.effect.name.match(/\d+/)?.[0]) || 1;

let crewList = foundry.utils.duplicate(this.actor.system.passengers.list);
let selectedCrew = [];

while (selectedCrew.length < rating && crewList.length) {
  selectedCrew.push(crewList.splice(crewList.length * Math.random() | 0, 1)[0]);
} 

for (let member of selectedCrew) {
  let actor = game.actors.get(member.id);
  actor.applyBasicDamage(9, {
    damageType: game.wfrp4e.config.DAMAGE_TYPE.NORMAL, 
    minimumOne: true, 
    loc: "roll", 
    suppressMsg: false, 
    hideDSN: false 
  });
}