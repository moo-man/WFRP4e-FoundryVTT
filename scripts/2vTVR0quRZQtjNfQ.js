let currentCareer = this.actor.system.currentCareer;
if (!currentCareer)
{
    return;
}

let talents = ["Aethyric Attunement",
"Arcane Magic (Any)",
"Chaos Magic (Tzeentch)",
"Fast Hands",
"Instinctive Diction",
"Magical Sense",
"Petty Magic",
"Second Sight",
"War Wizard",
"Witch!"].filter(t => !currentCareer.system.talents.includes(t))

currentCareer.system.talents = currentCareer.system.talents.concat(talents)