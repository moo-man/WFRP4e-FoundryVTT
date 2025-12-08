let d100 = () => Math.ceil(CONFIG.Dice.randomUniform() * 100);
let d20 = () => Math.ceil(CONFIG.Dice.randomUniform() * 20);
let d10 = () => Math.ceil(CONFIG.Dice.randomUniform() * 10);
export default class TradeGenerator
{

    constructor(settlement, tradeType)
    {
        this.settlement = settlement;
        this.tradeData = null;
        this.rolls = [];
        this.tradeType = tradeType;
    }

    async attemptTrade()
    {
        if (this.tradeType == "river")
        {
            return this.attemptRiverTrade();
        }
        else if (this.tradeType == "maritime")
        {
            return this.attemptMaritimeTrade();
        }
    }

    //#region River Trading

    async attemptRiverTrade()
    {
        let cargoAvailable = this.rollForCargoRiver()

        if (cargoAvailable)
        {
            let merchant = await this.createMerchant();
            let item = await this.createCargoItem(cargoAvailable, merchant);
            this.createCargoMessage(item, this.tradeData)
        }
        else 
        {
            ChatMessage.create({content : game.i18n.format("TRADE.NoCargoFound", {town : this.settlement.name, rolls: this.rolls.join(", ")})});
        }
    }

