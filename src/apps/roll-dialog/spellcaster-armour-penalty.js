export function applySpellcasterArmourPenalty(actor, fields, tooltips) {
    if (!game.settings.get("wfrp4e", "homebrew").spellcasterArmourPenalties) return;

    let talentMetal = actor.has("Arcane Magic (Metal)", "talent");
    let talentBeasts = actor.has("Arcane Magic (Beasts)", "talent");
    let wearingArmour = { head: 0, lArm: 0, rArm: 0, lLeg: 0, rLeg: 0, body: 0 };
    let debuff = 0;

    for (let a of actor.itemTags["armour"].filter(i => i.isEquipped)) {
        if ((a.system.isMetal && !talentMetal) || (a.system.isLeather && !talentBeasts)) {
            const currentAP = a.system.currentAP;
            for (let loc in currentAP) {
                wearingArmour[loc] += currentAP[loc];
            }
        }
    }
    for (let loc in wearingArmour) {
        debuff = Math.max(debuff, wearingArmour[loc]);
    }

    if (debuff > 0) {
        fields.slBonus += -debuff;
        tooltips.add("slBonus", -debuff, game.i18n.localize("SHEET.SpellcasterArmourPenalties"));
    }
}
