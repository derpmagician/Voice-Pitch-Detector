/**
 * Mapeo de Notas - Detector de Voz y Notas Musicales
 * Fase 3: Análisis de Frecuencia
 * 
 * Funcionalidades implementadas:
 * - Tabla completa de frecuencias musicales
 * - Mapeo frecuencia -> nota musical
 * - Cálculo de precisión en cents
 * - Soporte para múltiples octavas
 * - Detección de sostenidos y bemoles
 */

console.log('🎼 NoteMapper.js cargado - Fase 3 implementada');

// Tabla de notas base (octava 4, A4 = 440Hz)
const BASE_NOTES = {
    'C': { frequency: 261.63, name: 'Do', engName: 'C' },
    'C#': { frequency: 277.18, name: 'Do#', engName: 'C#' },
    'D': { frequency: 293.66, name: 'Re', engName: 'D' },
    'D#': { frequency: 311.13, name: 'Re#', engName: 'D#' },
    'E': { frequency: 329.63, name: 'Mi', engName: 'E' },
    'F': { frequency: 349.23, name: 'Fa', engName: 'F' },
    'F#': { frequency: 369.99, name: 'Fa#', engName: 'F#' },
    'G': { frequency: 392.00, name: 'Sol', engName: 'G' },
    'G#': { frequency: 415.30, name: 'Sol#', engName: 'G#' },
    'A': { frequency: 440.00, name: 'La', engName: 'A' },
    'A#': { frequency: 466.16, name: 'La#', engName: 'A#' },
    'B': { frequency: 493.88, name: 'Si', engName: 'B' }
};

// Notas naturales (sin sostenidos/bemoles)
const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Equivalencias de sostenidos y bemoles
const ENHARMONIC_EQUIVALENTS = {
    'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
};

class NoteMapper {
    constructor() {
        // Configuración del mapper
        this.config = {
            // Rango de octavas soportadas
            minOctave: 1,
            maxOctave: 8,
            
            // Configuración de precisión
            centsThreshold: 50,     // ±50 cents para considerar "cerca" de la nota
            exactCentsThreshold: 10, // ±10 cents para considerar "exacto"
            
            // Configuración de display
            useSpanishNames: true,   // Usar nombres en español (Do, Re, Mi...)
            showSharps: true,        // Mostrar sostenidos en lugar de bemoles
            showOctaveNumbers: true  // Mostrar números de octava
        };

        // Generar tabla completa de notas para todas las octavas
        this.noteTable = this.generateFullNoteTable();
        
        console.log('🎼 NoteMapper inicializado:', {
            notesGenerated: this.noteTable.length,
            octaveRange: `${this.config.minOctave}-${this.config.maxOctave}`,
            frequencyRange: `${this.noteTable[0].frequency.toFixed(2)}-${this.noteTable[this.noteTable.length-1].frequency.toFixed(2)} Hz`
        });
    }

    /**
     * Generar tabla completa de notas para todas las octavas
     */
    generateFullNoteTable() {
        const notes = [];
        const noteNames = Object.keys(BASE_NOTES);
        
        for (let octave = this.config.minOctave; octave <= this.config.maxOctave; octave++) {
            for (let i = 0; i < noteNames.length; i++) {
                const noteName = noteNames[i];
                const baseNote = BASE_NOTES[noteName];
                
                // Calcular frecuencia para esta octava
                // f = f0 * 2^(octave - 4)
                const frequency = baseNote.frequency * Math.pow(2, octave - 4);
                
                notes.push({
                    note: noteName,
                    octave: octave,
                    frequency: frequency,
                    name: baseNote.name,
                    engName: baseNote.engName,
                    fullName: `${baseNote.name}${octave}`,
                    engFullName: `${baseNote.engName}${octave}`,
                    isSharp: noteName.includes('#'),
                    isNatural: NATURAL_NOTES.includes(noteName),
                    midiNumber: this.calculateMidiNumber(noteName, octave)
                });
            }
        }
        
        return notes.sort((a, b) => a.frequency - b.frequency);
    }

    /**
     * Calcular número MIDI para una nota
     */
    calculateMidiNumber(noteName, octave) {
        const noteIndex = Object.keys(BASE_NOTES).indexOf(noteName);
        return (octave + 1) * 12 + noteIndex;
    }

