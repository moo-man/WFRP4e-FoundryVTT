import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class SkillModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();
        schema.advanced = new fields.SchemaField({
            value: new fields.StringField(),
        });
        schema.grouped = new fields.SchemaField({
            value: new fields.StringField({ initial: "noSpec" })
        });
        schema.characteristic = new fields.SchemaField({
            value: new fields.StringField({ initial: "ws" }),
        });
        schema.advances = new fields.SchemaField({
            value: new fields.NumberField(),
            costModifier: new fields.NumberField(),
            force: new fields.BooleanField(),
        });
        schema.modifier = new fields.SchemaField({
            value: new fields.NumberField(),
        });
        schema.total = new fields.SchemaField({
            value: new fields.NumberField(),
        });
        return schema;
    }

    async preUpdateChecks(data) {
        await super.preUpdateChecks(data);

        if (this.parent.isOwned && this.grouped.value == "isSpec" && data.name) {
            this._handleSkillNameChange(data.name)
        }
    }

    // If an owned (grouped) skill's name is changing, change the career data to match
    _handleSkillNameChange(newName) {
        let oldName = this.parent.name
        let currentCareer = this.parent.actor?.currentCareer;
        if (!currentCareer) 
        {
            return
        }
        else 
        {
            currentCareer.system.changeSkillName(oldName, newName)
        }
    }
}