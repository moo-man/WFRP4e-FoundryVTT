let fields = foundry.data.fields;

export class ChannellingModel extends foundry.abstract.DataModel 
{
    static defineSchema() 
    {
        return {
            wind : new fields.StringField({initial : ""}),
            value : new fields.NumberField({initial : 0, min: 0}),
        }
    }

    clear()
    {
        return {[this.schema.fieldPath] : {wind: "", value: 0}};
    }

    set({wind=null, value=0, add=false}={})
    {

        // If changing winds, start at 0
        if (wind && this.wind && wind != this.wind)
        {
            this.value = 0;
        }

        if (add)
        {
            value = this.value + value;
        }
        else
        {
            value = value || this.value;
        }

        // If value is set to 0, remove wind property, nothing has been channelled. 
        if (value <= 0)
        {
            wind = "";
        }
        else if (!wind)
        {
            wind = this.wind;
        }

        return {[this.schema.fieldPath] : {wind, value}};
    }

    getWinds(spells)
    {
        let winds = {};
        for(let spell of spells)
        {
            for (let wind of spell.system.lore.value.map(i => game.wfrp4e.config.loreWind[i]))
            {
                if (!winds[wind])
                {
                    winds[wind] = {
                        label : game.wfrp4e.config.magicWind[wind],
                        img: game.wfrp4e.config.windIcons[wind]
                    }
                }
            }
        }
        return winds;
    }

    getEffect(actor)
    {
        if (this.wind && this.value > 0)
        {
            let effectData = foundry.utils.deepClone(game.wfrp4e.config.systemEffects.channelling);
            effectData.name += ` (${game.wfrp4e.config.magicWind[this.wind]})`;
            effectData.img = game.wfrp4e.config.windIcons[this.wind];
            return new ActiveEffect.implementation(effectData, {parent: actor});
        }
    }
}