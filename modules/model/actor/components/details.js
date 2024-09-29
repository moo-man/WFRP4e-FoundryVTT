import { MountModel } from "./mount";

let fields = foundry.data.fields;

export class StandardDetailsModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.species = new fields.SchemaField({
            value: new fields.StringField(),
            subspecies: new fields.StringField(),
        });
        schema.gender = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.biography = new fields.SchemaField({
            value: new fields.HTMLField()
        });
        schema.gmnotes = new fields.SchemaField({
            value: new fields.HTMLField()
        });
        schema.size = new fields.SchemaField({
            value: new fields.StringField({ initial: "avg" })
        });
        schema.move = new fields.SchemaField({
            value: new fields.NumberField({ initial: 4 }),
            walk: new fields.StringField(),
            run: new fields.StringField(),
        });
        schema.god = new fields.SchemaField({
            value: new fields.StringField({label : game.i18n.localize("Blessed By")})
        });
        schema.status = new fields.SchemaField({
            value: new fields.StringField(),
            standing: new fields.StringField(),
            tier: new fields.NumberField({ initial: 0 }),
            modifier: new fields.NumberField({ initial: 0 }),
        });
        schema.hitLocationTable = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.mainHand = new fields.StringField({initial : "r"})
        return schema;
    }
}


export class CharacterDetailsModel extends StandardDetailsModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.experience = new fields.SchemaField({
            total: new fields.NumberField({ initial: 0 }),
            spent: new fields.NumberField({ initial: 0 }),
            log: new fields.ArrayField(new fields.ObjectField())
        });

        schema["personal-ambitions"] = new fields.SchemaField({
            "short-term": new fields.StringField(),
            "long-term": new fields.StringField()
        });
        schema["party-ambitions"] = new fields.SchemaField({
            "name": new fields.StringField(),
            "short-term": new fields.StringField(),
            "long-term": new fields.StringField()
        });
        schema.motivation = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.class = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.career = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.careerlevel = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.age = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.height = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.weight = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.haircolour = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.eyecolour = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.distinguishingmark = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.starsign = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }
}

// DOES NOT INHERIT STANDARD
export class VehicleDetailsModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.move = new fields.SchemaField({
            value: new fields.NumberField(),
            sail : new fields.SchemaField({
                enabled : new fields.BooleanField(),
                value : new fields.NumberField(),
                crew : new fields.NumberField(),
            }),
            oars : new fields.SchemaField({
                enabled : new fields.BooleanField(),
                value : new fields.NumberField(),
                crew : new fields.NumberField(),
            }),
            custom : new fields.SchemaField({
                label : new fields.StringField(),
                value : new fields.NumberField(),
                crew : new fields.NumberField()
            }),
            primary : new fields.StringField({initial : "sail", choices: ["sail", "oars"]})
        });
        schema.man = new fields.NumberField({initial : 0})
        schema.crew = new fields.SchemaField({
            starting : new fields.NumberField({initial : 0}),
            current : new fields.NumberField({initial : 0})
        })
        schema.size = new fields.SchemaField({
            value: new fields.StringField({ initial: "avg" })
        });
        schema.length = new fields.SchemaField({
            value: new fields.NumberField({min: 1, initial : 25})
        });
        schema.description = new fields.SchemaField({
            value: new fields.StringField({ initial: "" })
        });
        schema.gmdescription = new fields.SchemaField({
            value: new fields.StringField({ initial: "" }),
        });
        schema.price = new fields.SchemaField({
            gc: new fields.NumberField({initial : 0})
        });
        schema.availability = new fields.SchemaField({
            value: new fields.StringField(),
        });
        schema.motivePower = new fields.SchemaField({
            value: new fields.StringField(),
        });
        schema.hitLocationTable = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }

    computeSize()
    {
        let sizeNum = this.length.value;
        if (sizeNum <= 10)
        {
            return "tiny"
        }
        if (sizeNum <= 15)
        {
            return "ltl"
        }
        if (sizeNum <= 20)
        {
            return "sml"
        }
        if (sizeNum <= 35)
        {
            return "avg"
        }
        if (sizeNum <= 50)
        {
            return "lrg"
        }
        if (sizeNum <= 80)
        {
            return "enor"
        }
        return "mnst";
    }

    computeCrewEncumbrance(passengers)
    {
        let crewEncumbrance = 0;
        for (let p of passengers)
        {
            for(let count = 0; count < p.count; count++)
            {
                let bulk = game.wfrp4e.config.crewBulk[p.actor?.details.size.value]
                if (bulk)
                {
                    if (this.crew.current + bulk.crew > this.crew.starting)
                    {
                        crewEncumbrance += bulk.encumbrance;
                    }
                    this.crew.current += bulk.crew;
                }
            }
        }
        return crewEncumbrance
    }

    computeMove()
    {
        if (this.move.custom.label && this.move.custom.value)
        {
            this.move.value = this.move.custom.value;
        }
        else 
        {
            this.move.value = this.move[this.move.primary].value || 0;
        }
        this.move.display = this.formatMoveString();
    }

    formatMoveString()
    {
        let string = "";

        if (this.move.custom.label)
        {
            string = `${this.move.custom.label}`;
            if (this.move.custom.value)
            {
                string += ` (${this.move.custom.value})`
            }
        }

        if (this.move.sail.enabled)
        {
            if (this.move.primary == "sail")
            {
                string += "<strong>" + game.i18n.localize("VEHICLE.S") + "</strong>" 
            }
            else 
            {
                string += game.i18n.localize("VEHICLE.S") 
            }
            if (this.move.sail.value)
            {
                string += ` (${this.move.sail.value})`
            }
        }

        if (this.move.oars.enabled)
        {
            if (string)
            {
                string += " / "
            }

            if (this.move.primary == "oars")
            {
                string += "<strong>" + game.i18n.localize("VEHICLE.O") + "</strong>" 
            }
            else 
            {
                string += game.i18n.localize("VEHICLE.O") 
            }

            if (this.move.oars.value)
            {
                string += ` (${this.move.oars.value})`
            }
        }

        return string;
    }
}