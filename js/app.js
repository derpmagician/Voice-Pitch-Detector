/**
 * Aplicación Principal - Detector de Voz y Notas Musicales
 * Fase 1: Configuración Base
 * 
 * Características implementadas:
 * - Interfaz básica con botón de inicio/parada
 * - Solicitud de permisos de micrófono
 * - Manejo de errores básico
 * - Diseño responsive
 */

class VoicePitchDetectorApp {
    constructor() {
        this.isRunning = false;
        this.audioCapture = null;
        this.pitchDetector = null;    // Detector de pitch (Fase 3)
        this.noteMapper = null;       // Mapeador de notas (Fase 3)
        this.animationFrameId = null;  // Para el bucle de animación
        this.lastUpdateTime = 0;       // Para throttling de actualizaciones
        this.settings = {
            sensitivity: 1.0,
            octaveRange: '2-6',
            updateInterval: 50  // Actualizar cada 50ms (20 FPS)
        };
        
        this.init();
    }

    /**
     * Inicialización de la aplicación
     */
    init() {
        console.log('🎵 Inicializando Detector de Voz y Notas Musicales...');
        
        // Cargar configuraciones guardadas
        this.loadSettings();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Verificar compatibilidad del navegador
        this.checkBrowserCompatibility();
        
        // Actualizar interfaz inicial
        this.updateUI();
        
        console.log('✅ Aplicación inicializada correctamente');
    }

