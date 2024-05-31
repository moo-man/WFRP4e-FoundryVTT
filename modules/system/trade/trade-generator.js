let d100 = () => Math.ceil(CONFIG.Dice.randomUniform() * 100);
let d20 = () => Math.ceil(CONFIG.Dice.randomUniform() * 20);
export default class TradeGenerator
{

    constructor(settlement)
    {
        this.settlement = settlement;
        this.tradeData = null;
        this.rolls = []
    }

    rollForCargo()
    {
        let available = [];

        let target = (this.settlement.wealth + this.settlement.size) * 10;
        if (this.settlement.produces.length)
        {
            let roll = d100();
            this.rolls.push(roll);
            if (roll <= target)
            {
                available = available.concat(this.settlement.produces);
            }
        }
        if (this.settlement.trade)
        {
            let roll = d100();
            this.rolls.push(roll);
            if (roll <= target)
            {
                available = available.concat(this.randomCargo(this.settlement.season));
            }
        }
        return available[Math.floor(CONFIG.Dice.randomUniform() * available.length)];
    }

    randomCargo() {
        let roll = d100();
        let cargoTable = game.wfrp4e.trade.tradeData.river.cargoTable[this.settlement.season];
        for (let key in cargoTable) 
        {
            let cargoData = cargoTable[key]
            if (roll <= cargoData.max && roll >= cargoData.min) 
            {
                return key;
            }
        }
    }

    async attemptTrade()
    {
        let cargoAvailable = this.rollForCargo();

        if (cargoAvailable)
        {
            let merchant = await this.createMerchant();
            let item = this.createCargoItem(cargoAvailable, merchant);
            this.createCargoMessage(item, this.tradeData)
        }
        else 
        {
            ChatMessage.create({content : game.i18n.format("TRADE.NoCargoFound", {town : this.settlement.name, rolls: this.rolls.join(", ")})});
        }
    }

    static async buyTrade(event) {
        let cargoData = this.getCargoData(event)
        let actor = game.user.character;
        if (!actor) return ui.notifications.error("Please assign a character.");
    
        // Perform the total amount of money to pay and get the available amount from the PCs
        let toPay
        if (cargoData.system.price.gc.toString().includes("."))
        {
          let fraction = Number("." + cargoData.system.price.gc.toString().split(".")[1])
          toPay = Math.trunc(cargoData.system.price.gc) + game.i18n.localize("MARKET.Abbrev.GC")
    
          let ss = 20 * fraction
          if (ss.toString().includes("."))
          {
            fraction = Number("." + ss.toString().split(".")[1])
            toPay += `${Math.trunc(ss)}${game.i18n.localize("MARKET.Abbrev.SS")}`
            let bp = Math.round(12 * fraction)
            if (bp)
              toPay += `${bp}${game.i18n.localize("MARKET.Abbrev.BP")}`
          }
          else toPay += `${ss}${game.i18n.localize("MARKET.Abbrev.SS")}`
        }
        else toPay = `${cargoData.system.price.gc}${game.i18n.localize("MARKET.Abbrev.GC")}`
    
    
        // Check if enough money or not
        let newMoneyInventory = game.wfrp4e.market.payCommand(toPay, actor)
        if (newMoneyInventory) {
          actor.updateEmbeddedDocuments("Item", newMoneyInventory);
    
          cargoData.type = "cargo";
          cargoData.img = "modules/wfrp4e-dotr/assets/icons/cargo.png";
          let itemCargo = await Item.create(cargoData, { temporary: true })
          itemCargo.postItem(1);
        }
      }

    attemptSell(cargo)
    {
        let message;
        let price = Number(cargo.system.price.gc);
    
        let targetScore = (this.settlement.size * 10) + ((this.settlement.trade) ? 30 : 0);
        let score1 = d100();
        let score2 = d100();
    
        if (this.settlement.produces.includes(cargo.system.cargoType.value))
        {
            message = "This good is already produced at <b>" + this.settlement.name + "</b>"
        }
        else if (cargo.system.origin.value == this.settlement.name)
        {
            message = "You cannot sell cargo in the same settlement you bought it from."
        }
        else if (score1 <= targetScore) 
        {
          let sellPrice = price + (price * game.wfrp4e.trade.tradeData.river.wealthAvailability[this.settlement.wealth].offered);
          sellPrice += sellPrice * ((d20() - 10) / 100);
          sellPrice = Math.round(sellPrice);
          message = "A merchant is willing to buy the whole cargo for " + `<a class="money-drag" data-amt="${sellPrice}g"><strong>${sellPrice} GC</strong></a>`
        } 
        else if (score2 <= targetScore) 
        {
          let sellPrice = price / 2 + (price / 2 * game.wfrp4e.trade.tradeData.river.wealthAvailability[this.settlement.wealth].offered);
          sellPrice += sellPrice * ((d20() - 10) / 100);
          sellPrice = Math.round(sellPrice);
          message = "A merchant is willing to buy half the size of the cargo for " + `<a class="money-drag" data-amt="${sellPrice}g"><strong>${sellPrice} GC</strong</a>`
        } 
        else 
        {
          message = "You cannot find anyone who wants to buy this cargo in <b>" + this.settlement.name + "</b>";
        }
        return ChatMessage.create(game.wfrp4e.utility.chatDataSetup(message));
    }

