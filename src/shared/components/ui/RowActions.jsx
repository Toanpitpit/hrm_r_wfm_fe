// RowActions — cụm nút thao tác cuối mỗi hàng bảng (xem / sửa / khóa / xóa).
// Dùng: <RowActions onView={...} onEdit={...} onDelete={...} />

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function RowActions({ lock, onView, onEdit, onLock, onDelete }) {
  return (
    <div style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
      {onView && <IconButton name="eye" onClick={onView} title="Xem chi tiết" />}
      {onEdit && <IconButton name="edit" onClick={onEdit} title="Chỉnh sửa" />}
      {lock != null && onLock && <IconButton name={lock ? 'lock' : 'unlock'} onClick={onLock} title={lock ? 'Mở khóa' : 'Khóa'} />}
      {onDelete && <IconButton name="trash" danger onClick={onDelete} title="Xóa" />}
    </div>
  );
}

export function IconButton({ name, danger, onClick, title }) {
  const { c } = useAdminTheme();
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 32,
        height: 32,
        background: hover ? (danger ? c.tones.badDim : c.bgElev) : 'transparent',
        border: `1px solid ${hover ? (danger ? c.tones.bad : c.border) : 'transparent'}`,
        borderRadius: 8,
        color: danger ? (hover ? c.tones.bad : '#EF4444') : (hover ? '#4F46E5' : c.fgSubtle),
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        transition: 'all .15s ease',
        outline: 'none',
      }}
    >
      <Icon name={name} size={15} />
    </button>
  );
}
