import React, { useEffect, useState, useRef } from 'react';
import { CommandParser, LCDCommand, isDebugNumberCommand, isDisplayCharCommand, isDebugTextCommand, DebugNumberCommand, DebugTextCommand, isDisplayTextCommand, isDisplaySetCursorCommand, isDisplayClearCommand } from './CommandParser';
import { DebugCommands } from './DebugCommands';
import { LCD, LCDBuffer } from './LCD';
import "./App.css";
import Button from 'react-bootstrap/Button';
import { Navbar, Container, Jumbotron, Modal, Tabs, Tab } from 'react-bootstrap';
import { DisplayCommandView } from './DisplayCommandView';

function App() {
  const [serial, setSerial] = useState<Serial>();
  const [serialPort, setSerialPort] = useState<SerialPort>();
  const [debugCommands, setDebugCommands] = useState<(DebugNumberCommand | DebugTextCommand)[]>([]);
  const [commands, setCommands] = useState<LCDCommand[]>([]);
  const [connected, setConnected] = useState(false);
  const lcdRef = useRef<[LCDBuffer, React.Dispatch<React.SetStateAction<LCDBuffer>>]>();

  const readerRef = useRef<ReadableStreamDefaultReader<any>>();
  const writerRef = useRef<WritableStreamDefaultWriter<any>>();

  useEffect(() => {
    if (navigator.serial) {
      setSerial(navigator.serial);
    }
  }, []);

  useEffect(() => {
    if (!serialPort) return;

    openSerialPort(serialPort);

    return () => { }
  }, [serialPort]);

  const handleCOMPortSelection = async () => {
    try {
      if (!serial) return;
      const serialPort = await serial.requestPort();
      const deviceInfo = serialPort.getInfo();
      if (deviceInfo.usbProductId !== 24597 && deviceInfo.usbVendorId !== 1027) {
        alert("This device is not supported!");
        return;
      }
      setConnected(true);
      setSerialPort(serialPort);
    } catch (error) {
      setConnected(false);
    }
  }

  const openSerialPort = async (serialPort: SerialPort) => {
    try {
      await serialPort.open({ baudRate: 460800, parity: "none", stopBits: 1, dataBits: 8, flowControl: "none" });
      while (serialPort.readable && serialPort.writable) {
        const commandParser = new CommandParser();
        const reader = await serialPort.readable.getReader();
        const writer = await serialPort.writable.getWriter();

        readerRef.current = reader;
        writerRef.current = writer;

        commandParser.onNewCommand = (command: LCDCommand) => {
          if (!lcdRef.current) return;
          const [buffer, setBuffer] = lcdRef.current;
          if (isDebugNumberCommand(command) || isDebugTextCommand(command)) {
            setDebugCommands(state => state.concat([command]));
          } else {
            setCommands(state => state.concat([command]));
          }
          if (isDisplayCharCommand(command)) {
            setBuffer(buffer.insertText(command.text));
          }
          if (isDisplayTextCommand(command)) {
            setBuffer(buffer.insertTextAt(command.text, command.row, command.column));
          }
          if (isDisplaySetCursorCommand(command)) {
            setBuffer(buffer.setCursor(command.row, command.column));
          }
          if (isDisplayClearCommand(command)) {
            setBuffer(buffer.clearLines());
          }
          
        };

        const ack = new Uint8Array([7]);

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              reader.releaseLock();
              writer.releaseLock();
              break;
            }
            if (value) {
              commandParser.parseValue(value);
              writer.write(ack);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  const clearAll = () => {
    if (!lcdRef.current) return;
    const [buffer, setBuffer] = lcdRef.current;
    setCommands([]); 
    setDebugCommands([]);
    setBuffer(new LCDBuffer(buffer.rows, buffer.columns));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>
            LCD-Simulator
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Jumbotron fluid style={{ flex: "1 1 auto", paddingTop: 16, marginBottom: 0 }}>
        <Container>
          {
            connected ? (
              <>
                <Tabs defaultActiveKey="lcd" id="uncontrolled-tab-example" variant="tabs" style={{marginTop: 16}}>
                  <Tab eventKey="lcd" title="LCD">
                    {
                    //@ts-ignore
                    <LCD ref={lcdRef} />
                    }
                  </Tab>
                </Tabs>
                <Tabs defaultActiveKey="debug" id="uncontrolled-tab-example" variant="tabs" style={{marginTop: 16}}>
                  <Tab eventKey="debug" title="Debug Infos">
                    <DebugCommands clear={() => setDebugCommands([])} clearAll={clearAll} commands={debugCommands} />
                  </Tab>
                  <Tab eventKey="display" title="Display Commands">
                    <DisplayCommandView clear={() => setCommands([])} clearAll={clearAll} commands={commands} />
                  </Tab>
                </Tabs>
              </>
            ) : (
              <>
                <h1>No device connected!</h1>
                <p>
                  Please connect to a device by pressing the "Open COM Port" button.
                </p>
                <Button variant="primary" onClick={handleCOMPortSelection}>Open COM Port</Button>
              </>
            )
          }
        </Container>
      </Jumbotron>
      {
        navigator.serial === undefined ? (
          <Modal show={true} backdrop="static">
            <Modal.Header>
              <Modal.Title>
                Your browser is not supported!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              To use this app you need to install a chrome (v89+), opera (v76+) or edge (v89+) browser. Mobile devices are also not supported!
            </Modal.Body>
          </Modal>
        ) : null
      }
    </div>
  );
}

export default App;
