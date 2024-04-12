                 
                            if (args.test.failed)
                            {
                                let applicableCharacteristics = ["ws", "bs", "s", "fel", "ag", "t", "dex"];
                                if (applicableCharacteristics.includes(args.preData.characteristic))
                                {
                                    this.actor.addCondition("stunned");
                                }
                            }