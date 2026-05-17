import React from 'react'

export default function AdminTable({ columns, data }) {
    return (
        <div className="flex-1 overflow-auto custom-scrollbar bg-white/2 border border-white/5 rounded-b-3xl backdrop-blur-md shadow-2xl relative">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-[#0f0f15] shadow-sm border-b border-white/5">
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                        {columns.map((col, index) => (
                            <th key={index} className={`p-6 bg-white/1 ${col.className || ''}`}>
                                {col.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="hover:bg-white/2 transition-colors group">
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className={`p-6 ${col.className || ''}`}>
                                        {col.render ? col.render(row) : row[col.accessor]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="p-10 text-center text-gray-500 text-sm">
                                No se encontraron registros.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}