import React, { useState, useEffect } from 'react'
import { apiCreateShowtime, apiUpdateShowtime } from "../api/showtimes"
import { showToast } from "../utils/modal"

import InputField from "../layouts/InputField"

export default function ShowtimesForm({ formId, initialData, movies, onSuccess }) {
    const [formData, setFormData] = useState({
        id: '',
        movie_id: '',
        room: '',
        date: '',
        time: '',
        language: 'ESP',
        format: '2D',
        price: '',
        available_seats: 50,
        is_active: true
    })

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`

    const isToday = formData.date === todayStr

    useEffect(() => {
        if (initialData) {
            let initialDate = '';
            let initialTime = '';

            if (initialData.start_time) {
                const d = new Date(initialData.start_time);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');

                initialDate = `${year}-${month}-${day}`;
                initialTime = `${hours}:${minutes}`;
            }

            setFormData({
                id: initialData.id || '',
                movie_id: initialData.movie_id || '',
                room: initialData.room || '',
                date: initialDate,
                time: initialTime,
                language: initialData.language || 'ESP',
                format: initialData.format || '2D',
                price: initialData.price || '',
                available_seats: initialData.available_seats || 50,
                is_active: initialData.is_active !== undefined ? initialData.is_active : true
            })
        } else {
            setFormData({
                id: '',
                movie_id: '',
                room: '',
                date: '',
                time: '',
                language: 'ESP',
                format: '2D',
                price: '',
                available_seats: 50,
                is_active: true
            })
        }
    }, [initialData])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.movie_id || !formData.room || !formData.date || !formData.time || formData.price === '') {
            showToast("warning", "Por favor completa todos los campos requeridos")
            return
        }

        const { available_seats, date, time, ...restFormData } = formData

        const payload = {
            ...restFormData,
            start_time: `${date}T${time}`,
            room: parseInt(restFormData.room, 10),
            price: parseFloat(restFormData.price),
            is_active: Boolean(restFormData.is_active)
        }

        try {
            const error = payload.id
                ? await apiUpdateShowtime(payload.id, payload)
                : await apiCreateShowtime(payload)

            if (error?.success) {
                showToast("success", "Función guardada correctamente")
                if (onSuccess) onSuccess()
            } else {
                showToast("error", error?.message || "Error al guardar la función")
            }
        } catch (error) {
            console.log(error.response)
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Ocurrió un error inesperado"
            showToast("error", message)
        }
    }

    return (
        <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 shadow-inner">
                <div>
                    <span className="text-base font-bold text-gray-200 block">Estado de la Función</span>
                    <span className="text-sm text-gray-500">¿Estará disponible para su compra?</span>
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

            <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Película</label>
                <select
                    required
                    value={formData.movie_id}
                    onChange={(e) => setFormData({ ...formData, movie_id: e.target.value })}
                    className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-white"
                >
                    <option value="" className="bg-[#0f0f15]">Seleccionar película...</option>
                    {movies.map(m => <option key={m.id} value={m.id} className="bg-[#0f0f15]">{m.title}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">N° de Sala</label>
                    <select
                        required
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-white"
                    >
                        <option value="" className="bg-[#0f0f15]">Seleccionar sala...</option>
                        <option value="1" className="bg-[#0f0f15]">Sala 1</option>
                        <option value="2" className="bg-[#0f0f15]">Sala 2</option>
                        <option value="3" className="bg-[#0f0f15]">Sala 3</option>
                        <option value="4" className="bg-[#0f0f15]">Sala 4</option>
                        <option value="5" className="bg-[#0f0f15]">Sala 5</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Asientos Libres</label>
                    <div className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-base flex items-center gap-3 cursor-not-allowed opacity-80">
                        <div className={`w-2 h-2 rounded-full ${formData.available_seats <= 10
                            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                            : formData.available_seats <= 25
                                ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]'
                                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                            }`}></div>
                        <span className="font-bold text-white">{formData.available_seats}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            {formData.available_seats === 1 ? 'Disponible' : 'Disponibles'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Idioma</label>
                    <select
                        required
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-white"
                    >
                        <option value="ESP" className="bg-[#0f0f15]">Español (DOB)</option>
                        <option value="SUB" className="bg-[#0f0f15]">Subtitulada (SUB)</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black uppercase tracking-widest text-neutral-400 ml-1">Formato</label>
                    <select
                        required
                        value={formData.format}
                        onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                        className="w-full bg-transparent border border-neutral-600 rounded-lg px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-white"
                    >
                        <option value="2D" className="bg-[#0f0f15]">Tradicional</option>
                        <option value="3D" className="bg-[#0f0f15]">3D Digital</option>
                        <option value="IMAX" className="bg-[#0f0f15]">IMAX</option>
                        <option value="4DX" className="bg-[#0f0f15]">4DX</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <InputField
                    name="date"
                    label="Fecha de Función"
                    type="date"
                    required
                    value={formData.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
                <InputField
                    name="time"
                    label="Hora de Función"
                    type="time"
                    required
                    value={formData.time}
                    min={isToday ? currentTime : undefined}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
            </div>

            <div className="flex flex-col">
                <InputField
                    name="price"
                    label="Precio ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
            </div>
        </form>
    )
}