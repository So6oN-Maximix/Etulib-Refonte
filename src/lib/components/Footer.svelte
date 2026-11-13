<footer class="site-footer">
	<div class="container foot">
		<div><a href="/" class="logo">Etulib</a><p>Le soutien scolaire, en ligne et près de chez vous.</p></div>
		<div><h4>Élèves et parents</h4><a href="/">Trouver un prof</a><a href="/">Tarifs</a><a href="/">Aide</a></div>
		<div><h4>Professeurs</h4><a href="/">Devenir tuteur</a><a href="/">Charte qualité</a></div>
		<div><h4>Etulib</h4><a href="/">Mentions légales</a><a href="/">CGU</a><a href="/">Contact</a></div>
	</div>
	<div class="container copy">&copy; 2026 Etulib. Tous droits réservés.</div>
</footer>

<style>
	.site-footer {
		padding: 3.5rem 0 2rem;
		font-size: .95rem
	}

	.foot {
		display: grid;
		grid-template-columns: 1.5fr 1fr 1fr 1fr;
		gap: 2rem
	}

	.foot p {
		color: var(--muted);
		margin-top: .6rem;
		max-width: 260px
	}

	.foot h4 {
		font-size: .95rem;
		color: var(--ink);
		margin-bottom: .6rem
	}

	.foot a:not(.logo) {
		display: block;
		color: var(--muted);
		padding: .15rem 0
	}

	.foot a:not(.logo):hover {
		color: var(--ink)
	}

	.copy {
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: .88rem
	}
</style>