/**
 * Medidor Visual - Detector de Voz y Notas Musicales
 * Fase 4: Visualización
 * 
 * Componentes implementados:
 * - Gauge estilo velocímetro circular
 * - Indicador de intensidad vocal
 * - Zona de precisión para cada nota
 * - Animaciones fluidas con Canvas
 * - Sistema de colores dinámico
 */

console.log('📊 VisualMeter.js cargado - Fase 4 implementada');

class VisualMeter {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración del medidor
        this.config = {
            // Dimensiones y posición
            width: this.canvas.width || 400,
            height: this.canvas.height || 400,
            centerX: 0, // Se calculará automáticamente
            centerY: 0, // Se calculará automáticamente
            
            // Parámetros del gauge
            outerRadius: 150,
            innerRadius: 80,
            needleLength: 120,
            needleWidth: 4,
            
            // Rango de frecuencias (Hz)
            minFrequency: 80,
            maxFrequency: 800,
            
            // Ángulos (en radianes)
            startAngle: Math.PI * 0.75,  // 135 grados
            endAngle: Math.PI * 0.25,    // 45 grados
            
            // Colores
            backgroundColor: '#1a1a1a',
            borderColor: '#404040',
            needleColor: '#FF6B6B',
            centerColor: '#2196F3',
            
            // Zonas de precisión
            exactZoneColor: '#4CAF50',
            closeZoneColor: '#FF9800',
            farZoneColor: '#F44336',
            
            // Animación
            animationSpeed: 0.15,  // Factor de suavizado (0-1)
            glowEffect: true,
            
            // Texto
            showFrequency: true,
            showNote: true,
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            textColor: '#ffffff',
            
            ...options
        };
        
        // Estado del medidor
        this.currentFrequency = 0;
        this.targetFrequency = 0;
        this.currentNote = null;
        this.currentPrecision = 'none';
        this.volume = 0;
        this.isActive = false;
        this.lastUpdateTime = 0;
        
        // Animación
        this.animationFrameId = null;
        this.needleAngle = this.config.startAngle;
        this.targetNeedleAngle = this.config.startAngle;
        
        // Calcular centro
        this.config.centerX = this.config.width / 2;
        this.config.centerY = this.config.height / 2;
        
        // Notas de referencia para el medidor
        this.referenceNotes = this.generateReferenceNotes();
        
        this.init();
        
