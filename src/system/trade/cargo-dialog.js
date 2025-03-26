// Old code
/************************************************************************************/
export default class CargoDialog extends Dialog {

  /* -------------------------------------------- */
  constructor(html, cargoData) {
    let myButtons = {
      cargoButton: {
        label: game.i18n.localize("TRADE.CreateCargoItem"),
        callback: html => this.createCargoItem(html)
      },
      cancelButton: {
        label: game.i18n.localize("TRADE.Cancel"),
        callback: html => this.close()
      },
    };
    // Common conf
    let dialogConf = {
      content: html,
      buttons: myButtons,
      default: "cargoButton"
    }
    let dialogOptions = { classes: ["dialog"] }

    dialogConf.title = "Manage Trade",
    dialogOptions.width = 340;
    dialogOptions.height = 260;
    super(dialogConf, dialogOptions);

    this.cargoData = cargoData;
  }

  /* -------------------------------------------- */
  async createCargoItem(html, divider=1) {
    this.cargoData.system.encumbrance.value = parseInt($("#cargo-size").val());
    let cargoDiscount = parseInt($("#cargo-discount").val());
    this.cargoData.system.price.gc = this.cargoData.system.encumbrance.value / (this.cargoData.system.tradeType == "river" ? 10 : 1) * parseFloat(this.cargoData.system.unitPrice.value) * (1.0 + (cargoDiscount / 100));
    let message =
      `${game.i18n.format("TRADE.MerchantDataBuy", {cargoName : this.cargoData.name, cargoSize : this.cargoData.system.encumbrance.value, cargoPrice : this.cargoData.system.price.gc })}<br>
   <span class="chat-card-button-area">
   <a class='chat-card-button market-button trade-buy-click' data-button='buyTrade'>${game.i18n.localize("TRADE.BuyCargo")}</a>
   </span>`;

    let messageData = game.wfrp4e.utility.chatDataSetup(message)
    messageData["flags.wfrp4e.cargoData"] = this.cargoData
    ChatMessage.create(messageData);
  }

  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    // Get the rollData stuff
    var cargoData = this.cargoData;

    // Update from quantity!
    html.on('change', '#cargo-size', event => {
      let discount = Number($("#cargo-discount").val());
      let newSize = Number(event.currentTarget.value);
      let newPrice = newSize / 10 * this.cargoData.system.unitPrice.value * (1.0 + (discount / 100));
      $("#cargo-price").val(newPrice);
    });
    // Update from discount!
    html.on('change', '#cargo-discount', event => {
      let discount = Number(event.currentTarget.value)
      let newSize = Number($("#cargo-size").val())
      let newPrice = newSize / 10 * this.cargoData.system.unitPrice.value * (1.0 + (discount / 100));
      $("#cargo-price").val(newPrice);
    });
  }

}
