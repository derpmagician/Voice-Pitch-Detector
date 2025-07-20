/**
 * Captura de Audio - Detector de Voz y Notas Musicales
 * Fase 2: Captura de Audio
 * 
 * Funcionalidades implementadas:
 * - initializeMicrophone() - Inicialización del micrófono
 * - createAudioContext() - Creación del contexto de audio
 * - setupAnalyser() - Configuración del analizador de frecuencias
 * - getAudioData() - Obtención de datos de audio en tiempo real
 * - stopAudioCapture() - Detener captura de audio
 */

console.log('🎤 AudioCapture.js cargado - Fase 2 implementada');

class AudioCapture {
    constructor() {
        // Configuración de audio
        this.audioContext = null;
        this.mediaStream = null;
        this.source = null;
        this.analyser = null;
        this.microphone = null;
        
        // Buffers para datos de audio
        this.dataArray = null;
        this.frequencyData = null;
        this.timeDomainData = null;
        
        // Estado de la captura
        this.isCapturing = false;
        this.isInitialized = false;
        
        // Configuración del analizador
        this.config = {
            fftSize: 2048,              // Tamaño de la FFT (debe ser potencia de 2)
            smoothingTimeConstant: 0.8,  // Suavizado de los datos (0-1)
            minDecibels: -90,           // Nivel mínimo de dB
            maxDecibels: -10,           // Nivel máximo de dB
            sampleRate: 44100           // Frecuencia de muestreo preferida
        };
        
        // Configuración de constraints del micrófono
        this.mediaConstraints = {
            audio: {
                echoCancellation: true,     // Cancelación de eco
                noiseSuppression: true,     // Supresión de ruido
                autoGainControl: true,      // Control automático de ganancia
                sampleRate: this.config.sampleRate,
                channelCount: 1,            // Mono
                sampleSize: 16              // 16-bit
            },
            video: false
        };

        console.log('🎤 AudioCapture inicializado con configuración:', {
            fftSize: this.config.fftSize,
            sampleRate: this.config.sampleRate
        });
    }

    /**
     * Inicializar la captura de audio completa
     */
    async initialize() {
        try {
            console.log('🎤 Iniciando inicialización de AudioCapture...');
            
            if (this.isInitialized) {
                console.log('⚠️ AudioCapture ya está inicializado');
                return true;
            }

            // Paso 1: Inicializar micrófono
            const micSuccess = await this.initializeMicrophone();
            if (!micSuccess) {
                throw new Error('No se pudo inicializar el micrófono');
            }

            // Paso 2: Crear contexto de audio
            const contextSuccess = await this.createAudioContext();
            if (!contextSuccess) {
                throw new Error('No se pudo crear el contexto de audio');
            }

            // Paso 3: Configurar analizador
            const analyserSuccess = this.setupAnalyser();
            if (!analyserSuccess) {
                throw new Error('No se pudo configurar el analizador');
            }

            // Paso 4: Inicializar buffers de datos
            this.initializeBuffers();

            this.isInitialized = true;
            console.log('✅ AudioCapture inicializado correctamente');
            
            return true;

        } catch (error) {
            console.error('❌ Error en inicialización de AudioCapture:', error);
            await this.cleanup();
            throw error;
        }
    }