        console.log('📊 VisualMeter inicializado:', {
            canvas: canvasId,
            dimensions: `${this.config.width}x${this.config.height}`,
            frequencyRange: `${this.config.minFrequency}-${this.config.maxFrequency} Hz`,
            referenceNotes: this.referenceNotes.length
        });
    }

    /**
     * Inicializar el medidor
     */
    init() {
        this.setupCanvas();
        this.draw();
        this.startAnimation();
    }

    /**
     * Configurar canvas
     */
    setupCanvas() {
        // Configurar canvas para alta resolución
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.config.width = this.canvas.width;
        this.config.height = this.canvas.height;
        this.config.centerX = this.config.width / 2;
        this.config.centerY = this.config.height / 2;
        
        this.ctx.scale(dpr, dpr);
        
        // Configurar estilos de dibujo
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    /**
     * Generar notas de referencia para el medidor
     */
    generateReferenceNotes() {
        const notes = [];
        
        // Generar notas en el rango de frecuencias del medidor
        const baseFreqs = [
            { note: 'C', freq: 130.81, octave: 3 },
            { note: 'D', freq: 146.83, octave: 3 },
            { note: 'E', freq: 164.81, octave: 3 },
            { note: 'F', freq: 174.61, octave: 3 },
            { note: 'G', freq: 196.00, octave: 3 },
            { note: 'A', freq: 220.00, octave: 3 },
            { note: 'B', freq: 246.94, octave: 3 },
            { note: 'C', freq: 261.63, octave: 4 },
            { note: 'D', freq: 293.66, octave: 4 },
            { note: 'E', freq: 329.63, octave: 4 },
            { note: 'F', freq: 349.23, octave: 4 },
            { note: 'G', freq: 392.00, octave: 4 },
            { note: 'A', freq: 440.00, octave: 4 },
            { note: 'B', freq: 493.88, octave: 4 },
            { note: 'C', freq: 523.25, octave: 5 },
            { note: 'D', freq: 587.33, octave: 5 },
            { note: 'E', freq: 659.25, octave: 5 },
            { note: 'F', freq: 698.46, octave: 5 }
        ];
        
        return baseFreqs.filter(note => 
            note.freq >= this.config.minFrequency && 
            note.freq <= this.config.maxFrequency
        );
    }

    /**
     * Actualizar el medidor con nuevos datos
     */
    update(pitchData, noteData = null, volume = 0) {
        if (pitchData && pitchData.isValid) {
            this.targetFrequency = pitchData.frequency;
            this.currentNote = noteData;
            this.currentPrecision = noteData ? noteData.precision : 'none';
            this.volume = Math.min(1, Math.max(0, volume));
            this.isActive = true;
        } else {
            this.isActive = false;
            this.currentNote = null;
            this.currentPrecision = 'none';
        }
        
        // Calcular ángulo objetivo de la aguja
        this.targetNeedleAngle = this.frequencyToAngle(this.targetFrequency);
    }

    /**
     * Convertir frecuencia a ángulo en el medidor
     */
    frequencyToAngle(frequency) {
        if (frequency < this.config.minFrequency || frequency > this.config.maxFrequency) {
            return this.config.startAngle;
        }
        
        const range = this.config.maxFrequency - this.config.minFrequency;
        const normalizedFreq = (frequency - this.config.minFrequency) / range;
        
        const angleRange = this.config.endAngle - this.config.startAngle;
        if (angleRange < 0) {
            // Manejar el caso donde el ángulo cruza 0 (ej: de 270° a 90°)
            return this.config.startAngle + normalizedFreq * (angleRange + 2 * Math.PI);
        }
        
        return this.config.startAngle + normalizedFreq * angleRange;
    }

    /**
     * Iniciar bucle de animación
     */
    startAnimation() {
        const animate = (currentTime) => {
            // Throttling: actualizar cada 16ms (~60 FPS)
            if (currentTime - this.lastUpdateTime >= 16) {
                this.animateNeedle();
                this.draw();
                this.lastUpdateTime = currentTime;
            }
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        
        this.animationFrameId = requestAnimationFrame(animate);
    }

    /**
     * Animar la aguja con suavizado
     */
    animateNeedle() {
        // Suavizado exponencial para movimiento fluido
        const diff = this.targetNeedleAngle - this.needleAngle;
        
        // Manejar la diferencia de ángulos que cruzan 0
        let adjustedDiff = diff;
        if (Math.abs(diff) > Math.PI) {
            adjustedDiff = diff > 0 ? diff - 2 * Math.PI : diff + 2 * Math.PI;
        }
        
        this.needleAngle += adjustedDiff * this.config.animationSpeed;
        
        // Normalizar ángulo
        if (this.needleAngle > 2 * Math.PI) {
            this.needleAngle -= 2 * Math.PI;
        } else if (this.needleAngle < 0) {
            this.needleAngle += 2 * Math.PI;
        }
        
        // Actualizar frecuencia mostrada con suavizado
        const freqDiff = this.targetFrequency - this.currentFrequency;
        this.currentFrequency += freqDiff * this.config.animationSpeed;
    }

    /**
     * Dibujar el medidor completo
     */
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);
        
        // Dibujar componentes en orden
        this.drawBackground();
        this.drawScale();
        this.drawReferenceNotes();
        this.drawPrecisionZones();
        this.drawNeedle();
        this.drawCenter();
        this.drawLabels();
    }

    /**
     * Dibujar fondo del medidor
     */
    drawBackground() {
        const { ctx, config } = this;
        
        // Fondo circular principal
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, config.outerRadius + 10, 0, 2 * Math.PI);
        ctx.fillStyle = config.backgroundColor;
        ctx.fill();
        
        // Borde exterior
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, config.outerRadius + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = config.borderColor;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Área del medidor
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, config.outerRadius, config.startAngle, config.endAngle);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 8;
        ctx.stroke();
    }

    /**
     * Dibujar escala de frecuencias
     */
    drawScale() {
        const { ctx, config } = this;
        const numTicks = 20;
        
        for (let i = 0; i <= numTicks; i++) {
            const angle = config.startAngle + (i / numTicks) * (config.endAngle - config.startAngle);
            const frequency = config.minFrequency + (i / numTicks) * (config.maxFrequency - config.minFrequency);
            
            // Líneas de escala
            const isMainTick = i % 5 === 0;
            const tickLength = isMainTick ? 15 : 8;
            const tickWidth = isMainTick ? 2 : 1;
            
            const innerRadius = config.outerRadius - tickLength;
            const outerRadius = config.outerRadius;
            
            const x1 = config.centerX + Math.cos(angle) * innerRadius;
            const y1 = config.centerY + Math.sin(angle) * innerRadius;
            const x2 = config.centerX + Math.cos(angle) * outerRadius;
            const y2 = config.centerY + Math.sin(angle) * outerRadius;
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = isMainTick ? '#666666' : '#444444';
            ctx.lineWidth = tickWidth;
            ctx.stroke();
            
            // Etiquetas de frecuencia
            if (isMainTick) {
                const labelRadius = config.outerRadius - 25;
                const labelX = config.centerX + Math.cos(angle) * labelRadius;
                const labelY = config.centerY + Math.sin(angle) * labelRadius;
                
                ctx.fillStyle = config.textColor;
                ctx.font = `${config.fontSize - 2}px ${config.fontFamily}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(Math.round(frequency).toString(), labelX, labelY);
            }
        }
    }

    /**
     * Dibujar notas de referencia
     */
    drawReferenceNotes() {
        const { ctx, config } = this;
        
        this.referenceNotes.forEach(noteInfo => {
            const angle = this.frequencyToAngle(noteInfo.freq);
            const radius = config.outerRadius - 40;
            
            const x = config.centerX + Math.cos(angle) * radius;
            const y = config.centerY + Math.sin(angle) * radius;
            
            // Círculo de la nota
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = this.getNoteColor(noteInfo.note);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Nombre de la nota
            ctx.fillStyle = config.textColor;
            ctx.font = `${config.fontSize - 4}px ${config.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(noteInfo.note, x, y - 15);
        });
    }

    /**
     * Dibujar zonas de precisión
     */
    drawPrecisionZones() {
        if (!this.currentNote || !this.isActive) return;
        
        const { ctx, config } = this;
        const noteFreq = this.currentNote.frequency;
        const noteAngle = this.frequencyToAngle(noteFreq);
        
        // Zona exacta (±10 cents)
        const exactRange = noteFreq * 0.006; // ~10 cents
        const exactStartAngle = this.frequencyToAngle(noteFreq - exactRange);
        const exactEndAngle = this.frequencyToAngle(noteFreq + exactRange);
        
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, config.outerRadius, exactStartAngle, exactEndAngle);
        ctx.strokeStyle = config.exactZoneColor;
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // Zona cercana (±50 cents)
        const closeRange = noteFreq * 0.029; // ~50 cents
        const closeStartAngle = this.frequencyToAngle(noteFreq - closeRange);
        const closeEndAngle = this.frequencyToAngle(noteFreq + closeRange);
        
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, config.outerRadius, closeStartAngle, closeEndAngle);
        ctx.strokeStyle = config.closeZoneColor;
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    /**
     * Dibujar la aguja del medidor
     */
    drawNeedle() {
        const { ctx, config } = this;
        
        ctx.save();
        ctx.translate(config.centerX, config.centerY);
        ctx.rotate(this.needleAngle);
        
        // Sombra de la aguja
        if (config.glowEffect && this.isActive) {
            ctx.shadowColor = config.needleColor;
            ctx.shadowBlur = 10;
        }
        
        // Cuerpo de la aguja
        ctx.beginPath();
        ctx.moveTo(0, -config.needleWidth / 2);
        ctx.lineTo(config.needleLength, 0);
        ctx.lineTo(0, config.needleWidth / 2);
        ctx.closePath();
        
        // Color según estado
        let needleColor = config.needleColor;
        if (this.isActive && this.currentNote) {
            switch (this.currentPrecision) {
                case 'exact':
                    needleColor = config.exactZoneColor;
                    break;
                case 'close':
                    needleColor = config.closeZoneColor;
                    break;
                case 'far':
                    needleColor = config.farZoneColor;
                    break;
            }
        }
        
        ctx.fillStyle = needleColor;
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * Dibujar centro del medidor
     */
    drawCenter() {
        const { ctx, config } = this;
        
        // Círculo central grande
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, 12, 0, 2 * Math.PI);
        ctx.fillStyle = config.centerColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Punto central
        ctx.beginPath();
        ctx.arc(config.centerX, config.centerY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }

    /**
     * Dibujar etiquetas de información
     */
    drawLabels() {
        const { ctx, config } = this;
        
        // Título del medidor
        ctx.fillStyle = config.textColor;
        ctx.font = `${config.fontSize + 2}px ${config.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Tono', config.centerX, config.centerY - config.outerRadius - 30);
        
        // Información de frecuencia
        if (config.showFrequency && this.isActive) {
            ctx.font = `${config.fontSize + 4}px ${config.fontFamily}`;
            ctx.fillText(
                `${Math.round(this.currentFrequency)} Hz`,
                config.centerX,
                config.centerY + config.innerRadius + 20
            );
        }
        
        // Información de nota
        if (config.showNote && this.currentNote && this.isActive) {
            ctx.font = `${config.fontSize + 6}px ${config.fontFamily}`;
            ctx.fillStyle = this.getNoteColor(this.currentNote.note);
            ctx.fillText(
                this.currentNote.displayName || this.currentNote.name,
                config.centerX,
                config.centerY + config.innerRadius + 45
            );
            
            // Información de cents
            if (Math.abs(this.currentNote.cents) > 5) {
                const centsText = `${this.currentNote.cents > 0 ? '+' : ''}${Math.round(this.currentNote.cents)}¢`;
                ctx.font = `${config.fontSize}px ${config.fontFamily}`;
                ctx.fillStyle = config.textColor;
                ctx.fillText(centsText, config.centerX, config.centerY + config.innerRadius + 65);
            }
        }
    }

    /**
     * Obtener color para una nota
     */
    getNoteColor(note) {
        const colors = {
            'C': '#FF6B6B',   // Rojo
            'C#': '#FF8E53',  // Naranja-rojo
            'D': '#FF9800',   // Naranja
            'D#': '#FFB74D',  // Amarillo-naranja
            'E': '#FFEB3B',   // Amarillo
            'F': '#AED581',   // Verde-amarillo
            'F#': '#66BB6A',  // Verde
            'G': '#4DB6AC',   // Verde-cian
            'G#': '#4FC3F7',  // Cian
            'A': '#42A5F5',   // Azul
            'A#': '#7986CB',  // Azul-morado
            'B': '#AB47BC'    // Morado
        };
        
        return colors[note] || '#FFFFFF';
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
        
        // Recalcular notas de referencia si cambió el rango
        if (newConfig.minFrequency || newConfig.maxFrequency) {
            this.referenceNotes = this.generateReferenceNotes();
        }
        
        console.log('⚙️ VisualMeter configuración actualizada:', newConfig);
    }

    /**
     * Detener animación
     */
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.isActive = false;
    }

    /**
     * Reiniciar medidor
     */
    reset() {
        this.currentFrequency = 0;
        this.targetFrequency = 0;
        this.currentNote = null;
        this.currentPrecision = 'none';
        this.volume = 0;
        this.isActive = false;
        this.needleAngle = this.config.startAngle;
        this.targetNeedleAngle = this.config.startAngle;
        
        this.draw();
    }

    /**
     * Redimensionar canvas
     */
    resize() {
        this.setupCanvas();
        this.draw();
    }
}

// Exportar para uso posterior
window.VisualMeter = VisualMeter;
