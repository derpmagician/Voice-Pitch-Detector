# 🎵 Diagramas Pitch Analysis - test-pitch-analysis.html

## Descripción General
Suite especializada para validar algoritmos de detección de pitch, incluyendo YIN algorithm, autocorrelación, mapeo de notas y cálculo de precisión en cents.

## 🏗️ Arquitectura de Análisis de Pitch

```mermaid
graph TB
    A[test-pitch-analysis.html] --> B[Pitch Detection Engine]
    
    B --> C[Algorithm Selector]
    B --> D[Signal Preprocessor]
    B --> E[Pitch Detectors]
    B --> F[Note Mapper]
    B --> G[Accuracy Analyzer]
    
    C --> C1[YIN Algorithm]
    C --> C2[Autocorrelation]
    C --> C3[HPS Method]
    C --> C4[AMDF Algorithm]
    
    D --> D1[Windowing Hamming]
    D --> D2[Pre-emphasis Filter]
    D --> D3[Noise Gate]
    D --> D4[DC Removal]
    
    E --> E1[Fundamental Frequency]
    E --> E2[Confidence Score]
    E --> E3[Harmonic Analysis]
    E --> E4[Pitch Stability]
    
    F --> F1[Frequency to Note]
    F --> F2[Octave Detection]
    F --> F3[Cents Calculation]
    F --> F4[Enharmonic Handling]
    
    G --> G1[Reference Comparison]
    G --> G2[Error Statistics]
    G --> G3[Precision Metrics]
    G --> G4[Confidence Analysis]
```

## 🔄 Flujo de Análisis de Pitch

```mermaid
flowchart TD
    A[Audio Buffer Input] --> B[Preprocessing]
    B --> C[Window Function Application]
    C --> D[Algorithm Selection]
    
    D --> E[YIN Algorithm]
    D --> F[Autocorrelation Method]
    D --> G[HPS Method]
    
    E --> H[YIN Difference Function]
    H --> I[Cumulative Mean Normalized]
    I --> J[Absolute Threshold]
    J --> K[Parabolic Interpolation]
    
    F --> L[Autocorrelation Calculation]
    L --> M[Peak Detection]
    M --> N[Period Estimation]
    
    G --> O[Harmonic Product Spectrum]
    O --> P[Downsampling & Multiplication]
    P --> Q[Peak Finding]
    
    K --> R[Frequency Estimation]
    N --> R
    Q --> R
    
    R --> S[Confidence Calculation]
    S --> T{¿Confidence > Threshold?}
    
    T -->|Sí| U[Note Mapping]
    T -->|No| V[No Pitch Detected]
    
    U --> W[Frequency to MIDI]
    W --> X[Note Name Generation]
    X --> Y[Cents Deviation]
    Y --> Z[Final Result]
    
    V --> AA[Return Null]
    Z --> BB[Store Results]
    AA --> BB
```

## 🎯 Algoritmos de Detección Implementados

```mermaid
mindmap
    root((Pitch Algorithms))
        YIN Algorithm
            Difference Function
            Cumulative Normalized
            Absolute Threshold
            Parabolic Interpolation
            Confidence Score
        Autocorrelation
            Time Domain Analysis
            Lag Calculation
            Peak Detection
            Period Estimation
            Noise Robustness
        Harmonic Product
            Frequency Domain
            Harmonic Reinforcement
            Subharmonic Suppression
            Spectrum Compression
            Peak Enhancement
        AMDF Method
            Average Magnitude
            Difference Function
            Minimum Detection
            Pitch Period
            Computational Efficiency
```

## 📊 Test de Precisión por Algoritmo

```mermaid
graph TD
    A[Precision Testing] --> B[Synthetic Signals]
    A --> C[Real Audio Samples]
    A --> D[Noisy Conditions]
    A --> E[Polyphonic Tests]
    
    B --> B1[Pure Tones 80-2000Hz]
    B --> B2[Harmonic Complex Tones]
    B --> B3[Frequency Sweeps]
    B --> B4[Step Frequency Changes]
    
    C --> C1[Male Voice Samples]
    C --> C2[Female Voice Samples]
    C --> C3[Instrument Recordings]
    C --> C4[Sung Notes Choir]
    
    D --> D1[SNR 0-40dB Range]
    D --> D2[White Noise Addition]
    D --> D3[Pink Noise Background]
    D --> D4[Environmental Noise]
    
    E --> E1[Two Note Intervals]
    E --> E2[Simple Chords]
    E --> E3[Complex Harmonies]
    E --> E4[Melody + Accompaniment]
```