    createCargoItem(cargoKey, merchant)
    {
        let size = this._computeSize();
        let {price, quality} = this._computePriceQuality(cargoKey);

        let name = "TRADE." + cargoKey.capitalize(); // Auto-build tanslation key
        this.tradeData = { name: game.i18n.localize(name), town: this.settlement.name.capitalize(), merchant};

        let itemData = { system: duplicate(game.system.model.Item.cargo) };
        itemData.name = game.i18n.format("TRADE.CargoItemName", { name: this.tradeData.name })
        itemData.system.cargoType.value = cargoKey
        itemData.system.origin.value = this.tradeData.town
        itemData.system.unitPrice.value = price
        itemData.system.price.gc = price * (size / 10);
        itemData.system.quality.value = quality
        itemData.system.description.value = `<p>${game.i18n.format("TRADE.CargoDescr", { name : merchant.name, town: this.tradeData.town })}</p>`
        itemData.system.encumbrance.value = size
        itemData.system.tradeType = "river";

        return itemData

    }

    async createMerchant()
    {
        let species = (await game.wfrp4e.tables.rollTable("species")).species;
        let gender = (await new Roll("1d2").roll()).total == 1 ? "male" : "female";
        let name = game.wfrp4e.names.generateName({ species, gender });
        let haggle = (await new Roll("2d10+30").roll()).total;
        

        return {species, gender, name, haggle};
    }

    createCargoMessage(itemData, tradeData)
    {
        if (!tradeData)
        {
            throw Error("No successful trade data provided")
        }
        let message =
        `<h3>${game.i18n.format("TRADE.CargoTitle", tradeData)}</h3><br>
          <b>Enc</b>: ${itemData.system.encumbrance.value}<br>
          <b>${game.i18n.localize("TRADE.Price")}</b>: ${itemData.system.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}<br>
          <b>${game.i18n.localize("TRADE.Quality")}</b>: ${game.i18n.localize("TRADE." + itemData.system.quality.value.capitalize())}<br><br>
          ${game.i18n.format("TRADE.MerchantData", tradeData.merchant)}<br>`;

          message += `<span class="chat-card-button-area">`;
          message += `<a class='chat-card-button market-button trade-cargo-click' data-button='manageTrade'>${game.i18n.localize("TRADE.ManageCargo")}</a>`;
          message += "</span>";
          let messageData = game.wfrp4e.utility.chatDataSetup(message, "gmroll")
          messageData["flags.wfrp4e.cargoData"] = itemData
          return ChatMessage.create(messageData);
    }


    _computeSize()
    {
        let baseSize = d100();

        if (this.settlement.trade)
        {
            let tens = Math.floor(baseSize / 10);
            let unit = baseSize % 10;
            let reversed = unit * 10 + tens;
            if (reversed > baseSize)
            {
                baseSize = reversed;
            }
        }

        let roundedSize = Math.ceil(baseSize / 10) * 10;
        return roundedSize * (this.settlement.wealth + this.settlement.size);
    }

    _computePriceQuality(cargoKey)
    {
        let variation = (Math.ceil(CONFIG.Dice.randomUniform() * 20) - 10) / 100;
        let cargoTable = game.wfrp4e.trade.tradeData.river.cargoTable[this.settlement.season];
        let cargoData = cargoTable[cargoKey]

        let randomize = Math.round(cargoData.price * variation);
        let price = cargoData.price + randomize;// random +/-10% variation to simulate market variance

        let quality = "average";

        // Get the price in case of brandy
        if (cargoKey == "wine" || cargoKey == "brandy") {

            let wineBrandyPrice = game.wfrp4e.trade.tradeData.river.wineBrandyPrice
            let score = Math.ceil(CONFIG.Dice.randomUniform() * 10)
            for (let i = 0; i < wineBrandyPrice.length; i++) 
            {
                if (score <= wineBrandyPrice[i].score) 
                {
                    price = wineBrandyPrice[i].price;
                    quality = wineBrandyPrice[i].quality;
                    break; 
                }
            }
        }

        return {price, quality};
    }
}
