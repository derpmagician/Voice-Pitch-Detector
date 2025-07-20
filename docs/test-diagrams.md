# 🧪 Diagramas de Testing - test.html

## Descripción General
Página de pruebas básicas que valida la funcionalidad general del sistema de detección de pitch, incluyendo captura de audio, análisis y visualización.

## 🏗️ Diagrama de Componentes de Testing

```mermaid
graph TB
    A[test.html - Suite de Pruebas] --> B[Test Controls]
    A --> C[Status Display]
    A --> D[Audio Testing]
    A --> E[Pitch Analysis Testing]
    A --> F[Visual Testing]
    A --> G[Results Panel]
    
    B --> B1[Start/Stop Tests]
    B --> B2[Test Selector]
    B --> B3[Reset Button]
    
    C --> C1[Current Test Status]
    C --> C2[Progress Indicator]
    C --> C3[Error Messages]
    
    D --> D1[Microphone Test]
    D --> D2[Audio Level Meter]
    D --> D3[Sample Rate Check]
    
    E --> E1[Frequency Detection]
    E --> E2[Note Recognition]
    E --> E3[Accuracy Metrics]
    
    F --> F1[Meter Animation]
    F --> F2[Note Highlighting]
    F --> F3[Precision Indicator]
    
    G --> G1[Test Results Log]
    G --> G2[Performance Stats]
    G --> G3[Export Report]
```

## 🔄 Flujo de Pruebas

```mermaid
flowchart TD
    A[Iniciar Suite de Pruebas] --> B{¿Permisos de Audio?}
    B -->|Sí| C[Test 1: Audio Capture]
    B -->|No| X[Error: Sin Permisos]
    
    C --> D{¿Audio OK?}
    D -->|Sí| E[Test 2: Pitch Detection]
    D -->|No| Y[Error: Audio Fallido]
    
    E --> F{¿Pitch Detectado?}
    F -->|Sí| G[Test 3: Note Mapping]
    F -->|No| Z[Error: Sin Pitch]
    
    G --> H{¿Notas Mapeadas?}
    H -->|Sí| I[Test 4: Visualización]
    H -->|No| W[Error: Mapeo Fallido]
    
    I --> J{¿Visuals OK?}
    J -->|Sí| K[✅ Todas las Pruebas Pasaron]
    J -->|No| V[Error: Visualización]
    
    K --> L[Generar Reporte]
    X --> M[Mostrar Errores]
    Y --> M
    Z --> M
    W --> M
    V --> M
```

## 🧪 Tests Implementados

```mermaid
mindmap
    root((Test Suite))
        Audio Tests
            Microphone Access
            Audio Context Creation
            Sample Rate Verification
            Volume Level Detection
        Pitch Tests
            YIN Algorithm
            Autocorrelation Fallback
            Frequency Accuracy
            Stability Check
        Note Tests
            Frequency to Note Mapping
            Octave Recognition
            Cents Calculation
            Precision Levels
        Visual Tests
            Canvas Rendering
            Animation Smoothness
            FPS Counter
            Responsive Behavior
        Performance Tests
            Memory Usage
            CPU Load
            Latency Measurement
            Error Rate
```

## 📊 Métricas de Testing

```mermaid
graph LR
    A[Test Metrics] --> B[Audio Quality]
    A --> C[Pitch Accuracy]
    A --> D[Visual Performance]
    A --> E[System Stability]
    
    B --> B1[Sample Rate: 44.1kHz]
    B --> B2[Latency: <20ms]
    B --> B3[SNR: >40dB]
    
    C --> C1[Frequency ±1Hz]
    C --> C2[Note Detection: 95%]
    C --> C3[Cents ±10]
    
    D --> D1[FPS: 60]
    D --> D2[Render Time: <16ms]
    D --> D3[Memory: <100MB]
    
    E --> E1[Uptime: >99%]
    E --> E2[Error Rate: <1%]
    E --> E3[Recovery: <2s]
```

## 🎯 Estados del Test

```mermaid
stateDiagram-v2
    [*] --> Initialized: Test Page Loaded
    Initialized --> Running: Start Test Suite
    Running --> AudioTest: Test 1
    AudioTest --> PitchTest: Audio OK
    AudioTest --> Failed: Audio Error
    PitchTest --> NoteTest: Pitch OK
    PitchTest --> Failed: Pitch Error
    NoteTest --> VisualTest: Notes OK
    NoteTest --> Failed: Note Error
    VisualTest --> Passed: All Successful
    VisualTest --> Failed: Visual Error
    Failed --> Retry: User Action
    Passed --> Report: Generate Results
    Retry --> AudioTest: Restart Tests
    Report --> [*]: Test Complete
```

