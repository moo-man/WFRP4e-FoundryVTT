args.actor.characteristics.ag.modifier -= 10;

                            if (args.actor.details.move.value > 3)
                            {
                                args.actor.details.move.value -= 1;
                                if (args.actor.details.move.value < 3)
                                    args.actor.details.move.value = 3
                            }