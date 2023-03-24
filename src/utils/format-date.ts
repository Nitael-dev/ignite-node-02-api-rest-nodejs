export const formatDate = (date: string | Date) => {
  return typeof date === 'string'
    ? new Date(date)
        .toLocaleDateString('pt-br', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        .replace(',', ' -')
    : date
        .toLocaleDateString('pt-br', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        .replace(',', ' -')
}
