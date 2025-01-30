const river = this.actor.itemTags.template.find(t => t.name === "River Troll");

if (!river) { 
  args.options.abortItemCreation = true;
  this.script.notification("Can only be applied to River Troll.", 'warning');
}