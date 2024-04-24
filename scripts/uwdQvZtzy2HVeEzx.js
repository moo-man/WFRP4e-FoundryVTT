if (args.totalWoundLoss > 0)
{
    let roll = await new Roll("1d10").roll();
    roll.toMessage(this.script.getChatData());
    args.modifiers.other.push({label : this.effect.name, value : roll.total})
    
    args.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields : {difficulty : "hard"}, skipTargets: true, appendTitle :  " - " + this.effect.name}).then(async test => {
        await test.roll();
        if (test.failed)
        {
            this.script.scriptMessage("<strong>" + args.actor.name + "</strong> takes a @Table[critbody]{Critical Hit} to the torse", {whisper: ChatMessage.getWhisperRecipients("GM")}) 
        }
    })
}
