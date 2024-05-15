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
        this.parent.parent.parent.update({["system.status." + this.constructor.key] :  {modifiers : this.modifiers.concat(sources), log}});
    }

    dialog(actor) 
    {
        let defaultValue = "";
        if (game.modules.get("foundryvtt-simple-calendar")?.active) {
            defaultValue = SimpleCalendar.api.currentDateTimeDisplay()?.date
        }

        let activeSources = foundry.utils.deepClone(this.sources).map((source, index) => { source.index = index; return source }).filter(source => source.active);
        let ol = `<ol>
      ${activeSources.map((source) => {
            let li = `<li data-index="${source.index}" style="display: flex; justify-content: space-around"><a style="flex: 0 0 20px" class="remove"><i class="fa-solid fa-xmark"></i></a><span style="flex: 1">${source.description}</span><span style="flex: 0 0 30px">${source.formula}</span>`
            return li;
        }).join("")}
    </ol>
    `

        // If values object provided, show a select box, otherwise, just a text input
        let content = `<div class="value-dialog"><p>Enter Week Label</p><input class="value" type="text" value="${defaultValue}"></div>` + (activeSources.length ? ol : "No Active Sources!")


        return Dialog.wait({
            title: "Week Label",
            content: content,
            buttons: {
                submit: {
                    label: game.i18n.localize("Submit"),
                    callback: (html) => {
                        this.roll(html.find("input")[0].value);
                    }
                }
            },
            default: "submit",
            render: (html) => {
                html.find(".remove").click(ev => {
                    let index = Number(ev.currentTarget.parentElement.dataset.index);
                    let sources = foundry.utils.deepClone(this.sources)
                    sources[index].active = false;
                    actor.update({ [`system.status.${this.constructor.key}.sources`]: sources });
                    ev.currentTarget.parentElement.remove();
                })
            }
        })
    }

    updateLog(label, newModifiers)
    {
        let range = [this.modifiers.length, this.modifiers.length + newModifiers.length - 1];
        return this.log.concat([{label, range}])
    }

    clear()
    {
        this.parent.parent.parent.update({["system.status." + this.constructor.key] :  {modifiers : [], log : []}});
    }
}