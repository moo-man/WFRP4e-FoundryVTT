let fatigued = this.actor.hasCondition("fatigued");
                                        if (fatigued)
                                        {
                                            foundry.utils.setProperty(fatigued, "flags.wfrp4e.scriptData", foundry.utils.getProperty(fatigued, "flags.wfrp4e.scriptData").filter(s => s.trigger != "dialog"))
                                        }
                                        
                                        if (!this.item.system.properties.qualities.unbreakable) this.item.system.qualities.value.push({name : 'unbreakable'})