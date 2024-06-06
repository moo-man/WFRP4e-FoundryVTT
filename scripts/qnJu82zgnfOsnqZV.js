let closed = !this.item.getFlag("wfrp4e-soc", "gunport") || false;

await this.item.setFlag("wfrp4e-soc", "gunport", closed);
let scriptData = this.effect.flags.wfrp4e.scriptData;

if (closed) {
  scriptData[0].label = "Open";
} else {
  scriptData[0].label = "Close";
}

await this.effect.update({"flags.wfrp4e.scriptData": scriptData});