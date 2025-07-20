# 🎤 Diagramas Audio Capture - test-audio-capture.html

## Descripción General
Suite de pruebas especializada en validar la captura de audio desde el micrófono, configuración de AudioContext, y análisis de señales en tiempo real.

## 🏗️ Arquitectura de Audio Capture

```mermaid
graph TB
    A[test-audio-capture.html] --> B[Audio Capture Tests]
    
    B --> C[Permission Manager]
    B --> D[AudioContext Handler]
    B --> E[Stream Processor]
    B --> F[Buffer Analyzer]
    B --> G[Quality Monitor]
    
    C --> C1[getUserMedia Request]
    C --> C2[Permission Status Check]
    C --> C3[Error Handling]
    
    D --> D1[Context Creation]
    D --> D2[Sample Rate Config]
    D --> D3[Analyser Setup]
    
    E --> E1[MediaStream Processing]
    E --> E2[Node Connection]
    E --> E3[Real-time Analysis]
    
    F --> F1[Time Domain Data]
    F --> F2[Frequency Domain Data]
    F --> F3[Buffer Management]
    
    G --> G1[Volume Level Meter]
    G --> G2[Signal Quality Index]
    G --> G3[Performance Metrics]
```

## 🔄 Flujo de Captura de Audio

```mermaid
flowchart TD
    A[Iniciar Test Audio] --> B[Solicitar Permisos]
    B --> C{¿Permisos Concedidos?}
    
    C -->|Sí| D[Crear AudioContext]
    C -->|No| E[Error: Sin Permisos]
    
    D --> F[Configurar Analyser]
    F --> G[Conectar MediaStream]
    G --> H[Iniciar Análisis]
    
    H --> I[Capturar Buffer Audio]
    I --> J[Análisis Time Domain]
    J --> K[Análisis Frequency Domain]
    K --> L[Calcular Métricas]
    L --> M[Actualizar Visualización]
    M --> N{¿Continuar?}
    
    N -->|Sí| I
    N -->|No| O[Detener Captura]
    
    E --> P[Mostrar Error UI]
    O --> Q[Limpiar Recursos]
    P --> R[Permitir Retry]
    Q --> S[Test Completado]
```

## 🎚️ Configuración de AudioContext

```mermaid
graph LR
    A[AudioContext Config] --> B[Sample Rate]
    A --> C[Analyser Node]
    A --> D[Buffer Settings]
    A --> E[Processing Options]
    
    B --> B1[44100 Hz Preferred]
    B --> B2[48000 Hz Fallback]
    B --> B3[Browser Default]
    
    C --> C1[FFT Size: 4096]
    C --> C2[Smoothing: 0.8]
    C --> C3[Min/Max dB Range]
    
    D --> D1[Buffer Length: 4096]
    D --> D2[Overlap: 50%]
    D --> D3[Window: Hamming]
    
    E --> E1[Echo Cancellation: false]
    E --> E2[Noise Suppression: false]
    E --> E3[Auto Gain: false]
```

## 📊 Métricas de Audio Testing

```mermaid
mindmap
    root((Audio Metrics))
        Calidad de Señal
            SNR Ratio
            THD Percentage
            Dynamic Range
            Frequency Response
        Performance
            Latency Input-Output
            CPU Usage %
            Memory Allocation
            Buffer Underruns
        Configuración
            Sample Rate Hz
            Bit Depth
            Channels Mono/Stereo
            Codec Support
        Estabilidad
            Connection Drops
            Error Recovery
            Long Running Test
            Device Switching
```

## 🎛️ Panel de Control de Tests

```mermaid
graph TB
    A[Audio Test Controls] --> B[Basic Tests]
    A --> C[Advanced Tests]
    A --> D[Stress Tests]
    A --> E[Diagnostic Tools]
    
    B --> B1[Permission Test]
    B --> B2[Basic Capture]
    B --> B3[Volume Detection]
    
    C --> C1[Frequency Analysis]
    C --> C2[Noise Floor Test]
    C --> C3[Dynamic Range]
    
    D --> D1[Long Duration 10min]
    D --> D2[High CPU Load]
    D --> D3[Memory Leak Check]
    
    E --> E1[Device Enumeration]
    E --> E2[Supported Formats]
    E --> E3[Browser Info]
```

## 🔊 Análisis de Señal

```mermaid
graph TD
    subgraph Time_Domain[Análisis Tiempo]
        A1[Raw PCM Data] --> A2[RMS Calculation]
        A2 --> A3[Peak Detection]
        A3 --> A4[Zero Crossings]
        A4 --> A5[Waveform Display]
    end
    
    subgraph Frequency_Domain[Análisis Frecuencia]
        B1[FFT Processing] --> B2[Magnitude Spectrum]
        B2 --> B3[Phase Spectrum]
        B3 --> B4[Spectral Centroid]
        B4 --> B5[Spectrum Display]
    end
    
    subgraph Quality_Analysis[Análisis Calidad]
        C1[SNR Calculation] --> C2[THD Analysis]
        C2 --> C3[Noise Floor]
        C3 --> C4[Dynamic Range]
        C4 --> C5[Quality Score]
    end
    
    Time_Domain --> Frequency_Domain
    Frequency_Domain --> Quality_Analysis
```