## 🎼 Mapeo de Notas y Escalas

```mermaid
graph LR
    A[Note Mapping System] --> B[MIDI Conversion]
    A --> C[Scientific Notation]
    A --> D[International Standard]
    A --> E[Cultural Variants]
    
    B --> B1[Frequency to MIDI Number]
    B --> B2[MIDI 0-127 Range]
    B --> B3[Middle C = MIDI 60]
    B --> B4[Octave Calculation]
    
    C --> C1[C4 = 261.63 Hz]
    C --> C2[A4 = 440 Hz Reference]
    C --> C3[Octave Numbers]
    C --> C4[Note Names C-B]
    
    D --> D1[ISO 16:1975 Standard]
    D --> D2[Equal Temperament]
    D --> D3[12-TET System]
    D --> D4[Cent Divisions]
    
    E --> E1[Do Re Mi Solfege]
    E --> E2[German H for B]
    E --> E3[Sharps vs Flats]
    E --> E4[Regional Preferences]
```

## 🔬 Análisis de Precisión en Cents

```mermaid
graph TB
    A[Cents Analysis] --> B[Reference Frequency]
    A --> C[Detected Frequency]
    A --> D[Deviation Calculation]
    A --> E[Precision Classification]
    
    B --> B1[Equal Temperament 12-TET]
    B --> B2[A4 = 440Hz Standard]
    B --> B3[MIDI Note Frequencies]
    
    C --> C1[Algorithm Output Hz]
    C --> C2[Confidence Weighted]
    C --> C3[Temporal Smoothing]
    
    D --> D1[Cents = 1200 * log2(f/fref)]
    D --> D2[Positive = Sharp]
    D --> D3[Negative = Flat]
    D --> D4[±50 cents = Semitone]
    
    E --> E1[Exact: ±10 cents]
    E --> E2[Close: ±25 cents]
    E --> E3[Near: ±50 cents]
    E --> E4[Far: >50 cents]
```

## 🎚️ Estados del Análisis

```mermaid
stateDiagram-v2
    [*] --> Ready: Test Initialized
    Ready --> Analyzing: Audio Buffer Received
    Analyzing --> Preprocessing: Apply Filters
    Preprocessing --> AlgorithmSelect: Choose Method
    AlgorithmSelect --> YIN_Process: YIN Selected
    AlgorithmSelect --> Autocorr_Process: Autocorr Selected
    AlgorithmSelect --> HPS_Process: HPS Selected
    YIN_Process --> ConfidenceCheck: YIN Complete
    Autocorr_Process --> ConfidenceCheck: Autocorr Complete
    HPS_Process --> ConfidenceCheck: HPS Complete
    ConfidenceCheck --> NoteMapping: High Confidence
    ConfidenceCheck --> NoPitch: Low Confidence
    NoteMapping --> ResultReady: Mapping Complete
    NoPitch --> Ready: Return Null
    ResultReady --> Ready: Store Result
```

## 📈 Métricas de Performance por Algoritmo

```mermaid
graph LR
    A[Algorithm Metrics] --> B[YIN Performance]
    A --> C[Autocorr Performance]
    A --> D[HPS Performance]
    
    B --> B1[Accuracy: 95-98%]
    B --> B2[Latency: ~5ms]
    B --> B3[CPU: Medium]
    B --> B4[Memory: 4KB]
    
    C --> C1[Accuracy: 85-92%]
    C --> C2[Latency: ~2ms]
    C --> C3[CPU: Low]
    C --> C4[Memory: 2KB]
    
    D --> D1[Accuracy: 90-95%]
    D --> D2[Latency: ~8ms]
    D --> D3[CPU: High]
    D --> D4[Memory: 8KB]
```

## 🧪 Casos de Test Específicos

