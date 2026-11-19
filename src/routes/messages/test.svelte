<svelte:head>
    <title>Messages – Etulib</title>
</svelte:head>

<div class="inbox" id="inbox">
    <aside class="inbox-side" aria-label="Conversations" id="conversation">
        <div class="inbox-side-head">
            <h1>Messages</h1>
            <input type="search" id="thread-search" placeholder="Rechercher une conversation" aria-label="Rechercher une conversation">
        </div>
        <ul class="threads">
            <li>
                <a href="/" class="unread" aria-current="true">
                    <span class="avatar">CM</span>
                    <span class="t-name">Camille M.<small> · Léa</small></span>
                    <span class="t-time">17:42</span>
                    <span class="t-preview">N'hésitez pas à noter vos questions avant la séance.</span>
                    <span class="badge">2</span>
                </a>
            </li>
            <li>
                <a href="/">
                    <span class="avatar">YB</span>
                    <span class="t-name">Yanis B.<small> · Léa</small></span>
                    <span class="t-time">Lun.</span>
                    <span class="t-preview">D'accord, à samedi 10 h alors.</span>
                </a>
            </li>
            <li>
                <a href="/">
                    <span class="avatar">SL</span>
                    <span class="t-name">Sophie L.<small> · Tom</small></span>
                    <span class="t-time">29 oct.</span>
                    <span class="t-preview">Merci pour le compte rendu !</span>
                </a>
            </li>
        </ul>
        <p class="empty" id="no-threads" hidden>Aucune conversation pour le moment. Elles apparaissent dès qu'un cours est réservé ou qu'un message est envoyé depuis la fiche d'un professeur.</p>
    </aside>

    <section class="thread" aria-label="Conversation" id="messages">
        <div class="thread-head">
            <button type="button" class="thread-back" id="thread-back" aria-label="Retour aux conversations">←</button>
            <span class="avatar">CM</span>
            <div><b>Camille M.</b><small>Professeure de mathématiques · Cours de Léa</small></div>
            <a href="/tutor?id=1" class="link-quiet">Voir la fiche</a>
        </div>
        <p class="thread-note" hidden>En tant que parent, vous voyez les échanges de Léa avec son professeur.</p>

        <div class="chat" id="chat" aria-live="polite">
            <div class="chat-empty" id="chat-select">
                <span class="chat-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg></span>
                <p><b>Sélectionnez une conversation</b></p>
                <p>Cliquez sur une conversation à gauche pour afficher vos messages.</p>
            </div>
        </div>

        <form class="composer" id="composer" hidden>
            <div id="attach-preview" class="attachment-preview"></div>

            <div class="composer-inputs">
                <button type="button" class="btn-line" id="attach-btn">Joindre</button>
                <input type="file" id="msg-file" multiple hidden>
                <textarea name="message" rows="1" placeholder="Écrire un message…" aria-label="Votre message"></textarea>
                <button type="submit" class="btn-search">Envoyer</button>
            </div>
        </form>
    </section>
</div>

