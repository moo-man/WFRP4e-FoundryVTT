/**
 * Primary use of this hook is to intercept chat commands.
 * /char  - Begin character generation
 * /table - Roll on a table
 * /cond  - Lookup a condition
 * /name  - Generate a name
 * /avail - Start an item availability test
 * /pay - Player: Remove money from character. GM: Start a payment request
 * /credit - Player: Not allowed. GM: Start a credit request to send money to players
 * /help - display a help message on all the commands above
 */
Hooks.on("chatMessage", (html, content, msg) => {
    // Setup new message's visibility
    let rollMode = game.settings.get("core", "rollMode");
    if (["gmroll", "blindroll"].includes(rollMode)) msg["whisper"] = ChatMessage.getWhisperIDs("GM");
    if (rollMode === "blindroll") msg["blind"] = true;
    msg["type"] = 0;

    let regExp;
    regExp = /(\S+)/g;
    let commands = content.match(regExp);
    let command = commands[0];

    /**
     * Check if the string is an amount of money or not
     * @param {string} mayBeAnOption
     * @returns {boolean} is it and amount ?
     */
    function isAnAmountOfMoney(mayBeAnOption) {
        let gc = game.i18n.localize("MARKET.Abbrev.GC")
        let ss = game.i18n.localize("MARKET.Abbrev.SS")
        let bp = game.i18n.localize("MARKET.Abbrev.BP")

        // language=JSRegexp
        let pattern = `^.*(\\d*${gc}|\\d*${ss}|\\d*${bp})$`
        let regExp = RegExp(pattern);
        return regExp.test(mayBeAnOption.toUpperCase());
    }

    /**
     * Extract the amount and the option from le commands array representing the command typed in the chat
     * @param commands Array of string
     * @returns {{amount: string, option: WFRP4E.creditOptions}}
     */
    function extractAmountAndOptionFromCommandLine(commands) {
        let amount = undefined, optionInCommandLine = undefined
        let mayBeAnOption = commands[commands.length - 1];

        if (typeof mayBeAnOption === "undefined") {
            return {amount, optionInCommandLine}
        }

        let isAnAmount = isAnAmountOfMoney(mayBeAnOption);

        if (isAnAmount) {
            amount = commands.slice(1, commands.length).join(""); // all the matches except the first (/credit) goes to amount
            optionInCommandLine = WFRP4E.creditOptions.SPLIT;
        } else {
            amount = commands.slice(1, commands.length - 1).join(""); // all the matches except the first (/credit) and the last (option)
            optionInCommandLine = mayBeAnOption;
        }
        let option = getOption(optionInCommandLine)
        return {amount, option};
    }

    /**
     * This method return an option from an initial string value
     * @param {string} optionInCommandLine
     * @returns {WFRP4E.creditOptions} an option
     */
    function getOption(optionInCommandLine) {
      return (typeof optionInCommandLine == "undefined") ? WFRP4E.creditOptions.SPLIT : optionInCommandLine;
    }    

// Roll on a table
    if (command === "/table") {
        // If no argument, display help menu
        if (commands.length === 1)
            msg.content = WFRP_Tables.formatChatRoll("menu");
        else {
            // [0]: /table [1]: <table-name> [2]: argument1 [3]: argument2
            let modifier, column; // Possible arguments
            // If argument 1 is a number use it as the modifier
            if (!isNaN(commands[2])) {
                modifier = parseInt(commands[2]);
                column = commands[3]
            } else // if argument 1 is not a number, use it as column
            {
                modifier = parseInt(commands[3]),
                    column = commands[2]
            }
            // Call tables class to roll and return html
            msg.content = WFRP_Tables.formatChatRoll(commands[1], {modifier: modifier}, column)
        }
        // Create message and return false to not display user input of `/table`
        if (msg)
            ChatMessage.create(msg);
        return false;
    }
    // Lookup a condition
    else if (command === "/cond") {
        // Only one argument possible [1]: condition to lookup
        let conditionInput = commands[1].toLowerCase();
        // Don't require spelling, match the closest condition to the input
        let closest = WFRP_Utility.matchClosest(WFRP4E.conditions, conditionInput);
        if (!WFRP4E.conditionDescriptions)
        {
            ui.notifications.error("No content found")
            return false
        }
        let description = WFRP4E.conditionDescriptions[closest];
        let name = WFRP4E.conditions[closest];

        // Create message and return false to not display user input of `/cond`
        msg.content = `<b>${name}</b><br>${description}`;
        ChatMessage.create(msg);
        return false;
    }
    // Character generation
    else if (command === "/char") {
        // Begin character generation, return false to not display user input of `/char`
        GeneratorWfrp4e.speciesStage();
        return false;
    }
    // Name generation
    else if (command === "/name") {
        // Possible arguments - [2]: gender, [1]: species
        let gender = (commands[2] || "").toLowerCase()
        let species = (commands[1] || "").toLowerCase();
        // Call generator class to create name, create message, return false to not display user input of `/name`
        let name = NameGenWfrp.generateName({species, gender})
        ChatMessage.create(WFRP_Utility.chatDataSetup(name))
        return false;
    }
    // Availability test
    else if (command === "/avail") {
        let modifier = 0;
        // Possible arguments - [1]: settlement size, [2]: item rarity [3*]: modifier

        let settlement = (commands[1] || "").toLowerCase();
        let rarity = (commands[2] || "").toLowerCase();
        if (!isNaN(commands[3])) {
            modifier = commands[3];
        }

        // Call generator class to start the test, create message, send to chat, return false to not display user input of `/avail`
        MarketWfrp4e.testForAvailability({settlement, rarity, modifier});
        return false;
    }
    // Pay commands
    else if (command === "/pay") {
        //The parameter is a string that will be exploded by a regular expression
        let amount = commands[1];
        let player = commands[2];
        //If the user isnt a GM, he pays a price
        if (!game.user.isGM) {
            let actor = WFRP_Utility.getSpeaker(msg.speaker);
            let money = duplicate(actor.data.items.filter(i => i.type === "money"));
            money = MarketWfrp4e.payCommand(amount, money);
            if (money)
                actor.updateEmbeddedEntity("OwnedItem", money);
        } else //If hes a gm, it generate a "Pay" card
            MarketWfrp4e.generatePayCard(amount, player);
        return false;
    }
    // Credit commands
    else if (command === "/credit") {
        let {amount, option} = extractAmountAndOptionFromCommandLine(commands);

        // If hes a gm, it generate a "Credit" card for all the player.
        if (game.user.isGM) {
            MarketWfrp4e.generateCreditCard(amount, option);
        } else {
            //If the user isnt a GM, he can't use the command (for now)
            message = `<p>${game.i18n.localize("MARKET.CreditCommandNotAllowed")}</p>`;
            ChatMessage.create(WFRP_Utility.chatDataSetup(message, "roll"));
        }
        return false;
    }
    //Help commands
    else if (command === "/help") {
        let rawCommands = game.i18n.localize("CHAT.CommandLine.Help.Commands");

        let commandElements = rawCommands.split(",").map(function (item) {
            return {
                title: game.i18n.localize(`CHAT.CommandLine.Help.${item}.Title`),
                command: game.i18n.localize(`CHAT.CommandLine.Help.${item}.Usage.Command`),
                commandLabel: game.i18n.localize(`CHAT.CommandLine.Help.Label.Command`),
                example: game.i18n.localize(`CHAT.CommandLine.Help.${item}.Usage.Example`),
                exampleLabel: game.i18n.localize(`CHAT.CommandLine.Help.Label.Example`),
                note: game.i18n.localize(`CHAT.CommandLine.Help.${item}.Usage.Note`),
                noteLabel: game.i18n.localize(`CHAT.CommandLine.Help.Label.Note`),
            };
        });

        let link = game.i18n.format("CHAT.CommandLine.Help.Link", {link: "https://github.com/CatoThe1stElder/WFRP-4th-Edition-FoundryVTT/wiki"})

        renderTemplate("systems/wfrp4e/templates/chat/chat-help-command.html", {
            commands: commandElements,
            link: link
        }).then(html => {
            let chatData = WFRP_Utility.chatDataSetup(html, "selfroll");
            ChatMessage.create(chatData);
        });
        return false;
    }
});
