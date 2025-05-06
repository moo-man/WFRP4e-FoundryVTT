if (args.test.result.castOutcome == "success")
{
    CorruptionMessageModel.createCorruptionMessage("moderate", this.script.getChatData())
}
