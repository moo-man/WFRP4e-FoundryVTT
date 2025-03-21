import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;

export class ExtendedTestModel extends BaseItemModel {
    static LOCALIZATION_PREFIXES = ["WH.Models.extendedTest"];


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
            value: new fields.StringField({ initial: "none", choices : game.wfrp4e.config.extendedTestCompletion})
        });

        schema.hide = new fields.SchemaField({
            test: new fields.BooleanField({ initial: false }),
            progress: new fields.BooleanField({ initial: false }),
        });

        schema.difficulty = new fields.SchemaField({
            value: new fields.StringField({ initial: "challenging", choices : game.wfrp4e.config.difficultyLabels })
        });

        return schema;
    }

    static get compendiumBrowserFilters() {
        return new Map([
            ...Array.from(super.compendiumBrowserFilters),
            ["SL", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.SL.target.label",
                type: "range",
                config: {
                    keyPath: "system.SL.target"
                }
            }],
            ["test", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.test.value.label",
                type: "text",
                config: {
                    keyPath: "system.test.value"
                }
            }],
            ["negativePossible", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.negativePossible.value.label",
                type: "boolean",
                config: {
                    keyPath: "system.negativePossible.value"
                }
            }],
            ["failingDecreases", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.failingDecreases.value.label",
                type: "boolean",
                config: {
                    keyPath: "system.failingDecreases.value"
                }
            }],
            ["completion", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.completion.value.label",
                type: "boolean",
                config: {
                    choices: game.wfrp4e.config.extendedTestCompletion,
                    keyPath: "system.completion.value"
                }
            }],
            ["difficulty", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.difficulty.value.label",
                type: "boolean",
                config: {
                    choices: game.wfrp4e.config.difficultyLabels,
                    keyPath: "system.difficulty.value"
                }
            }],
            ["hide.test", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.hide.test.label",
                type: "boolean",
                config: {
                    keyPath: "system.hide.test"
                }
            }],
            ["hide.progress", {
                label: this.LOCALIZATION_PREFIXES + ".FIELDS.hide.progress.label",
                type: "boolean",
                config: {
                    keyPath: "system.hide.progress"
                }
            }]
        ]);
    }

    /**
     * Used to identify an Item as one being a child or instance of ExtendedTestModel
     *
     * @final
     * @returns {boolean}
     */
    get isExtendedTest() {
        return true;
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