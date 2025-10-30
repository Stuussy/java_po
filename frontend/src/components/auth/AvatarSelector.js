import React, { useState } from 'react';
import { AVAILABLE_AVATARS, getAvatarById } from '../../utils/avatars';
import '../../styles/AvatarSelector.css';

const AvatarSelector = ({ currentAvatar, onSelect, onClose }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || 'avatar1');

  const handleSelect = (avatarId) => {
    setSelectedAvatar(avatarId);
  };

  const handleSave = () => {
    onSelect(selectedAvatar);
    onClose();
  };

  return (
    <div className="avatar-selector-overlay" onClick={onClose}>
      <div className="avatar-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="avatar-selector-header">
          <h2>Choose Your Avatar</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="current-avatar-preview">
          <div className="avatar-preview-large" style={{ background: getAvatarById(selectedAvatar).color }}>
            <span>{getAvatarById(selectedAvatar).emoji}</span>
          </div>
          <p className="avatar-name">{getAvatarById(selectedAvatar).name}</p>
        </div>

        <div className="avatar-grid">
          {AVAILABLE_AVATARS.map((avatar) => (
            <div
              key={avatar.id}
              className={`avatar-option ${selectedAvatar === avatar.id ? 'selected' : ''}`}
              style={{ background: avatar.color }}
              onClick={() => handleSelect(avatar.id)}
            >
              <span className="avatar-emoji">{avatar.emoji}</span>
              {selectedAvatar === avatar.id && <div className="check-mark">✓</div>}
            </div>
          ))}
        </div>

        <div className="avatar-selector-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSave}>Save Avatar</button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
