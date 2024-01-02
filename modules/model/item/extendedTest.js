import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class ExtendedTestModel extends BaseItemModel {
    static defineSchema() {
        let schema = super.defineSchema();

        schema.SL = new fields.SchemaField({
            current: new fields.NumberField({ initial: 0 }),
            target: new fields.NumberField({ initial: 1 }),
        });

        schema.test = new fields.SchemaField({
            value: new fields.StringField({})
        });

        schema.negativePossible = new fields.SchemaField({
            value: new fields.BooleanField({ initial: false })
        });

        schema.failingDecreases = new fields.SchemaField({
            value: new fields.BooleanField({ initial: true })
        });

        schema.completion = new fields.SchemaField({
            value: new fields.StringField({ initial: "none" })
        });

        schema.hide = new fields.SchemaField({
            current: new fields.BooleanField({ initial: false }),
            target: new fields.BooleanField({ initial: false }),
        });

        schema.difficulty = new fields.SchemaField({
            value: new fields.StringField({ initial: "challenging" })
        });

        return schema;
    }



    computeOwned() {
        this.SL.pct = 0;
        if (this.SL.target > 0)
            this.SL.pct = this.SL.current / this.SL.target * 100
        if (this.SL.pct > 100)
            this.SL.pct = 100
        if (this.SL.pct < 0)
            this.SL.pct = 0;
    }

    chatData() {
        let properties = [];
        let pct = 0;
        if (this.SL.target > 0)
            pct = this.SL.current / this.SL.target * 100
        if (pct > 100)
            pct = 100
        if (pct < 0)
            pct = 0;
        properties.push(`<b>${game.i18n.localize("Test")}</b>: ${this.test.value}`)
        if (!this.hide.test && !this.hide.progress)
            properties.push(`<div class="test-progress">
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${pct}%"></div>
      </div>
      <span><a class="extended-SL">${this.SL.current}</a> / ${this.SL.target} SL</span>
    </div>`)

        return properties;
    }
}