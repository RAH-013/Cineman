import React, { useState, useEffect } from 'react'
import { apiCreateMovie, apiUpdateMovie } from "../api/movies"
import { showToast } from "../utils/modal"

import InputField from "../layouts/InputField"

const AVAILABLE_GENRES = [
    { value: 'accion', label: 'Acción' },
    { value: 'aventura', label: 'Aventura' },
    { value: 'animada', label: 'Animada' },
    { value: 'comedia', label: 'Comedia' },
    { value: 'crimen', label: 'Crimen' },
    { value: 'drama', label: 'Drama' },
    { value: 'fantasia', label: 'Fantasía' },
    { value: 'horror', label: 'Horror' },
    { value: 'romance', label: 'Romance' },
    { value: 'sci_fi', label: 'Sci-Fi' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'misterio', label: 'Misterio' },
    { value: 'videojuego', label: 'Videojuego' },
    { value: 'terror', label: 'Terror' },
    { value: 'noir', label: 'Noir' }
]

const AVAILABLE_CLASSIFICATIONS = [
    { value: 'AA', label: 'AA (Infantil)' },
    { value: 'A', label: 'A (Todo público)' },
    { value: 'B', label: 'B (+12 años)' },
    { value: 'B15', label: 'B15 (+15 años)' },
    { value: 'C', label: 'C (Adultos)' },
    { value: 'D', label: 'D (Exclusivo Adultos)' }
]

export default function MoviesForm({ formId, initialData, onSuccess }) {
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        director: '',
        synopsis: '',
        genres: [],
        duration_minutes: '',
        classification: 'A',
        poster_url: '',
        trailer_url: '',
        is_active: true
    })

    const [releaseDate, setReleaseDate] = useState('')

    useEffect(() => {
        if (initialData) {
            let formattedDate = '';
            if (initialData.release_date) {
                const d = new Date(initialData.release_date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                formattedDate = `${year}-${month}-${day}`;
            }

            let currentGenres = [];
            if (initialData.genres) {
                currentGenres = typeof initialData.genres === 'string'
                    ? initialData.genres.split(',').map(g => g.trim())
                    : Array.isArray(initialData.genres) ? initialData.genres : [];
            }

            setFormData({
                id: initialData.id || '',
                title: initialData.title || '',
                director: initialData.director || '',
                synopsis: initialData.synopsis || '',
                genres: currentGenres,
                duration_minutes: initialData.duration_minutes || '',
                classification: initialData.classification || 'A',
                poster_url: initialData.poster_url || '',
                trailer_url: initialData.trailer_url || '',
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            })
            setReleaseDate(formattedDate)
        } else {
            setFormData({
                id: '',
                title: '',
                director: '',
                synopsis: '',
                genres: [],
                duration_minutes: '',
                classification: 'A',
                poster_url: '',
                trailer_url: '',
                is_active: true
            })
            setReleaseDate('')
        }
    }, [initialData])

    const handleGenreToggle = (genreValue) => {
        setFormData(prev => {
            const isSelected = prev.genres.includes(genreValue);
            const updatedGenres = isSelected
                ? prev.genres.filter(g => g !== genreValue)
                : [...prev.genres, genreValue];
            return { ...prev, genres: updatedGenres };
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (
            !formData.title ||
            !formData.director ||
            !formData.synopsis ||
            formData.genres.length === 0 ||
            !formData.duration_minutes ||
            !formData.classification ||
            !releaseDate
        ) {
            showToast("warning", "Por favor completa todos los campos requeridos")
            return
        }

        const payload = {
            id: formData.id || undefined,
            title: formData.title,
            director: formData.director,
            synopsis: formData.synopsis,
            genres: formData.genres.join(','),
            duration_minutes: parseInt(formData.duration_minutes, 10),
            classification: formData.classification,
            release_date: releaseDate,
            poster_url: formData.poster_url || null,
            trailer_url: formData.trailer_url || null,
            is_active: formData.is_active ? 1 : 0
        }

        try {
            const error = formData.id
                ? await apiUpdateMovie(payload)
                : await apiCreateMovie(payload)

            if (error?.success) {
                showToast("success", "Película guardada correctamente")
                if (onSuccess) onSuccess()
            } else {
                showToast("error", error?.message || "Error al guardar la película")
            }
        } catch (error) {
            console.log(error.response)
            const message = error?.response?.data?.message || error?.message || "Ocurrió un error inesperado"
            showToast("error", message)
        }
    }

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 shadow-inner">
                <div>
                    <span className="text-base font-bold text-gray-200 block">Estado de la Película</span>
                    <span className="text-sm text-gray-500">¿Estará activa en el sistema?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
            </div>

            <InputField
                name="title"
                label="Título de la Película"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <InputField
                name="director"
                label="Director"
                type="text"
                required
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            />

            <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Sinopsis</label>
                <textarea
                    required
                    rows="3"
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-white resize-none"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                    Géneros <span className="text-gray-500 text-[10px] font-normal normal-case">(Selecciona uno o varios)</span>
                </label>
                <div className="flex flex-wrap gap-2 p-4 bg-white/2 border border-white/5 rounded-xl">
                    {AVAILABLE_GENRES.map(genre => {
                        const isSelected = formData.genres.includes(genre.value);
                        return (
                            <button
                                key={genre.value}
                                type="button"
                                onClick={() => handleGenreToggle(genre.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${isSelected
                                    ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                    : 'bg-transparent border-neutral-700 text-gray-400 hover:border-neutral-500 hover:text-gray-200'
                                    }`}
                            >
                                {genre.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">
                    Clasificación <span className="text-gray-500 text-[10px] font-normal normal-case">(Selecciona una opción)</span>
                </label>
                <div className="flex flex-wrap gap-2 p-4 bg-white/2 border border-white/5 rounded-xl">
                    {AVAILABLE_CLASSIFICATIONS.map(item => {
                        const isSelected = formData.classification === item.value;
                        return (
                            <button
                                key={item.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, classification: item.value })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${isSelected
                                    ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                                    : 'bg-transparent border-neutral-700 text-gray-400 hover:border-neutral-500 hover:text-gray-200'
                                    }`}
                            >
                                {item.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            <InputField
                name="poster_url"
                label="URL del Póster (Imagen)"
                type="url"
                value={formData.poster_url}
                onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
            />

            <InputField
                name="trailer_url"
                label="Código del Tráiler"
                type="text"
                value={formData.trailer_url}
                onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
            />

            <InputField
                name="duration_minutes"
                label="Duración (Minutos)"
                type="number"
                min="1"
                required
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
            />

            <InputField
                name="release_date"
                label="Fecha de Estreno"
                type="date"
                required
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
            />
        </form>
    )
}