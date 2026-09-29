import { useState } from 'react'
import type { FormEvent } from 'react'
import type { CreateTicketInput, Priority } from '../types'
import { PRIORITIES, capitalizePriority } from '../utils'

interface TicketFormProps {
  onCreate: (input: CreateTicketInput) => Promise<boolean>
  busy: boolean
}

export function TicketForm({ onCreate, busy }: TicketFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [titleError, setTitleError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setTitleError('Title is required')
      return
    }
    setTitleError('')

    const ok = await onCreate({
      title: trimmed,
      description: description.trim(),
      priority,
    })
    if (ok) {
      setTitle('')
      setDescription('')
      setPriority('medium')
    }
  }

  return (
    <section className="panel panel--create">
      <div className="create-layout">
        <aside className="create-visual" aria-hidden="true">
          <img
            className="create-visual__img"
            src="/create-ticket.jpg"
            alt=""
          />
          <div className="create-visual__shade" />
        </aside>

        <div className="create-body">
          <div className="panel__header">
            <h2 className="panel__title">New ticket</h2>
          </div>

          <form className="form form--create" onSubmit={handleSubmit} noValidate>
            <div className="form__grid">
              <div className={`field ${titleError ? 'field--error' : ''}`}>
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (titleError) setTitleError('')
                  }}
                  placeholder="Cannot reset password"
                  autoComplete="off"
                  required
                />
                {titleError ? <span className="field__error">{titleError}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="priority">Priority</label>
                <div className="select-wrap">
                  <select
                    id="priority"
                    name="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {capitalizePriority(p)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="field field--description">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form__footer">
              <button
                className="btn btn--primary btn--create"
                type="submit"
                disabled={busy}
              >
                {busy ? 'Creating…' : 'Create ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