    /**
     * Configurar event listeners para los controles de la interfaz
     */
    setupEventListeners() {
        // Botones principales
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');
        const requestPermissionBtn = document.getElementById('requestPermissionBtn');
        const dismissErrorBtn = document.getElementById('dismissError');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.startDetection());
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopDetection());
        }

        if (requestPermissionBtn) {
            requestPermissionBtn.addEventListener('click', () => this.requestMicrophonePermission());
        }

        if (dismissErrorBtn) {
            dismissErrorBtn.addEventListener('click', () => this.dismissError());
        }

        // Controles de configuración
        const sensitivitySlider = document.getElementById('sensitivity');
        const sensitivityValue = document.getElementById('sensitivityValue');
        const octaveRangeSelect = document.getElementById('octaveRange');

        if (sensitivitySlider) {
            sensitivitySlider.addEventListener('input', (e) => {
                this.settings.sensitivity = parseFloat(e.target.value);
                if (sensitivityValue) {
                    sensitivityValue.textContent = this.settings.sensitivity.toFixed(1);
                }
                this.saveSettings();
            });
        }

        if (octaveRangeSelect) {
            octaveRangeSelect.addEventListener('change', (e) => {
                this.settings.octaveRange = e.target.value;
                this.saveSettings();
                this.updateOctaveRange();
                this.updateNotesPanel();
            });
        }

        // Event listeners para responsive
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Listener para cuando se cierra la página
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * Verificar compatibilidad del navegador
     */
    checkBrowserCompatibility() {
        const compatibility = {
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            audioContext: !!(window.AudioContext || window.webkitAudioContext),
            requestAnimationFrame: !!window.requestAnimationFrame
        };

        console.log('🔍 Verificando compatibilidad:', compatibility);

        if (!compatibility.getUserMedia) {
            this.showError('Tu navegador no soporta acceso al micrófono. Por favor, usa Chrome, Firefox, Safari o Edge.');
            return false;
        }

        if (!compatibility.audioContext) {
            this.showError('Tu navegador no soporta Web Audio API. Por favor, actualiza tu navegador.');
            return false;
        }

        if (!compatibility.requestAnimationFrame) {
            console.warn('⚠️ requestAnimationFrame no disponible, usando setTimeout como fallback');
        }

        return true;
    }

    /**
     * Iniciar la detección de voz
     */
    async startDetection() {
        if (this.isRunning) return;

        try {
            console.log('🎤 Iniciando detección de voz...');
            
            this.updateStatus('Solicitando permisos de micrófono...', 'warning');
            
            // Verificar permisos de micrófono
            const hasPermission = await this.checkMicrophonePermission();
            if (!hasPermission) {
                this.showMicrophonePermissionRequest();
                return;
            }

            this.updateStatus('Configurando captura de audio...', 'warning');

            // Inicializar captura de audio (Fase 2)
            this.audioCapture = new AudioCapture();
            await this.audioCapture.initialize();

            this.updateStatus('Configurando análisis de pitch...', 'warning');

            // Inicializar análisis de pitch y notas (Fase 3)
            this.initializePitchAnalysis();

            // Iniciar captura de datos
            this.audioCapture.startCapture();

            // Iniciar el bucle de procesamiento de audio
            this.startAudioProcessingLoop();

            this.isRunning = true;
            this.updateUI();
            this.updateStatus('Detectando voz en tiempo real...', 'success');
            
            console.log('✅ Detección de voz iniciada');

        } catch (error) {
            console.error('❌ Error al iniciar detección:', error);
            this.showError(`Error al iniciar la detección: ${error.message}`);
            this.isRunning = false;
            this.updateUI();
        }
    }

    /**
     * Parar la detección de voz
     */
    stopDetection() {
        if (!this.isRunning) return;

        try {
            console.log('⏹️ Parando detección de voz...');

            // Parar el bucle de procesamiento
            this.stopAudioProcessingLoop();

            // Parar y limpiar captura de audio (Fase 2)
            if (this.audioCapture) {
                this.audioCapture.stopAudioCapture();
                this.audioCapture.cleanup();
                this.audioCapture = null;
            }

            // Limpiar análisis de pitch (Fase 3)
            this.cleanupPitchAnalysis();

            this.isRunning = false;
            this.updateUI();
            this.updateStatus('Detección detenida', 'secondary');
            
            // Resetear visualizaciones
            this.resetVisualization();
            
            console.log('✅ Detección de voz detenida');

        } catch (error) {
            console.error('❌ Error al parar detección:', error);
            this.showError(`Error al parar la detección: ${error.message}`);
        }
    }

    /**
     * Verificar permisos de micrófono
     */
    async checkMicrophonePermission() {
        try {
            // Intentar acceder al micrófono temporalmente
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            // Cerrar el stream inmediatamente
            stream.getTracks().forEach(track => track.stop());
            
            this.hideMicrophonePermissionRequest();
            return true;

        } catch (error) {
            console.warn('⚠️ Sin permisos de micrófono:', error.name);
            return false;
        }
    }

    /**
     * Solicitar permisos de micrófono explícitamente
     */
    async requestMicrophonePermission() {
        try {
            const hasPermission = await this.checkMicrophonePermission();
            if (hasPermission) {
                this.hideMicrophonePermissionRequest();
                this.updateStatus('Permisos concedidos correctamente', 'success');
            }
        } catch (error) {
            console.error('❌ Error al solicitar permisos:', error);
            this.showError('No se pudieron obtener los permisos de micrófono. Verifica la configuración de tu navegador.');
        }
    }

    /**
     * Mostrar solicitud de permisos de micrófono
     */
    showMicrophonePermissionRequest() {
        const permissionPanel = document.getElementById('micPermission');
        if (permissionPanel) {
            permissionPanel.style.display = 'block';
        }
        this.updateStatus('Se necesitan permisos de micrófono', 'warning');
    }

    /**
     * Ocultar solicitud de permisos de micrófono
     */
    hideMicrophonePermissionRequest() {
        const permissionPanel = document.getElementById('micPermission');
        if (permissionPanel) {
            permissionPanel.style.display = 'none';
        }
    }

    /**
     * Actualizar la interfaz de usuario
     */
    updateUI() {
        const startBtn = document.getElementById('startBtn');
        const stopBtn = document.getElementById('stopBtn');

        if (startBtn && stopBtn) {
            startBtn.disabled = this.isRunning;
            stopBtn.disabled = !this.isRunning;

            // Actualizar clases CSS para animaciones
            if (this.isRunning) {
                startBtn.classList.add('btn-disabled');
                stopBtn.classList.remove('btn-disabled');
            } else {
                startBtn.classList.remove('btn-disabled');
                stopBtn.classList.add('btn-disabled');
            }
        }

        // Actualizar configuraciones en la interfaz
        const sensitivitySlider = document.getElementById('sensitivity');
        const sensitivityValue = document.getElementById('sensitivityValue');
        const octaveRangeSelect = document.getElementById('octaveRange');

        if (sensitivitySlider && sensitivityValue) {
            sensitivitySlider.value = this.settings.sensitivity;
            sensitivityValue.textContent = this.settings.sensitivity.toFixed(1);
        }

        if (octaveRangeSelect) {
            octaveRangeSelect.value = this.settings.octaveRange;
        }
    }

    /**
     * Actualizar el estado de la aplicación
     */
    updateStatus(message, type = 'secondary') {
        const statusText = document.getElementById('statusText');
        const statusLight = document.getElementById('statusLight');

        if (statusText) {
            statusText.textContent = message;
        }

        if (statusLight) {
            // Remover clases anteriores
            statusLight.className = 'status-light';
            // Agregar nueva clase de estado
            statusLight.classList.add(`status-${type}`);
        }

        console.log(`📊 Estado: ${message} (${type})`);
    }

    /**
     * Mostrar un error al usuario
     */
    showError(message) {
        const errorDisplay = document.getElementById('errorDisplay');
        const errorMessage = document.getElementById('errorMessage');

        if (errorDisplay && errorMessage) {
            errorMessage.textContent = message;
            errorDisplay.style.display = 'flex';
        }

        this.updateStatus('Error', 'error');
        console.error('❌ Error mostrado al usuario:', message);
    }

    /**
     * Cerrar el panel de error
     */
    dismissError() {
        const errorDisplay = document.getElementById('errorDisplay');
        if (errorDisplay) {
            errorDisplay.style.display = 'none';
        }
        this.updateStatus('Listo para comenzar', 'secondary');
    }

    /**
     * Cargar configuraciones del localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('voicePitchDetectorSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                console.log('📁 Configuraciones cargadas:', this.settings);
            }
        } catch (error) {
            console.warn('⚠️ Error cargando configuraciones:', error);
        }
    }

    /**
     * Guardar configuraciones en localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('voicePitchDetectorSettings', JSON.stringify(this.settings));
            console.log('💾 Configuraciones guardadas:', this.settings);
        } catch (error) {
            console.warn('⚠️ Error guardando configuraciones:', error);
        }
    }

    /**
     * Actualizar el panel de notas según el rango de octavas
     */
    updateNotesPanel() {
        // TODO: Implementar en Fase 4 - Visualización
        console.log(`🎵 Actualizando panel de notas para rango: ${this.settings.octaveRange}`);
    }

    /**
     * Resetear visualizaciones
     */
    resetVisualization() {
        // Resetear frecuencia mostrada
        const frequencyDisplay = document.getElementById('currentFrequency');
        const noteDisplay = document.getElementById('currentNote');

        if (frequencyDisplay) {
            frequencyDisplay.textContent = '0';
        }

        if (noteDisplay) {
            noteDisplay.textContent = '--';
        }

        // TODO: Resetear medidor visual (Fase 4)
        // TODO: Resetear panel de notas (Fase 4)

        console.log('🔄 Visualizaciones reseteadas');
    }

    /**
     * Manejar cambios de tamaño de ventana
     */
    handleResize() {
        // TODO: Ajustar visualizaciones responsivas (Fase 4)
        console.log('📱 Manejando cambio de tamaño de ventana');
    }

    /**
     * Limpieza al cerrar la aplicación
     */
    cleanup() {
        console.log('🧹 Limpiando recursos...');
        
        if (this.isRunning) {
            this.stopDetection();
        }
        
        this.saveSettings();
        
        console.log('✅ Limpieza completada');
    }

    /**
     * Iniciar el bucle de procesamiento de audio
     */
    startAudioProcessingLoop() {
        console.log('🔄 Iniciando bucle de procesamiento de audio...');
        
        const processAudio = (currentTime) => {
            // Throttling: solo actualizar cada X ms
            if (currentTime - this.lastUpdateTime < this.settings.updateInterval) {
                this.animationFrameId = requestAnimationFrame(processAudio);
                return;
            }
            
            this.lastUpdateTime = currentTime;

            try {
                if (this.isRunning && this.audioCapture) {
                    // Obtener datos de audio
                    const audioData = this.audioCapture.getAudioData();
                    
                    if (audioData) {
                        // Procesar y actualizar visualizaciones
                        this.processAudioData(audioData);
                    }
                }
                
                // Continuar el bucle si seguimos corriendo
                if (this.isRunning) {
                    this.animationFrameId = requestAnimationFrame(processAudio);
                }
                
            } catch (error) {
                console.error('❌ Error en bucle de procesamiento:', error);
                this.stopDetection();
            }
        };

        // Iniciar el bucle
        this.animationFrameId = requestAnimationFrame(processAudio);
    }

    /**
     * Detener el bucle de procesamiento de audio
     */
    stopAudioProcessingLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
            console.log('⏹️ Bucle de procesamiento de audio detenido');
        }
    }

    /**
     * Procesar datos de audio y actualizar visualizaciones
     */
    /**
     * Procesar datos de audio y actualizar visualizaciones
     */
    processAudioData(audioData) {
        try {
            // Actualizar visualizaciones básicas (Fase 2)
            this.updateBasicVisualization(audioData);
            
            // Análisis de pitch (Fase 3)
            if (this.pitchDetector) {
                const pitchResult = this.pitchDetector.detectPitch(audioData);
                this.updatePitchDisplay(pitchResult);
                
                // Mapeo de notas (Fase 3)
                if (this.noteMapper && pitchResult.isValid) {
                    const noteResult = this.noteMapper.frequencyToNote(pitchResult.frequency);
                    this.updateNoteDisplay(noteResult, pitchResult);
                    
                    // Actualizar visualizaciones avanzadas (Fase 4)
                    this.updateAdvancedVisualizations(pitchResult, noteResult, audioData.volume);
                } else {
                    this.clearNoteDisplay();
                    this.clearAdvancedVisualizations();
                }
            }
            
        } catch (error) {
            console.error('❌ Error procesando datos de audio:', error);
        }
    }

    /**
     * Actualizar visualizaciones básicas con datos de audio (Fase 2)
     */
    updateBasicVisualization(audioData) {
        // Actualizar frecuencia dominante
        const frequencyDisplay = document.getElementById('currentFrequency');
        if (frequencyDisplay) {
            frequencyDisplay.textContent = Math.round(audioData.dominantFrequency);
        }

        // Actualizar volumen/intensidad (usar para futuras visualizaciones)
        const volume = audioData.volume;
        
        // Mostrar información en consola (para debugging, solo ocasionalmente)
        if (Math.random() < 0.01) { // 1% de las veces
            console.log('🎵 Audio Data:', {
                dominantFreq: Math.round(audioData.dominantFrequency),
                volume: volume.toFixed(3),
                bufferLength: audioData.bufferLength,
                sampleRate: audioData.sampleRate
            });
        }
    }

    /**
     * Actualizar visualizaciones avanzadas (Fase 4)
     */
    updateAdvancedVisualizations(pitchResult, noteResult, volume) {
        try {
            // Actualizar medidor visual circular
            if (this.visualMeter) {
                this.visualMeter.update(pitchResult, noteResult, volume);
            }
            
            // Actualizar panel de notas interactivo
            if (this.noteDisplay) {
                this.noteDisplay.update(noteResult, {
                    precision: noteResult.precision,
                    cents: noteResult.cents,
                    confidence: pitchResult.confidence
                });
            }
            
            // Actualizar indicador de precisión
            this.updatePrecisionIndicator(noteResult);
            
        } catch (error) {
            console.error('❌ Error actualizando visualizaciones avanzadas:', error);
        }
    }

    /**
     * Limpiar visualizaciones avanzadas (Fase 4)
     */
    clearAdvancedVisualizations() {
        try {
            if (this.visualMeter) {
                this.visualMeter.reset();
            }
            
            if (this.noteDisplay) {
                this.noteDisplay.reset();
            }
            
            this.clearPrecisionIndicator();
            
        } catch (error) {
            console.error('❌ Error limpiando visualizaciones avanzadas:', error);
        }
    }

    /**
     * Inicializar sistema de análisis de pitch (Fase 3)
     */
    initializePitchAnalysis() {
        try {
            // Crear detector de pitch
            const sampleRate = this.audioCapture ? this.audioCapture.getStatus().sampleRate : 44100;
            this.pitchDetector = new PitchDetector(sampleRate || 44100);
            
            // Crear mapeador de notas
            this.noteMapper = new NoteMapper();
            
            // Configurar rango de octavas según configuración
            this.updateOctaveRange();
            
            // Inicializar componentes de visualización (Fase 4)
            this.initializeVisualization();
            
            console.log('🎵 Sistema de análisis de pitch y visualización inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando análisis de pitch:', error);
            throw error;
        }
    }

    /**
     * Inicializar componentes de visualización (Fase 4)
     */
    initializeVisualization() {
        try {
            console.log('🎨 Inicializando componentes de visualización...');
            
            // Crear canvas para el medidor visual si no existe
            let meterCanvas = document.getElementById('pitchMeterCanvas');
            if (!meterCanvas) {
                const meterContainer = document.getElementById('pitchMeter');
                if (meterContainer) {
                    // Crear canvas para el medidor
                    const canvas = document.createElement('canvas');
                    canvas.id = 'pitchMeterCanvas';
                    canvas.width = 400;
                    canvas.height = 400;
                    canvas.style.maxWidth = '100%';
                    canvas.style.height = 'auto';
                    
                    // Reemplazar contenido existente
                    meterContainer.innerHTML = '';
                    meterContainer.appendChild(canvas);
                    meterCanvas = canvas;
                }
            }
            
            // Inicializar medidor visual circular
            if (meterCanvas) {
                this.visualMeter = new VisualMeter('pitchMeterCanvas', {
                    minFrequency: 80,
                    maxFrequency: 800,
                    animationSpeed: 0.15,
                    glowEffect: true,
                    showFrequency: true,
                    showNote: true
                });
                console.log('📊 Medidor visual inicializado');
            } else {
                console.warn('⚠️ Canvas para medidor visual no encontrado');
            }
            
            // Inicializar panel de notas interactivo
            const notesPanel = document.getElementById('notesPanel');
            if (notesPanel) {
                this.noteDisplay = new NoteDisplay('notesPanel', {
                    octaveRange: this.getOctaveRange(),
                    showFrequencies: true,
                    showCents: true,
                    pulseEffect: true,
                    glowEffect: true
                });
                console.log('🎵 Panel de notas inicializado');
            } else {
                console.warn('⚠️ Panel de notas no encontrado');
            }
            
            console.log('✅ Componentes de visualización inicializados');
        } catch (error) {
            console.error('❌ Error inicializando visualización:', error);
            // No lanzar error, las visualizaciones son opcionales
        }
    }

    /**
     * Limpiar sistema de análisis de pitch (Fase 3)
     */
    cleanupPitchAnalysis() {
        if (this.pitchDetector) {
            this.pitchDetector.reset();
            this.pitchDetector = null;
        }
        
        this.noteMapper = null;
        
        console.log('🧹 Sistema de análisis de pitch limpiado');
    }

    /**
     * Actualizar display de pitch detectado (Fase 3)
     */
    updatePitchDisplay(pitchResult) {
        const frequencyDisplay = document.getElementById('currentFrequency');
        
        if (frequencyDisplay) {
            if (pitchResult.isValid) {
                frequencyDisplay.textContent = Math.round(pitchResult.frequency);
                
                // Agregar clase CSS para indicar pitch válido
                frequencyDisplay.parentElement.classList.remove('no-pitch');
                frequencyDisplay.parentElement.classList.add('has-pitch');
                
                // Cambiar color según confianza
                if (pitchResult.confidence > 0.8) {
                    frequencyDisplay.parentElement.classList.add('high-confidence');
                } else {
                    frequencyDisplay.parentElement.classList.remove('high-confidence');
                }
                
            } else {
                frequencyDisplay.textContent = '--';
                frequencyDisplay.parentElement.classList.add('no-pitch');
                frequencyDisplay.parentElement.classList.remove('has-pitch', 'high-confidence');
            }
        }

        // Log de debugging ocasional
        if (Math.random() < 0.02) { // 2% de las veces
            console.log('🎵 Pitch Result:', {
                frequency: pitchResult.frequency?.toFixed(2),
                confidence: pitchResult.confidence?.toFixed(3),
                clarity: pitchResult.clarity?.toFixed(3),
                algorithm: pitchResult.algorithm,
                isValid: pitchResult.isValid,
                isStable: pitchResult.isStable
            });
        }
    }

    /**
     * Actualizar display de notas detectadas (Fase 3)
     */
    updateNoteDisplay(noteResult, pitchResult) {
        const noteDisplay = document.getElementById('currentNote');
        
        if (noteDisplay) {
            if (noteResult.isValid) {
                noteDisplay.textContent = noteResult.displayName;
                
                // Actualizar clases CSS según precisión
                noteDisplay.parentElement.className = 'note-display';
                noteDisplay.parentElement.classList.add(`precision-${noteResult.precision}`);
                
                // Agregar información de cents si es útil
                if (Math.abs(noteResult.cents) > 5) {
                    const centsIndicator = noteResult.cents > 0 ? '↑' : '↓';
                    noteDisplay.textContent += ` ${centsIndicator}${Math.abs(Math.round(noteResult.cents))}`;
                }
                
            } else {
                noteDisplay.textContent = '--';
                noteDisplay.parentElement.className = 'note-display no-note';
            }
        }

        // Actualizar panel de notas (iluminar la nota detectada)
        this.highlightNoteInPanel(noteResult);

        // Actualizar indicador de precisión
        this.updatePrecisionIndicator(noteResult);

        // Log de debugging ocasional
        if (Math.random() < 0.02) { // 2% de las veces
            console.log('🎼 Note Result:', {
                note: noteResult.displayName,
                cents: noteResult.cents?.toFixed(1),
                precision: noteResult.precision,
                frequency: `${noteResult.detectedFrequency?.toFixed(2)} -> ${noteResult.frequency?.toFixed(2)}`,
                isValid: noteResult.isValid
            });
        }
    }

    /**
     * Limpiar display de notas
     */
    clearNoteDisplay() {
        const noteDisplay = document.getElementById('currentNote');
        if (noteDisplay) {
            noteDisplay.textContent = '--';
            noteDisplay.parentElement.className = 'note-display no-note';
        }
        
        // Limpiar highlight del panel de notas
        this.clearNoteHighlights();
        
        // Limpiar indicador de precisión
        this.clearPrecisionIndicator();
    }

    /**
     * Iluminar nota en el panel de notas
     */
    highlightNoteInPanel(noteResult) {
        // Limpiar highlights anteriores
        this.clearNoteHighlights();
        
        if (!noteResult.isValid) return;
        
        // Encontrar el elemento de la nota en el panel
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            const noteAttr = item.getAttribute('data-note');
            if (noteAttr && noteAttr === noteResult.note.replace('#', 's')) { // Convertir # a s para HTML
                item.classList.add('active');
                item.classList.add(`precision-${noteResult.precision}`);
            }
        });
    }

    /**
     * Limpiar highlights del panel de notas
     */
    clearNoteHighlights() {
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            item.classList.remove('active', 'precision-exact', 'precision-close', 'precision-near', 'precision-far');
        });
    }

    /**
     * Actualizar indicador de precisión
     */
    /**
     * Actualizar indicador de precisión (Fase 4)
     */
    updatePrecisionIndicator(noteResult) {
        const precisionIndicator = document.getElementById('precisionIndicator');
        if (!precisionIndicator) return;
        
        if (!noteResult || !noteResult.isValid) {
            this.clearPrecisionIndicator();
            return;
        }
        
        // Calcular posición del indicador (0-100%)
        const maxCents = 50; // ±50 cents es el rango máximo mostrado
        const position = Math.max(0, Math.min(100, 
            50 + (noteResult.cents / maxCents) * 50
        ));
        
        // Actualizar posición
        precisionIndicator.style.left = `${position}%`;
        
        // Actualizar clases CSS para colores
        precisionIndicator.className = `precision-indicator precision-${noteResult.precision}`;
        
        // Color según precisión
        const colors = {
            'exact': '#4CAF50',
            'close': '#FF9800', 
            'far': '#F44336'
        };
        
        precisionIndicator.style.backgroundColor = colors[noteResult.precision] || '#666666';
        
        // Mostrar el indicador con animación
        precisionIndicator.style.opacity = '1';
        precisionIndicator.style.transform = 'scale(1)';
        
        // Agregar efecto de pulso para notas exactas
        if (noteResult.precision === 'exact') {
            precisionIndicator.style.animation = 'precision-pulse 0.5s ease-out';
            setTimeout(() => {
                precisionIndicator.style.animation = '';
            }, 500);
        }
    }

    /**
     * Limpiar indicador de precisión (Fase 4)
     */
    clearPrecisionIndicator() {
        const precisionIndicator = document.getElementById('precisionIndicator');
        if (precisionIndicator) {
            precisionIndicator.style.opacity = '0';
            precisionIndicator.style.transform = 'scale(0.8)';
            precisionIndicator.style.animation = '';
        }
    }

    /**
     * Actualizar rango de octavas según configuración
     */
    updateOctaveRange() {
        if (!this.noteMapper) return;
        
        const range = this.settings.octaveRange.split('-');
        if (range.length === 2) {
            const minOctave = parseInt(range[0]);
            const maxOctave = parseInt(range[1]);
            
            this.noteMapper.updateConfig({
                minOctave: minOctave,
                maxOctave: maxOctave
            });
            
            console.log(`🎵 Rango de octavas actualizado: ${minOctave}-${maxOctave}`);
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, iniciando aplicación...');
    window.voicePitchDetector = new VoicePitchDetectorApp();
});

// Exportar para uso en otros módulos (si es necesario)
window.VoicePitchDetectorApp = VoicePitchDetectorApp;
