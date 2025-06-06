const trait = this.actor.itemTags.trait.find(t => t.name === "Regenerate");
const name = "Rotten Regeneration";

if (!trait) return;

const effect = trait.effects.find(e => e.name === "Regenerate");
const scriptData = effect.system.scriptData;

scriptData[0].script = `  
  let chatData = {whisper: ChatMessage.getWhisperRecipients("GM")};
  let message = "";
  
  let wounds = foundry.utils.duplicate(this.actor.status.wounds);
  let regenRoll = await new Roll("1d10").roll({allowInteractive : false});
  let regen = regenRoll.total;
  
  if (wounds.value >= wounds.max)
    return;
  
  if (wounds.value > 0) {
    wounds.value += Math.floor(regen / 2);
    if (wounds.value > wounds.max) {
      wounds.value = wounds.max;
    }
    message += \`<b>\${this.actor.name}</b> regains \${regen} Wounds.\`;
  
    if (regen === 10) {
      message += "<br>Additionally, they regenerate a Critical Wound.";
    }
  } else if (regen >= 8) {
    message += \`<b>\${this.actor.name}</b> rolled a \${regen} and regains 1 Wound.\`;
    wounds.value += 1;
    if (regen === 10) {
      message += "<br>Additionally, they regenerate a Critical Wound.";
    }
  } else {
    message += \`<b>\${this.actor.name}</b> Regenerate roll of \${regen} - No effect.\`;
  }
  
  await this.actor.update({"system.status.wounds": wounds});
  this.script.message(message, {whisper: ChatMessage.getWhisperRecipients("GM")});
`

await effect.update({
  name,
  "system.scriptData": scriptData
});

await trait.update({name});