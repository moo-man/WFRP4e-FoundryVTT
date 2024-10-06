if (this.actor.system.status?.ward?.value) {
  this.actor.system.status.ward.value = Math.max(7, this.actor.system.status.ward.value-1);
} else {
  this.actor.system.status.ward.value = 9;
}