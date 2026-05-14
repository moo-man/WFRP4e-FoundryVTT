let test = this.actor.attacker?.test
if (test && this.item.system.protects[test.result.hitloc.result] && test.result.critical)
{
  this.script.message(`<strong>${this.item.name}</strong>: Roll Critical twice and choose lower result.`)
}