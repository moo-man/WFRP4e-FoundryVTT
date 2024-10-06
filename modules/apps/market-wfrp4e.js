import WFRP_Utility from "../system/utility-wfrp4e.js";


/**
 * WIP
 * This class contains functions and helpers related to the market and Pay system
 */
export default class MarketWFRP4e {
  /**
   * Roll a test for the availability and the stock quantity of an item based on the rulebook
   * Takes as a parameter an object with localized settlement type, localized rarity and a modifier for the roll
   * @param {Object} options settlement, rarity, modifier
   */
  static async testForAvailability({ settlement, rarity, modifier }) {
    //This method read the table  game.wfrp4e.config.availabilityTable defined in the config file

    //First we get the different settlements size
    let validSettlements = Object.getOwnPropertyNames(game.wfrp4e.config.availabilityTable);
    let validSettlementsLocalized = {};
    let validRarityLocalized = {};

    //For each settlements we found in the config, we try to translate them and we build a correlation table
    validSettlements.forEach(function (index) {
      validSettlementsLocalized[game.i18n.localize(index).toLowerCase()] = index;
    });

    //If we found a valid settlement size, we now do the same thing for the rarity datas
    if (settlement && validSettlementsLocalized.hasOwnProperty(settlement)) {
      let validRarity = Object.getOwnPropertyNames(game.wfrp4e.config.availabilityTable[validSettlementsLocalized[settlement]]);
      validRarity.forEach(function (index) {
        validRarityLocalized[game.i18n.localize(index).toLowerCase()] = index;
      });
    }

    let msg = `<h3><b>${game.i18n.localize("MARKET.AvailabilityTest")}</b></h3>`;

    //If at least one of the args isnt specified or if the specified options are not valid, we give informations on the correct syntax
    if (!settlement || !rarity || !validSettlementsLocalized.hasOwnProperty(settlement) || !validRarityLocalized.hasOwnProperty(rarity)) {
      msg += `<p>${game.i18n.localize("MARKET.AvailWrongCommand")}</p><p><i>${game.i18n.localize("MARKET.AvailCommandExample")}</i></p>`;
    }
    //Everything is ok, lets roll for availability
    else {
      let roll = await new Roll("1d100 - @modifier", { modifier: modifier }).roll();
      //we retrieve the correct line
      let availabilityLookup = game.wfrp4e.config.availabilityTable[validSettlementsLocalized[settlement]][validRarityLocalized[rarity]];
      let isAvailable = availabilityLookup.test > 0 && roll.total <= availabilityLookup.test;

      let finalResult = {
        settlement: settlement.charAt(0).toUpperCase() + settlement.slice(1),
        rarity: rarity.charAt(0).toUpperCase() + rarity.slice(1),
        instock: isAvailable ? game.i18n.localize("Yes") : game.i18n.localize("No"),
        quantity: isAvailable ? availabilityLookup.stock : 0,
        roll: roll.total
      };

      //We roll the stock if we detect a valid roll value
      if (availabilityLookup.stock.includes("d")) {
        let stockRoll = await new Roll(availabilityLookup.stock).roll();
        finalResult.quantity = stockRoll.total;
      }

      //Format the message before sending it back to chat
      msg += this.formatTestForChat(finalResult);
    }
    ChatMessage.create(WFRP_Utility.chatDataSetup(msg, "roll", true));
  }

  /**
   * Format an availability test before sending it to chat
   * @param {Object} result
   */
  static formatTestForChat(result) {
    return `
        <b>${game.i18n.localize("MARKET.SettlementSize")}</b> ${result.settlement}<br>
        <b>${game.i18n.localize("MARKET.Rarity")}</b> ${result.rarity}<br><br>
        <b>${game.i18n.localize("MARKET.InStock")}</b> ${result.instock}<br>
        <b>${game.i18n.localize("MARKET.QuantityAvailable")}</b> ${result.quantity}<br>
        <b>${game.i18n.localize("Roll")}:</b> ${result.roll}
      `;
  }

