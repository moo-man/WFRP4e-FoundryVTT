export default class CargoDialog extends HandlebarsApplicationMixin(ApplicationV2)
{
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["warhammer", "standard-form"],
    window: {
      title: "Manage Trade"
    },
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      handler: this._onSubmit
    }

  }


  /* -------------------------------------------- */
  constructor(cargoData, options) {
    super(options);
    this.cargoData = cargoData;
  }

  /** @override */
  static PARTS = {
    form: {
      template: "systems/wfrp4e/templates/apps/trade/trade-cargo.hbs",
      scrollable: [""]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  };

  async _prepareContext(options) {
    let context = await super._prepareContext(options);
    context.cargoData = this.cargoData;
    context.buttons = [{ type: "submit", label: "TRADE.CreateCargoItem" }]
    return context
  }


  /* -------------------------------------------- */
  static async _onSubmit(ev, form, formData) {
    this.cargoData.system.encumbrance.value = parseInt(formData.object.size);
    let cargoDiscount = parseInt(formData.object.modifier || 0);
    this.cargoData.system.price.gc = this.cargoData.system.encumbrance.value / (this.cargoData.system.tradeType == "river" ? 10 : 1) * parseFloat(this.cargoData.system.unitPrice.value) * (1.0 + (cargoDiscount / 100));

    let message =
      `${game.i18n.format("TRADE.MerchantDataBuy", { cargoName: this.cargoData.name, cargoSize: this.cargoData.system.encumbrance.value, cargoPrice: this.cargoData.system.price.gc })}<br>
      <p><a class='chat-button' data-action='buyCargo'>${game.i18n.localize("TRADE.BuyCargo")}</a></p>`;

    let messageData = game.wfrp4e.utility.chatDataSetup(message)
    messageData["flags.wfrp4e.cargoData"] = this.cargoData
    ChatMessage.create(messageData);
  }

  /* -------------------------------------------- */
  async _onRender(options) {
    await super._onRender(options);

    this.priceElement = this.element.querySelector("[name='price']");

    // Update from quantity!
    this.sizeElement = this.element.querySelector('[name="size"]');
    this.sizeElement.addEventListener("change", event => {
      let discount = Number(this.modifierElement.value);
      let newSize = Number(event.target.value);
      let newPrice = newSize / 10 * this.cargoData.system.unitPrice.value * (1.0 + (discount / 100));
      this.priceElement.value = newPrice;
    });
    // Update from discount!
    this.modifierElement = this.element.querySelector('[name="modifier"]');
    this.modifierElement.addEventListener("change", event => {
      let discount = Number(event.target.value)
      let newSize = Number(this.sizeElement.value)
      let newPrice = newSize / 10 * this.cargoData.system.unitPrice.value * (1.0 + (discount / 100));
      this.priceElement.value = newPrice;
    });
  }

}