    rollForCargoRiver()
    {
        let available = [];

        let target = (this.settlement.wealth + this.settlement.size) * 10;
        let roll = d100();
        this.rolls.push(roll);
        if (roll <= target)
        {
            // If has product list, choose from product
            if (this.settlement.produces.length)
            {
                this.randomCargo(this.settlement.produces)
            }
            else // If no product list, choose randomly
            {
                this.randomCargo()
            }
            available = available.concat(this.settlement.produces);
        }

        // if (this.settlement.produces.length)
        // {
        //     let roll = d100();
        //     this.rolls.push(roll);
        //     if (roll <= target)
        //     {
        //         available = available.concat(this.settlement.produces);
        //     }
        // }
        if (this.settlement.trade)
        {
            let roll = d100();
            this.rolls.push(roll);
            if (roll <= target)
            {
                available = available.concat(this.randomCargo());
            }
        }
        return available[Math.floor(CONFIG.Dice.randomUniform() * available.length)];
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
          let sellPrice = price + (price * game.wfrp4e.trade.tradeData[this.tradeType].wealthAvailability[this.settlement.wealth].offered);
          sellPrice += sellPrice * ((d20() - 10) / 100);
          sellPrice = Math.round(sellPrice);
          message = "A merchant is willing to buy the whole cargo for " + `<a class="money-drag" data-amt="${sellPrice}g"><strong>${sellPrice} GC</strong></a>`
        } 
        else if (score2 <= targetScore) 
        {
          let sellPrice = price / 2 + (price / 2 * game.wfrp4e.trade.tradeData[this.tradeType].wealthAvailability[this.settlement.wealth].offered);
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

    async createCargoItem(cargoKey, merchant)
    {
        let size = this._computeSize();
        let {price, quality} = await this._computePriceQuality(cargoKey);

        let name = "TRADE." + cargoKey.capitalize(); // Auto-build tanslation key
        this.tradeData = { name: game.i18n.localize(name), town: this.settlement.name.capitalize(), merchant};

        let itemData = { system: foundry.utils.duplicate(game.model.Item.cargo) };
        itemData.name = game.i18n.format("TRADE.CargoItemName", { name: this.tradeData.name })
        itemData.system.cargoType.value = cargoKey
        itemData.system.origin.value = this.tradeData.town
        itemData.system.unitPrice.value = price
        itemData.system.price.gc = price * (size / 10);
        itemData.system.quality.value = quality
        itemData.system.description.value = `<p>${game.i18n.format("TRADE.CargoDescr", { name : merchant.name, town: this.tradeData.town })}</p>`
        itemData.system.encumbrance.value = size
        itemData.system.tradeType = this.tradeType;

        return itemData
    }


    //#endregion

    //#region Maritime Trading
    async attemptMaritimeTrade()
    {
        let cargoAvailable = this.getMaritimeCargo()
        let items = await this.createMaritimeCargoItems(cargoAvailable);
        if (items.length == 0)
        {
            ChatMessage.create({content : game.i18n.format("TRADE.NoCargoFound", {town : this.settlement.name, rolls: this.rolls.join(", ")})});
        }
    }

    getMaritimeCargo()
    {
        let available = [];

        for (let good of this.settlement.produces)
        {
            available.push(good);
        }

        for (let good of this.settlement.surplus)
        {
            available.push(good.split("+")[0].trim());
        }

        if (this.settlement.trade)
        {
            available.push(this.randomCargo());
        }
        return available;
    }

    attemptSellMaritime(cargo, far)
    {
        let message;
        let rollMessage;
        let price = Number(cargo.system.price.gc);

        let produces = this.settlement.produces.includes(cargo.system.cargoType.value)
        let surplus = Number(this.settlement.surplus.find(i => i.split("+")[0].trim() == cargo.system.cargoType.value)?.split("+")[1]) || 0
        let demand = Number(this.settlement.demand.find(i => i.split("+")[0].trim() == cargo.system.cargoType.value)?.split("+")[1]) || 0

        let buyer = false;
        let halfBuyer = false;
        let quarterBuyer = this.settlement.trade || demand;

        let difficulty; // Difficulty of gossip test if needed

        let target;
        let roll;
        let halfRoll;

        // Case 1 - Settlement does not produce and has no surplus
        if (!produces && !surplus )
        {
            target = (this.settlement.size + demand) * 10 + (this.settlement.trade ? 30 : 0)

            roll = d100()
            halfRoll = d100();
            if (roll <= target)
            {
                buyer = true;
            }
            else if (halfRoll <= target)
            {
                halfBuyer = true;
            }
        }

        // Case 2 - Settlement produces but has no surplus
        else if (produces && !surplus)
        {
            // "far" is if over 100 miles travelled

            difficulty = far ? "difficult" : "vhard";

            target = this.settlement.size * (far ? 10 : 5);
            roll = d100();
            if (roll <= target)
            {
                buyer = true;
            }
        }

        // Case 3 - Settlement has surplus
        else if (surplus)
        {
            difficulty = "vhard";
            target = this.settlement.size * 5;
            roll = d100();
            if (roll <= target)
            {
                buyer = true;
            }
        }


        if (cargo.system.origin.value == this.settlement.name)
        {
            message = "<p>You cannot sell cargo in the same settlement you bought it from.</p>"
            buyer = false;
            halfBuyer = false;
            quarterBuyer = false;
        }
        else 
        {
            if (halfRoll) 
            {
                rollMessage = `Rolled ${roll}, ${halfRoll} vs ${target}`;
            }
            else 
            {
                rollMessage = `Rolled ${roll} vs ${target}`;
            }

            if (buyer) 
            {
                message = `<p>A buyer was found at <strong>${this.settlement.name}</strong>`
            }
            else if (halfBuyer)
            {
                message = `<p>A buyer was found at <strong>${this.settlement.name}</strong>, but they are only willing to buy half the cargo.`
            }
            else
            {
                message = `<p>No buyer was found at <strong>${this.settlement.name}</strong>`
                if (quarterBuyer)
                {
                    message += `, but it's possible to offload to a merchant who will buy at a quarter price.</p>`
                }
            }

            message += ` (${rollMessage})</p>`
        }

        if (buyer || halfBuyer || quarterBuyer)
        {
            let offerPrices = game.wfrp4e.trade.tradeData[this.tradeType].offerPrice
            let offerIndex = Math.clamp(this.settlement.wealth + this.settlement.size + demand, 0, offerPrices.length - 1)
            let offerPriceMultiplier = offerPrices[offerIndex];

            let offerPrice = price + (price * offerPriceMultiplier);
            // Add slight variation
            offerPrice += Math.round(offerPrice * ((d20() - 10) / 100));

            if (!buyer && halfBuyer)
            {
                offerPrice /= 2;
            }

            else if (!buyer && quarterBuyer)
            {
                offerPrice /= 4;
            }

            message += "<p>They are willing to pay " + `<a class="money-drag" data-amt="${offerPrice}g"><strong>${offerPrice} GC</strong></a></p>`

            //TODO:  Add haggling (136)
        }

        return ChatMessage.create(game.wfrp4e.utility.chatDataSetup(message));
    }

    
    async createMaritimeCargoItems(cargoKeys)
    {
        let items = [];

        for (let key of cargoKeys)
        {    
            let sizeRoll = d10();

            this.rolls.push(sizeRoll);

            if (sizeRoll != 1)
            {
                let merchant = await this.createMerchant();
                let surplus = Number(this.settlement.surplus.find(i => i.split("+")[0].trim() == key)?.split("+")[1]) || 0

                let size = (sizeRoll * 10) * (this.settlement.wealth + this.settlement.size + surplus);
                let {price, quality} = await this._computePriceQuality(key);
                
                let name = "TRADE." + key.capitalize(); // Auto-build tanslation key
                this.tradeData = { name: game.i18n.localize(name), town: this.settlement.name.capitalize(), merchant};
                
                let itemData = { system: foundry.utils.duplicate(game.model.Item.cargo) };
                itemData.name = game.i18n.format("TRADE.CargoItemName", { name: this.tradeData.name })
                itemData.system.cargoType.value = key
                itemData.system.origin.value = this.tradeData.town
                itemData.system.unitPrice.value = price
                itemData.system.price.gc = price * size;
                itemData.system.quality.value = quality
                itemData.system.description.value = `<p>${game.i18n.format("TRADE.CargoDescr", { name : merchant.name, town: this.tradeData.town })}</p>`
                itemData.system.encumbrance.value = size
                itemData.system.tradeType = this.tradeType;
                items.push(itemData);

                await this.createCargoMessage(itemData, this.tradeData)
            } 
        }
        return items;
    }

    
    //#endregion

   
    randomCargo(products=[]) {

        // If supplied with products, randomnly select index
        if (products.length)
        {
            return products[Math.floor(CONFIG.Dice.randomUniform() * products.length)]
        }


        // Otherwise
        let roll = d100();
        let cargoTable = game.wfrp4e.trade.tradeData[this.tradeType].cargoTable[this.settlement.season];
        for (let key in cargoTable) 
        {
            let cargoData = cargoTable[key]
            if (roll <= cargoData.max && roll >= cargoData.min) 
            {
                return key;
            }
        }
    }

    async rollMerchantTest(merchant)
    {
        let roll = d100();

        let SL =  Math.floor(merchant.haggle / 10) - Math.floor(roll / 10);

        if (roll <= merchant.haggle)
        {
            SL += merchant.dealmaker;
        }
        merchant.test = {roll, SL};
    }

    static async buyCargo(cargoData) {
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

    async createMerchant()
    {
        let species = (await game.wfrp4e.tables.rollTable("species")).species;
        let gender = (await new Roll("1d2").roll({allowInteractive : false})).total == 1 ? "male" : "female";
        let name = game.wfrp4e.names.generateName({ species, gender });
        let rolls = [d10(), d10(), d10()];
        let haggle = rolls.reduce((sum, val) => sum + val, 0) + 40;
        let dealmaker = rolls.filter(i => i == 10).length >= 2;

        let merchant = {species, gender, name, haggle, dealmaker};
        await this.rollMerchantTest(merchant);
        return merchant;
    }

    createCargoMessage(itemData, tradeData)
    {
        if (!tradeData)
        {
            throw Error("No successful trade data provided")
        }
        let message =
        `<p style="text-align:center"><strong>${game.i18n.format("TRADE.CargoTitle", tradeData)}</strong></p>
          <b>Enc</b>: ${itemData.system.encumbrance.value}<br>
          <b>${game.i18n.localize("TRADE.Price")}</b>: ${itemData.system.price.gc} ${game.i18n.localize("MARKET.Abbrev.GC")}<br>
          <b>${game.i18n.localize("TRADE.Quality")}</b>: ${game.i18n.localize("TRADE." + itemData.system.quality.value.capitalize())}<br><br>
          ${game.i18n.format("TRADE.MerchantData", tradeData.merchant)}<br>`;

          if (tradeData.merchant.test)
          {
           message += `<p>${game.i18n.format("TRADE.MerchantTest", tradeData.merchant.test)}</p>`;
          }

          message += `<p><a class="chat-button" data-action="manageTrade">${game.i18n.localize("TRADE.ManageCargo")}</a></p>`;
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

    async _computePriceQuality(cargoKey)
    {
        let variation = (Math.ceil(CONFIG.Dice.randomUniform() * 20) - 10) / 100;
        let cargoTable = game.wfrp4e.trade.tradeData[this.tradeType].cargoTable[this.settlement.season];
        let cargoData = cargoTable[cargoKey]

        let price = (await new Roll(cargoData.price.toString()).roll({allowInteractive : false})).total
        let randomize = Math.round(price * variation);
        price += randomize;// random +/-10% variation to simulate market variance

        let quality = "average";

        // Get the price in case of brandy
        if (this.tradeType != "maritime" && (cargoKey == "wine" || cargoKey == "brandy")) {

            let wineBrandyPrice = game.wfrp4e.trade.tradeData[this.tradeType].wineBrandyPrice
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
