let difficulty = ""
                            if (this.effect.name.includes("Moderate"))
                                difficulty = "easy"
                            else if (this.effect.name.includes("Severe"))
                                difficulty = "average"
                            else
                                difficulty = "veasy"
        
                            let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {context : {failure : this.actor.name + " dies from Blight"}, fields: {difficulty}, appendTitle : " - Blight"})
                            await test.roll();
                            if (test.failed)
                            {
                                this.actor.addCondition("dead");
                            }