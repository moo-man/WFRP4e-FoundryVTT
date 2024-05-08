import { MountModel } from "./mount";

let fields = foundry.data.fields;

export class MoraleModel extends foundry.abstract.DataModel {
    static defineSchema() {
        let schema = {};
        schema.starting = new fields.NumberField({initial: 75});
        schema.modifiers = new fields.ArrayField(new fields.SchemaField({
            value : new fields.NumberField(),
            formula : new fields.StringField(),
            description : new fields.StringField()
        }))
        schema.sources = new fields.ArrayField(new fields.SchemaField({
            formula : new fields.StringField(),
            description : new fields.StringField(),
            active : new fields.BooleanField()
        }), {initial: this.initialMoraleSources})
        schema.log = new fields.ArrayField(new fields.SchemaField({
            label : new fields.StringField(),
            range : new fields.ArrayField(new fields.NumberField())
        }));
        return schema;
    }

    compute()
    {
        this.value = this.starting
        for(let entry of this.log)
        {
            entry.modifiers = this.modifiers.slice(entry.range[0], entry.range[1]+1);
            entry.value = entry.modifiers.reduce((total, modifier) => total += Number(modifier?.value || 0), 0) || 0
            this.value += entry.value;
            entry.sum = this.value;
        }
    }

    async roll(label, suppressMsg = false)
    {
        if (!label)
        {
            return;
        }

        let msg = `<h2>Morale Rolls</h2><h4>${label}</h4>`
        let sources = foundry.utils.deepClone(this.sources.filter(i => i.active));
        if (!sources.length)
        {
            msg += `<p>No Active Morale Modifiers</p>`;
        }
        else 
        {
            for(let source of sources)
            {
                let roll = await new Roll(source.formula).roll();
                source.value = roll.total;
                msg += `<p><a class="inline-roll" data-tooltip="${source.formula}">${source.value}</a>: ${source.description}</p>`
            }
        }
        if (!suppressMsg)
        {
            ChatMessage.create({content : msg}, {speaker : {alias : this.parent.parent.name}, whisper : ChatMessage.getWhisperRecipients("GM")});
        }
        let log = this.updateLog(label, sources);
        this.parent.parent.parent.update({"system.status.morale" :  {modifiers : this.modifiers.concat(sources), log}});
    }

    updateLog(label, newModifiers)
    {
        let range = [this.modifiers.length, this.modifiers.length + newModifiers.length - 1];
        return this.log.concat([{label, range}])
    }

    clearMorale()
    {
        this.parent.parent.parent.update({"system.status.morale" :  {modifiers : [], log : []}});
    }

    static initialMoraleSources = [
    {active : false, description : "Pay is generous" ,      formula : "+2d10"},
    {active : false, description : "Captain is competent and/or makes good decisions",      formula : "+2d10"},
    {active : false, description : "Circumstances on board are certain to attract the favour of Manann",      formula : "+d10"},
    {active : false, description : "One officer (or more) per 10 crew",      formula : "+d10"},
    {active : false, description : "Captain is valiant in the face of danger",      formula : "+d10"},
    {active : false, description : "Food is more than basic rations",      formula : "+d10"},
    {active : false, description : "Good omen witnessed",      formula : "+d10"},
    {active : false, description : "Pay is regular",      formula : "+d10"},
    {active : false, description : "Landing at port and granted shore leave",      formula : "+d10"},
    {active : false, description : "Crew are shorthanded",      formula : "-d10"},
    {active : false, description : "Ship has not seen port for a week",      formula : "-d10"},
    {active : false, description : "Bad omen witnessed",      formula : "-d10"},
    {active : false, description : "Pay is irregular",      formula : "-d10"},
    {active : false, description : "Ship in uncharted waters",      formula : "-d10"},
    {active : false, description : "Sea monster sighted",      formula : "-d10"},
    {active : false, description : "Food is hard tack only",      formula : "-d10"},
    {active : false, description : "Landing at port and refused shore leave",      formula : "-2d10"},
    {active : false, description : "Ship in hostile waters",      formula : "-2d10"},
    {active : false, description : "Less than one officer per 30 crew",      formula : "-2d10"},
    {active : false, description : "Circumstances on board are certain to attract the displeasure of Manann",      formula : "-2d10"},
    {active : false, description : "Food is less than basic rations",      formula : "-2d10"},
    {active : false, description : "Disease rampant amongst the crew",      formula : "-2d10"},
    {active : false, description : "Captain is cowardly in the face of danger",      formula : "-2d10"},
    {active : false, description : "Captain treats the crew with marked disrespect",      formula : "-2d10"},
    {active : false, description : "Captain is incompetent and/or makes poor decisions",      formula : "-2d10"},
    {active : false, description : "Pay is miserly",      formula : "-2d10"},
    {active : false, description : "No pay",      formula : "-3d10"},
    {active : false, description : "Less than one officer per 50 crew",      formula : "-3d10"},
    {active : false, description : "Crew is suffering from starvation",      formula : "-4d10"}]
}