  /**
   * Send a whispered card menu to the player to start an availability test
   * The card let him choose a settlement size
   * @param {String} rarity
   */
  static generateSettlementChoice(rarity) {
    let cardData = { rarity: game.wfrp4e.config.availability[rarity] };
    renderTemplate("systems/wfrp4e/templates/chat/market/market-settlement.hbs", cardData).then(html => {
      let chatData = WFRP_Utility.chatDataSetup(html, "selfroll");
      ChatMessage.create(chatData);
    });
  }

  /**
   * Consolidate every money the player has in order to give him the fewer coins possible
   * @param {Array} money
   */
  static consolidateMoney(money) {
    //We sort the money from the highest BP value to the lowest (so gc => ss => bp)
    //This allow us to deal with custom money too and to not be dependent on the money name (translation errors could break the code otherwise)
    money.sort((a, b) => b.system.coinValue.value - a.system.coinValue.value);

    let brass = 0;
    //First we calculate the BP value
    for (let m of money)
      brass += m.system.quantity.value * m.system.coinValue.value;

    //Then we consolidate the coins
    for (let m of money) {
      //We don't know what players could create as a custom money and we dont want to divide by zero, ever. It would kill a kitten somewhere, probably.
      if (m.system.coinValue.value <= 0)
        break;
      m.system.quantity.value = Math.trunc(brass / m.system.coinValue.value);
      brass = brass % m.system.coinValue.value;
    }

    return money;
  }
  
  static convertMoney(money, type)
  {

    money = money.map(m => m.toObject());
  
    if (type == "gc")
    {
      let currentGC = money.find(i => i.name == game.i18n.localize("NAME.GC"))
      let currentSS = money.find(i => i.name == game.i18n.localize("NAME.SS"))

      if (currentGC && currentSS && currentGC.system.quantity.value )
      {
        currentGC.system.quantity.value -= 1;
        currentSS.system.quantity.value += 20
        return [currentGC, currentSS];
      }
      else
        return ui.notifications.error(game.i18n.localize("ErrorMoneyConvert"))
    }
    
    if (type == "ss")
    {
      let currentSS = money.find(i => i.name == game.i18n.localize("NAME.SS"))
      let currentBP = money.find(i => i.name == game.i18n.localize("NAME.BP"))

      if (currentBP && currentSS  && currentSS.system.quantity.value)
      {
        currentSS.system.quantity.value -= 1;
        currentBP.system.quantity.value += 12
        return [currentBP, currentSS];
      }
      else
        return ui.notifications.error(game.i18n.localize("ErrorMoneyConvert"))
    }
  }

