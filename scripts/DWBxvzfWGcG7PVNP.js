let letter = this.item.system.location.key[0]; // "l" or "r";

this.item.updateSource({"system.location.key" : letter + "Finger"})

// We want the location to be Right or Left Hand, but the key to be rFinger or lFinger