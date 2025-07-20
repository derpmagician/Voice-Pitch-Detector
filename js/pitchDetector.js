/**
 * Detector de Tono - Detector de Voz y Notas Musicales
 * Fase 3: Análisis de Frecuencia
 * 
 * Algoritmos implementados:
 * - autocorrelation() - Algoritmo principal de autocorrelación
 * - findPitch() - Detectar frecuencia fundamental
 * - smoothPitch() - Suavizar lecturas
 * - validatePitch() - Filtrar ruido
 * - YIN Algorithm - Implementación mejorada para mejor precisión
 */

console.log('🎵 PitchDetector.js cargado - Fase 3 implementada');

class PitchDetector {
    constructor(sampleRate = 44100) {
        this.sampleRate = sampleRate;
        
        // Configuración del detector
        this.config = {
            // Rango de frecuencias válidas (Hz)
            minFrequency: 80,      // Nota más baja: ~E2
            maxFrequency: 2000,    // Nota más alta: ~B6
            
            // Parámetros de autocorrelación
            threshold: 0.2,        // Umbral de confianza
            clarityThreshold: 0.9, // Umbral de claridad de pitch
            
            // Suavizado temporal
            smoothingFactor: 0.8,  // Factor de suavizado (0-1)
            stabilityCount: 3,     // Frames consecutivos para estabilidad
            
            // Filtrado de ruido
            volumeThreshold: 0.01, // Volumen mínimo para detectar pitch
            
            // YIN Algorithm parameters
            yinThreshold: 0.15,    // Umbral YIN para detección de pitch
            probabilityThreshold: 0.1
        };
        
        // Estado del detector
        this.lastPitch = 0;
        this.pitchHistory = [];
        this.clarityHistory = [];
        this.stableFrames = 0;
        
        // Buffer para cálculos
        this.autocorrelationBuffer = null;
        this.yinBuffer = null;
        
        console.log('🎵 PitchDetector inicializado:', {
            sampleRate: this.sampleRate,
            range: `${this.config.minFrequency}-${this.config.maxFrequency} Hz`,
            threshold: this.config.threshold
        });
    }

    /**
     * Detectar pitch en datos de audio
     */
    detectPitch(audioData) {
        try {
            if (!audioData || !audioData.timeDomainData) {
                return this.createNullResult();
            }

            // Verificar volumen mínimo
            if (audioData.volume < this.config.volumeThreshold) {
                return this.createNullResult('Volume too low');
            }

            // Preparar datos para análisis
            const samples = this.prepareAudioSamples(audioData.timeDomainData);
            
            if (!samples || samples.length === 0) {
                return this.createNullResult('No valid samples');
            }

            // Método principal: YIN Algorithm (más preciso)
            let pitchResult = this.detectPitchYIN(samples);
            
            // Fallback: Autocorrelación tradicional si YIN no funciona
            if (!pitchResult.isValid) {
                pitchResult = this.detectPitchAutocorrelation(samples);
            }

            // Validar y procesar resultado
            if (pitchResult.isValid) {
                pitchResult = this.processValidPitch(pitchResult, audioData);
            }

            return pitchResult;

        } catch (error) {
            console.error('❌ Error en detección de pitch:', error);
            return this.createNullResult(`Error: ${error.message}`);
        }
    }

    /**
     * Preparar muestras de audio para análisis
     */
    prepareAudioSamples(timeDomainData) {
        if (!timeDomainData || timeDomainData.length === 0) return null;

        // Convertir de Uint8Array (0-255) a Float32Array (-1 to 1)
        const samples = new Float32Array(timeDomainData.length);
        
        for (let i = 0; i < timeDomainData.length; i++) {
            samples[i] = (timeDomainData[i] - 128) / 128.0;
        }

        // Aplicar ventana para reducir artefactos
        this.applyHammingWindow(samples);
        
        return samples;
    }