## 🎯 Estados del Test de Audio

```mermaid
stateDiagram-v2
    [*] --> Idle: Test Loaded
    Idle --> RequestingPermission: Start Test
    RequestingPermission --> PermissionGranted: User Allows
    RequestingPermission --> PermissionDenied: User Denies
    PermissionGranted --> InitializingAudio: Setup AudioContext
    InitializingAudio --> AudioReady: Context Created
    InitializingAudio --> AudioError: Setup Failed
    AudioReady --> Capturing: Start Recording
    Capturing --> Analyzing: Process Buffer
    Analyzing --> Visualizing: Update Displays
    Visualizing --> Capturing: Continue Loop
    Capturing --> Stopped: Stop Requested
    Stopped --> Idle: Cleanup Complete
    PermissionDenied --> Retry: Request Again
    AudioError --> Retry: Fix and Restart
    Retry --> RequestingPermission: New Attempt
```

## 📈 Visualizaciones en Tiempo Real

```mermaid
graph LR
    A[Real-time Displays] --> B[Waveform]
    A --> C[Spectrum]
    A --> D[Volume Meter]
    A --> E[Quality Indicators]
    
    B --> B1[Time Series Plot]
    B --> B2[Scrolling Display]
    B --> B3[Zoom Controls]
    
    C --> C1[Frequency Bars]
    C --> C2[Log Scale Option]
    C --> C3[Peak Hold]
    
    D --> D1[VU Meter Style]
    D --> D2[RMS + Peak]
    D --> D3[Clipping Alert]
    
    E --> E1[SNR Gauge]
    E --> E2[Quality Score]
    E --> E3[Status Lights]
```

## 🧪 Test Cases Específicos

| Test Case | Input | Expected Output | Pass Criteria |
|-----------|-------|----------------|---------------|
| **Silent Input** | No audio signal | Noise floor only | <-60dB average |
| **1kHz Tone** | Pure sine 1000Hz | Single peak at 1kHz | ±1Hz accuracy |
| **White Noise** | Broadband noise | Flat spectrum | ±3dB variation |
| **Clipping Test** | Overdriven signal | Clipping detection | Alert triggered |
| **Dynamic Range** | Quiet to loud | Full scale usage | >60dB range |

## 🔧 Configuraciones de Device

```mermaid
graph TB
    A[Audio Device Config] --> B[Input Devices]
    A --> C[Constraints]
    A --> D[Processing]
    
    B --> B1[Default Microphone]
    B --> B2[USB Microphone]
    B --> B3[Bluetooth Headset]
    B --> B4[Line Input]
    
    C --> C1[Sample Rate: 44.1-48kHz]
    C --> C2[Channels: Mono preferred]
    C --> C3[Echo Cancel: false]
    C --> C4[Noise Suppress: false]
    
    D --> D1[No Auto Gain Control]
    D --> D2[Raw Audio Preferred]
    D --> D3[Low Latency Mode]
    D --> D4[High Quality Setting]
```

## 📊 Performance Benchmarks

```mermaid
gantt
    title Audio Test Performance Timeline
    dateFormat X
    axisFormat %Lms
    
    section Setup Phase
    Permission Request  :p1, 0, 500
    AudioContext Init   :p2, 500, 200
    Analyser Setup      :p3, 700, 100
    Stream Connection   :p4, 800, 150
    
    section Runtime Phase
    Buffer Capture      :active, r1, 950, 50
    FFT Processing      :r2, 1000, 25
    Display Update      :r3, 1025, 15
    Next Buffer         :r4, 1040, 10
    
    section Cleanup Phase
    Stop Stream         :c1, 1050, 50
    Release Resources   :c2, 1100, 25
    Context Cleanup     :c3, 1125, 25
```

## 🎯 Criterios de Éxito Audio

- ✅ **Permisos**: Obtenidos sin errores en <2s
- ✅ **AudioContext**: Creado con sample rate deseado
- ✅ **Latencia**: Input-to-analysis <20ms
- ✅ **Calidad**: SNR >40dB con señal limpia
- ✅ **Estabilidad**: Sin dropouts durante 5 min
- ✅ **Recursos**: <50MB memoria, <15% CPU

## 🔍 Debugging Tools

```mermaid
graph LR
    A[Debug Tools] --> B[Console Logging]
    A --> C[Visual Indicators]
    A --> D[Data Export]
    A --> E[Error Tracking]
    
    B --> B1[Audio Events Log]
    B --> B2[Buffer Statistics]
    B --> B3[Performance Metrics]
    
    C --> C1[Connection Status LED]
    C --> C2[Signal Quality Meter]
    C --> C3[Error Messages UI]
    
    D --> D1[Audio Buffer Export]
    D --> D2[Test Results JSON]
    D --> D3[Performance Report]
    
    E --> E1[JavaScript Exceptions]
    E --> E2[Web Audio API Errors]
    E --> E3[Device Access Issues]
```

---

**Última actualización**: Julio 2025  
**Versión**: 1.0  
**Cobertura Tests**: Audio capture completo
