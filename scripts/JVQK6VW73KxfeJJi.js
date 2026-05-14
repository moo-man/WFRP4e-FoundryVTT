if (args.totalWoundLoss > 0)
                            {
                                args.modifiers.other.push({label : this.effect.name, value : args.totalWoundLoss + 4})
                                args.totalWoundLoss = (args.totalWoundLoss * 2) + 4
                            }