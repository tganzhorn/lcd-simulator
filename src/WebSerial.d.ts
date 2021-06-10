interface Navigator {
    readonly serial: Serial;
}

interface WorkerNavigator {
    readonly serial: Serial;
}

interface Serial {
    onconnect: any;
    ondisconnect: any;
    getPorts: Promise<SerialPort[]>;
    requestPort: (options?: SerialPortRequestOptions = {}) => Promise<SerialPort>;
}

type SerialPortRequestOptions = {
    filters: SerialPortFilter[];
}

type SerialPortFilter = {
    usbVendorId: number;
    usbProductId: number;
}

interface SerialPort {
    onconnect: any;
    ondisconnect: any;
    readonly readable: ReadableStream;
    readonly writable: WritableStream;

    getInfo: () => SerialPortInfo;

    open: (options: SerialOptions) => Promise<void>;
    setSignals: (signals?: SerialOutputSignals = {}) => Promise<void>;
    getSignals: () => Promise<SerialInputSignals>;
    close: () => Promise<void>;
}

type SerialPortInfo = {
    usbVendorId: number;
    usbProductId: number;
}

type SerialOptions = {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: "none" | "odd" | "even";
    bufferSize?: number;
    flowControl?: "none" | "hardware";
};

type SerialOutputSignals = {
    dataTerminalReady: boolean;
    requestToSend: boolean;
    break: boolean;
}

type SerialInputSignals = {
    dataCarrierDetect: boolean;
    clearToSend: boolean;
    ringIndicator: boolean;
    dataSetReady: boolean;
}
