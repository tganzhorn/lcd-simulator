export class LCDCommand {
    type: CommandTypes;
    timestamp: Date;

    constructor(type: CommandTypes) {
        this.type = type;
        this.timestamp = new Date();
    }
}

export type CommandTypes = "DisplaySetCursorCommand" | "DisplayTextCommand" | "DisplayCharCommand" |
    "DisplayClearCommand" | "DebugNumberCommand" | "DebugTextCommand" | "DisplayPrintColumnCommand";