    /**
     * Inicializar acceso al micrófono
     */
    async initializeMicrophone() {
        try {
            console.log('🎤 Solicitando acceso al micrófono...');
            
            // Verificar soporte de getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia no está soportado en este navegador');
            }

            // Solicitar acceso al micrófono
            this.mediaStream = await navigator.mediaDevices.getUserMedia(this.mediaConstraints);
            
            if (!this.mediaStream) {
                throw new Error('No se pudo obtener el stream del micrófono');
            }

            // Verificar que tenemos pistas de audio
            const audioTracks = this.mediaStream.getAudioTracks();
            if (audioTracks.length === 0) {
                throw new Error('No se encontraron pistas de audio en el stream');
            }

            console.log('✅ Micrófono inicializado correctamente:', {
                tracks: audioTracks.length,
                label: audioTracks[0].label,
                settings: audioTracks[0].getSettings()
            });

            // Configurar event listeners para el stream
            this.setupStreamEventListeners();

            return true;

        } catch (error) {
            console.error('❌ Error inicializando micrófono:', error);
            
            // Manejar errores específicos
            if (error.name === 'NotAllowedError') {
                throw new Error('Permisos de micrófono denegados. Por favor, permite el acceso al micrófono.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No se encontró ningún micrófono. Verifica que tienes un micrófono conectado.');
            } else if (error.name === 'NotReadableError') {
                throw new Error('El micrófono está siendo usado por otra aplicación.');
            }
            
            throw error;
        }
    }

    /**
     * Crear el contexto de audio
     */
    async createAudioContext() {
        try {
            console.log('🎵 Creando contexto de audio...');
            
            // Crear AudioContext (compatibilidad cross-browser)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                throw new Error('AudioContext no está soportado en este navegador');
            }

            this.audioContext = new AudioContext({
                sampleRate: this.config.sampleRate
            });

            // Si el contexto está suspendido (política de autoplay), reanudarlo
            if (this.audioContext.state === 'suspended') {
                console.log('🔄 Reanudando contexto de audio suspendido...');
                await this.audioContext.resume();
            }

            console.log('✅ Contexto de audio creado:', {
                state: this.audioContext.state,
                sampleRate: this.audioContext.sampleRate,
                currentTime: this.audioContext.currentTime.toFixed(3)
            });

            // Crear fuente de audio desde el stream del micrófono
            this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
            
            if (!this.source) {
                throw new Error('No se pudo crear la fuente de audio del micrófono');
            }

            console.log('✅ Fuente de audio del micrófono creada');

            return true;

        } catch (error) {
            console.error('❌ Error creando contexto de audio:', error);
            throw error;
        }
    }

    /**
     * Configurar el nodo analizador
     */
    setupAnalyser() {
        try {
            console.log('📊 Configurando analizador de frecuencias...');
            
            if (!this.audioContext) {
                throw new Error('El contexto de audio no está inicializado');
            }

            // Crear el nodo analizador
            this.analyser = this.audioContext.createAnalyser();
            
            // Configurar parámetros del analizador
            this.analyser.fftSize = this.config.fftSize;
            this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
            this.analyser.minDecibels = this.config.minDecibels;
            this.analyser.maxDecibels = this.config.maxDecibels;

            // Conectar la fuente de audio al analizador
            this.source.connect(this.analyser);

            console.log('✅ Analizador configurado:', {
                fftSize: this.analyser.fftSize,
                frequencyBinCount: this.analyser.frequencyBinCount,
                smoothingTimeConstant: this.analyser.smoothingTimeConstant,
                minDecibels: this.analyser.minDecibels,
                maxDecibels: this.analyser.maxDecibels
            });

            return true;

        } catch (error) {
            console.error('❌ Error configurando analizador:', error);
            return false;
        }
    }

    /**
     * Inicializar buffers para datos de audio
     */
    initializeBuffers() {
        if (!this.analyser) {
            throw new Error('El analizador no está configurado');
        }

        const bufferLength = this.analyser.frequencyBinCount;
        
        // Buffer para datos de frecuencia (0-255)
        this.frequencyData = new Uint8Array(bufferLength);
        
        // Buffer para datos en dominio del tiempo (waveform) (-128 a 127)
        this.timeDomainData = new Uint8Array(bufferLength);
        
        // Buffer para datos de frecuencia en float (-Infinity to 0 dB)
        this.dataArray = new Float32Array(bufferLength);

        console.log('📊 Buffers inicializados:', {
            bufferLength: bufferLength,
            frequencyDataLength: this.frequencyData.length,
            timeDomainDataLength: this.timeDomainData.length
        });
    }

    /**
     * Configurar event listeners para el stream
     */
    setupStreamEventListeners() {
        if (!this.mediaStream) return;

        // Listener para cuando se terminan las pistas
        this.mediaStream.addEventListener('removetrack', (event) => {
            console.log('⚠️ Pista de audio removida:', event.track.label);
        });

        // Listeners para las pistas individuales
        const audioTracks = this.mediaStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.addEventListener('ended', () => {
                console.log('⚠️ Pista de audio terminada:', track.label);
                this.handleTrackEnded();
            });

            track.addEventListener('mute', () => {
                console.log('🔇 Micrófono silenciado');
            });

            track.addEventListener('unmute', () => {
                console.log('🔊 Micrófono activado');
            });
        });
    }

    /**
     * Manejar cuando una pista de audio termina
     */
    handleTrackEnded() {
        console.log('⚠️ Pista de audio terminada, deteniendo captura...');
        this.stopAudioCapture();
    }

    /**
     * Iniciar la captura de datos de audio
     */
    startCapture() {
        if (!this.isInitialized) {
            throw new Error('AudioCapture no está inicializado');
        }

        if (this.isCapturing) {
            console.log('⚠️ La captura ya está en progreso');
            return;
        }

        this.isCapturing = true;
        console.log('🎵 Captura de audio iniciada');
    }

    /**
     * Obtener datos de audio en tiempo real
     */
    getAudioData() {
        if (!this.isCapturing || !this.analyser) {
            return null;
        }

        // Obtener datos de frecuencia (espectro de frecuencias)
        this.analyser.getByteFrequencyData(this.frequencyData);
        
        // Obtener datos en dominio del tiempo (forma de onda)
        this.analyser.getByteTimeDomainData(this.timeDomainData);
        
        // Obtener datos de frecuencia en float (mayor precisión)
        this.analyser.getFloatFrequencyData(this.dataArray);

        // Calcular algunos valores útiles
        const volume = this.calculateVolume();
        const dominantFrequency = this.findDominantFrequency();

        return {
            frequencyData: this.frequencyData,      // Uint8Array (0-255)
            timeDomainData: this.timeDomainData,    // Uint8Array (0-255, centrado en 128)
            floatFrequencyData: this.dataArray,     // Float32Array (dB values)
            volume: volume,                         // Valor 0-1
            dominantFrequency: dominantFrequency,   // Hz
            sampleRate: this.audioContext.sampleRate,
            bufferLength: this.analyser.frequencyBinCount,
            timestamp: performance.now()
        };
    }

    /**
     * Calcular el volumen promedio
     */
    calculateVolume() {
        if (!this.frequencyData) return 0;

        let sum = 0;
        for (let i = 0; i < this.frequencyData.length; i++) {
            sum += this.frequencyData[i];
        }
        
        const average = sum / this.frequencyData.length;
        return average / 255; // Normalizar a 0-1
    }

    /**
     * Encontrar la frecuencia dominante
     */
    findDominantFrequency() {
        if (!this.frequencyData || !this.audioContext) return 0;

        let maxIndex = 0;
        let maxValue = 0;

        // Buscar el bin con mayor amplitud (ignorar los primeros bins de baja frecuencia)
        for (let i = 2; i < this.frequencyData.length; i++) {
            if (this.frequencyData[i] > maxValue) {
                maxValue = this.frequencyData[i];
                maxIndex = i;
            }
        }

        // Convertir el índice del bin a frecuencia en Hz
        const nyquist = this.audioContext.sampleRate / 2;
        const frequency = (maxIndex * nyquist) / this.analyser.frequencyBinCount;

        return frequency;
    }

    /**
     * Obtener información del estado actual
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isCapturing: this.isCapturing,
            hasAudioContext: !!this.audioContext,
            hasMediaStream: !!this.mediaStream,
            hasAnalyser: !!this.analyser,
            audioContextState: this.audioContext ? this.audioContext.state : null,
            sampleRate: this.audioContext ? this.audioContext.sampleRate : null
        };
    }

    /**
     * Detener la captura de audio
     */
    stopAudioCapture() {
        console.log('⏹️ Deteniendo captura de audio...');
        
        this.isCapturing = false;

        if (this.mediaStream) {
            // Detener todas las pistas del stream
            this.mediaStream.getTracks().forEach(track => {
                track.stop();
                console.log(`🔇 Pista detenida: ${track.label}`);
            });
        }

        console.log('✅ Captura de audio detenida');
    }

    /**
     * Limpiar todos los recursos
     */
    async cleanup() {
        console.log('🧹 Limpiando recursos de AudioCapture...');

        try {
            // Detener captura si está activa
            if (this.isCapturing) {
                this.stopAudioCapture();
            }

            // Desconectar nodos de audio
            if (this.source) {
                this.source.disconnect();
                this.source = null;
            }

            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }

            // Cerrar contexto de audio
            if (this.audioContext && this.audioContext.state !== 'closed') {
                await this.audioContext.close();
                this.audioContext = null;
            }

            // Limpiar referencias
            this.mediaStream = null;
            this.dataArray = null;
            this.frequencyData = null;
            this.timeDomainData = null;

            this.isInitialized = false;
            this.isCapturing = false;

            console.log('✅ Recursos de AudioCapture limpiados');

        } catch (error) {
            console.error('❌ Error durante limpieza:', error);
        }
    }

    /**
     * Obtener configuración actual
     */
    getConfig() {
        return { ...this.config };
    }

    /**
     * Actualizar configuración
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Configuración actualizada:', this.config);
        
        // Si hay cambios que requieren reinicialización, marcar como no inicializado
        if (newConfig.fftSize && this.analyser) {
            console.log('⚠️ Cambio de fftSize requiere reinicialización');
            this.isInitialized = false;
        }
    }
}

// Exportar para uso posterior
window.AudioCapture = AudioCapture;
