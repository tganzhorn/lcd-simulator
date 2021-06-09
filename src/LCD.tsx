import { forwardRef, ForwardRefExoticComponent, useRef, useState, useImperativeHandle, useEffect } from "react";
import { Button } from "react-bootstrap";

export class LCDBuffer {
    rows: number;
    columns: number;
    cursorRow: number;
    cursorColumn: number;
    commandsReceived: number;

    lines: string[];

    constructor(rows: number, columns: number, lines?: string[], cursorRow?: number, cursorColumn?: number, commandsReceived?: number) {
        this.rows = rows;
        this.columns = columns;

        this.cursorColumn = cursorColumn ?? 0;
        this.cursorRow = cursorRow ?? 0;

        this.commandsReceived = commandsReceived ?? 0;

        this.lines = lines ?? new Array(rows).fill(" ".repeat(columns));
    }

    insertTextAt(text: string, row: number, column: number) {
        if (row > this.rows - 1) return this;
        const line = this.lines[row];
        const length = Math.min(text.length + column, this.columns - column);
        this.lines[row] = line.substring(0, column) + text.substring(0, length) + line.substring(column + length, line.length);
        this.cursorRow = row;
        this.cursorColumn = Math.min(column + text.length, this.columns - 1);

        this.commandsReceived++;

        return new LCDBuffer(this.rows, this.columns, this.lines, this.cursorRow, this.cursorColumn, this.commandsReceived);
    }

    insertText(text: string) {
        this.insertTextAt(text, this.cursorRow, this.cursorColumn);

        this.commandsReceived++;

        return new LCDBuffer(this.rows, this.columns, this.lines, this.cursorRow, this.cursorColumn, this.commandsReceived);
    }

    setCursor(row: number | null, column: number | null) {
        this.cursorRow = row ?? this.cursorRow;
        this.cursorColumn = column ?? this.cursorColumn;

        this.commandsReceived++;

        return new LCDBuffer(this.rows, this.columns, this.lines, this.cursorRow, this.cursorColumn, this.commandsReceived);
    }

    clearLines() {
        this.lines = new Array(this.rows).fill(" ".repeat(this.columns));

        this.commandsReceived++;

        return new LCDBuffer(this.rows, this.columns, this.lines, this.cursorRow, this.cursorColumn, this.commandsReceived);
    }

    clearRow(row: number) {
        this.lines[row] = " ".repeat(this.columns);

        this.commandsReceived++;

        return new LCDBuffer(this.rows, this.columns, this.lines, this.cursorRow, this.cursorColumn, this.commandsReceived);
    }

    getLines() {
        return this.lines;
    }
}

export const LCD: ForwardRefExoticComponent<{}> = forwardRef((props, ref) => {
    const [size, setSize] = useState<[number, number]>([21, 8]);
    const [buffer, setBuffer] = useState<LCDBuffer>(new LCDBuffer(size[1], size[0]));
    const [fontSize, setFontSize] = useState<number>(32);
    const lightRef = useRef<HTMLDivElement>(null);


    useImperativeHandle(ref, () => ([buffer, setBuffer]));

    useEffect(() => {
        if (!lightRef.current) return;

        if (buffer.commandsReceived === 0) return;

        lightRef.current.style.backgroundColor = "#5DFF00";
        lightRef.current.style.boxShadow = "0 0 10px #5DFF00";

        const raf = window.setTimeout(() => {
            if (!lightRef.current) return;
            lightRef.current.style.backgroundColor = "#aaa";
            lightRef.current.style.boxShadow = "none";
        }, 300);

        return () => {
            window.clearTimeout(raf);
        }
    }, [buffer]);

    useEffect(() => {
        setBuffer(new LCDBuffer(size[1], size[0]));
    }, [size]);

    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", backgroundColor: "#343a40", padding: 8, color: "white" }}>
            <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <span>RX:</span>
                    <div ref={lightRef} style={{ transition: "all 0.1s ease", marginLeft: 16, backgroundColor: "#aaa", borderRadius: "50%", width: 32, height: 32 }}></div>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                    <span>CMD: <span style={{fontFamily: "Roboto Mono", color: "lightblue"}}>{buffer.commandsReceived}</span></span>
                </div>
                <label htmlFor="size" style={{ paddingRight: 8 }}>LCD-Size:</label>
                <select id="size" onChange={(event) => {
                    const x = event.target.value.split('x').map(v => parseInt(v));
                    setSize([x[0], x[1]]);
                }} value={`${size[0]}x${size[1]}`}>
                    <option value={"21x8"}>21x8</option>
                    <option value={"26x13"}>26x13</option>
                </select>
                <div>
                    <Button onClick={() => setBuffer(new LCDBuffer(size[1], size[0]))}>Reset Display</Button>
                </div>
            </div>

            <div className="lcd" style={{ border: "1px solid black", position: "relative", display: "inline-block", backgroundColor: "#5DFF00", color: "black" }}>
                <div style={{position: "absolute", right: 0}}>
                    <span onClick={() => setFontSize(size => Math.min(48, size + 1))}>➕</span>
                    <span onClick={() => setFontSize(size => Math.max(12, size - 1))}>➖</span>
                </div>
                {
                    buffer.getLines().map((line, index) => (
                        <div key={index + line} style={{ lineHeight: 1, letterSpacing: "0.3em", fontFamily: "VT323", fontSize: fontSize, whiteSpace: "pre" }}>{line}</div>
                    ))
                }
            </div>
        </div>
    )
});