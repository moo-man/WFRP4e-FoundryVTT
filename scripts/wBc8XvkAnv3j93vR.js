if (Number(args.actor.system.status.fate.value) > 0) {
  args.actor.update({"system.status.fate.value": Math.max(args.actor.system.status.fate.value - 1, 0)});
  args.actor.update({"system.status.fortune.value": Math.max(args.actor.system.status.fortune.value - 1, 0)});
  this.script.message(`Reduced Fate and Fortune by 1`);
} 
else if (Number(args.actor.system.status.resilience.value) > 0)
{
  args.actor.update({"system.status.resilience.value": Math.max(args.actor.system.status.resilience.value - 1, 0)});
  args.actor.update({"system.status.resolve.value": Math.max(args.actor.system.status.resolve.value - 1, 0)});
  this.script.message(`Reduced Resilience and Resolve by 1`);
}