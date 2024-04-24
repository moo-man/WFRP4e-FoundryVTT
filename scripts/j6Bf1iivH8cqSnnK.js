let target = args.data.targets[0]
return target?.actor.hasCondition("prone") || target.hasCondition("surprised")