<style>
    /* messagerie plein écran, façon Messenger */
    body.messages-page{display:flex;flex-direction:column;height:100vh;height:100dvh;overflow:hidden}

    .messages-main{flex:1;min-height:0;display:grid;grid-template-rows:minmax(0,1fr)}

    .inbox{display:grid;grid-template-columns:340px minmax(0,1fr);grid-template-rows:minmax(0,1fr);min-height:0;background:#fff;overflow:hidden}

    /* liste des conversations */
    .inbox-side{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--line)}

    .inbox-side-head{flex-shrink:0;padding:1rem 1rem .8rem}

    .inbox-side-head h1{margin-bottom:.7rem;font-size:1.5rem}

    .inbox-side-head input{width:100%;padding:.55rem .9rem;border:1px solid var(--line);border-radius:999px;background:var(--tint);font:inherit}

    .inbox-side-head input:focus{outline:0;border-color:var(--ink);background:#fff}

    .inbox-side .empty{margin:1rem;font-size:.92rem}

    .threads{flex:1;min-height:0;list-style:none;overflow-y:auto}

    .threads a{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.2rem .8rem;padding:.9rem 1rem;border-bottom:1px solid var(--line)}

    .threads a:hover{background:var(--tint)}

    .threads a[aria-current]{background:var(--tint);box-shadow:inset 3px 0 0 var(--ink)}

    .threads .avatar{grid-row:span 2}

    .t-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;color:var(--ink)}

    .t-name small{font-weight:400;color:var(--muted)}

    .t-time{font-size:.8rem;color:var(--muted)}

    .t-preview{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.9rem;color:var(--muted)}

    .threads .unread .t-preview{font-weight:600;color:var(--ink)}

    /* conversation : les messages défilent, la barre de saisie reste en bas */
    .thread{display:flex;flex-direction:column;min-width:0;min-height:0}

    .thread-head{flex-shrink:0;display:flex;align-items:center;gap:.8rem;padding:.8rem 1.1rem;border-bottom:1px solid var(--line)}

    .thread-head small{display:block;color:var(--muted)}

    .thread-head .link-quiet{margin-left:auto}

    .thread-back{display:none;padding:.2rem .4rem;background:none;border:0;font-size:1.4rem;line-height:1;color:var(--ink);cursor:pointer}

    .thread-note{flex-shrink:0;padding:.5rem 1.1rem;background:var(--tint);border-bottom:1px solid var(--line);font-size:.88rem;color:var(--muted)}

    .chat{flex:1;min-height:0;display:flex;flex-direction:column;gap:.5rem;padding:1.1rem;overflow-y:auto;background:var(--paper)}

    .day-sep{align-self:center;margin:.4rem 0;font-size:.8rem;color:var(--muted)}

    .msg{max-width:min(560px,82%);padding:.55rem .85rem;background:#fff;border:1px solid var(--line);border-radius:14px;overflow-wrap:anywhere}

    .msg.out{align-self:flex-end;background:var(--ink);border-color:var(--ink);color:#fff}

    .msg time{display:block;margin-top:.2rem;font-size:.75rem;opacity:.65}

    .msg-file{display:flex;align-items:center;gap:.6rem;margin-top:.4rem}

    .composer {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        background: #fff;
        border-top: 1px solid var(--line);
    }

    .composer-inputs {
        display: flex;
        align-items: flex-end;
        gap: 0.5rem;
        padding: 0.8rem 1rem;
        width: 100%;
    }

    .composer-inputs textarea{flex:1;min-height:44px;max-height:140px;padding:.65rem .9rem;border:1px solid var(--line);border-radius:18px;font:inherit;resize:none}

    .composer-inputs textarea:focus{border-color:var(--ink);outline:0;box-shadow:0 0 0 3px var(--tint)}

    .composer-inputs .btn-search{padding:.7rem 1.4rem;border-radius:6px}

    /* aperçu des pièces jointes avant l'envoi */
    .attachment-preview{display:flex;gap:.75rem;padding:.9rem 1rem .2rem;overflow-x:auto}

    .attachment-preview:empty{display:none}

    .preview-file{position:relative;flex-shrink:0;display:flex;align-items:center;gap:.65rem;max-width:250px;padding:.5rem .9rem .5rem .5rem;background:#fff;border:1px solid var(--line);border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.06);animation:preview-in .18s ease-out}

    @keyframes preview-in{from{opacity:0;transform:translateY(6px) scale(.96)}to{opacity:1;transform:none}}

    .file-meta{min-width:0}

    .file-size{margin:0;font-size:.78rem;color:var(--muted)}

    .preview-file .file-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.9rem;font-weight:600;color:var(--ink)}

    .preview-file small{display:block;font-size:.78rem;color:var(--muted)}

    /* image : vignette seule, sans carte */
    .preview-file.is-image{padding:0;background:none;border:0;box-shadow:none}

    .preview-thumb{display:block;width:72px;height:72px;object-fit:cover;border-radius:14px;border:1px solid var(--line)}

    /* croix ronde dans le coin */
    .remove-file-btn{position:absolute;top:-8px;right:-8px;display:grid;place-items:center;width:22px;height:22px;padding:0;background:var(--ink);border:2px solid #fff;border-radius:50%;font-size:.95rem;line-height:1;color:#fff;cursor:pointer;transition:background .15s,transform .15s}

    .remove-file-btn:hover{background:#ef4444;transform:scale(1.1)}

    @media (max-width:800px) {
        .inbox{grid-template-columns:1fr}
        .thread{display:none}
        .inbox.open .inbox-side{display:none}
        .inbox.open .thread{display:flex}
        .thread-back{display:block}
    }

    /* Badge d'événement système dans la conversation */
    .system-event {
        align-self: center;
        margin: 1rem auto;
        padding: 0.5rem 1.25rem;
        background: var(--tint);
        border: 1px solid var(--line);
        border-radius: 999px;
        font-size: 0.85rem;
        color: var(--muted);
        text-align: center;
        max-width: 90%;
    }

    .system-event b {
        color: var(--ink);
        font-weight: 600;
    }

    /* conversation vide */
    .chat-empty{margin:auto;max-width:340px;padding:1rem;text-align:center;color:var(--muted)}

    .chat-empty[hidden]{display:none}

    .chat-empty b{font-family:"Bricolage Grotesque",sans-serif;font-size:1.15rem;color:var(--ink)}

    .chat-empty-icon{display:grid;place-items:center;width:56px;height:56px;margin:0 auto .8rem;border:1.5px dashed var(--ink);border-radius:50%;color:var(--ink)}

    .chat-empty-icon svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}

    .thread.read-only .composer{display:none}
</style>