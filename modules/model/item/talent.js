import { BaseItemModel } from "./components/base";
let fields = foundry.data.fields;


export class TalentModel extends BaseItemModel {
    static LOCALIZATION_PREFIXES = ["WH.Models.talent"];
    static defineSchema() {
        let schema = super.defineSchema();
        schema.max = new fields.SchemaField({
            value: new fields.StringField({choices : game.wfrp4e.config.talentMax})
        });
        schema.advances = new fields.SchemaField({
            value: new fields.NumberField({initial : 1, min: 1}),
            force: new fields.BooleanField()
        })
        schema.career = new fields.SchemaField({
            value: new fields.StringField()
        });
        schema.tests = new fields.SchemaField({
            value: new fields.StringField()
        });
        return schema;
    }

    /**
     * Used to identify an Item as one being a child or instance of TalentModel
     *
     * @final
     * @returns {boolean}
     */
    get isTalent() {
        return true;
    }

    get Max() {
        switch (this.max.value) // Turn its max value into "numMax", which is an actual numeric value
        {
            case '1':
                return 1;

            case '2':
                return 2;

            case '3':
                return 3;

            case '4':
                return 4;

            case 'none':
                return "-";

            default:
                return this.parent.actor.characteristics[this.max.value].bonus;
        }
    }

    get cost() {
        return (this.Advances + 1) * 100
    }

    get Advances() {
        if (this.parent.isOwned) {
          let talents = this.parent.actor.itemTags["talent"]
          return talents.filter(i => i.name == this.parent.name).reduce((prev, current) => prev += current.advances.value, 0)
        }
        else {
          return this.advances.value
        }
      }

    computeOwned() {
        this.advances.indicator = this.advances.force;
    }

    addCareerData(career) {
        if (!career)
            return

        this.advances.career = this;
        this.advances.indicator = this.advances.indicator || !!this.advances.career || false
    }

    chatData() {
        let properties = [];
        properties.push(`<b>${game.i18n.localize("Max")}: </b> ${game.wfrp4e.config.talentMax[this.max.value]}`);
        if (this.tests.value)
            properties.push(`<b>${game.i18n.localize("Tests")}: </b> ${this.tests.value}`);
        return properties;
    }
}