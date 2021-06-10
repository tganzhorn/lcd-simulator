import { LCDCommand } from "./LCDCommand";

export type DebugTextModes = "normal" | "error" | "ok";

export class DebugTextCommand extends LCDCommand {
    mode: DebugTextModes;
    text: string;

    constructor(text: string, mode: DebugTextModes) {
        super("DebugTextCommand");
        this.text = text;
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
    mode: DebugNumberModes;
    text: string;
    number: number;

    constructor(text: string, number: number, mode: DebugNumberModes) {
        super("DebugNumberCommand");

        this.mode = mode;
        this.text = text;
        this.number = number;
    }
}

export const isDebugNumberCommand = (command: LCDCommand): command is DebugNumberCommand => {
    return command.type === "DebugNumberCommand";
}