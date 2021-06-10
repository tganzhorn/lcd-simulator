import { FunctionComponent } from "react";
import { Button, ButtonGroup, Table } from "react-bootstrap";
import { LCDCommand } from "../classes/CommandParser";

export const DisplayCommandView: FunctionComponent<{ commands: LCDCommand[], clear: () => void, clearAll: () => void }> = ({ commands, clear, clearAll }) => {
    return (
        <div style={{ flex: "1 1 auto", backgroundColor: "#343a40" }}>
            <div style={{ height: 300, overflowY: "auto" }}>
                <Table striped bordered hover size="sm" variant="dark">
                    <thead>
                        <tr style={{ position: "sticky" }}>
                            <th>Time</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            commands.length === 0 ? (
                                <tr>
                                    <td colSpan={2}>We did not receive any display commands yet. 😢</td>
                                </tr>
                            ) : null
                        }
                        {
                            commands.map((command, index) => (
                                <tr key={index + command.timestamp.toTimeString()}>
                                    <td>{command.timestamp.toLocaleTimeString()}</td>
                                    <td>{command.type}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </Table>
            </div>
            <div style={{ padding: 8, backgroundColor: "rgba(255,255,255,.05)" }}>
                <ButtonGroup>
                    <Button onClick={clear}>Clear Displaycommands</Button>
                    <Button onClick={clearAll}>Clear All</Button>
                </ButtonGroup>
            </div>

        </div>
    )
}
