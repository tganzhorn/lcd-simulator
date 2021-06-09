import React, { FunctionComponent } from "react";
import { Button, Table } from "react-bootstrap";
import { LCDCommand } from "./CommandParser";

export const DisplayCommandView: FunctionComponent<{ commands: LCDCommand[], clear: () => {} }> = ({ commands, clear }) => {
    return (
        <div style={{flex: "1 1 auto", backgroundColor: "#343a40"}}>
            <div style={{height: 300, overflowY: "auto"}}>
                <Table striped bordered hover size="sm" variant="dark">
                    <thead>
                        <tr style={{position: "sticky"}}>
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
            <div style={{padding: 8}}>
                <Button onClick={clear}>Clear Displaycommands</Button>
            </div>
            
        </div>
    )
}
