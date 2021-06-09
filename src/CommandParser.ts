class LCDCommand {
    type: CommandTypes;
    timestamp: Date;

    constructor(type: CommandTypes) {
        this.type = type;
        this.timestamp = new Date();
    }
}

export type CommandTypes = "DisplaySetCursorCommand" | "DisplayTextCommand" | "DisplayCharCommand" |
    "DisplayClearCommand" | "DebugNumberCommand" | "DebugTextCommand" | "DisplayPrintColumnCommand";

export class CommandParser {
    currentCommand: Uint8Array = new Uint8Array(0);
    newCommand: boolean = false;
    commandBuffer: number[] = [];
    debugNumberModes: string[] = ["u8hex", "u16hex", "u32hex", "u8dez", "u16dez", "u8bin", "u16bin", "u32bin"];
    debugTextModes: string[] = ["text", "error", "ok"];
    _onNewCommand: (command: LCDCommand) => void = () => { };

    parseValue(buffer: Uint8Array) {
        for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === 35) {
                this.newCommand = true;
                if (this.commandBuffer.length !== 0)  {
                    const command = this.parseCommand();
                    if (command) this._onNewCommand(command);
                }
                this.commandBuffer.length = 0;
                continue;
            }
            if (this.newCommand) {
                if (this.commandBuffer[2]) {
                    if (this.commandBuffer.length === this.commandBuffer[2] + 2) {
                        this.commandBuffer.push(buffer[i]);
                        const command = this.parseCommand();
                        if (command) this._onNewCommand(command);
                        this.commandBuffer.length = 0;
                        this.newCommand = false;
                        continue;
                    }
                }
                this.commandBuffer.push(buffer[i]);
            }
        }
    }

    set onNewCommand(handle: (command: LCDCommand) => void) {
        this._onNewCommand = handle;
    }

    parseCommand(): LCDCommand | false {
        // Display Commands
        if (this.commandBuffer[0] === 76) {
            if (this.commandBuffer[1] === 2) { // set row, column
                const row = this.commandBuffer[3];
                const column = this.commandBuffer[4];

                return new DisplaySetCursorCommand(row, column);
            }
            if (this.commandBuffer[1] === 3) { // set row
                const row = this.commandBuffer[3];

                return new DisplaySetCursorCommand(row, null);
            }
            if (this.commandBuffer[1] === 4) { // set column
                const column = this.commandBuffer[3];

                return new DisplaySetCursorCommand(null, column);
            }
            if (this.commandBuffer[1] === 5) { // print column
                let text = String.fromCharCode(this.commandBuffer[3]);

                return new DisplayCharCommand(text, 1, "normal");
            }
            if (this.commandBuffer[1] === 6) { // print mulcolumn
                const row = this.commandBuffer[3];
                const column = this.commandBuffer[4];

                let text = "";
                for (let i = 5; i < this.commandBuffer.length; i++) {
                    text += String.fromCharCode(this.commandBuffer[i]);
                }

                return new DisplayPrintMulColumnCommand(text, row, column);
            }
            if (this.commandBuffer[1] === 7 || this.commandBuffer[1] === 8) { // text
                const mode = this.commandBuffer[1] === 7 ? "normal" : "inverse";
                const length = this.commandBuffer[2];
                const row = this.commandBuffer[3];
                const column = this.commandBuffer[4];

                let text = "";
                for (let i = 5; i < this.commandBuffer.length; i++) {
                    text += String.fromCharCode(this.commandBuffer[i]);
                }

                return new DisplayTextCommand(text, row, column, length, mode);
            }
            if (this.commandBuffer[1] === 9 || this.commandBuffer[1] === 10) { // char
                const mode = this.commandBuffer[1] === 9 ? "normal" : "invers";
                const length = 1;
                const text = String.fromCharCode(this.commandBuffer[3]);

                //@ts-ignore
                return new DisplayCharCommand(text, length, mode);
            }
            if (this.commandBuffer[1] === 12) { // print line
                return false;
            }
            if (this.commandBuffer[1] === 13) { // clear row
                return false;
            }
            if (this.commandBuffer[1] === 14) { // clear lcd
                return new DisplayClearCommand();
            }
        }
        // Debug commands
        if (this.commandBuffer[0] === 68) {
            if (this.commandBuffer[1] === 2) {
                const length = this.commandBuffer[2];
                const mode = this.debugNumberModes[this.commandBuffer[3] - 1];
                const number = (
                    this.commandBuffer[4] * 2 ** 0 +
                    this.commandBuffer[5] * 2 ** 1 +
                    this.commandBuffer[6] * 2 ** 2 +
                    this.commandBuffer[7] * 2 ** 3
                );

                let text = "";
                for (let i = 8; i < this.commandBuffer.length; i++) {
                    if (this.commandBuffer[i] === 0) break;
                    text += String.fromCharCode(this.commandBuffer[i]);
                }

                //@ts-ignore
                return new DebugNumberCommand(text, length, number, mode);
            }
            if (this.commandBuffer[1] === 1) {
                const length = this.commandBuffer[2];
                const mode = this.debugTextModes[this.commandBuffer[3] - 1];

                let text = "";
                for (let i = 4; i < this.commandBuffer.length; i++) {
                    text += String.fromCharCode(this.commandBuffer[i]);
                }

                //@ts-ignore
                return new DebugTextCommand(text, length, mode);
            }
        }
        console.log(this.commandBuffer);
        return false;
    }
}

