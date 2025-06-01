if (this.actor.statuses.has("infighting") && !args.flags.infighter) 
{
    args.fields.modifier += 10;
    args.flags.infighter = true;
}

args.fields.successBonus += 1; 