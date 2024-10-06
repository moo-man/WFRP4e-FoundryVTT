if (args.test.options.income && !args.test.options.criminal)
{
    args.test.options.criminal = true;
    let currentCareer = args.test.actor.system.currentCareer;
    let coin = {1 : "b", 2 : "s", 3 : "s", 4 : "g"}[currentCareer.system.level.value] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    let term = {1 : "bp", 2 : "ss", 3 : "ss", 4 : "gc"}[currentCareer.system.level.value] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    let dieAmount = {1 : "2d10", 2 : "1d10", 3 : "2d10", 4 : "1"}[currentCareer.system.level.value] // b, s, or g maps to 2d10, 1d10, or 1 respectively (takes the first letter)
    dieAmount = parseInt(dieAmount[0]) * this.item.system.Advances;     // Multilpy that first letter by your standing (Brass 4 = 8d10 pennies)
    if (coin != "g") // Don't roll for gold, just use standing value
    {
        dieAmount = dieAmount + "d10";
    }
    let moneyEarned = (await new Roll(dieAmount.toString()).roll()).total;
    let moneyString = `${moneyEarned}${coin}`
    let transactionString = `${moneyEarned}${term}`

    this.script.message(`<a class="money-drag" data-amt="${moneyString}"><strong>Earned an additional ${game.wfrp4e.market.amountToString(game.wfrp4e.market.parseMoneyTransactionString(transactionString))}</strong></a>`, {whisper : ChatMessage.getWhisperRecipients("GM")})
}