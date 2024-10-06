let tokenImg = ""; // Put path to token image here, inbetween the quotation marks
if (tokenImg)
{
    if (this.effect.getFlag("wfrp4e", "transformed"))
    {
        await this.effect.setFlag("wfrp4e", "transformed", false);
        this.actor.getActiveTokens().forEach(t => t.document.update({texture : {src: this.actor.prototypeToken.texture.src}}));   
    }
    else 
    {
        await this.effect.setFlag("wfrp4e", "transformed", true);
        this.actor.getActiveTokens().forEach(t => t.document.update({texture : {src: tokenImg}}));
    }
}
else 
{
    this.script.notification("No Token Image path configured. The image path should be set in the first line of this script.", "error");
}