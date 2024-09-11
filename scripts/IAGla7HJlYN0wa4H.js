if (args.test.characteristicKey == "wp") 
{
    if (args.test.failed)
    {
        this.actor.addSystemEffect("convulsions")
        this.script.message(`Willpower Test failed, <b>${this.actor.prototypeToken.name}</b> gains @Symptom[Convulsions] for [[1d10]] hours`)
    }
}