// RowActions — cụm nút thao tác cuối mỗi hàng bảng (xem / sửa / khóa / xóa).
// Dùng: <RowActions onView={...} onEdit={...} onDelete={...} />

import { useState } from 'react';
import { useAdminTheme } from '../../context/ThemeContext';
import Icon from './Icon';

export default function RowActions({ lock, onView, onEdit, onLock, onDelete }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, justifyContent: 'flex-end' }}>
      {onView && <IconButton name="eye" onClick={onView} />}
      {onEdit && <IconButton name="edit" onClick={onEdit} />}
      {lock != null && onLock && <IconButton name={lock ? 'lock' : 'unlock'} onClick={onLock} />}
      {onDelete && <IconButton name="trash" danger onClick={onDelete} />}
    </div>
  );
}

export function IconButton({ name, danger, onClick }) {
  const { c } = useAdminTheme();
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? (danger ? c.tones.badDim : c.bgElev) : 'transparent',
        border: `1px solid ${hover ? (danger ? c.tones.bad : c.border) : 'transparent'}`,
        borderRadius: 2,
        padding: 7,
        color: danger && hover ? c.tones.bad : c.fgSubtle,
        display: 'grid',
        placeItems: 'center',
        transition: 'all .12s',
      }}
    >
      <Icon name={name} size={15} />
    </button>
  );
}
