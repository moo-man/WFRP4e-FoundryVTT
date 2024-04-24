args.actor.system.characteristics.s.value += 30
args.actor.system.characteristics.t.value += 30

args.actor.system.characteristics.s.bonus += 3
args.actor.system.characteristics.t.bonus += 3

if (args.actor.system.characteristics.s.value > 100)
{
   args.actor.system.characteristics.s.value = 100
   args.actor.system.characteristics.s.bonus = 10
}

if (args.actor.system.characteristics.t.value > 100)
{
   args.actor.system.characteristics.t.value = 100
args.actor.system.characteristics.t.bonus = 10
}