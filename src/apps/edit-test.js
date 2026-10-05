

export default class EditTest extends  HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "edit-test"],
        window: {
            title: "Edit Test",
            resizable : false,
            contentClasses : ["standard-form"]
        },
        form: {
            submitOnChange: false,
            closeOnSubmit : true,
            handler: this._onSubmit
        }
    }

    constructor(test, options) {
        super(options)
        this.test = test;
    }


      /** @override */
    static PARTS = {
        form: {
            template: "systems/wfrp4e/templates/apps/edit-test.hbs",
        },
    };

    async _prepareContext(options) {
        let context = await super._prepareContext(options);

        let testData = this.test.e5 ? this.test.testData : this.test.preData;

        context.roll = testData.roll;
        context.hitloc = (this.test.e5 ? testData.hitLocation.roll : testData.hitloc) || this.test.result.hitloc?.roll;
        context.SL = this.test.e5 ? testData.definedSL : testData.SL;
        context.target = testData.target;
        return context;
    }

    static _onSubmit(ev, form, formData)
    {
        this.test.edit(formData.object);
    }
}