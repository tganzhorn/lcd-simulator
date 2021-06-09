import { FunctionComponent } from "react";
import { Button, Table } from "react-bootstrap";
import { DebugNumberCommand, DebugNumberModes, DebugTextCommand, isDebugNumberCommand, isDebugTextCommand } from "./CommandParser";

export const DebugCommands: FunctionComponent<{ commands: (DebugTextCommand | DebugNumberCommand)[], clear: () => {} }> = ({ commands, clear }) => {
    return (
        <div style={{flex: "1 1 auto", backgroundColor: "#343a40"}}>
            <div style={{height: 300, overflowY: "auto"}}>
                <Table striped bordered hover size="sm" variant="dark">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Message</th>
                            <th>Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            commands.length === 0 ? (
                                <tr>
                                    <td colSpan={3}>We did not receive any debug messages yet. 😢</td>
                                </tr>
                            ) : null
                        }
                        {
                            commands.map((command, index) => {
                                if (isDebugTextCommand(command)) {
                                    return <DebugText key={index} command={command} />;
                                }
                                if (isDebugNumberCommand(command)) {
                                    return <DebugNumber key={index} command={command} />;
                                }
                                return null;
                            })
                        }
                    </tbody>
                </Table>
            </div>
            <div style={{padding: 8}}>
                <Button onClick={clear}>Clear Log</Button>
            </div>
            
        </div>
    )
}

const DebugText: FunctionComponent<{ command: DebugTextCommand }> = ({ command }) => {
    const { timestamp, mode, text } = command;

    let color = "";
    let icon = "";
    if (mode === "error") {
        icon = "❌ ";
        color = "lightred";
    }
    if (mode === "ok") {
        icon = "✔ ";
        color = "lightgreen";
    }

    return (
        <tr>
            <td>{timestamp.toLocaleTimeString()}</td>
            <td style={{ color: color }} colSpan={2}>{icon + text}</td>
        </tr>
    )
}

const fillZeroes = (string: string, length: number) => {
    if (string.length === length) return string;

    let tmp = string;
    for (let i = string.length; i < length; i++) {
        tmp = "0" + tmp;
    }   
    return tmp;
}

const DebugNumber: FunctionComponent<{ command: DebugNumberCommand }> = ({ command }) => {
    const { timestamp, number, text, mode } = command;

    const printNumber = (number: number, mode: DebugNumberModes) => {
        if (mode === "u8hex") {
            return `0x${fillZeroes(number.toString(16), 2)}`;
        }
        if (mode === "u16hex") {
            return `0x${fillZeroes(number.toString(16), 4)}`;
        }
        if (mode === "u32hex") {
            return `0x${fillZeroes(number.toString(16), 8)}`;
        }
        if (mode === "u8bin") {
            return `0b${fillZeroes(number.toString(2), 8)}`;
        }
        if (mode === "u16bin") {
            return `0b${fillZeroes(number.toString(2), 16)}`;
        }
        return number.toString();
    }

    return (
        <tr>
            <td>{timestamp.toLocaleTimeString()}</td>
            <td>{text}</td>
            <td style={{fontFamily: "Roboto Mono", color: "lightblue"}}>{printNumber(number, mode)}</td>
        </tr>
    )
}