    /**
     * Mapear frecuencia a nota musical
     */
    frequencyToNote(frequency) {
        if (!frequency || frequency <= 0 || !isFinite(frequency)) {
            return this.createNullNoteResult('Invalid frequency');
        }

        // Encontrar la nota más cercana
        const closestNote = this.findClosestNote(frequency);
        
        if (!closestNote) {
            return this.createNullNoteResult('Frequency out of range');
        }

        // Calcular desviación en cents
        const cents = this.calculateCents(frequency, closestNote.frequency);
        
        // Determinar precisión
        const precision = this.calculatePrecision(Math.abs(cents));
        
        // Crear resultado completo
        return {
            // Información de la nota
            note: closestNote.note,
            octave: closestNote.octave,
            frequency: closestNote.frequency,
            name: this.config.useSpanishNames ? closestNote.name : closestNote.engName,
            fullName: this.config.useSpanishNames ? closestNote.fullName : closestNote.engFullName,
            
            // Información de precisión
            detectedFrequency: frequency,
            cents: cents,
            centsAbs: Math.abs(cents),
            precision: precision,
            
            // Información adicional
            isSharp: closestNote.isSharp,
            isNatural: closestNote.isNatural,
            midiNumber: closestNote.midiNumber,
            
            // Estado
            isValid: true,
            timestamp: performance.now(),
            
            // Metadatos
            closestNote: closestNote,
            
            // Información de display
            displayName: this.getDisplayName(closestNote),
            colorCode: this.getNoteColor(closestNote.note),
            
            // Navegación de notas
            nextNote: this.getNextNote(closestNote),
            previousNote: this.getPreviousNote(closestNote)
        };
    }

    /**
     * Encontrar la nota más cercana a una frecuencia
     */
    findClosestNote(frequency) {
        if (frequency < this.noteTable[0].frequency || 
            frequency > this.noteTable[this.noteTable.length - 1].frequency) {
            return null;
        }

        let closest = this.noteTable[0];
        let minDifference = Math.abs(frequency - closest.frequency);

        for (let i = 1; i < this.noteTable.length; i++) {
            const difference = Math.abs(frequency - this.noteTable[i].frequency);
            if (difference < minDifference) {
                minDifference = difference;
                closest = this.noteTable[i];
            }
        }

        return closest;
    }

    /**
     * Calcular desviación en cents
     * 1 cent = 1/100 de un semitono
     * cents = 1200 * log2(f1/f2)
     */
    calculateCents(frequency1, frequency2) {
        if (frequency2 <= 0 || frequency1 <= 0) return 0;
        return 1200 * Math.log2(frequency1 / frequency2);
    }

    /**
     * Calcular nivel de precisión basado en cents
     */
    calculatePrecision(centsAbs) {
        if (centsAbs <= this.config.exactCentsThreshold) {
            return 'exact';      // Exacto: ±10 cents
        } else if (centsAbs <= this.config.centsThreshold) {
            return 'close';      // Cerca: ±50 cents
        } else if (centsAbs <= 100) {
            return 'near';       // Cerca del semitono
        } else {
            return 'far';        // Lejos
        }
    }

    /**
     * Obtener nombre de display formatado
     */
    getDisplayName(noteInfo) {
        let name = this.config.useSpanishNames ? noteInfo.name : noteInfo.engName;
        
        // Convertir sostenidos a bemoles si está configurado
        if (!this.config.showSharps && noteInfo.isSharp) {
            const equivalent = ENHARMONIC_EQUIVALENTS[noteInfo.note];
            if (equivalent) {
                name = this.config.useSpanishNames ? 
                    this.convertSharpToFlatSpanish(noteInfo.note) : equivalent;
            }
        }
        
        // Agregar octava si está configurado
        if (this.config.showOctaveNumbers) {
            name += noteInfo.octave;
        }
        
        return name;
    }

    /**
     * Convertir sostenido a bemol en español
     */
    convertSharpToFlatSpanish(sharpNote) {
        const conversions = {
            'C#': 'Reb', 'D#': 'Mib', 'F#': 'Solb', 'G#': 'Lab', 'A#': 'Sib'
        };
        return conversions[sharpNote] || sharpNote;
    }

    /**
     * Obtener color asociado a una nota (para visualización)
     */
    getNoteColor(note) {
        const colors = {
            'C': '#FF0000',   // Rojo
            'C#': '#FF4000',  // Naranja-rojo
            'D': '#FF8000',   // Naranja
            'D#': '#FFB000',  // Amarillo-naranja
            'E': '#FFFF00',   // Amarillo
            'F': '#80FF00',   // Verde-amarillo
            'F#': '#00FF00',  // Verde
            'G': '#00FF80',   // Verde-cian
            'G#': '#00FFFF',  // Cian
            'A': '#0080FF',   // Azul-cian
            'A#': '#0000FF',  // Azul
            'B': '#8000FF'    // Morado
        };
        
        return colors[note] || '#FFFFFF';
    }