  /**
   * Execute a /credit amount and add the money to the player inventory
   * @param {string} amount the amount of money transfered
   * @param {Array} moneyItemInventory
   */
  static creditCommand(amount, actor, options = {}) {
    //First we parse the amount
    let moneyItemInventory = actor.itemTags["money"].map(i => i.toObject());
    let moneyToSend = this.parseMoneyTransactionString(amount);
    let msg = `<h3><b>${game.i18n.localize("MARKET.CreditCommand")}</b></h3>`;
    let errorOccured = false;
    //Wrong amount
    if (!moneyToSend) {
      msg += `<p>${game.i18n.localize("MARKET.MoneyTransactionWrongCommand")}</p><p><i>${game.i18n.localize("MARKET.CreditCommandExample")}</i></p>`;
      errorOccured = true;
    }
    //Command is ok, let's try to pay
    else {
      //We need to get the character money items for gc, ss and bp. This is a "best effort" lookup method. If it fails, we stop the amount to prevent any data loss.
      let characterMoney = this.getCharacterMoney(moneyItemInventory);
      this.checkCharacterMoneyValidity(moneyItemInventory, characterMoney);

      //If one money is missing, we stop here before doing anything bad
      if (Object.values(characterMoney).includes(false)) {
        msg += `<p>${game.i18n.localize("MARKET.CantFindMoneyItems")}</p>`;
        errorOccured = true;
      } else {
        //Great, we can just deduce the quantity for each money
        moneyItemInventory[characterMoney.gc].system.quantity.value += moneyToSend.gc;
        moneyItemInventory[characterMoney.ss].system.quantity.value += moneyToSend.ss;
        moneyItemInventory[characterMoney.bp].system.quantity.value += moneyToSend.bp;
      }
    }
    if (errorOccured)
      moneyItemInventory = false;
    else {
      msg += game.i18n.format("MARKET.Credit", {
        number1: moneyToSend.gc,
        number2: moneyToSend.ss,
        number3: moneyToSend.bp
      });
      msg += `<br><b>${game.i18n.localize("MARKET.ReceivedBy")}</b> ${actor.name}`;
      this.throwMoney(moneyToSend)

    }
    if (options.suppressMessage)
      ui.notifications.notify(`${actor.name} received ${moneyToSend.gc}${game.i18n.localize("MARKET.Abbrev.GC")} ${moneyToSend.ss}${game.i18n.localize("MARKET.Abbrev.SS")} ${moneyToSend.bp}${game.i18n.localize("MARKET.Abbrev.BP")}`)
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(msg, "roll"));
    return moneyItemInventory;
  }

  /**
   * Execute a /pay command and remove the money from an actor inventory, without chat card
   * @param {String} amount
   * @param {Actor} actor
   */
   static directPayCommand(amount, actor, options = {}) {
    let moneyPaid = this.payCommand(amount, actor)
    if (moneyPaid) {
      actor.updateEmbeddedDocuments("Item", moneyPaid);
    }
  }

  /**
   * Execute a /pay command and remove the money from the player inventory
   * @param {String} command
   * @param {Array} moneyItemInventory
   * @param transactionType  game.wfrp4e.config.transactionType, is it a payment or an income
   */
  static payCommand(command, actor, options = {}) {
    //First we parse the command
    let moneyItemInventory = actor.itemTags["money"].map(i => i.toObject())
    let moneyToPay = this.parseMoneyTransactionString(command);
    let msg = `<h3><b>${game.i18n.localize("MARKET.PayCommand")}</b></h3>`;
    let errorOccured = false;
    //Wrong command
    if (!moneyToPay) {
      msg += `<p>${game.i18n.localize("MARKET.MoneyTransactionWrongCommand")}</p><p><i>${game.i18n.localize("MARKET.PayCommandExample")}</i></p>`;
      errorOccured = true;
    }
    //Command is ok, let's try to pay
    else {
      //We need to get the character money items for gc, ss and bp. This is a "best effort" lookup method. If it fails, we stop the command to prevent any data loss.
      let characterMoney = this.getCharacterMoney(moneyItemInventory);
      this.checkCharacterMoneyValidity(moneyItemInventory, characterMoney);
      //If one money is missing, we stop here before doing anything bad
      if (Object.values(characterMoney).includes(false)) {
        msg += `<p>${game.i18n.localize("MARKET.CantFindMoneyItems")}</p>`;
        errorOccured = true;
      } else {
        //Now its time to check if the actor has enough money to pay
        //We'll start by trying to pay without consolidating the money
        if (moneyToPay.gc <= moneyItemInventory[characterMoney.gc].system.quantity.value &&
          moneyToPay.ss <= moneyItemInventory[characterMoney.ss].system.quantity.value &&
          moneyToPay.bp <= moneyItemInventory[characterMoney.bp].system.quantity.value) {
          //Great, we can just deduce the quantity for each money
          moneyItemInventory[characterMoney.gc].system.quantity.value -= moneyToPay.gc;
          moneyItemInventory[characterMoney.ss].system.quantity.value -= moneyToPay.ss;
          moneyItemInventory[characterMoney.bp].system.quantity.value -= moneyToPay.bp;
        } else //We'll need to calculate the brass value on both the pay command and the actor inventory, and then consolidate
        {
          let totalBPAvailable = 0;
          for (let m of moneyItemInventory)
            totalBPAvailable += m.system.quantity.value * m.system.coinValue.value;

          let totalBPPay = moneyToPay.gc * 240 + moneyToPay.ss * 12 + moneyToPay.bp;

          //Does we have enough money in the end?
          if (totalBPAvailable < totalBPPay) {
            //No
            msg += `${game.i18n.localize("MARKET.NotEnoughMoney")}<br>
              <b>${game.i18n.localize("MARKET.MoneyNeeded")}</b> ${totalBPPay} ${game.i18n.localize("NAME.BP")}<br>
              <b>${game.i18n.localize("MARKET.MoneyAvailable")}</b> ${totalBPAvailable} ${game.i18n.localize("NAME.BP")}`;
            errorOccured = true;
          } else //Yes!
          {
            totalBPAvailable -= totalBPPay;
            moneyItemInventory[characterMoney.gc].system.quantity.value = 0;
            moneyItemInventory[characterMoney.ss].system.quantity.value = 0;
            moneyItemInventory[characterMoney.bp].system.quantity.value = totalBPAvailable;

            //Then we consolidate
            moneyItemInventory = this.consolidateMoney(moneyItemInventory);
          }
        }
      }
    }
    if (errorOccured) {
      moneyItemInventory = false;
    } else {
      msg += game.i18n.format("MARKET.Paid", {
        number1: moneyToPay.gc,
        number2: moneyToPay.ss,
        number3: moneyToPay.bp
      });
      msg += `<br><b>${game.i18n.localize("MARKET.PaidBy")}</b> ${actor.name}`;

      this.throwMoney(moneyToPay)
    }
    if (options.suppressMessage)
      ui.notifications.notify(msg)
    else
      ChatMessage.create(WFRP_Utility.chatDataSetup(msg, "roll"));
    return moneyItemInventory;
  }

  /**
   * we'll try to look for the coin value equals to the gc/ss/bp coin value for any entry that wasn't found.
   * This allows for a better chance at detecting the money items, as they are currently not properly identified by a unique id. Meaning if a translation module made a typo in the compendium
   * or if a player/gm edit the name of the money items for any reasons, it would not be found by the first method
   * @param moneyItemInventory
   * @param characterMoney
   */
  static checkCharacterMoneyValidity(moneyItemInventory, characterMoney) {
    for (let m = 0; m < moneyItemInventory.length; m++) {
      switch (moneyItemInventory[m].system.coinValue.value) {
        case 240://gc
          if (characterMoney.gc === false)
            characterMoney.gc = m;
          break;
        case 12://ss
          if (characterMoney.ss === false)
            characterMoney.ss = m;
          break;
        case 1://bp
          if (characterMoney.bp === false)
            characterMoney.bp = m;
          break;
      }
    }
  }

  /**
   * From a moneyItemInventory we get the money of the character (GC, SS and BP)
   * @param moneyItemInventory
   * @returns {{ss: boolean, gc: boolean, bp: boolean}}
   */
  static getCharacterMoney(moneyItemInventory) {
    let moneyTypeIndex = {
      gc: false,
      ss: false,
      bp: false
    }
    //First we'll try to look at the localized name
    for (let m = 0; m < moneyItemInventory.length; m++) {
      switch (moneyItemInventory[m].name) {
        case game.i18n.localize("NAME.GC"):
          moneyTypeIndex.gc = m;
          break;
        case game.i18n.localize("NAME.SS"):
          moneyTypeIndex.ss = m;
          break;
        case game.i18n.localize("NAME.BP"):
          moneyTypeIndex.bp = m;
          break;
      }
    }
    return moneyTypeIndex;
  }

  static throwMoney(moneyValues) {
    let number = moneyValues.gc || 0;
    if ((moneyValues.ss || 0) > number)
      number = moneyValues.ss || 0
    if ((moneyValues.bp || 0) > number)
      number = moneyValues.bp || 0

    if (game.dice3d && game.settings.get("wfrp4e", "throwMoney")) {
      new Roll(`${number}dc`).evaluate().then((roll) => {
        game.dice3d.showForRoll(roll);
      });
    }
  }

  /**
   * Parse a price string
   * Like "8gc6bp" or "74ss 12gc", etc
   * This method use localized abbreviations
   * return an object with the moneys and quantity
   * @param {String} string
   * @returns {Object}
   */
  static parseMoneyTransactionString(string) {
    //Regular expression to match any number followed by any abbreviation. Ignore whitespaces
    const expression = /((\d+)\s?(\p{L}+))/ug
    let matches = [...string.matchAll(expression)];

    let payRecap = {
      gc: 0,
      ss: 0,
      bp: 0
    };
    let isValid = matches.length;
    for (let match of matches) {
      //Check if we have a valid command. We should have 4 groups per match
      if (match.length !== 4) {
        isValid = false;
        break;
      }
      //Should contains the abbreviated money (like "gc")
      switch (match[3].toLowerCase()) {
        case game.i18n.localize("MARKET.Abbrev.GC").toLowerCase():
          payRecap.gc += parseInt(match[2], 10);
          break;
        case game.i18n.localize("MARKET.Abbrev.SS").toLowerCase():
          payRecap.ss += parseInt(match[2], 10);
          break;
        case game.i18n.localize("MARKET.Abbrev.BP").toLowerCase():
          payRecap.bp += parseInt(match[2], 10);
          break;
      }
    }
    if (isValid && (payRecap.gc + payRecap.ss + payRecap.bp === 0))
      isValid = false;
    if (isValid && (payRecap.gc + payRecap.ss + payRecap.bp === 0))
      isValid = false;
    return isValid ? payRecap : false;
  }

  /**
   * Generate a card in the chat with a "Pay" button.
   * GM Only
   * @param {String} payRequest
   */
  static generatePayCard(payRequest, player) {
    let parsedPayRequest = this.parseMoneyTransactionString(payRequest);
    //If the /pay command has a syntax error, we display an error message to the gm
    if (!parsedPayRequest) {
      let msg = `<h3><b>${game.i18n.localize("MARKET.PayRequest")}</b></h3>`;
      msg += `<p>${game.i18n.localize("MARKET.MoneyTransactionWrongCommand")}</p><p><i>${game.i18n.localize("MARKET.PayCommandExample")}</i></p>`;
      ChatMessage.create(WFRP_Utility.chatDataSetup(msg, "gmroll"));
    } else //generate a card with a summary and a pay button
    {
      let cardData = {
        payRequest: payRequest,
        QtGC: parsedPayRequest.gc,
        QtSS: parsedPayRequest.ss,
        QtBP: parsedPayRequest.bp
      };
      renderTemplate("systems/wfrp4e/templates/chat/market/market-pay.hbs", cardData).then(html => {
        let chatData = WFRP_Utility.chatDataSetup(html, "roll", false, {forceWhisper: player});
        ChatMessage.create(chatData);
      });
    }
  }

  /**
* Make some change ... to avoid player going around with tons of bronze coins
* @param {int} amount
* @returns {Object} an amount {amount.gc,amount.ss,amount.bp}
*/
  static makeSomeChange(amount, bpRemainder) {
    let gc = 0, ss = 0, bp = 0;
    if (amount >= 0) {
      gc = Math.floor(amount / 240)
      amount = amount % 240
      ss = Math.floor(amount / 12)
      bp = amount % 12
      bp = bp + ((bpRemainder > 0) ? 1 : 0);
    }
    return { gc: gc, ss: ss, bp: bp };
  }

  /**
* Transforms an amount of money to a string with value + currency like 2gc4ss8bp localized.
* @param {Object} amount
* @return {String} the amount
*/
  static amountToString(amount) {
    let gc = game.i18n.localize("MARKET.Abbrev.GC")
    let ss = game.i18n.localize("MARKET.Abbrev.SS")
    let bp = game.i18n.localize("MARKET.Abbrev.BP")
    return `${amount.gc || amount.g || 0}${gc} ${amount.ss || amount.s || 0}${ss} ${amount.bp || amount.b || 0}${bp}`
  }


  /**
*
* @param initialAmount {Object} {initialAmount.gc,initialAmount.ss,initialAmount.bp}
* @param {int} nbOfPlayers to split among them
* return amount {Object} an amount {amount.gc,amount.ss,amount.bp}
*/
  static splitAmountBetweenAllPlayers(initialAmount, nbOfPlayers) {
    // convert initialAmount in bp
    let bpAmount = initialAmount.gc * 240 + initialAmount.ss * 12 + initialAmount.bp;
    // divide bpAmount by nb of players and get the true remainder
    let bpRemainder = bpAmount % nbOfPlayers;
    bpAmount = Math.floor(bpAmount / nbOfPlayers);
    // rebuild an amount of gc/ss/bp from bpAmount
    let amount = this.makeSomeChange(bpAmount, bpRemainder);
    return amount;
  }


  /**TODO: Known Issue: /credit amount actor does not provide a chat message to the owning player
   * Process the credit management options.
   * GM Only
   * @param {String} creditRequest
   * @param {String} optionOrName
   */
  static processCredit(creditRequest, optionOrName) {
    let parsedPayRequest = this.parseMoneyTransactionString(creditRequest);

    //If the /credit command has a syntax error, we display an error message to the gm
    if (!parsedPayRequest) {
      let msg = `<h3><b>${game.i18n.localize("MARKET.CreditRequest")}</b></h3>`;
      msg += `<p>${game.i18n.localize("MARKET.MoneyTransactionWrongCommand")}</p><p><i>${game.i18n.localize("MARKET.CreditCommandExample")}</i></p>`;
      ChatMessage.create(WFRP_Utility.chatDataSetup(msg, "gmroll"));
    } else //generate a card with a summary and a receive button
    {
      let amount, message, forceWhisper
      optionOrName = optionOrName || "split" // Default behavior

      // Process split/each options
      let nbActivePlayers = Array.from(game.users).filter(u => u.role != 4 && u.active).length;
      if ( optionOrName.toLowerCase() == "each" || optionOrName.toLowerCase() == "split") {
        if (nbActivePlayers == 0 ) {
          let message = game.i18n.localize("MARKET.NoPlayers");
          ChatMessage.create({ content: message });
          return
        }
        if (optionOrName.toLowerCase() === "split") {
          amount = this.splitAmountBetweenAllPlayers(parsedPayRequest, nbActivePlayers);
          message = game.i18n.format("MARKET.RequestMessageForSplitCredit", {
            activePlayerNumber: nbActivePlayers,
            initialAmount: this.amountToString(parsedPayRequest)
          });
        }
        else if (optionOrName.toLowerCase() === "each") {
          amount = parsedPayRequest;
          message = game.i18n.format("MARKET.RequestMessageForEachCredit", {
            activePlayerNumber: nbActivePlayers,
            initialAmount: this.amountToString(parsedPayRequest)
          });
        }
      } else {
        amount = parsedPayRequest;
        let paName = optionOrName.trim().toLowerCase();
        let player = game.users.players.filter(p => p.name.toLowerCase() == paName);
        if (player[0]) { // Player found !
          forceWhisper = player[0].name;
          message = game.i18n.format("MARKET.CreditToUser", {
            userName: player[0].name,
            initialAmount: this.amountToString(parsedPayRequest)
          });
        } else {
          let actor = game.actors.find(a => a.name.toLowerCase().includes(paName.toLowerCase()) )
          if ( actor) {
            let money = this.creditCommand(this.amountToString(amount), actor); // Imediate processing!
            if (money) {
              actor.updateEmbeddedDocuments("Item", money);
            }
            return
          } else {
            message = game.i18n.localize("MARKET.NoMatchingPlayer");
            ChatMessage.create({ content: message });
            return
          }
        }
      }
      let cardData = {
        digestMessage: message,
        amount: this.amountToString(amount),
        QtGC: amount.gc,
        QtSS: amount.ss,
        QtBP: amount.bp
      };
      renderTemplate("systems/wfrp4e/templates/chat/market/market-credit.hbs", cardData).then(html => {
        let chatData = WFRP_Utility.chatDataSetup(html, "roll", false, {forceWhisper});
        foundry.utils.setProperty(chatData, "flags.wfrp4e.instances", nbActivePlayers);
        ChatMessage.create(chatData);
      })
    }
  }




  static async rollIncome(career, {standing, tier}={}) {
    standing = standing || career.system.status.standing
    tier = tier || career.system.status.tier

    let dieAmount = game.wfrp4e.config.earningValues[tier] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    dieAmount = parseInt(dieAmount) * standing;     // Multilpy that first letter by your standing (Brass 4 = 8d10 pennies)
    let earned;
    if (tier != "g") // Don't roll for gold, just use standing value
    {
      dieAmount = dieAmount + "d10";
      earned = (await new Roll(dieAmount).roll()).total;
    }
    else
      earned = dieAmount;

      let item;
      if (tier == "g")
      {
        item = await game.wfrp4e.utility.find(game.i18n.localize("NAME.GC"), "money")
      }
      else if (tier == "s")
      {
        item = await game.wfrp4e.utility.find(game.i18n.localize("NAME.SS"), "money")
      }
      else if (tier == "b")
      {
        item = await game.wfrp4e.utility.find(game.i18n.localize("NAME.BP"), "money")
      }

      item = item?.toObject();

      if (item)
      {
        item.system.quantity.value = earned;
      }

      return {earned, type : tier, item}
  }


  static addMoneyTo(actor, moneyString) {
    // Money string is in the format of <amt><type>, so 12b, 5g, 1.5g
    let type = moneyString.slice(-1);
    let amt;
    // Failure means divide by two, so mark whether we should add half a gold or half a silver, just round pennies
    let halfS = false, halfG = false
    if (type === "b")
      amt = Math.round(moneyString.slice(0, -1));
    else if (type === "s") {
      if (moneyString.slice(0, -1).includes("."))
        halfS = true;
      amt = Math.floor(moneyString.slice(0, -1))
    }
    else if (type === "g") {
      if (moneyString.slice(0, -1).includes("."))
        halfG = true;
      amt = Math.floor(moneyString.slice(0, -1))
    }
    let money = actor.itemTags["money"].map(m => m.toObject());

    let moneyItem;
    switch (type) {
      case 'b':
        moneyItem = money.find(i => i.name === game.i18n.localize("NAME.BP"));
        break;
      case 's':
        moneyItem = money.find(i => i.name === game.i18n.localize("NAME.SS"));
        break;
      case 'g':
        moneyItem = money.find(i => i.name === game.i18n.localize("NAME.GC"));
        break;
    }

    // If 0, means they failed the roll by -6 or more, delete all money
    if (!amt && !halfG && !halfS)
      money.forEach(m => m.system.quantity.value = 0);
    else // Otherwise, add amount to designated type
      moneyItem.system.quantity.value += amt;

    // add halves
    if (halfS)
      money.find(i => i.name === game.i18n.localize("NAME.BP")).system.quantity.value += 6;
    if (halfG)
      money.find(i => i.name === game.i18n.localize("NAME.SS")).system.quantity.value += 10;

    return money;
  }
}
