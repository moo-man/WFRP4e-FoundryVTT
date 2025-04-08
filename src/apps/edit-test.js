

export default class EditTest extends  HandlebarsApplicationMixin(ApplicationV2)
{
    static DEFAULT_OPTIONS = {
        tag: "form",
        classes: ["warhammer", "standard-form", "edit-test"],
        window: {
            title: "Edit Test",
            resizable : false,
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
        context.roll = this.test.preData.roll;
        context.hitloc = this.test.preData.hitloc;
        context.SL = this.test.preData.SL;
        context.target = this.test.preData.target;
        return context;
    }

    static _onSubmit(ev, form, formData)
    {
        this.test.edit(formData.object);
    }
}