    /**
     * Aplicar ventana de Hamming para reducir artefactos espectrales
     */
    applyHammingWindow(samples) {
        const length = samples.length;
        
        for (let i = 0; i < length; i++) {
            const windowValue = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (length - 1));
            samples[i] *= windowValue;
        }
    }

    /**
     * Implementación del algoritmo YIN para detección de pitch
     * Más preciso que la autocorrelación tradicional
     */
    detectPitchYIN(samples) {
        const length = samples.length;
        const halfLength = Math.floor(length / 2);
        
        // Inicializar buffer YIN si es necesario
        if (!this.yinBuffer || this.yinBuffer.length !== halfLength) {
            this.yinBuffer = new Float32Array(halfLength);
        }

        // Paso 1: Calcular función de diferencia
        this.yinBuffer[0] = 1.0;
        
        for (let tau = 1; tau < halfLength; tau++) {
            this.yinBuffer[tau] = 0;
            
            for (let i = 0; i < halfLength; i++) {
                const delta = samples[i] - samples[i + tau];
                this.yinBuffer[tau] += delta * delta;
            }
        }

        // Paso 2: Calcular función de diferencia cumulativa normalizada
        let runningSum = 0;
        this.yinBuffer[0] = 1;
        
        for (let tau = 1; tau < halfLength; tau++) {
            runningSum += this.yinBuffer[tau];
            if (runningSum === 0) {
                this.yinBuffer[tau] = 1;
            } else {
                this.yinBuffer[tau] = this.yinBuffer[tau] * tau / runningSum;
            }
        }

        // Paso 3: Buscar el mínimo absoluto
        const minTauRange = this.frequencyToSamplePeriod(this.config.maxFrequency);
        const maxTauRange = this.frequencyToSamplePeriod(this.config.minFrequency);
        
        let bestTau = 0;
        let bestValue = 1.0;
        
        for (let tau = Math.max(2, minTauRange); tau < Math.min(halfLength, maxTauRange); tau++) {
            if (this.yinBuffer[tau] < this.config.yinThreshold) {
                // Buscar mínimo local con interpolación parabólica
                const betterTau = this.parabolicInterpolation(tau);
                const frequency = this.sampleRate / betterTau;
                
                if (this.isValidFrequency(frequency)) {
                    return {
                        frequency: frequency,
                        clarity: 1.0 - this.yinBuffer[tau],
                        confidence: Math.max(0, 1.0 - this.yinBuffer[tau]),
                        algorithm: 'YIN',
                        isValid: true,
                        tau: betterTau
                    };
                }
            }
            
            if (this.yinBuffer[tau] < bestValue) {
                bestValue = this.yinBuffer[tau];
                bestTau = tau;
            }
        }

        // Si no se encontró un pitch claro, usar el mejor candidato
        if (bestTau > 0 && bestValue < 0.8) {
            const betterTau = this.parabolicInterpolation(bestTau);
            const frequency = this.sampleRate / betterTau;
            
            if (this.isValidFrequency(frequency)) {
                return {
                    frequency: frequency,
                    clarity: 1.0 - bestValue,
                    confidence: Math.max(0, 1.0 - bestValue),
                    algorithm: 'YIN',
                    isValid: bestValue < 0.5,
                    tau: betterTau
                };
            }
        }

        return { isValid: false, algorithm: 'YIN', reason: 'No clear pitch found' };
    }

    /**
     * Implementación de autocorrelación tradicional (fallback)
     */
    detectPitchAutocorrelation(samples) {
        const length = samples.length;
        const correlations = new Float32Array(Math.floor(length / 2));
        
        // Calcular autocorrelación
        for (let lag = 0; lag < correlations.length; lag++) {
            let sum = 0;
            let count = 0;
            
            for (let i = 0; i < length - lag; i++) {
                sum += samples[i] * samples[i + lag];
                count++;
            }
            
            correlations[lag] = count > 0 ? sum / count : 0;
        }

        // Normalizar por el valor en lag=0
        if (correlations[0] > 0) {
            for (let i = 1; i < correlations.length; i++) {
                correlations[i] /= correlations[0];
            }
            correlations[0] = 1.0;
        }

        // Encontrar el primer pico significativo
        const minPeriod = this.frequencyToSamplePeriod(this.config.maxFrequency);
        const maxPeriod = this.frequencyToSamplePeriod(this.config.minFrequency);
        
        let bestLag = 0;
        let bestValue = 0;
        
        for (let lag = Math.max(1, minPeriod); lag < Math.min(correlations.length, maxPeriod); lag++) {
            // Buscar picos locales
            if (correlations[lag] > this.config.threshold &&
                correlations[lag] > correlations[lag - 1] &&
                correlations[lag] > correlations[lag + 1] &&
                correlations[lag] > bestValue) {
                
                bestValue = correlations[lag];
                bestLag = lag;
            }
        }

        if (bestLag > 0 && bestValue > this.config.threshold) {
            // Interpolación parabólica para mayor precisión
            const betterLag = this.parabolicInterpolation(bestLag, correlations);
            const frequency = this.sampleRate / betterLag;
            
            if (this.isValidFrequency(frequency)) {
                return {
                    frequency: frequency,
                    clarity: bestValue,
                    confidence: bestValue,
                    algorithm: 'Autocorrelation',
                    isValid: true,
                    lag: betterLag
                };
            }
        }

        return { 
            isValid: false, 
            algorithm: 'Autocorrelation', 
            reason: `Best correlation: ${bestValue.toFixed(3)}` 
        };
    }

    /**
     * Interpolación parabólica para mejorar la precisión
     */
    parabolicInterpolation(peakIndex, buffer = this.yinBuffer) {
        if (peakIndex <= 0 || peakIndex >= buffer.length - 1) {
            return peakIndex;
        }

        const y1 = buffer[peakIndex - 1];
        const y2 = buffer[peakIndex];
        const y3 = buffer[peakIndex + 1];

        const a = (y1 - 2 * y2 + y3) / 2;
        const b = (y3 - y1) / 2;

        if (a !== 0) {
            const xv = -b / (2 * a);
            return peakIndex + xv;
        }

        return peakIndex;
    }

    /**
     * Procesar pitch válido con suavizado y validación
     */
    processValidPitch(pitchResult, audioData) {
        // Aplicar suavizado temporal
        const smoothedResult = this.smoothPitch(pitchResult);
        
        // Validar estabilidad
        const validatedResult = this.validatePitch(smoothedResult);
        
        // Agregar información adicional
        validatedResult.volume = audioData.volume;
        validatedResult.timestamp = audioData.timestamp || performance.now();
        validatedResult.isStable = this.stableFrames >= this.config.stabilityCount;
        
        return validatedResult;
    }

    /**
     * Suavizar lecturas de pitch
     */
    smoothPitch(pitchResult) {
        if (!pitchResult.isValid) {
            return pitchResult;
        }

        // Mantener historial limitado
        this.pitchHistory.push(pitchResult.frequency);
        this.clarityHistory.push(pitchResult.clarity);
        
        const maxHistory = 10;
        if (this.pitchHistory.length > maxHistory) {
            this.pitchHistory.shift();
            this.clarityHistory.shift();
        }

        // Suavizado exponencial
        if (this.lastPitch > 0) {
            const factor = this.config.smoothingFactor;
            pitchResult.frequency = factor * pitchResult.frequency + (1 - factor) * this.lastPitch;
        }
        
        this.lastPitch = pitchResult.frequency;

        // Calcular confianza promedio
        const avgClarity = this.clarityHistory.reduce((a, b) => a + b, 0) / this.clarityHistory.length;
        pitchResult.smoothedClarity = avgClarity;

        return pitchResult;
    }

    /**
     * Validar pitch y filtrar ruido
     */
    validatePitch(pitchResult) {
        if (!pitchResult.isValid) {
            this.stableFrames = 0;
            return pitchResult;
        }

        // Verificar si el pitch está en rango válido
        if (!this.isValidFrequency(pitchResult.frequency)) {
            pitchResult.isValid = false;
            pitchResult.reason = 'Frequency out of range';
            this.stableFrames = 0;
            return pitchResult;
        }

        // Verificar estabilidad temporal
        const isStableFrame = this.pitchHistory.length > 0 && 
            Math.abs(pitchResult.frequency - this.lastPitch) < (this.lastPitch * 0.05); // 5% tolerance

        if (isStableFrame) {
            this.stableFrames++;
        } else {
            this.stableFrames = 0;
        }

        // Verificar claridad mínima
        if (pitchResult.clarity < this.config.clarityThreshold * 0.3) {
            pitchResult.confidence *= 0.5; // Reducir confianza pero no invalidar
        }

        return pitchResult;
    }

    /**
     * Crear resultado nulo/inválido
     */
    createNullResult(reason = 'No pitch detected') {
        this.stableFrames = 0;
        return {
            frequency: 0,
            clarity: 0,
            confidence: 0,
            isValid: false,
            isStable: false,
            algorithm: 'None',
            reason: reason,
            timestamp: performance.now()
        };
    }

    /**
     * Verificar si una frecuencia está en el rango válido
     */
    isValidFrequency(frequency) {
        return frequency >= this.config.minFrequency && 
               frequency <= this.config.maxFrequency &&
               !isNaN(frequency) && 
               isFinite(frequency);
    }

    /**
     * Convertir frecuencia a período en muestras
     */
    frequencyToSamplePeriod(frequency) {
        return Math.round(this.sampleRate / frequency);
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
        console.log('⚙️ PitchDetector configuración actualizada:', newConfig);
    }

    /**
     * Resetear estado del detector
     */
    reset() {
        this.lastPitch = 0;
        this.pitchHistory = [];
        this.clarityHistory = [];
        this.stableFrames = 0;
        console.log('🔄 PitchDetector reseteado');
    }

    /**
     * Obtener estadísticas del detector
     */
    getStats() {
        return {
            lastPitch: this.lastPitch,
            historyLength: this.pitchHistory.length,
            stableFrames: this.stableFrames,
            avgClarity: this.clarityHistory.length > 0 ? 
                this.clarityHistory.reduce((a, b) => a + b, 0) / this.clarityHistory.length : 0
        };
    }
}

// Exportar para uso posterior
window.PitchDetector = PitchDetector;
