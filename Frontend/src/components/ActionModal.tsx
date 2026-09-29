import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

interface ActionModalProps {
  title: string
  description: string
  commentLabel: string
  commentPlaceholder: string
  submitLabel: string
  busy: boolean
  onClose: () => void
  onSubmit: (comment: string) => Promise<void>
}

export function ActionModal({
  title,
  description,
  commentLabel,
  commentPlaceholder,
  submitLabel,
  busy,
  onClose,
  onSubmit,
}: ActionModalProps) {
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = comment.trim()
    if (!trimmed) {
      setError('Please add a comment before continuing')
      return
    }
    setError('')
    await onSubmit(trimmed)
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h3 id="modal-title" className="modal__title">
            {title}
          </h3>
          <button className="modal__close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className="modal__desc">{description}</p>
        <form className="modal__form" onSubmit={handleSubmit}>
          <div className={`field ${error ? 'field--error' : ''}`}>
            <label htmlFor="action-comment">{commentLabel}</label>
            <textarea
              id="action-comment"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                if (error) setError('')
              }}
              placeholder={commentPlaceholder}
              rows={4}
              autoFocus
            />
            {error ? <span className="field__error">{error}</span> : null}
          </div>
          <div className="modal__actions">
            <button className="btn btn--ghost" type="button" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button className="btn btn--primary" type="submit" disabled={busy}>
              {busy ? 'Saving…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
