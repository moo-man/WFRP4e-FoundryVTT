let fields = foundry.data.fields;
export default class TestDataModel extends foundry.abstract.DataModel
{
static LOCALIZATION_PREFIXES = ["WH.Components.Test"];

    static defineSchema()
    {
        return {
            self: new fields.SchemaField({
                difficulty: new fields.StringField({}),
                characteristic: new fields.StringField({}),
                skill: new fields.StringField({})
            }),
            target: new fields.SchemaField({
                difficulty: new fields.StringField({}),
                characteristic: new fields.StringField({}),
                skill: new fields.StringField({})
            })
        }
    }

    async setup(actor, item, {context={}, options={}}={}, type="self")
    {
        // If target, don't add item to context (that's only for using the item, not responding to it)
        if (type == "self")
        {
            context.item = item;
        }
        else if (!context.appendTitle)
        {
            context.appendTitle = ` – ${item.name}`;
        }

        let test;
        let data = this[type];
        if (data.difficulty)
        {
            context.fields = context.fields || {};
            context.fields.difficulty = data.difficulty;
        }
        if (data.skill)
        {
            test = await actor.setupSkill(data.skill, context, options);
        }
        else if (data.characteristic)
        {
            test = await actor.setupCharacteristic(data.characteristic, context, options);
        }
        else 
        {
            throw Error("Test not defined with a skill or a characteristic");
        }

        return await test.roll();

    }

    get hasSelf()
    {
        return this.self.characteristic || this.self.skill;
    }

    get hasTarget()
    {
        return this.target.characteristic || this.target.skill;
    }

    get selfLabel()
    {
        return this._getLabel("self");
    }

    get targetLabel()
    {
        return this._getLabel("target");
    }

    _getLabel(type)
    {
        let skill = this[type].skill;
        let characteristic = this[type].characteristic;
        let difficulty = this[type].difficulty;

        if (!skill && !characteristic)
        {
            return "";
        }

        return `${game.wfrp4e.config.difficultyLabels[difficulty] || ""} ${skill || game.wfrp4e.config.characteristics[characteristic]} Test`;
    }
}