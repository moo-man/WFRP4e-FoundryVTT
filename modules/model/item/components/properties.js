let fields = foundry.data.fields;

export default PropertiesMixin = (cls) => class extends cls 
{
    static defineSchema() {
        let schema = super.defineSchema();
        schema.qualities = new fields.SchemaField({
            value: new fields.ArrayField(new fields.ObjectField({}))
        });
        schema.flaws = new fields.SchemaField({
            value: new fields.ArrayField(new fields.ObjectField({}))
        });
        return schema;
    }

    //#region getters

    get loading() {
        return this.properties.flaws.reload
    }

    get repeater() {
        return this.properties.qualities.repeater
    }

    get isMagical() {
        return this.properties.qualities.magical || this.properties.unusedQualities?.magical; // Should still be magical if unused
      }

    get properties() {

        if (this._properties)
        {
            return this._properties;
        }

        else return {
            qualities: this.constructor._propertyArrayToObject(this.qualities.value, game.wfrp4e.utility.qualityList()),
            flaws: this.constructor._propertyArrayToObject(this.flaws.value, game.wfrp4e.utility.flawList()),
        }
    }

    get originalProperties() {
        let properties = {
            qualities: this.constructor._propertyArrayToObject(this._source.qualities.value, game.wfrp4e.utility.qualityList()),
            flaws: this.constructor._propertyArrayToObject(this._source.flaws.value, game.wfrp4e.utility.flawList()),
            unusedQualities: {}
        }
        return properties;
    }

    get OriginalQualities() {
        let qualities = Object.values(this.originalProperties.qualities)
        let ungrouped = qualities.filter(i => !i.group).map(q => q.display)
        let grouped = []
        let groupNums = this.QualityGroups
        for (let g of groupNums) {
            grouped.push(qualities.filter(i => i.group == g).map(i => i.display).join(" " + game.i18n.localize("QualitiesOr") + " "))
        }
        return ungrouped.concat(grouped)
    }

    get OriginalFlaws() {
        return Object.values(this.originalProperties.flaws).map(f => f.display)
    }


    // Related to OR qualities - can choose which one is active
    get QualityGroups() {
        // return groups with no duplicates
        return Object.values(this.originalProperties.qualities)
            .map(i => i.group)
            .filter(i => Number.isNumeric(i))
            .filter((value, index, array) => {
                return array.findIndex(i => value == i) == index
            });
    }

    get Qualities() {
        return Object.values(this.properties.qualities).map(q => q.display)
    }

    get UnusedQualities() {
        return Object.values(this.properties.unusedQualities).map(q => q.display)
    }

    get InactiveQualities() {
        return Object.values(this.properties.inactiveQualities).map(q => q.display)
    }

    get Flaws() {
        return Object.values(this.properties.flaws).map(f => f.display)
    }

    //#endregion

    computeBase() {
        this._properties = null;
        super.computeBase();
    }

    computeEncumbrance() 
    {
        let enc = super.computeEncumbrance();

        if (this.properties.qualities?.lightweight && enc >= 1)
            enc -= 1 * this.quantity.value
        if (this.properties.flaws?.bulky)
            enc += 1 * this.quantity.value

        return enc
    }

    /**
   * 
   * @param {Object} properties properties object to add
   */
    _addProperties(properties) {
        let qualities = this.qualities.value;
        let flaws = this.flaws.value;

        for (let q in properties.qualities) {
            let hasQuality = qualities.find(quality => quality.name == q)
            if (hasQuality && properties.qualities[q].value) {
                hasQuality.value += properties.qualities[q].value
            }
            else
                qualities.push({ name: q, value: properties.qualities[q].value })
        }
        for (let f in properties.flaws) {
            let hasQuality = flaws.find(flaw => flaw.name == f)
            if (hasQuality && properties.flaws[f].value) {
                hasQuality.value += properties.flaws[f].value
            }
            else
                flaws.push({ name: f, value: properties.flaws[f].value })
        }
    }

    static _propertyArrayToObject(array, propertyObject) {

        let properties = {}

        // Convert quality/flaw arry into an properties object (accessible example `item.properties.qualities.accurate` or `item.properties.flaws.reload.value)
        if (array) {
            array.forEach(p => {
                if (propertyObject[p.name]) {
                    properties[p.name] = {
                        key: p.name,
                        display: propertyObject[p.name],
                        value: p.value,
                        group: p.group,
                        active: p.active
                    }
                    if (p.value)
                        properties[p.name].display += " " + (Number.isNumeric(p.value) ? p.value : `(${p.value})`)

                }
                else if (p.custom) {
                    properties[p.key] = {
                        key: p.key,
                        display: p.display
                    }
                }
                // Unrecognized
                else properties[p.name] = {
                    key: p.name,
                    display: p.name
                }
            })
        }

        return properties
    }
}