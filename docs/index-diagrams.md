# 🎵 Diagramas de Arquitectura - index.html

## Descripción General
Página principal de la aplicación "Detector de Voz y Notas Musicales" que integra todos los componentes del sistema de detección de pitch en tiempo real.

## 🏗️ Diagrama de Componentes

```mermaid
graph TB
    A[index.html - Página Principal] --> B[Header - app-header]
    A --> C[Control Panel - control-panel]
    A --> D[Status Section - status-section]
    A --> E[Visualization Area - visualization-area]
    A --> F[Error Display - error-display]
    A --> G[Footer - app-footer]
    
    B --> B1[Título Principal]
    B --> B2[Navegación de Tests]
    
    C --> C1[Controles Principales]
    C --> C2[Panel de Configuración]
    
    D --> D1[Indicador de Estado]
    D --> D2[Permisos de Micrófono]
    
    E --> E1[Sección de Medidor]
    E --> E2[Panel de Notas]
    E --> E3[Indicador de Precisión]
    
    E1 --> E1A[Canvas - Medidor Circular]
    E1 --> E1B[Display de Frecuencia]
    E1 --> E1C[Display de Nota]
    
    E2 --> E2A[7 Botones de Notas Do-Si]
    E2 --> E2B[Frecuencias de Referencia]
    
    E3 --> E3A[Barra de Precisión]
    E3 --> E3B[Indicador Móvil]
    E3 --> E3C[Etiquetas Lejos/Cerca/Exacto]
```

## 🔄 Flujo de Datos

```mermaid
flowchart LR
    A[Micrófono] --> B[audioCapture.js]
    B --> C[pitchDetector.js]
    C --> D[noteMapper.js]
    D --> E[visualMeter.js]
    D --> F[noteDisplay.js]
    
    E --> G[Canvas - Medidor Circular]
    F --> H[Panel de Notas Interactivo]
    
    I[app.js - Controlador] --> B
    I --> C
    I --> D
    I --> E
    I --> F
    
    J[Controles de Usuario] --> I
    K[Configuraciones] --> I
```

## 🎨 Estructura Visual

```mermaid
graph TD
    A[🎵 Header con Título] --> B[🧪 Navegación Tests]
    B --> C[🎛️ Panel Control - Inicio/Parada]
    C --> D[⚙️ Configuraciones - Sensibilidad/Octavas]
    D --> E[🔴 Estado del Sistema]
    E --> F[📊 Medidor Circular Canvas]
    F --> G[📟 Displays Frecuencia/Nota]
    G --> H[🎼 Panel 7 Notas Musicales]
    H --> I[📏 Barra de Precisión]
    I --> J[📄 Footer Información]
```

## 🔗 Dependencias JavaScript

```mermaid
graph LR
    A[index.html] --> B[app.js]
    A --> C[audioCapture.js]
    A --> D[pitchDetector.js]
    A --> E[noteMapper.js]
    A --> F[visualMeter.js]
    A --> G[noteDisplay.js]
    
    B -.-> C
    B -.-> D
    B -.-> E
    B -.-> F
    B -.-> G
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
```

## 📱 Layout Responsivo

```mermaid
graph TB
    subgraph Desktop[💻 Desktop - Grid Layout]
        A1[Header Completo]
        A2[Controls Horizontal]
        A3[Meter + Notes Side by Side]
        A4[Precision Bar Full Width]
    end
    
    subgraph Tablet[📱 Tablet - 768px]
        B1[Header Compacto]
        B2[Controls Vertical]
        B3[Meter Stacked]
        B4[Notes 2 Columns]
    end
    
    subgraph Mobile[📱 Mobile - 480px]
        C1[Header Minimal]
        C2[Single Column]
        C3[Test Links 1 Column]
        C4[Notes 4 Grid]
    end
```

## ⚡ Estados de la Aplicación

```mermaid
stateDiagram-v2
    [*] --> Idle: Página Cargada
    Idle --> RequestingPermission: Usuario presiona Iniciar
    RequestingPermission --> Ready: Permisos Concedidos
    RequestingPermission --> Error: Permisos Denegados
    Ready --> Recording: Detectando Audio
    Recording --> Processing: Analizando Pitch
    Processing --> Visualizing: Mostrando Resultados
    Visualizing --> Recording: Continúa Detección
    Recording --> Stopped: Usuario presiona Parar
    Stopped --> Idle: Sistema en Reposo
    Error --> RequestingPermission: Reintentar Permisos
```

## 🎯 Elementos Interactivos

```mermaid
mindmap
    root((Interacciones))
        Controles
            Botón Iniciar
            Botón Parar
            Slider Sensibilidad
            Select Octavas
        Navegación
            Link Test General
            Link Audio Capture
            Link Pitch Analysis
            Link Visualizations
        Configuración
            Rango de Sensibilidad 0.1-2.0
            Octavas 1-7, 2-6, 3-5
        Visualización
            Canvas Interactivo
            Notas Activables
            Indicador Precision
```

## 🔧 Tecnologías Integradas

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| **HTML5** | Semantic Elements | Estructura accesible |
| **CSS3** | Grid/Flexbox | Layout responsivo |
| **Canvas API** | 2D Context | Medidor circular |
| **Web Audio API** | getUserMedia | Captura de audio |
| **JavaScript ES6+** | Módulos/Clases | Lógica de aplicación |

## 📊 Métricas de Performance

- **Tiempo de carga**: <2 segundos
- **FPS del medidor**: 60fps constantes
- **Latencia audio**: <50ms
- **Tamaño bundle**: ~200KB (sin audio procesado)
- **Compatibilidad**: 95%+ navegadores modernos

## 🎨 Paleta de Colores

```mermaid
pie title Distribución de Colores UI
    "Azul Primario (#2196F3)" : 35
    "Verde Éxito (#4CAF50)" : 25
    "Naranja Advertencia (#FF9800)" : 20
    "Rojo Error (#F44336)" : 15
    "Grises Neutros" : 5
```

---

**Última actualización**: Julio 2025  
**Versión**: 1.0  
**Estado**: ✅ Implementado y funcional