export type DisplayCommandModes = "normal" | "inverse";

export class DisplayTextCommand extends LCDCommand {
    mode: DisplayCommandModes;
    length: number;
    row: number;
    column: number;
    text: string;

    constructor(text: string, row: number, column: number, length: number, mode: DisplayCommandModes) {
        super("DisplayTextCommand");
        this.text = text;
        this.row = row;
        this.column = column;
        this.length = length;
        this.mode = mode;
    }
}

export class DisplayPrintMulColumnCommand extends LCDCommand {
    row: number;
    column: number;
    text: string;

    constructor(text: string, row: number, column: number) {
        super("DisplayPrintColumnCommand")
        this.text = text;
        this.row = row;
        this.column = column;
    }
}

export class DisplaySetCursorCommand extends LCDCommand {
    row: number | null;
    column: number | null;

    constructor(row: number | null, column: number | null) {
        super("DisplaySetCursorCommand");
        this.row = row;
        this.column = column;
    }
}

export class DisplayClearCommand extends LCDCommand {
    constructor() {
        super("DisplayClearCommand");
    }
}

export class DisplayCharCommand extends LCDCommand {
    mode: DisplayCommandModes;
    length: number;
    text: string;

    constructor(text: string, length: number, mode: DisplayCommandModes) {
        super("DisplayCharCommand");
        this.text = text;
        this.length = length;
        this.mode = mode;
    }
}

export type DebugTextModes = "normal" | "error" | "ok";

export class DebugTextCommand extends LCDCommand {
    mode: DebugTextModes;
    text: string;
    length: number;

    constructor(text: string, length: number, mode: DebugTextModes) {
        super("DebugTextCommand");
        this.text = text;
        this.length = length;
        this.mode = mode;
    }
}

export const isDebugTextCommand = (command: LCDCommand): command is DebugTextCommand => {
    return command.type === "DebugTextCommand";
}

export type DebugNumberModes =
    "u8hex" | "u16hex" | "u32hex" |
    "u8bin" | "u16bin" | "u32bin" |
    "u8dez" | "u16dez";

export class DebugNumberCommand extends LCDCommand {
    length: number;
    mode: DebugNumberModes;
    text: string;
    number: number;

    constructor(text: string, length: number, number: number, mode: DebugNumberModes) {
        super("DebugNumberCommand");
        this.length = length;
        this.mode = mode;
        this.text = text;
        this.number = number;
    }
}

export const isDebugNumberCommand = (command: LCDCommand): command is DebugNumberCommand => {
    return command.type === "DebugNumberCommand";
}