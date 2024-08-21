if (args.test.failed)
                        {
                          let SL = Number(args.test.result.SL)
                          if (SL <= -2 && SL > -4)
                            this.actor.addCondition("stunned")
                          else if (SL <= -4 && SL > -6)
                            this.script.message(this.actor.prototypeToken.name + " must make a <b>Willpower</b> Test or fall @Condition[Prone].")
                          else if (SL <= -6)
                            this.actor.addCondition("unconscious")
                        }