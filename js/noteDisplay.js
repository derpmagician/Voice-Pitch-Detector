/**
 * Panel de Notas - Detector de Voz y Notas Musicales
 * Fase 4: Visualización
 * 
 * Componentes implementados:
 * - Panel interactivo de notas musicales
 * - Iluminación de notas detectadas
 * - Indicador de precisión visual
 * - Animaciones de activación/desactivación
 * - Sistema de colores por nota
 */

console.log('🎵 NoteDisplay.js cargado - Fase 4 implementada');

class NoteDisplay {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container element with id '${containerId}' not found`);
        }
        
        // Configuración
        this.config = {
            showFrequencies: true,
            showOctaves: true,
            showCents: true,
            animationDuration: 300, // ms
            pulseEffect: true,
            glowEffect: true,
            octaveRange: [2, 6], // Octavas a mostrar
            noteNames: {
                'C': 'Do',
                'C#': 'Do#',
                'D': 'Re',
                'D#': 'Re#',
                'E': 'Mi',
                'F': 'Fa',
                'F#': 'Fa#',
                'G': 'Sol',
                'G#': 'Sol#',
                'A': 'La',
                'A#': 'La#',
                'B': 'Si'
            },
            noteColors: {
                'C': '#FF6B6B',
                'C#': '#FF8E53',
                'D': '#FF9800',
                'D#': '#FFB74D',
                'E': '#FFEB3B',
                'F': '#AED581',
                'F#': '#66BB6A',
                'G': '#4DB6AC',
                'G#': '#4FC3F7',
                'A': '#42A5F5',
                'A#': '#7986CB',
                'B': '#AB47BC'
            },
            precisionColors: {
                'exact': '#4CAF50',
                'close': '#FF9800',
                'far': '#F44336',
                'none': '#666666'
            },
            ...options
        };
        
        // Estado actual
        this.currentNote = null;
        this.currentPrecision = 'none';
        this.isActive = false;
        this.noteElements = new Map();
        
        // Temporizadores
        this.animationTimeouts = new Map();
        
        this.init();
        
        console.log('🎵 NoteDisplay inicializado:', {
            container: containerId,
            octaveRange: this.config.octaveRange,
            notesCount: this.noteElements.size
        });
    }

    /**
     * Inicializar el panel de notas
     */
    init() {
        this.createNotesGrid();
        this.setupEventListeners();
    }

    /**
     * Crear la grilla de notas
     */
    createNotesGrid() {
        // Limpiar contenido existente
        this.container.innerHTML = '';
        
        // Crear estructura HTML
        const notesGrid = document.createElement('div');
        notesGrid.className = 'notes-grid';
        
        // Generar todas las notas en el rango especificado
        const allNotes = this.generateAllNotes();
        
        allNotes.forEach(noteInfo => {
            const noteElement = this.createNoteElement(noteInfo);
            notesGrid.appendChild(noteElement);
            this.noteElements.set(noteInfo.id, {
                element: noteElement,
                info: noteInfo,
                isActive: false
            });
        });
        
        this.container.appendChild(notesGrid);
        
        // Aplicar estilos CSS dinámicamente si no están definidos
        this.injectStyles();
    }

    /**
     * Generar todas las notas en el rango especificado
     */
    generateAllNotes() {
        const notes = [];
        const noteSequence = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        for (let octave = this.config.octaveRange[0]; octave <= this.config.octaveRange[1]; octave++) {
            noteSequence.forEach(note => {
                const frequency = this.calculateNoteFrequency(note, octave);
                const noteInfo = {
                    id: `${note}_${octave}`,
                    note: note,
                    octave: octave,
                    frequency: frequency,
                    displayName: this.config.noteNames[note],
                    color: this.config.noteColors[note]
                };
                notes.push(noteInfo);
            });
        }
        
        return notes;
    }

    /**
     * Calcular frecuencia de una nota
     */
    calculateNoteFrequency(note, octave) {
        const noteOffsets = {
            'C': -9, 'C#': -8, 'D': -7, 'D#': -6,
            'E': -5, 'F': -4, 'F#': -3, 'G': -2,
            'G#': -1, 'A': 0, 'A#': 1, 'B': 2
        };
        
        const A4_FREQ = 440;
        const semitones = noteOffsets[note] + (octave - 4) * 12;
        return A4_FREQ * Math.pow(2, semitones / 12);
    }

    /**
     * Crear elemento HTML para una nota
     */
    createNoteElement(noteInfo) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.setAttribute('data-note', noteInfo.note);
        noteElement.setAttribute('data-octave', noteInfo.octave);
        noteElement.setAttribute('data-frequency', noteInfo.frequency.toFixed(2));
        
        // Estructura interna
        noteElement.innerHTML = `
            <div class="note-content">
                <div class="note-button" style="border-color: ${noteInfo.color}">
                    <span class="note-name">${noteInfo.displayName}</span>
                    <span class="note-octave">${noteInfo.octave}</span>
                </div>
                ${this.config.showFrequencies ? `
                    <div class="note-frequency">${noteInfo.frequency.toFixed(2)} Hz</div>
                ` : ''}
                <div class="precision-indicator">
                    <div class="precision-bar">
                        <div class="precision-fill"></div>
                    </div>
                    <div class="precision-text">--</div>
                </div>
            </div>
            <div class="note-glow" style="background-color: ${noteInfo.color}"></div>
        `;
        
        return noteElement;
    }

    /**
     * Configurar listeners de eventos
     */
    setupEventListeners() {
        // Click en notas para reproducir tono (funcionalidad futura)
        this.noteElements.forEach((noteData, noteId) => {
            noteData.element.addEventListener('click', () => {
                this.playNote(noteData.info);
            });
            
            noteData.element.addEventListener('mouseenter', () => {
                this.highlightNote(noteId, 'hover');
            });
            
            noteData.element.addEventListener('mouseleave', () => {
                if (!noteData.isActive) {
                    this.unhighlightNote(noteId);
                }
            });
        });
    }

    /**
     * Actualizar el display con nueva nota detectada
     */
    update(noteData, precisionData = null) {
        // Limpiar estado anterior
        this.clearActiveNotes();
        
        if (noteData && noteData.note) {
            this.currentNote = noteData;
            this.currentPrecision = precisionData ? precisionData.precision : 'none';
            this.isActive = true;
            
            // Encontrar la nota más cercana en nuestro rango
            const matchingNoteId = this.findMatchingNote(noteData);
            
            if (matchingNoteId) {
                this.activateNote(matchingNoteId, noteData, precisionData);
            }
        } else {
            this.currentNote = null;
            this.currentPrecision = 'none';
            this.isActive = false;
        }
    }

    /**
     * Encontrar la nota que mejor coincide con la detectada
     */
    findMatchingNote(noteData) {
        const baseName = noteData.note.replace(/[0-9]/g, ''); // Remover números de octava
        let bestMatch = null;
        let minFreqDiff = Infinity;
        
        this.noteElements.forEach((noteElement, noteId) => {
            if (noteElement.info.note === baseName) {
                const freqDiff = Math.abs(noteElement.info.frequency - noteData.frequency);
                if (freqDiff < minFreqDiff) {
                    minFreqDiff = freqDiff;
                    bestMatch = noteId;
                }
            }
        });
        
        return bestMatch;
    }

    /**
     * Activar visualización de una nota
     */
    activateNote(noteId, noteData, precisionData) {
        const noteElement = this.noteElements.get(noteId);
        if (!noteElement) return;
        
        noteElement.isActive = true;
        const element = noteElement.element;
        const info = noteElement.info;
        
        // Aplicar clases CSS
        element.classList.add('active');
        element.classList.add(`precision-${this.currentPrecision}`);
        
        // Actualizar indicador de precisión
        if (precisionData) {
            const precisionBar = element.querySelector('.precision-fill');
            const precisionText = element.querySelector('.precision-text');
            
            if (precisionBar && precisionText) {
                const precision = this.calculatePrecisionPercentage(precisionData);
                const precisionColor = this.config.precisionColors[this.currentPrecision];
                
                precisionBar.style.width = `${precision}%`;
                precisionBar.style.backgroundColor = precisionColor;
                
                if (Math.abs(precisionData.cents) > 5) {
                    precisionText.textContent = `${precisionData.cents > 0 ? '+' : ''}${Math.round(precisionData.cents)}¢`;
                } else {
                    precisionText.textContent = '♪';
                }
            }
        }
        
        // Aplicar efecto de brillo
        if (this.config.glowEffect) {
            const glow = element.querySelector('.note-glow');
            if (glow) {
                glow.style.opacity = '0.3';
                glow.style.transform = 'scale(1.2)';
            }
        }
        
        // Aplicar efecto de pulso
        if (this.config.pulseEffect) {
            this.startPulseAnimation(element);
        }
        
        console.log('🎵 Nota activada:', {
            note: info.note + info.octave,
            frequency: info.frequency.toFixed(2) + ' Hz',
            precision: this.currentPrecision,
            cents: precisionData ? Math.round(precisionData.cents) : 0
        });
    }

    /**
     * Calcular porcentaje de precisión para la barra visual
     */
    calculatePrecisionPercentage(precisionData) {
        if (!precisionData || !precisionData.cents) return 0;
        
        const centsDiff = Math.abs(precisionData.cents);
        
        if (centsDiff <= 10) {
            return 100 - (centsDiff / 10) * 20; // 100% a 80%
        } else if (centsDiff <= 50) {
            return 80 - ((centsDiff - 10) / 40) * 60; // 80% a 20%
        } else {
            return Math.max(0, 20 - ((centsDiff - 50) / 50) * 20); // 20% a 0%
        }
    }

    /**
     * Iniciar animación de pulso
     */
    startPulseAnimation(element) {
        const noteButton = element.querySelector('.note-button');
        if (!noteButton) return;
        
        let pulseCount = 0;
        const maxPulses = 3;
        
        const pulse = () => {
            if (pulseCount >= maxPulses || !element.classList.contains('active')) {
                return;
            }
            
            noteButton.style.transform = 'scale(1.1)';
            noteButton.style.transition = 'transform 0.1s ease-out';
            
            setTimeout(() => {
                noteButton.style.transform = 'scale(1)';
                pulseCount++;
                
                if (pulseCount < maxPulses) {
                    setTimeout(pulse, 200);
                }
            }, 100);
        };
        
        pulse();
    }

    /**
     * Limpiar todas las notas activas
     */
    clearActiveNotes() {
        this.noteElements.forEach((noteElement, noteId) => {
            if (noteElement.isActive) {
                this.deactivateNote(noteId);
            }
        });
    }

    /**
     * Desactivar visualización de una nota
     */
    deactivateNote(noteId) {
        const noteElement = this.noteElements.get(noteId);
        if (!noteElement) return;
        
        noteElement.isActive = false;
        const element = noteElement.element;
        
        // Remover clases CSS
        element.classList.remove('active');
        element.classList.remove('precision-exact', 'precision-close', 'precision-far');
        
        // Resetear indicador de precisión
        const precisionBar = element.querySelector('.precision-fill');
        const precisionText = element.querySelector('.precision-text');
        
        if (precisionBar) {
            precisionBar.style.width = '0%';
        }
        
        if (precisionText) {
            precisionText.textContent = '--';
        }
        
        // Remover efecto de brillo
        const glow = element.querySelector('.note-glow');
        if (glow) {
            glow.style.opacity = '0';
            glow.style.transform = 'scale(1)';
        }
    }

    /**
     * Resaltar nota (hover)
     */
    highlightNote(noteId, type = 'hover') {
        const noteElement = this.noteElements.get(noteId);
        if (!noteElement || noteElement.isActive) return;
        
        const element = noteElement.element;
        element.classList.add(`highlight-${type}`);
    }

    /**
     * Quitar resaltado de nota
     */
    unhighlightNote(noteId) {
        const noteElement = this.noteElements.get(noteId);
        if (!noteElement) return;
        
        const element = noteElement.element;
        element.classList.remove('highlight-hover');
    }

    /**
     * Reproducir nota (funcionalidad futura)
     */
    playNote(noteInfo) {
        console.log('🔊 Reproducir nota:', noteInfo.note + noteInfo.octave, noteInfo.frequency.toFixed(2) + ' Hz');
        // TODO: Implementar síntesis de audio para reproducir la nota
    }

    /**
     * Inyectar estilos CSS si no están definidos
     */
    injectStyles() {
        const styleId = 'note-display-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .notes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 10px;
                padding: 20px;
                max-height: 400px;
                overflow-y: auto;
            }
            
            .note-item {
                position: relative;
                background: #2a2a2a;
                border-radius: 10px;
                padding: 10px;
                transition: all 0.3s ease;
                cursor: pointer;
                overflow: hidden;
            }
            
            .note-item:hover {
                background: #3a3a3a;
                transform: translateY(-2px);
            }
            
            .note-item.active {
                background: #1a1a1a;
                border: 2px solid #4CAF50;
                box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
            }
            
            .note-item.precision-exact {
                border-color: #4CAF50;
                box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
            }
            
            .note-item.precision-close {
                border-color: #FF9800;
                box-shadow: 0 0 20px rgba(255, 152, 0, 0.5);
            }
            
            .note-item.precision-far {
                border-color: #F44336;
                box-shadow: 0 0 20px rgba(244, 67, 54, 0.5);
            }
            
            .note-content {
                position: relative;
                z-index: 2;
                text-align: center;
            }
            
            .note-button {
                width: 50px;
                height: 50px;
                border: 2px solid #666;
                border-radius: 50%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin: 0 auto 8px;
                background: rgba(255, 255, 255, 0.05);
                transition: all 0.2s ease;
            }
            
            .note-name {
                font-size: 14px;
                font-weight: bold;
                color: #fff;
                line-height: 1;
            }
            
            .note-octave {
                font-size: 10px;
                color: #ccc;
                line-height: 1;
            }
            
            .note-frequency {
                font-size: 10px;
                color: #999;
                margin-bottom: 5px;
            }
            
            .precision-indicator {
                margin-top: 5px;
            }
            
            .precision-bar {
                width: 100%;
                height: 4px;
                background: #333;
                border-radius: 2px;
                overflow: hidden;
                margin-bottom: 2px;
            }
            
            .precision-fill {
                height: 100%;
                background: #666;
                transition: all 0.3s ease;
                border-radius: 2px;
            }
            
            .precision-text {
                font-size: 9px;
                color: #ccc;
                text-align: center;
            }
            
            .note-glow {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 10px;
                opacity: 0;
                transition: all 0.3s ease;
                z-index: 1;
                filter: blur(10px);
            }
            
            .highlight-hover .note-button {
                transform: scale(1.05);
                border-color: #888;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Actualizar configuración
     */
    updateConfig(newConfig) {
        const oldRange = [...this.config.octaveRange];
        this.config = { ...this.config, ...newConfig };
        
        // Regenerar notas si cambió el rango
        if (newConfig.octaveRange && 
            (newConfig.octaveRange[0] !== oldRange[0] || newConfig.octaveRange[1] !== oldRange[1])) {
            this.createNotesGrid();
        }
        
        console.log('⚙️ NoteDisplay configuración actualizada:', newConfig);
    }

    /**
     * Resetear panel
     */
    reset() {
        this.clearActiveNotes();
        this.currentNote = null;
        this.currentPrecision = 'none';
        this.isActive = false;
    }

    /**
     * Obtener estadísticas actuales
     */
    getStats() {
        const activeNotes = Array.from(this.noteElements.values()).filter(n => n.isActive);
        
        return {
            totalNotes: this.noteElements.size,
            activeNotes: activeNotes.length,
            currentNote: this.currentNote,
            currentPrecision: this.currentPrecision,
            octaveRange: this.config.octaveRange
        };
    }
}

// Exportar para uso posterior
window.NoteDisplay = NoteDisplay;
