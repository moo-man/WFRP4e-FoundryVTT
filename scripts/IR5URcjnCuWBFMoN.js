// If a full dose is imbibed, 
// the victim must pass a Hard (-20) Endurance Test.

let test = await this.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {fields: {difficulty: "hard"}})
await test.roll()
if (test.failed)
{
    this.script.message(`<p><strong>${this.actor.prototypeToken.name}</strong> notices nothing amiss save that they become tired a little earlier than usual. At this point it is still possible to save the victim via a powerful antidote or magical means.</p>
    <p>Once they fall asleep however, it is almost impossible. At this point the victim must make a <strong>Hard (-20) Endurance</strong> Test. If they fail, they never awaken.</p>`, 
    {
      whisper: ChatMessage.getWhisperRecipients("GM"), 
      blind: true 
    })
}
return test.failed;