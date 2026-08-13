if (args.actor.has("Bestial")) 
{
  this.script.notification(`${args.actor.prototypeToken.name} must pass an <b>Difficult (-10) Willpower</b> Test to attack this target!`); 
}

return true; // No need to show this in the dialog