// If the creature currently has a Surprised, Unconscious, or Entangled Condition, it does not gain this Advantage.
const surprised = this.actor.hasCondition("surprised")
const unconscious = this.actor.hasCondition("unconscious")
const entangled = this.actor.hasCondition("entangled")
if (entangled || unconscious || surprised) return

// If, at the beginning of its turn, this creature does not have at least Rating Advantage points, its Advantage pool immediately increases to Rating.
const grimRating = parseInt(this.item.specification.value) || 1
if (grimRating > this.actor.status.advantage.value) {
  this.actor.setAdvantage(grimRating)
}