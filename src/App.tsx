//@ts-nocheck
import { useEffect, useState, useRef } from 'react';
import { CommandParser } from './CommandParser';
import { DebugCommands } from './DebugCommands';
import { LCD } from './LCD';
import "./App.css";
import Button from 'react-bootstrap/Button';
import { Navbar, Container, Jumbotron, Modal, Tabs, Tab } from 'react-bootstrap';
import { DisplayCommandView } from './DisplayCommandView';

function App() {
  const [serial, setSerial] = useState();
  const [serialPort, setSerialPort] = useState();
  const [debugCommands, setDebugCommands] = useState([]);
  const [commands, setCommands] = useState([]);
  const [connected, setConnected] = useState(false);
  const lcdRef = useRef();

  const readerRef = useRef();
  const writerRef = useRef();

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

  const openSerialPort = async (serialPort) => {
    try {
      await serialPort.open({ baudRate: 460800, parity: "none", stopBits: 1, dataBits: 8, flowControl: "none" });
      while (serialPort.readable && serialPort.writable) {
        const commandParser = new CommandParser();
        const reader = await serialPort.readable.getReader();
        const writer = await serialPort.writable.getWriter();

        readerRef.current = reader;
        writerRef.current = writer;

        commandParser.onNewCommand = (command) => {
          const [buffer, setBuffer] = lcdRef.current;
          if (command.type === "DebugNumberCommand" || command.type === "DebugTextCommand") {
            setDebugCommands(state => state.concat([command]));
          } else {
            setCommands(state => state.concat([command]));
          }
          if (command.type === "DisplayCharCommand") {
            setBuffer(buffer.insertText(command.text));
          }
          if (command.type === "DisplayTextCommand") {
            setBuffer(buffer.insertTextAt(command.text, command.row, command.column));
          }
          if (command.type === "DisplaySetCursorCommand") {
            setBuffer(buffer.setCursor(command.row, command.column));
          }
          if (command.type === "DisplayClearCommand") {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand>
            LCD-Simulator
          </Navbar.Brand>
        </Container>
      </Navbar>
      <Jumbotron fluid style={{ flex: "1 1 auto", paddingTop: 16 }}>
        <Container>
          {
            connected ? (
              <>
                
                <Tabs defaultActiveKey="lcd" id="uncontrolled-tab-example" variant="tabs" style={{marginTop: 16}}>
                  <Tab eventKey="lcd" title="LCD">
                    <LCD ref={lcdRef} />
                  </Tab>
                </Tabs>
                <Tabs defaultActiveKey="debug" id="uncontrolled-tab-example" variant="tabs" style={{marginTop: 16}}>
                  <Tab eventKey="debug" title="Debug Infos">
                    <DebugCommands clear={() => setDebugCommands([])} commands={debugCommands} />
                  </Tab>
                  <Tab eventKey="display" title="Display Commands">
                    <DisplayCommandView clear={() => setCommands([])} commands={commands} />
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
