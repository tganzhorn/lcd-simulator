import { LCDCommand } from "./LCDCommand";

export type DisplayCommandModes = "normal" | "inverse";

export class DisplayTextCommand extends LCDCommand {
    mode: DisplayCommandModes;
    row: number;
    column: number;
    text: string;

    constructor(text: string, row: number, column: number, mode: DisplayCommandModes) {
        super("DisplayTextCommand");
        this.text = text;
        this.row = row;
        this.column = column;
        this.mode = mode;
    }
}

export const isDisplayTextCommand = (command: LCDCommand): command is DisplayTextCommand => {
    return command.type === "DisplayTextCommand";
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

export const isDisplayPrintMulColumnCommand = (command: LCDCommand): command is DisplayPrintMulColumnCommand => {
    return command.type === "DisplayPrintColumnCommand";
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

export const isDisplaySetCursorCommand = (command: LCDCommand): command is DisplaySetCursorCommand => {
    return command.type === "DisplaySetCursorCommand";
}

export class DisplayClearCommand extends LCDCommand {
    constructor() {
        super("DisplayClearCommand");
    }
}

export const isDisplayClearCommand = (command: LCDCommand): command is DisplayClearCommand => {
    return command.type === "DisplayClearCommand";
}

export class DisplayCharCommand extends LCDCommand {
    mode: DisplayCommandModes;
    text: string;

    constructor(text: string, mode: DisplayCommandModes) {
        super("DisplayCharCommand");
        this.text = text;
        this.mode = mode;
    }
}

export const isDisplayCharCommand = (command: LCDCommand): command is DisplayCharCommand => {
    return command.type === "DisplayCharCommand";
}