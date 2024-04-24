if (args.test.options.healWounds) {
 if (args.test.succeeded) 
 {
   let wounds = this.actor.characteristics.int.bonus + Number(args.test.result.SL)
   if (args.test.options.fieldDressing && args.test.result.reversed)
   {
      wounds = this.actor.characteristics.int.bonus + Math.min(1, Number(args.test.result.SL))
   }
	args.test.result.woundsHealed = wounds
	args.test.result.other.push(`<b>${this.actor.name}</b> healed <b>${wounds}</b> wounds of the patient.`)
   }
   else if (this.actor.characteristics.int.bonus + Number(args.test.result.SL) < 0)
   {
      args.test.result.other.push(`The patient contracts a @UUID[Compendium.wfrp4e-core.items.Item.1hQuVFZt9QnnbWzg]{Minor Infection}.`)
   }
}