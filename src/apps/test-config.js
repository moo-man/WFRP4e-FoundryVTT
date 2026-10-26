
export default class TestConfiguration extends WHFormApplication {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["warhammer", "standard-form"],
    window: {
      contentClasses: ["standard-form"],
      title: "Test Configuration"
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
      handler: this.submit
    }
  }

  constructor(document, options) {
    super(options);
    this.document = document;
  }

  /** @override */
  static PARTS = {
    form: {
      classes: ["standard-form"],
      template: "systems/wfrp4e/templates/apps/test-config.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.fields = this.document.system.schema.fields.test.fields;
    context.source = this.document._source.system.test;
    return context;
  }


}