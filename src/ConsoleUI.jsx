import React from 'react';
import {Button, Modal} from 'antd';
import {CloseOutlined} from '@ant-design/icons';
import {useTranslation} from './locale';

export function CloseIcon() {
  return <CloseOutlined aria-hidden="true"/>;
}

export function CloseButton({onClick, autoFocus = false}) {
  const t = useTranslation();
  return <button type="button" className="console-close-button" aria-label={t('close')}
    autoFocus={autoFocus} onClick={onClick}><CloseIcon/></button>;
}

export function ConsoleModal({open, title, children, onCancel, onConfirm, confirmText, cancelText}) {
  const t = useTranslation();
  const footer = onConfirm
    ? <><Button onClick={onCancel}>{cancelText ?? t('cancel')}</Button><Button type="primary" onClick={onConfirm}>{confirmText ?? t('confirm')}</Button></>
    : <Button onClick={onCancel}>{t('close')}</Button>;
  return <Modal className="console-modal" open={open} title={title} onCancel={onCancel}
    closeIcon={<CloseIcon/>} footer={footer}>{children}</Modal>;
}

const paths = {
  snowflake: 'M12 2v20 M8.5 4.5 12 8l3.5-3.5 M8.5 19.5 12 16l3.5 3.5 M3.3 7l17.4 10 M3.3 17 20.7 7 M4 10.9l4.8-1.3-1.3-4.8 M20 13.1l-4.8 1.3 1.3 4.8 M7.5 19.2l1.3-4.8L4 13.1 M16.5 4.8l-1.3 4.8 4.8 1.3',
  topology: 'M4 3h6v5H4z M7 8v8h4 M7 11h7 M14 8h6v5h-6z M11 15h6v5h-6z',
  inspect: 'M4 9V4h5 M15 4h5v5 M20 15v5h-5 M9 20H4v-5 M8 12h2l2-4 2 8 2-4h2',
  log: 'M5 3h14v18H5z M8 8h8 M8 12h8 M8 16h5',
  critical: 'M10.6 4.5a1.6 1.6 0 0 1 2.8 0l7.8 13.8a1.6 1.6 0 0 1-1.4 2.4H4.2a1.6 1.6 0 0 1-1.4-2.4z M12 9v4.5 M12 17v.1',
  warning: 'M10.9 3.6a1.6 1.6 0 0 1 2.2 0l7.3 7.3a1.6 1.6 0 0 1 0 2.2l-7.3 7.3a1.6 1.6 0 0 1-2.2 0l-7.3-7.3a1.6 1.6 0 0 1 0-2.2z M12 8v4.5 M12 16v.1',
  info: 'M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0 M12 11v6 M12 7v1'
};

// Fit the painted strokes of each module glyph inside its square title badge.
const titleViewBoxes = {
  topology: '2.7 2.2 18.6 18.6',
  inspect: '3.2 3.2 17.6 17.6',
  log: '2.2 2.2 19.6 19.6'
};

export function Icon({name, viewBox = "0 0 24 24"}) {
  return <svg className="console-icon" aria-hidden="true" viewBox={viewBox} fill="none"
    stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
    <path d={paths[name]} />
  </svg>;
}

export function ModuleHeader({icon, eyebrow, title, count, children}) {
  return <header className="section-head">
    <div className="module-title">
      <span className="module-icon"><Icon name={icon} viewBox={titleViewBoxes[icon]}/></span>
      <div><small>{eyebrow}</small><h2>{title}{count != null && <em>{count}</em>}</h2></div>
    </div>
    {children}
  </header>;
}

export const levels = ['critical', 'warning', 'info'];

export function SeverityLabel({level, label}) {
  const t = useTranslation();
  return <span className="severity-label" data-tone={level}>
    <Icon name={level}/>{label ?? t(level)}
  </span>;
}

export function SeverityCard({level, count, description, children}) {
  const t = useTranslation();
  return <div className={'alert-card ' + level} data-tone={level}>
    <Icon name={level}/>
    <div className="alert-copy">
      <strong>{t(level)}</strong>
      <small>{description}</small>
      {children}
    </div>
    <b className="alert-count">{count}</b>
  </div>;
}

export function SwitchLink({device, onOpen}) {
  const t = useTranslation();
  return <button type="button" className="switch-link" aria-controls="investigation-panel"
    aria-label={t('viewSwitch', {device})} onClick={() => onOpen(device)}>{device}</button>;
}

export function DeviceNode({kind, status = 'normal', selected, children, className, ...buttonProps}) {
  return <button type="button" className={['device-node',kind,selected && 'selected',className].filter(Boolean).join(' ')}
    data-status={status} aria-pressed={!!selected} {...buttonProps}>{children}</button>;
}
