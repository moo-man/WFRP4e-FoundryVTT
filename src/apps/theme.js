let fields = foundry.data.fields;

export default class WFRP4eThemeConfig extends HandlebarsApplicationMixin(ApplicationV2)
{
  static DEFAULT_OPTIONS = {
    id: "theme-config",
    tag: "form",
    window: {
      title: "WH.Theme.Config",
      contentClasses: ["standard-form"]
    },
    form: {
      closeOnSubmit: true,
      handler: this.onSubmit
    },
    position: { width: 540 },
    actions: {
      reset: this.onReset
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/wfrp4e/templates/apps/theme-config.hbs",
      scrollable: [""]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  };

  static get schema() {
    return WFRP4eThemeConfig.#schema;
  }

  static #schema = new foundry.data.fields.SchemaField({

    actor: new foundry.data.fields.SchemaField({
      enabled: new foundry.data.fields.BooleanField({ initial: true }),
      font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    }),
    item: new foundry.data.fields.SchemaField({
      enabled: new foundry.data.fields.BooleanField({ initial: true }),
      font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    }),
    journal: new foundry.data.fields.SchemaField({
      enabled: new foundry.data.fields.BooleanField({ initial: true }),
      font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    }),
    sidebar: new foundry.data.fields.SchemaField({
      enabled: new foundry.data.fields.BooleanField({ initial: true }),
      font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    }),
    apps: new foundry.data.fields.SchemaField({
      enabled: new foundry.data.fields.BooleanField({ initial: true }),
      font: new foundry.data.fields.StringField({ required: true, initial: "classic", choices: { "classic": "WH.Theme.Font.Classic", "readable": "WH.Theme.Font.Readable" } })
    }),

  });

  /**
   * The current setting value
   * @type {GameUIConfiguration}
   */
  #setting;

  /**
   * Track whether the schema has already been localized.
   * @type {boolean}
   */
  static #localized = false;

  /* -------------------------------------------- */

  /** @inheritDoc */
  async _preFirstRender(_context, _options) {
    await super._preFirstRender(_context, _options);
    if (!WFRP4eThemeConfig.#localized) {
      foundry.helpers.Localization.localizeDataModel({ schema: WFRP4eThemeConfig.#schema }, {
        prefixes: ["WH.Theme"],
          prefixPath: "wfrp4e.theme."
      });
      WFRP4eThemeConfig.#localized = true;
    }
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    if (options.isFirstRender) this.#setting = await game.settings.get("wfrp4e", "theme");
    return {
      setting: this.#setting,
      fields: WFRP4eThemeConfig.#schema.fields,
      buttons: [
        { type: "reset", label: "Reset", icon: "fa-solid fa-undo", action: "reset" },
        { type: "submit", label: "Save Changes", icon: "fa-solid fa-save" }
      ]
    };
  }

  _onChangeForm(_formConfig, _event) {
    const formData = new foundry.applications.ux.FormDataExtended(this.form);
    this.#setting = WFRP4eThemeConfig.#cleanFormData(formData);
    this.setThemeOnActiveSheets();
    this.render();
  }

  /** @inheritDoc */
  _onClose(options) {
    super._onClose(options);
    if (!options.submitted) game.configureUI(this.#setting);
  }

  setThemeOnActiveSheets()
  {
    Array.from(foundry.applications.instances).map(i => i[1]).filter(i => i instanceof WarhammerActorSheetV2 || i instanceof WarhammerItemSheetV2).forEach(sheet => {
      sheet.setTheme(this.#setting);
    })

    Array.from(foundry.applications.instances).map(i => i[1]).filter(i => i.element.classList.contains("journal-sheet")).forEach(sheet => {
      this.setThemeOnElement(sheet.element, this.#setting.journal);
    })

    this.setThemeOnElement(ui.sidebar.element, this.#setting.sidebar);
    // Consider chat notifications to be part of sidebar
    this.setThemeOnElement(document.body.querySelector("#chat-notifications"), this.#setting.sidebar);
    
    this.setThemeOnElement(document.body, this.#setting.apps);
  }

  setThemeOnElement(element, theme)
  {
    if (theme.enabled)
    {
      element.classList.remove("no-theme")

      if (theme.font == "classic")
      {
        element.classList.add("classic-font")
      }
      else
      {
        element.classList.remove("classic-font")
      }
    }
    else
    {
      element.classList.add("no-theme")
      element.classList.remove("classic-font")
    }
  }

  /**
   * Clean the form data, accounting for the field names assigned by game.settings.register on the schema.
   * @param {FormDataExtended} formData
   * @returns {GameUIConfiguration}
   */
  static #cleanFormData(formData) {
    return WFRP4eThemeConfig.#schema.clean(foundry.utils.expandObject(formData.object).wfrp4e.theme);
  }

  /**
   * Submit the configuration form.
   * @this {UIConfig}
   * @param {SubmitEvent} event
   * @param {HTMLFormElement} form
   * @param {FormDataExtended} formData
   * @returns {Promise<void>}
   */
  static async onSubmit(event, form, formData) {
    await game.settings.set("wfrp4e", "theme", this.#setting);
  }
}