## 🔧 Test Configuration

```mermaid
graph TD
    A[Test Config] --> B[Audio Settings]
    A --> C[Analysis Parameters]
    A --> D[Visual Settings]
    A --> E[Performance Limits]
    
    B --> B1[Sample Rate: 44100Hz]
    B --> B2[Buffer Size: 4096]
    B --> B3[Smoothing: 0.8]
    
    C --> C1[YIN Threshold: 0.15]
    C --> C2[Min Frequency: 80Hz]
    C --> C3[Max Frequency: 2000Hz]
    
    D --> D1[Canvas Size: 400x400]
    D --> D2[Animation: 60fps]
    D --> D3[Colors: 12 unique]
    
    E --> E1[Max CPU: 25%]
    E --> E2[Max Memory: 150MB]
    E --> E3[Max Latency: 50ms]
```

## 📱 Test Scenarios

| Scenario | Input | Expected Output | Pass Criteria |
|----------|-------|----------------|---------------|
| **Silence** | No audio | No pitch detected | Null frequency |
| **Pure Tone 440Hz** | A4 sine wave | A4 detected | ±2Hz accuracy |
| **Voice Sample** | Human voice | Fundamental freq | Note recognition |
| **Noise** | White noise | No stable pitch | Filtered out |
| **Multi-tone** | Chord input | Strongest component | Dominant frequency |

## 🎨 Visual Test Matrix

```mermaid
graph TB
    subgraph Visual_Tests[Visual Component Tests]
        A1[Canvas Rendering]
        A2[Meter Animation]
        A3[Note Highlighting]
        A4[Precision Bar]
        A5[Status Lights]
    end
    
    subgraph Test_Cases[Test Cases per Visual]
        B1[Initial State]
        B2[Active Detection]
        B3[Note Hit]
        B4[Precision Change]
        B5[Error State]
    end
    
    subgraph Expected_Results[Expected Visual Behavior]
        C1[Static Display]
        C2[Smooth Animation]
        C3[Color Change]
        C4[Position Update]
        C5[Error Indication]
    end
    
    Visual_Tests --> Test_Cases
    Test_Cases --> Expected_Results
```

## 🔍 Debug Information

```mermaid
graph LR
    A[Debug Panel] --> B[Console Logs]
    A --> C[Performance Monitor]
    A --> D[Error Tracker]
    A --> E[Test History]
    
    B --> B1[Audio Events]
    B --> B2[Pitch Values]
    B --> B3[Note Changes]
    
    C --> C1[FPS Counter]
    C --> C2[Memory Usage]
    C --> C3[CPU Load]
    
    D --> D1[JavaScript Errors]
    D --> D2[Audio Failures]
    D --> D3[Render Issues]
    
    E --> E1[Previous Results]
    E --> E2[Regression Data]
    E --> E3[Success Rates]
```

## ⚡ Performance Benchmarks

```mermaid
gantt
    title Test Execution Timeline
    dateFormat X
    axisFormat %Lms
    
    section Audio Tests
    Microphone Init     :a1, 0, 100
    Context Setup       :a2, 100, 50
    Permission Check    :a3, 150, 25
    
    section Analysis Tests
    Pitch Detection     :b1, 175, 200
    Note Mapping        :b2, 375, 100
    Accuracy Check      :b3, 475, 75
    
    section Visual Tests
    Canvas Render       :c1, 550, 150
    Animation Test      :c2, 700, 300
    FPS Verification    :c3, 1000, 100
    
    section Report
    Results Compilation :d1, 1100, 50
    Export Generation   :d2, 1150, 25
```

## 🎯 Success Criteria

- ✅ **Audio Capture**: Permisos obtenidos y stream activo
- ✅ **Pitch Detection**: Frecuencia detectada con <2Hz error
- ✅ **Note Recognition**: Nota correcta identificada
- ✅ **Visual Rendering**: 60fps mantenidos durante 10s
- ✅ **Memory Management**: Sin memory leaks detectados
- ✅ **Error Handling**: Recuperación automática de errores

---

**Última actualización**: Julio 2025  
**Versión**: 1.0  
**Cobertura**: 85% funcionalidad core