| Test Case | Input Signal | Expected | Algorithm | Pass Criteria |
|-----------|-------------|----------|-----------|---------------|
| **A4 Pure Tone** | 440Hz sine | A4, 0 cents | YIN/Auto/HPS | ±2Hz, ±5 cents |
| **C4 Complex** | 261.63Hz + harmonics | C4, 0 cents | YIN preferred | ±3Hz, ±8 cents |
| **Noisy Signal** | 330Hz + SNR 10dB | E4, ~0 cents | YIN robust | Detection >80% |
| **Frequency Sweep** | 200-800Hz linear | Continuous track | All algorithms | Smooth transition |
| **Rapid Changes** | Note jumps <100ms | Individual notes | Fast response | <50ms latency |

## 🎯 Configuración de Test Parameters

```mermaid
graph TB
    A[Test Configuration] --> B[Algorithm Settings]
    A --> C[Input Parameters]
    A --> D[Output Validation]
    A --> E[Performance Limits]
    
    B --> B1[YIN Threshold: 0.15]
    B --> B2[Autocorr Window: 4096]
    B --> B3[HPS Harmonics: 5]
    B --> B4[Smoothing Factor: 0.3]
    
    C --> C1[Sample Rate: 44100Hz]
    C --> C2[Buffer Size: 4096]
    C --> C3[Overlap: 75%]
    C --> C4[Window: Hamming]
    
    D --> D1[Frequency Range: 80-2000Hz]
    D --> D2[Confidence Min: 0.7]
    D --> D3[Stability Frames: 3]
    D --> D4[Error Tolerance: ±5Hz]
    
    E --> E1[Processing Time: <10ms]
    E --> E2[Memory Usage: <16KB]
    E --> E3[CPU Load: <20%]
    E --> E4[Success Rate: >90%]
```

## 📊 Análisis Estadístico de Resultados

```mermaid
graph TD
    A[Statistical Analysis] --> B[Accuracy Metrics]
    A --> C[Precision Metrics]
    A --> D[Reliability Metrics]
    A --> E[Performance Metrics]
    
    B --> B1[Mean Absolute Error Hz]
    B --> B2[RMS Error Hz]
    B --> B3[Max Error Hz]
    B --> B4[Detection Rate %]
    
    C --> C1[Cents Deviation Mean]
    C --> C2[Cents Standard Dev]
    C --> C3[95% Confidence Interval]
    C --> C4[Note Accuracy %]
    
    D --> D1[False Positive Rate]
    D --> D2[False Negative Rate]
    D --> D3[Stability Index]
    D --> D4[Confidence Correlation]
    
    E --> E1[Processing Time ms]
    E --> E2[Throughput Buffer/s]
    E --> E3[Memory Efficiency]
    E --> E4[CPU Utilization %]
```

## 🔍 Debugging y Visualización

```mermaid
graph LR
    A[Debug Tools] --> B[Waveform Display]
    A --> C[Spectrum Analysis]
    A --> D[Algorithm Internals]
    A --> E[Comparative Results]
    
    B --> B1[Time Domain Plot]
    B --> B2[Windowed Segments]
    B --> B3[Preprocessing Effects]
    
    C --> C1[FFT Spectrum]
    C --> C2[Harmonic Structure]
    C --> C3[Noise Floor Visualization]
    
    D --> D1[YIN Difference Function]
    D --> D2[Autocorr Peak Plots]
    D --> D3[HPS Spectrum Products]
    
    E --> E1[Algorithm Comparison]
    E --> E2[Reference vs Detected]
    E --> E3[Error Distribution Plots]
```

## 🎯 Criterios de Éxito Pitch Analysis

- ✅ **YIN Algorithm**: >95% accuracy, <10ms latency
- ✅ **Autocorrelation**: >90% accuracy, <5ms latency  
- ✅ **Note Mapping**: Correct note >92% of time
- ✅ **Cents Precision**: ±10 cents for clean signals
- ✅ **Noise Robustness**: >80% detection at 10dB SNR
- ✅ **Real-time Performance**: <20ms total processing

---

**Última actualización**: Julio 2025  
**Versión**: 1.0  
**Algoritmos**: YIN, Autocorr, HPS implementados
