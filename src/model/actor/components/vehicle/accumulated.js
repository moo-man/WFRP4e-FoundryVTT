let fields = foundry.data.fields;

export class CumulativeVehicleModifiers extends foundry.abstract.DataModel {

    static key = "";
    static initialSources = "";
    static chatRollLabel = "";
    static chatNoModifierLabel = "";
    static starting = 0;


    static defineSchema() {
        let schema = {};
        schema.starting = new fields.NumberField({initial: this.starting});
        schema.modifiers = new fields.ArrayField(new fields.SchemaField({
            value : new fields.NumberField(),
            formula : new fields.StringField(),
            description : new fields.StringField()
        }))
        schema.sources = new fields.ArrayField(new fields.SchemaField({
            formula : new fields.StringField(),
            description : new fields.StringField(),
            active : new fields.BooleanField()
        }), {initial: game.wfrp4e.config[this.initialSources] || []})
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

        let msg = `<h2>${game.i18n.localize(this.constructor.chatRollLabel)}</h2><h4>${label}</h4>`
        let sources = foundry.utils.deepClone(this.sources.filter(i => i.active));
        if (!sources.length)
        {
            msg += `<p>${game.i18n.localize(this.constructor.chatNoModifierLabel)}</p>`;
        }
        else 
        {
            for(let source of sources)
            {
                let roll = await new Roll(source.formula).roll({allowInteractive : false});
                source.value = roll.total;
                msg += `<p><a class="inline-roll" data-tooltip="${source.formula}">${source.value}</a>: ${source.description}</p>`
            }
        }
        if (!suppressMsg)
        {
            ChatMessage.create({content : msg}, {speaker : {alias : this.parent.parent.name}, whisper : ChatMessage.getWhisperRecipients("GM")});
        }
        let log = this.updateLog(label, sources);
        this.parent.parent.parent.update({["system.status." + this.constructor.key] :  {modifiers : this.modifiers.concat(sources), log}});
    }

    // Helper for adding a single morale value with a label
    addEntry(label, modifier)
    {
        let modifierEntry = [{value : modifier}]
        return this.parent.parent.parent.update({["system.status." + this.constructor.key] :  {modifiers : this.modifiers.concat(modifierEntry), log : this.updateLog(label, modifierEntry)}});
    }

    setValue(label, value)
    {
        let diffValue = value - this.value;
        return this.addEntry(label, diffValue)
    }

    updateLog(label, newModifiers)
    {
        let range = [this.modifiers.length, this.modifiers.length + newModifiers.length - 1];
        return this.log.concat([{label, range}])
    }

    deleteLog(index)
    {
        let newLog = foundry.utils.deepClone(this.log);
        newLog.splice(index, 1);
        return newLog
    }

    clear()
    {
        this.parent.parent.parent.update({["system.status." + this.constructor.key] :  {modifiers : [], log : []}});
    }
}