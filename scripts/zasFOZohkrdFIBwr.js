let modifier = 0
                            if (this.effect.name.includes("Moderate"))
                                modifier = -20
                            else
                                modifier = -10
                            args.fields.modifier += modifier