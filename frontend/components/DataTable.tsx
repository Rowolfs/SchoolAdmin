'use client'
import React, { useState, useEffect } from 'react'
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
}

export default function DataTable<T>({ columns, data, isLoading }: DataTableProps<T>) {
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [tableData, setTableData] = useState<T[]>(data)

  // Обновляем внутренний стейт, когда props.data меняется
  useEffect(() => {
    setTableData(data)
    // Сбрасываем страницу в пагинации на первую
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [data])

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div>
      {isLoading ? (
        // Если проп isLoading = true, показываем «Загрузка…»
        <div>Загрузка...</div>
      ) : (
        <>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className="px-4 py-2 text-left"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Если строк нет, показываем «Нет записей» */}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-2 text-center">
                    Нет записей
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Пред.
            </button>
            <span>
              Страница {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
            </span>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              След.
            </button>
          </div>
        </>
      )}
    </div>
  )
}