    /**
     * Obtener la siguiente nota en la escala
     */
    getNextNote(currentNote) {
        const currentIndex = this.noteTable.findIndex(n => 
            n.note === currentNote.note && n.octave === currentNote.octave
        );
        
        if (currentIndex >= 0 && currentIndex < this.noteTable.length - 1) {
            return this.noteTable[currentIndex + 1];
        }
        
        return null;
    }

    /**
     * Obtener la nota anterior en la escala
     */
    getPreviousNote(currentNote) {
        const currentIndex = this.noteTable.findIndex(n => 
            n.note === currentNote.note && n.octave === currentNote.octave
        );
        
        if (currentIndex > 0) {
            return this.noteTable[currentIndex - 1];
        }
        
        return null;
    }

    /**
     * Obtener todas las notas en un rango de octavas
     */
    getNotesInRange(minOctave, maxOctave) {
        return this.noteTable.filter(note => 
            note.octave >= minOctave && note.octave <= maxOctave
        );
    }

    /**
     * Obtener solo notas naturales (sin sostenidos/bemoles)
     */
    getNaturalNotesInRange(minOctave, maxOctave) {
        return this.noteTable.filter(note => 
            note.isNatural && note.octave >= minOctave && note.octave <= maxOctave
        );
    }

    /**
     * Convertir número MIDI a frecuencia
     */
    midiToFrequency(midiNumber) {
        // A4 = 440Hz = MIDI note 69
        return 440 * Math.pow(2, (midiNumber - 69) / 12);
    }

    /**
     * Convertir frecuencia a número MIDI aproximado
     */
    frequencyToMidi(frequency) {
        // A4 = 440Hz = MIDI note 69
        return Math.round(69 + 12 * Math.log2(frequency / 440));
    }

    /**
     * Crear resultado nulo/inválido
     */
    createNullNoteResult(reason = 'No note detected') {
        return {
            note: '',
            octave: 0,
            frequency: 0,
            name: '--',
            fullName: '--',
            detectedFrequency: 0,
            cents: 0,
            centsAbs: 0,
            precision: 'none',
            isValid: false,
            reason: reason,
            timestamp: performance.now(),
            displayName: '--',
            colorCode: '#666666'
        };
    }

    /**
     * Obtener información sobre la escala musical
     */
    getScaleInfo() {
        return {
            totalNotes: this.noteTable.length,
            octaveRange: `${this.config.minOctave}-${this.config.maxOctave}`,
            frequencyRange: {
                min: this.noteTable[0].frequency,
                max: this.noteTable[this.noteTable.length - 1].frequency
            },
            naturalNotes: NATURAL_NOTES,
            enharmonicEquivalents: ENHARMONIC_EQUIVALENTS
        };
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
        const oldConfig = { ...this.config };
        this.config = { ...this.config, ...newConfig };
        
        // Regenerar tabla si cambió el rango de octavas
        if (newConfig.minOctave !== undefined || newConfig.maxOctave !== undefined) {
            this.noteTable = this.generateFullNoteTable();
            console.log('🎼 NoteTable regenerada por cambio de octavas');
        }
        
        console.log('⚙️ NoteMapper configuración actualizada:', newConfig);
    }

    /**
     * Obtener estadísticas del mapper
     */
    getStats() {
        const naturalCount = this.noteTable.filter(n => n.isNatural).length;
        const sharpCount = this.noteTable.filter(n => n.isSharp).length;
        
        return {
            totalNotes: this.noteTable.length,
            naturalNotes: naturalCount,
            sharpNotes: sharpCount,
            octaves: this.config.maxOctave - this.config.minOctave + 1,
            frequencyRange: {
                lowest: this.noteTable[0],
                highest: this.noteTable[this.noteTable.length - 1]
            }
        };
    }
}

// Exportar clase y constantes
window.NoteMapper = NoteMapper;
window.BASE_NOTES = BASE_NOTES;
window.NATURAL_NOTES = NATURAL_NOTES;
window.ENHARMONIC_EQUIVALENTS = ENHARMONIC_EQUIVALENTS;

// Para compatibilidad con el plan original
window.NOTES = {
    'C4': BASE_NOTES.C.frequency,
    'D4': BASE_NOTES.D.frequency,
    'E4': BASE_NOTES.E.frequency,
    'F4': BASE_NOTES.F.frequency,
    'G4': BASE_NOTES.G.frequency,
    'A4': BASE_NOTES.A.frequency,
    'B4': BASE_NOTES.B.frequency
};
