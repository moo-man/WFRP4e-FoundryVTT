let value = await ValueDialog.create({
  title : this.script.label, 
  text: "Victory Notes for Experience Log"
});
value 
  ? this.actor.system.awardExp(50, value) 
  : this.actor.system.awardExp(50, this.script.label)