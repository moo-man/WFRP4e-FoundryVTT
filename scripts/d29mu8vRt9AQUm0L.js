this.actor.characteristics.i.value = Math.min(this.actor.characteristics.i.value, 10);
this.actor.characteristics.i.bonus = 1;

for(let skill of this.actor.itemTypes.skill.filter(i => i.system.characteristic.value == "i"))
{
    skill.system.total.value= Math.min(skill.system.total.value, 10)
}