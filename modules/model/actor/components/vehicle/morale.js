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
        }), {initial: game.wfrp4e.config.initialMoraleSources || []})
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
}