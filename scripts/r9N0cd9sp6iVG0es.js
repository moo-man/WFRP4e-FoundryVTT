let results = {
    1 : "Fimir",
    2 : "Dark Elves",
    3 : "Dragons",
    4 : "Daemons",
    5 : "The mortal followers of a particular Chaos God",
    6 : "The mortal followers of a particular Chaos God",
    7 : "Vampires and Necromancers",
    8 : "Vampires and Necromancers",
    9 : "Dwarfs",
    10 : "Dwarfs"
};

let gods = [
    "Tzeentch",
    "Slaanesh",
    "Nurgle",
    "Khorne"
];

let roll = await new Roll("1d10").roll();

roll.toMessage(this.script.getChatData());

let result = results[roll.total].replace("a particular Chaos God", gods[Math.ceil(CONFIG.Dice.randomUniform() * 4)]);

this.effect.updateSource({name: this.effect.setSpecifier(result)});