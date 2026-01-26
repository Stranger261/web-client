import { COLORS } from '../../configs/CONST';

const Table = ({
  columns = [],
  data = [],
  onRowClick,
  hoverable = true,
  className = '',
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const handleRowClick = row => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <div
      className={`overflow-x-auto rounded-lg shadow ${className}`}
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.dark
          : COLORS.surface.light,
      }}
    >
      <table
        className="min-w-full divide-y"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <thead
          style={{
            backgroundColor: isDarkMode
              ? COLORS.background.dark
              : COLORS.background.main,
          }}
        >
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${
                  column.align === 'right'
                    ? 'text-right'
                    : column.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                }`}
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                  width: column.width || 'auto',
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody
          className="divide-y"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-sm"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`transition-colors ${
                  hoverable ? 'cursor-pointer' : ''
                }`}
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                }}
                onMouseEnter={e => {
                  if (hoverable) {
                    e.currentTarget.style.backgroundColor = isDarkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.lightHover;
                  }
                }}
                onMouseLeave={e => {
                  if (hoverable) {
                    e.currentTarget.style.backgroundColor = isDarkMode
                      ? COLORS.surface.dark
                      : COLORS.surface.light;
                  }
                }}
                onClick={() => handleRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 text-sm ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    } ${column.className || ''}`}
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {column.render
                      ? column.render(row, rowIndex)
                      : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
